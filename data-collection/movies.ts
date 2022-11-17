import * as _ from 'lodash';
import fetch from "cross-fetch";
import {MOVIE_DATA, MOVIE_DICT} from '../svelte/src/ts/types';

const fs = require('fs');
const cliProgress = require('cli-progress');
// import { config } from '../config';

const KEY = '0e9c7a63a1bc4d8309d3290e6d92782d';

export async function getIds() {
    console.log('Getting ids from TMDb');
    const ids = [];

    for (let i = 1; i <= 250; i++) {
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${KEY}&page=${i}`; //IMDB 634 KOEN 8228166
        const response = await fetch(url, {
            headers: {
                'api_key': KEY,
            }
        });
        const json = await response.json();
        for (const movie of json.results) {
            ids.push(movie.id);
        }
        await new Promise(resolve => setTimeout(resolve, 600));

    }

    return _.uniq(ids);
}

export async function storeMetadata(ids: number[] = [], filename = 'data/metadata.json') {
    const metadata = JSON.parse(fs.readFileSync(filename).toString());
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(ids.length - _.size(metadata), 0);
    for (const id of ids) {
        if (metadata[id]) {
            continue;
        }
        bar.increment();

        try {
            // const params = 'title,alternative_titles,num_list_users,media_type,start_season,nsfw,synopsis,score,genres,rank,popularity,main_picture,related_anime,mean,recommendations';
            const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${KEY}`;
            const response = await fetch(url, {
                headers: {
                    'api_key': KEY,
                }
            });
            const url_recommended = `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${KEY}`;
            const response_rec = await fetch(url_recommended, {
                headers: {
                    'api_key': KEY,
                }
            });

            metadata[id] = {
                ...await response.json(),
                ...await response_rec.json()
            };
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

function filterMetadata(metadata: MOVIE_DICT): MOVIE_DICT {
    let filtered = {};
    for (const id in metadata) {
        const movie = metadata[id];
        if (movie.score && !['Documentary'].includes(movie.genres.toString()) && !movie.adult && !movie.video) {
            filtered[id] = movie;
        }
    }
    // only keep most popular movies
    const keys = Object.keys(filtered)
        .filter(id => {
            return filtered[id].members > 200;
        })
    return _.pick(filtered, keys) as MOVIE_DICT;
}

function parseMetadata(json): MOVIE_DATA {
    return Object.assign(new MOVIE_DATA(), {
        id: json.id,
        title: json.title,
        original_title: json.original_title,
        overview: json.overview,
        url: 'https://letterboxd.com/tmdb/'+json.id,
        runtime: json.runtime,
        year: json.release_date.split('-')[0],
        related: json.results?.map((r, i) => ({ id: r.id, count: json.results?.length - i })),
        genres: json.genres?.map(g => g.name),
        members: json.vote_count,
        picture: 'https://image.tmdb.org/t/p/w185/' + json.poster_path,
        score: json.vote_average,
        adult: json.adult,
        video: json.video,

        // recommendations: json.recommendations?.map(r => ({ id: r.node.id, count: r.num_recommendations })),

        // id: json.id,
        // title: json.title,
        // englishTitle: json.alternative_titles?.en,
        // url: 'https://myanimelist.net/anime/' + json.id,
        // picture: json.main_picture?.medium,
        // synopsis: json.synopsis,
        // type: json.media_type,
        // score: json.mean,
        // ranked: json.rank,
        // popularity: json.popularity,
        // related: json.related_anime?.map(r => ({
        //     id: r.node.id,
        //     relation_type: r.relation_type
        // })),
        // recommendations: json.recommendations?.map(r => ({ id: r.node.id, count: r.num_recommendations })),
        // year: json.start_season?.year,
        // nsfw: !['white', 'gray'].includes(json.nsfw),
    });
}


export function processMetadata(metadata) {
    const data = _.mapValues(metadata, parseMetadata);
    console.log(`${_.size(data)} movies have metadata`);
    const filtered = filterMetadata(data);
    console.log(`${_.size(filtered)} movies filtered`);

    fs.writeFileSync('data/min_metadata.json', JSON.stringify(filtered, null, 2));
    return data;
}