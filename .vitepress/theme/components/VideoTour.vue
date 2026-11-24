<script setup lang="ts">
// The home page's video: a poster with a play button. YouTube (privacy mode)
// loads only when the visitor presses play. Nothing is shown until a video id
// is given, so the page can go live before the video is on YouTube. Its texts
// follow the page's language (English or French).
import { computed, ref } from "vue";
import { useData } from "vitepress";

const props = defineProps<{ id: string; title: string; length: string }>();
const playing = ref(false);
const { lang } = useData();

const TEXT = {
  en: {
    kicker: "See it working",
    heading: "Unda in three and a half minutes",
    lead: "The real dashboard: going live, 24/7 channels, backups, restreaming, TV outputs and watching over it all.",
    play: "Play the video:",
    credits:
      "Films © Blender Foundation (Big Buck Bunny, Elephants Dream, Sintel, Tears of Steel), CC BY. Music: “Inspired” by Kevin MacLeod (incompetech.com), CC BY 4.0. Plays from YouTube.",
  },
  fr: {
    kicker: "Voyez-le en action",
    heading: "Unda en trois minutes et demie",
    lead: "Le vrai tableau de bord : passer en direct, chaînes 24h/24, secours, rediffusion, sorties TV et la surveillance de l’ensemble. Vidéo sans voix, sous-titrée en anglais.",
    play: "Lire la vidéo :",
    credits:
      "Films © Blender Foundation (Big Buck Bunny, Elephants Dream, Sintel, Tears of Steel), CC BY. Musique : « Inspired » de Kevin MacLeod (incompetech.com), CC BY 4.0. Lue depuis YouTube.",
  },
};
const t = computed(() => (lang.value.startsWith("fr") ? TEXT.fr : TEXT.en));
</script>

<template>
  <section v-if="props.id" class="m-section m-tight m-video-section">
    <div class="m-wrap">
      <div class="m-head m-center">
        <span class="m-kicker">{{ t.kicker }}</span>
        <h2>{{ t.heading }}</h2>
        <p>{{ t.lead }}</p>
      </div>
      <div class="m-video">
        <iframe
          v-if="playing"
          :src="`https://www.youtube-nocookie.com/embed/${props.id}?autoplay=1&rel=0&cc_load_policy=1`"
          :title="props.title"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen
        ></iframe>
        <button v-else type="button" class="m-video-poster" :aria-label="`${t.play} ${props.title} (${props.length})`" @click="playing = true">
          <img src="/screens/video-poster.webp" width="1600" height="900" alt="" loading="lazy" />
          <span class="m-video-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></span>
          <span class="m-video-length">{{ props.length }}</span>
        </button>
      </div>
      <p class="m-video-credits">{{ t.credits }}</p>
    </div>
  </section>
</template>
