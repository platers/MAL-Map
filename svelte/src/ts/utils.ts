import { Cluster } from "constellation-graph";
import _ from "lodash";
import { getTiers, METADATA, METADATA_DICT, params_dict } from "./base_utils";


export function currentLanguage() {
    return params_dict.language || "en";
}

export class ANIME_DATA extends METADATA {
    id: number;
    title: string;
    englishTitle: string;
    url: string;
    picture: string;
    synopsis: string;
    score: number;
    type: string;
    genres: string[];
    ranked: number;
    popularity: number;
    members: number;
    related: { id: number, relation_type: string }[];
    recommendations: { id: number, count: number }[];
    year: number;
    nsfw: boolean;

    nativeTitle() {
        return currentLanguage() == 'en' ? this.englishTitle || this.title : this.title;
    }
};

export type ANIME_DICT = { [id: number]: ANIME_DATA; };

export async function queryUser(username: string): Promise<number[]> {
    const proxy_url = 'https://corsanywhere.herokuapp.com/';
    const mal_url = `https://api.myanimelist.net/v2/users/${username}/animelist`;
    const full_url = `${proxy_url}${mal_url}?` + new URLSearchParams({
        'limit': '1000',
        'status': 'completed',
        'sort': 'list_score',
    }).toString();
    const response = await fetch(full_url, {
        headers: {
            "X-MAL-CLIENT-ID": "e0e691a27a61d8cca4d3446774022c20", // please dont steal. This is used on the client, impossible to hide.
        },
    });
    try {
        const data = await response.json();
        const ids = data.data.map((entry: any) => entry.node.id);
        console.log(ids);
        return ids;
    } catch (e) {
        console.log(e);
        return null;
    }
}

function displayTitle(metadata: any) {
    let title = currentLanguage() == 'en' ?
        metadata.englishTitle ||
        metadata.title : metadata.title;
    // discard after colon
    const colon = title.indexOf(': ');
    if (colon !== -1) {
        title = title.slice(0, colon);
    }
    return title;
}
import Anime from "../../../data-collection/data/min_metadata.json";
import Clusters_ from "../../../data-collection/data/clusters.json";
export const Metadata = _.mapValues(Anime, (metadata: any) => Object.assign(new ANIME_DATA(), metadata, {
    display_title: displayTitle(metadata),
}));
export const Clusters = Cluster.fromJSON(Clusters_);
export const Tier: { [id: number]: number } = getTiers(Clusters, Metadata);
export const Cluster_Nodes = Clusters.toNodeDict();