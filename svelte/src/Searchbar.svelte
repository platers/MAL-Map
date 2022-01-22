<script lang="ts">
    import _ from "lodash";
    import Autocomplete from "@smui-extra/autocomplete";
    import { ANIME_DATA } from "../../data-collection/types";
    import { Writable } from "svelte/store";

    export let selected_anime: Writable<ANIME_DATA>;
    export let options: ANIME_DATA[];
    export let getOptionLabel: (option: ANIME_DATA) => string;

    let autocomplete_anime: ANIME_DATA | null = null;
    $: if (autocomplete_anime) {
        $selected_anime = autocomplete_anime;
    }
</script>

<Autocomplete
    {options}
    {getOptionLabel}
    showMenuWithNoInput={false}
    search={async (input) => {
        const linput = input.toLowerCase();
        return options
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
