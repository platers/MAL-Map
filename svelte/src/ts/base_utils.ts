import { Rectangle } from "pixi.js";
import * as _ from "lodash";
import { Cluster } from "../../../data-collection/cluster";
import { METADATA_DICT } from "./base_types";


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
    return !(a.y > b.y + b.height || a.y + a.height < b.y);

}

const params = window.location.hash.substring(1).split("&");
console.log(params);
export const params_dict = _.fromPairs(params.map((param) => param.split("=")));
console.log(params_dict);

export function updateHashParams() {
    window.location.hash = _.entries(params_dict)
        .filter(([k, v]) => v && k)
        .map(([k, v]) => `${k}=${v}`)
        .join("&");
}

export function getTiers(cluster: Cluster, Metadata: METADATA_DICT) {
    let tiers: { [id: number]: number } = {};
    function getHead(cluster: Cluster) {
        let potential_heads: number[] = cluster.nodes.concat(cluster.clusters.map(getHead));
        let most_popular = _.maxBy(potential_heads, (node) => Metadata[node]?.score);

        for (let n of cluster.nodes) {
            tiers[n] = Infinity;
        }

        tiers[most_popular] = cluster.tier;

        return most_popular;
    }

    getHead(cluster);
    return tiers;
}
