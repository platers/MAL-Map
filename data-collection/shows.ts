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
        related: json.related_anime?.map(r => r.node.id),
        recommendations: json.recommendations?.map(r => ({ id: r.node.id, count: r.num_recommendations })),
        year: json.start_season?.year,
    }
}

export function processMetadata(metadata) {
    const data = _.mapValues(metadata, parseMetadata);
    const filtered = filterMetadata(data);
    console.log(`${_.size(filtered)} shows filtered`);

    fs.writeFileSync('data/min_metadata.json', JSON.stringify(filtered, null, 2));
    return filtered;
}