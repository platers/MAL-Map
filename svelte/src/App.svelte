<script lang="ts">
    import AnimeView from "./AnimeView.svelte";
    import Canvas from "./Canvas.svelte";
    import Filters from "./Filters.svelte";
    import LangButton from "./LangButton.svelte";
    import Searchbar from "./Searchbar.svelte";
    import Sidebar from "./Sidebar.svelte";
    import SidebarHeader from "./SidebarHeader.svelte";
    import Anime from "../../data-collection/data/min_metadata.json";
    import { nativeTitle, queryUser } from "./ts/utils";
    import { completedList, distance, endYear, scoreThreshold, selected_anime, startYear, username } from "./store";
    import _ from "lodash";
    import { ANIME_DATA } from "../../data-collection/types";
    import TextInput from "./TextInput.svelte";
    import SliderFilter from "./SliderFilter.svelte";
import { AnimeNode, Node } from "./ts/node";

    function getOptionLabel(option) {
        if (!option) return "";
        if (!option.englishTitle) return option.title;
        if (option.title === option.englishTitle) return option.title;
        if (nativeTitle(option) === option.englishTitle) {
            return `${option.englishTitle} (${option.title})`;
        } else {
            return `${option.title} (${option.englishTitle})`;
        }
    }

    let options = _.values(Anime) as ANIME_DATA[];

    async function handleSubmit(e: Event, input: string) {
        e.preventDefault();
        console.log(input);
        username.set(input);
        if (input === "") {
            completedList.set([]);
            return;
        }

        const list = await queryUser(input);
        if (list === null) {
            alert("User not found or server error, please try again."); // TODO: prettier error handling
        } else {
            completedList.set(list);
        }
        $distance = $distance; // force update
    }

    function onInit(nodes: AnimeNode[]) {
        function updateBrightness(node: AnimeNode, distance: number, scoreThreshold: number, startYear: number, endYear: number) {
            const passingScore = node.metadata.score >= scoreThreshold;
            const yearInRange =
                node.metadata.year <= endYear &&
                node.metadata.year >= startYear;
            const inRecs = node.recommendation_rank <= distance;

            if (passingScore && yearInRange && inRecs) {
                node.brightness = 1;
            } else {
                node.brightness = 0.5;
            }
        }

        distance.subscribe(() => {
            nodes.forEach(node => updateBrightness(node, $distance, $scoreThreshold, $startYear, $endYear));
        });
    }
</script>

<Canvas 
    {onInit}
/>

<Sidebar>
    <SidebarHeader
        slot="top-header"
        githubURL="https://github.com/platers/MAL-Map"
    >
        <LangButton />
    </SidebarHeader>
    <Searchbar slot="searchbar" {selected_anime} {options} {getOptionLabel} />
    <Filters slot="filters">
        <TextInput
            placeholder="MyAnimeList Username"
            title="Enter your MyAnimeList username and press the search icon"
            {handleSubmit}
        />
        <SliderFilter
            label="Distance to user watched list"
            value={distance}
            min={0}
            max={1}
            step={0.01}
        />
    </Filters>

    <AnimeView slot="metadata-view" />
</Sidebar>

<style lang="scss">
</style>
