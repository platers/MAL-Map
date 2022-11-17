<script lang="ts">
    import MovieView from "./MovieView.svelte";
    import Canvas from "./Canvas.svelte";
    import Filters from "./Filters.svelte";
    import LangButton from "./LangButton.svelte";
    import Searchbar from "./Searchbar.svelte";
    import Sidebar from "./Sidebar.svelte";
    import SidebarHeader from "./SidebarHeader.svelte";
    import { Metadata, nativeTitle } from "./ts/utils";
    import {
        completedList,
        endYear,
        scoreThreshold,
        selected_movie,
        startYear,
    } from "./store";
    import _ from "lodash";
    import SliderFilter from "./SliderFilter.svelte";
    import { FullNode, Node } from "./ts/node";
	import Edges from "../../data-collection/data/edges.json";
	import Layout_ from "../../data-collection/data/layout.json";
import { MOVIE_DATA } from "./ts/types";

    function getOptionLabel(option) {
        if (!option) return "";
        if (!option.title) return option.original_title;
        if (option.original_title === option.title) return option.title;
        if (nativeTitle(option) === option.title) {
            return `${option.title} (${option.original_title})`;
        } else {
            return `${option.original_title} (${option.title})`;
        }
    }

    let options = _.values(Metadata) as MOVIE_DATA[];

    function onInit(nodes: FullNode[], node_map: { [id: number]: FullNode }) {
        function updateBrightness(
            node: FullNode,
            scoreThreshold: number,
            startYear: number,
            endYear: number
        ) {
            const metadata = node.metadata as MOVIE_DATA;
            const passingScore = metadata.score >= scoreThreshold;
            const yearInRange =
                metadata.year <= endYear &&
                metadata.year >= startYear;

            if (passingScore && yearInRange ) {
                node.brightness = 1;
            } else {
                node.brightness = 0.5;
            }
        }

        function updateAllBrightness(nodes: FullNode[]) {
            nodes.forEach((node) => {
                updateBrightness(
                    node,
                    $scoreThreshold,
                    $startYear,
                    $endYear
                );
            });
        }

        scoreThreshold.subscribe(() => updateAllBrightness(nodes));
        startYear.subscribe(() => updateAllBrightness(nodes));
        endYear.subscribe(() => updateAllBrightness(nodes));

        completedList.subscribe((list) => {
            const startNodes =
                list?.length > 0
                    ? list.map((id) => node_map[id]).filter((node) => node)
                    : nodes;
            Node.bfs(startNodes, nodes);
            updateAllBrightness(nodes);
        });
    }
</script>

<Canvas {onInit} {selected_movie}
   Metadata_={Metadata}
    Edges={Edges.Edges}
    {Layout_}
/>

<Sidebar>
    <Searchbar slot="searchbar" {selected_movie} {options} {getOptionLabel} />
    <Filters slot="filters">
<!--        <TextInput-->
<!--            placeholder="MyAnimeList Username"-->
<!--            title="Enter your MyAnimeList username and press the search icon"-->
<!--            {handleSubmit}-->
<!--        />-->
        <SliderFilter
            label="Minimum score"
            value={scoreThreshold}
            min={0}
            max={10}
            step={0.01}
        />
        <SliderFilter
            range
            label="Year"
            start={startYear}
            end={endYear}
            min={1900}
            max={2026}
            step={1}
        />
    </Filters>

    <MovieView slot="metadata-view" />
    <SidebarHeader
            slot="top-header"
            githubURL="https://github.com/koenhagen/Movie-Map"
    >
        <LangButton />
    </SidebarHeader>
</Sidebar>

<style lang="scss">
</style>
