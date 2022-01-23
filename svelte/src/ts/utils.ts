import _ from "lodash";
import { ANIME_DATA } from "../../../data-collection/types";
import { params_dict } from "./base_utils";


export function truncateTitle(title: string) {
    // discard after colon
    const colon = title.indexOf(': ');
    if (colon !== -1) {
        title = title.slice(0, colon);
    }
    // title = unidecode(title);
    return title;
}


export function currentLanguage() {
    return params_dict.language || "en";
}

export function nativeTitle(metadata: ANIME_DATA) {
    return currentLanguage() == 'en' ? metadata.englishTitle || metadata.title : metadata.title;
}

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