import { createCluster } from "./cluster";
import { Layout } from "./layout";
import { storeEdges } from "./recs";
import { storeMetadata, getIds, processMetadata, storeAniListMetadata } from "./shows";
const fs = require('fs');

main();

async function main() {
    const ids = await getIds();
    const metadata_json = await storeMetadata(ids);
    const anilist_metadata_json = await storeAniListMetadata(ids);
    // const metadata_json = JSON.parse(fs.readFileSync('data/metadata.json').toString());
    const metadata = processMetadata(metadata_json, anilist_metadata_json);

    const edges = storeEdges(metadata);

    const root_cluster = await createCluster(edges);

    const layout = new Layout(root_cluster.toNodeDict(), edges, 20);
    while (!layout.done) {
        layout.tick();
    }
    fs.writeFileSync('data/layout.json', JSON.stringify(layout, null, 2));
}