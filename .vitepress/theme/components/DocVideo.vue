<script setup lang="ts">
// A video inside a guide page: a still picture with a play button, like the
// home page's video. YouTube (privacy mode) loads only when the visitor presses
// play. The play button's label follows the page's language.
import { computed, ref } from "vue";
import { useData } from "vitepress";

const props = defineProps<{ id: string; title: string; length: string; poster: string }>();
const playing = ref(false);
const { lang } = useData();
const play = computed(() => (lang.value.startsWith("fr") ? "Lire la vidéo :" : "Play the video:"));
</script>

<template>
  <div class="m-video m-doc-video">
    <iframe
      v-if="playing"
      :src="`https://www.youtube-nocookie.com/embed/${props.id}?autoplay=1&rel=0`"
      :title="props.title"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowfullscreen
    ></iframe>
    <button v-else type="button" class="m-video-poster" :aria-label="`${play} ${props.title} (${props.length})`" @click="playing = true">
      <img :src="props.poster" width="1600" height="900" alt="" loading="lazy" />
      <span class="m-video-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></span>
      <span class="m-video-length">{{ props.length }}</span>
    </button>
  </div>
</template>
