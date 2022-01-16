import _ from "lodash";
import { Rectangle } from "pixi.js";
import { ANIME_DATA } from "../../../data-collection/types";
const unidecode = require("unidecode");

export type NodeId = number;
export type EdgeId = number;
export type RecsType = { [key: NodeId]: { [key: NodeId]: number } };
export function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return parseInt(`${f(0)}${f(8)}${f(4)}`, 16);
}

export function rectIntersectsRect(a: Rectangle, b: Rectangle) {
    if (a.x > b.x + b.width || a.x + a.width < b.x)
        return false;
    if (a.y > b.y + b.height || a.y + a.height < b.y)
        return false;
    return true;
}

export function truncateTitle(title: string) {
    // discard after colon
    const colon = title.indexOf(': ');
    if (colon !== -1) {
        title = title.slice(0, colon);
    }
    // title = unidecode(title);
    return title;
}

const params = window.location.hash.substring(1).split("&");
export const params_dict = _.fromPairs(params.map((param) => param.split("=")));
console.log(params_dict);



export function nativeTitle(metadata: ANIME_DATA) {
    const lang = params_dict.language || 'en';
    return lang == 'en' ? metadata.englishTitle || metadata.title : metadata.title;
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