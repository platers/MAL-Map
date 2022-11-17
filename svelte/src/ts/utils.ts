import {Cluster} from "../../../data-collection/cluster";
import * as _ from "lodash";
import {getTiers, params_dict} from "./base_utils";
import Movie from "../../../data-collection/data/min_metadata.json";
import Clusters_ from "../../../data-collection/data/clusters.json";
import {MOVIE_DATA} from "./types";


export function currentLanguage() {
    return params_dict.language || "en";
}

export function nativeTitle(metadata: MOVIE_DATA) {
    return currentLanguage() == 'en' ? metadata.title || metadata.original_title : metadata.title;
}


// export async function queryUser(username: string): Promise<number[]> {
//     const proxy_url = 'https://corsanywhere.herokuapp.com/';
//     const mal_url = `https://api.myanimelist.net/v2/users/${username}/animelist`;
//     const full_url = `${proxy_url}${mal_url}?` + new URLSearchParams({
//         'limit': '1000',
//         'status': 'completed',
//         'sort': 'list_score',
//     }).toString();
//     const response = await fetch(full_url, {
//         headers: {
//             "X-MAL-CLIENT-ID": "e0e691a27a61d8cca4d3446774022c20", // please dont steal. This is used on the client, impossible to hide.
//         },
//     });
//     try {
//         const data = await response.json();
//         const ids = data.data.map((entry: any) => entry.node.id);
//         console.log(ids);
//         return ids;
//     } catch (e) {
//         console.log(e);
//         return null;
//     }
// }

function displayTitle(metadata: any) {
    return currentLanguage() == 'en' ?
        metadata.title ||
        metadata.original_title : metadata.original_title;
}

export const Metadata = _.mapValues(Movie, (metadata: any) => Object.assign(new MOVIE_DATA(), metadata, {
    title: displayTitle(metadata),
}));
export const Clusters = Cluster.fromJSON(Clusters_);
export const Tier: { [id: number]: number } = getTiers(Clusters, Metadata);
export const Cluster_Nodes = Clusters.toNodeDict();