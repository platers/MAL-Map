<script lang="ts">
    import { currentLanguage, params_dict, updateHashParams } from "./ts/utils";

    function changeLanguage() {
        const newLang = currentLanguage() === "en" ? "ja" : "en";
        params_dict.language = newLang;
        updateHashParams();
        window.location.reload();
    }
</script>

<button class="lang-button" on:click={(e) => changeLanguage()}>
    {#if currentLanguage() === "en"}
        JA
    {:else}
        EN
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
