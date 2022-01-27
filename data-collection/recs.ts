import * as _ from 'lodash';
import { ANIME_DICT } from '../svelte/src/ts/types';

const fs = require('fs');
export type Edge = [number, number, number];

export function storeEdges(metadata: ANIME_DICT, filename = 'data/edges.json') {
    const edges:Edge[] = getEdges(metadata)
        .filter(e => e[2] > 0.03)
        .sort((a, b) => b[0] - a[1]);
    const out = edges
        .map(e => [e[0], e[1], e[2].toPrecision(3)]);
    fs.writeFileSync(filename, JSON.stringify({ "Edges": out }));
    return edges;
}


function getEdges(metadatas: ANIME_DICT) {
    const edge_dict: { [key: string]: Edge; } = {};

        function addToEdge(a: number, b: number, w: number) {
            if (!metadatas[b] || !metadatas[a]) {
                return null;
            }
            const s = Math.min(a, b);
            const t = Math.max(a, b);
            const eid = `${s}-${t}`;
            if (!edge_dict[eid]) {
                edge_dict[eid] = [s, t, 0];
            }
            edge_dict[eid][2] += w;
        }

    for (const [id, metadata] of Object.entries(metadatas)) {
        const recs = metadata.recommendations;
        const total_recs = _.sumBy(recs, r => r.count);

        for (const rec of _.values(recs)) {
            addToEdge(parseInt(id), rec.id, rec.count / total_recs / 2);
        }
    }

    return _.values(edge_dict);
}