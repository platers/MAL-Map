<script lang="ts">
    import {params_dict, updateHashParams} from "./ts/base_utils";

    import {currentLanguage} from "./ts/utils";

    function changeLanguage() {
        params_dict.language = currentLanguage() === "en" ? "og" : "en";
        updateHashParams();
        window.location.reload();
    }
</script>

<button class="lang-button" on:click={() => changeLanguage()}>
    {#if currentLanguage() === "en"}
        Language: Original
    {:else}
        Language: English
    {/if}
</button>

<style>
    .lang-button {
        color: var(--color-d-gray-20);
        background: transparent;
        cursor: pointer;
        border: none;
    }
</style>
