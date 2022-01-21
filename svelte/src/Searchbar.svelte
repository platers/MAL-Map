<script lang="ts">
    import _ from "lodash";
    import Autocomplete from "@smui-extra/autocomplete";
    import { ANIME_DATA } from "../../data-collection/types";
    import { nativeTitle } from "./ts/utils";
    import Anime from "../../data-collection/data/min_metadata.json";
    import { selected_anime } from "./store";

    const anime_options = _.values(Anime);
    let autocomplete_anime: ANIME_DATA | null = null;
    $: if (autocomplete_anime) {
        $selected_anime = autocomplete_anime;
    }
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
</script>

<Autocomplete
    options={anime_options}
    {getOptionLabel}
    showMenuWithNoInput={false}
    search={async (input) => {
        const linput = input.toLowerCase();
        return anime_options
            .filter((a) => {
                return getOptionLabel(a).toLowerCase().includes(linput);
            })
            .sort((a, b) => {
                const aString = getOptionLabel(a).toLowerCase();
                const bString = getOptionLabel(b).toLowerCase();
                if (aString.startsWith(linput) && !bString.startsWith(linput)) {
                    return -1;
                } else if (
                    bString.startsWith(linput) &&
                    !aString.startsWith(linput)
                ) {
                    return 1;
                }
                return 0;
            })
            .slice(0, 10);
    }}
    bind:value={autocomplete_anime}
    placeholder="Search for an anime"
    label="Search Anime"
/>
