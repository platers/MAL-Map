import { createCluster } from "./cluster";
import { Layout } from "./layout";
import { storeEdges } from "./recs";
import { storeMetadata, getIds, processMetadata } from "./movies";
import { MOVIE_DICT } from "../svelte/src/ts/types";
const fs = require('fs');
const METADATA_FILENAME = 'data/metadata.json';

main();

async function main() {
    // If reset flag, delete existing metadata and pull it again. Takes hours.
    if (process.argv.length === 3 && process.argv[2] === 'reset') {
        const ids = await getIds();
        fs.writeFileSync(METADATA_FILENAME, '{}');
        await storeMetadata(ids);
    }

    // Load metadata
    const metadata_json = JSON.parse(fs.readFileSync(METADATA_FILENAME).toString());
    let metadata: MOVIE_DICT = processMetadata(metadata_json);

    // Get edges
    const edges = storeEdges(metadata);

    // Create clusters
    const root_cluster = await createCluster(edges);
    console.log("Finished clustering");
   
    // Layout clusters
    console.log("Starting layout");
    const layout = new Layout(root_cluster.toNodeDict(), edges, 20);
    while (!layout.done) {
        layout.tick();
    }
    fs.writeFileSync('data/layout.json', JSON.stringify(layout, null, 2));
}