import { Cluster, createCluster } from "./cluster";
import { Layout } from "./layout";
import { storeEdges } from "./recs";
import { storeMetadata, getIds, processMetadata, storeAniListMetadata } from "./shows";
import { ANIME_DICT } from "./types";
const fs = require('fs');

main();

async function main() {
    let metadata: ANIME_DICT = {};
    if (process.argv.length === 3 && process.argv[2] === 'cached') {
        const metadata_json = JSON.parse(fs.readFileSync('data/metadata.json').toString());
        const anilist_metadata_json = JSON.parse(fs.readFileSync('data/metadata-anilist.json').toString());
        metadata = processMetadata(metadata_json, anilist_metadata_json);
    } else {
        const ids = await getIds();
        const metadata_json = await storeMetadata(ids);
        const anilist_metadata_json = await storeAniListMetadata(ids);
        metadata = processMetadata(metadata_json, anilist_metadata_json);
    }

    const edges = storeEdges(metadata);

    const root_cluster = await createCluster(edges);

    const layout = new Layout(root_cluster.toNodeDict(), edges, 20);
    while (!layout.done) {
        layout.tick();
    }
    fs.writeFileSync('data/layout.json', JSON.stringify(layout, null, 2));
}