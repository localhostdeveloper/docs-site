<script setup lang="ts">
// The home page's video: a poster with a play button. YouTube (privacy mode)
// loads only when the visitor presses play. Nothing is shown until a video id
// is given, so the page can go live before the video is on YouTube.
import { ref } from "vue";

const props = defineProps<{ id: string; title: string; length: string }>();
const playing = ref(false);
</script>

<template>
  <section v-if="props.id" class="m-section m-tight m-video-section">
    <div class="m-wrap">
      <div class="m-head m-center">
        <span class="m-kicker">See it working</span>
        <h2>Unda in three and a half minutes</h2>
        <p>The real dashboard: going live, 24/7 channels, backups, restreaming, TV outputs and watching over it all.</p>
      </div>
      <div class="m-video">
        <iframe
          v-if="playing"
          :src="`https://www.youtube-nocookie.com/embed/${props.id}?autoplay=1&rel=0&cc_load_policy=1`"
          :title="props.title"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen
        ></iframe>
        <button v-else type="button" class="m-video-poster" :aria-label="`Play the video: ${props.title} (${props.length})`" @click="playing = true">
          <img src="/screens/video-poster.webp" width="1600" height="900" alt="" loading="lazy" />
          <span class="m-video-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></span>
          <span class="m-video-length">{{ props.length }}</span>
        </button>
      </div>
      <p class="m-video-credits">Films © Blender Foundation (Big Buck Bunny, Elephants Dream, Sintel, Tears of Steel), CC BY. Music: “Inspired” by Kevin MacLeod (incompetech.com), CC BY 4.0. Plays from YouTube.</p>
    </div>
  </section>
</template>
