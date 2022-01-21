<script lang="ts">
    import { currentLanguage, params_dict, updateHashParams } from "./ts/utils";

    function changeLanguage() {
        const newLang = currentLanguage() === "en" ? "ja" : "en";
        params_dict.language = newLang;
        updateHashParams();
        window.location.reload();
    }
</script>

<div style="text-align: center;">
    <a href="https://github.com/platers/MAL-Map" class="github-link">
        <i class="fa fa-github" style="font-size: 30px;" />
    </a>
    <button class="lang-button" on:click={(e) => changeLanguage()}>
        {#if currentLanguage() === "en"}
            JA
        {:else}
            EN
        {/if}
    </button>
</div>

<style>
    .github-link {
        color: var(--color-d-gray-20);
    }

    .lang-button {
        color: var(--color-d-gray-20);
        background: transparent;
        cursor: pointer;
        border: none;
    }
</style>
