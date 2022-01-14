import * as _ from 'lodash';
const fs = require('fs');
const cliProgress = require('cli-progress');
import fetch from "cross-fetch";
import { ANIME_DATA, ANIME_DICT } from './types';


const KEY = process.env.MAL_KEY;

export async function getIds() {
    console.log('Getting ids from MAL');
    const ids = [];
    for (let i = 0; i < 10; i++) {
        const url = `https://api.myanimelist.net/v2/anime/ranking?ranking_type=bypopularity&limit=500&offset=${i * 500}`;
        const response = await fetch(url, {
            headers: {
                'X-MAL-CLIENT-ID': KEY,
            }
        });
        const json = await response.json();
        for (const show of json.data) {
            ids.push(show.node.id);
        }
        await new Promise(resolve => setTimeout(resolve, 600));
    }
    // dedup ids
    const uniqueIds = _.uniq(ids);

    return ids;
}

export async function storeMetadata(ids: number[] = [], filename = 'data/metadata.json') {
    const metadata = JSON.parse(fs.readFileSync('data/metadata.json').toString());
    console.log(`${_.size(metadata)} shows already have metadata out of ${ids.length}`);
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(ids.length - _.size(metadata), 0);
    for (const id of ids) {
        if (metadata[id]) {
            continue;
        }
        bar.increment();

        try {
            const params = 'title,alternative_titles,num_list_users,media_type,start_season,nsfw,synopsis,score,genres,rank,popularity,main_picture,related_anime,mean,recommendations';
            const url = `https://api.myanimelist.net/v2/anime/${id}?fields=${params}`;
            const response = await fetch(url, {
                headers: {
                    'X-MAL-CLIENT-ID': KEY,
                }
            });
            // console.log(response)
            const json = await response.json();
            metadata[id] = json;
        } catch (e) {
            console.log(e, id);
        }
        await new Promise(resolve => setTimeout(resolve, 600));

        if (_.size(metadata) % 20 === 1) {
            fs.writeFileSync(filename, JSON.stringify(metadata, null, 2));
        }
    }
    bar.stop();
    fs.writeFileSync(filename, JSON.stringify(metadata, null, 2));
    return metadata;
}

function filterMetadata(metadata: ANIME_DICT): ANIME_DICT {
    let filtered = {};
    for (const id in metadata) {
        const show = metadata[id];
        if (show.score && ['tv'].includes(show.type)) {
            filtered[id] = show;
        }
    }
    // only keep most popular shows
    const keys = Object.keys(filtered)
        .filter(id => filtered[id].popularity < 4000)
    return _.pick(filtered, keys) as ANIME_DICT;
}

function parseMetadata(json): ANIME_DATA {
    return {
        id: json.id,
        title: json.title,
        englishTitle: json.alternative_titles?.en,
        url: 'https://myanimelist.net/anime/' + json.id,
        picture: json.main_picture?.medium,
        synopsis: json.synopsis,
        type: json.media_type,
        score: json.mean,
        genres: json.genres?.map(g => g.name),
        ranked: json.rank,
        popularity: json.popularity,
        members: json.num_list_users,
        related: json.related_anime?.map(r => ({
            id: r.node.id,
            relation_type: r.relation_type
        })),
        recommendations: json.recommendations?.map(r => ({ id: r.node.id, count: r.num_recommendations })),
        year: json.start_season?.year,
    }
}

function mergeSeasons(data: ANIME_DICT): ANIME_DICT {
    // merge shows related by prequel/sequel into the most popular show

    const canonical_ids = _.mapValues(data, getCanonicalSeason);

    for (const id in data) {
        const canonical_id = canonical_ids[id];
        if (canonical_id !== _.toInteger(id)) {
            // merge reccomendations
            const recs = data[id].recommendations;
            if (recs) {
                if (!data[canonical_id].recommendations) {
                    data[canonical_id].recommendations = [];
                }
                data[canonical_id].recommendations = data[canonical_id].recommendations.concat(recs);
            }
        }
    }

    let merged = {};
    for (const id in data) {
        const canonical_id = canonical_ids[id];
        if (canonical_id === _.toInteger(id)) {
            const keys = _.uniq(data[id].recommendations.map(r => canonical_ids[r.id])).filter(id => id);
            data[id].recommendations = keys.map(k => ({
                id: k,
                count: data[id].recommendations.filter(r => canonical_ids[r.id] === k).reduce((a, b) => a + b.count, 0)
            }));
            merged[id] = data[id];
        }
    }

    return merged;


    function getCanonicalSeason(show: ANIME_DATA): number {
        if (!show.related) {
            return show.id;
        }
        let related = [show.id];
        while (true) {
            let newRelated = [];
            for (const id of related) {
                if (!data[id] || !data[id].related) continue;
                const relatedTo = data[id].related.filter(r => r.relation_type === 'sequel' || r.relation_type === 'prequel');
                if (relatedTo) {
                    _.extend(newRelated, relatedTo.map(r => r.id));
                }
                newRelated.push(id);
            }
            newRelated = _.uniq(newRelated).filter(id => data[id]);
            if (newRelated.length === related.length) {
                break;
            }
            related = newRelated;
        }
        related = related.filter(id => data[id]);

        return _.minBy(related, id => data[id].popularity);
    }
}

export function processMetadata(metadata) {
    const data = _.mapValues(metadata, parseMetadata);
    console.log(`${_.size(data)} shows have metadata`);
    const merged = mergeSeasons(data);
    console.log(`${_.size(merged)} shows after merging seasons`);
    const filtered = filterMetadata(merged);
    console.log(`${_.size(filtered)} shows filtered`);

    fs.writeFileSync('data/min_metadata.json', JSON.stringify(filtered, null, 2));
    return filtered;
}