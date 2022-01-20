import _ from "lodash";
import Clusters_ from "../../../data-collection/data/clusters.json";
import { Cluster } from "../../../data-collection/cluster";
import Animes from "../../../data-collection/data/min_metadata.json";
import { ANIME_DICT } from "../../../data-collection/types";
export const Clusters = Cluster.fromJSON(Clusters_);
export const Cluster_Nodes = Clusters.toNodeDict();

const Metadata = Animes as unknown as ANIME_DICT;
export const Tier_Heads: { [tier: number]: number[] } = {};
export const Tier: { [id: number]: number } = {};
export const Tier_Sizes: { [tier: number]: number } = {};

getTierSizes(Clusters);
const max_tier = _.max(_.keys(Tier_Sizes).map(k => parseInt(k)));
getTierHead(Clusters);

function getTierHead(cluster: Cluster): number {
    if (Tier_Heads[cluster.tier] === undefined) {
        Tier_Heads[cluster.tier] = [];
    }
    let sub_heads = cluster.clusters.map(c => getTierHead(c));
    sub_heads = _.extend(sub_heads, cluster.nodes);
    const head = _.minBy(sub_heads, n => Metadata[n].popularity);
    Tier_Heads[cluster.tier].push(head);
    Tier[head] = cluster.tier;

    for (let n of cluster.nodes) {
        if (Tier_Heads[max_tier + 1] === undefined) {
            Tier_Heads[max_tier + 1] = [];
        }
        Tier_Heads[max_tier + 1].push(n);
        Tier[n] = max_tier + 1;
        Tier_Sizes[max_tier + 1]++;
    }

    return head;
}

function getTierSizes(cluster: Cluster) {
    if (Tier_Sizes[cluster.tier] === undefined) {
        Tier_Sizes[cluster.tier] = 0;
    }
    Tier_Sizes[cluster.tier]++;
    for (let c of cluster.clusters) {
        getTierSizes(c);
    }
}