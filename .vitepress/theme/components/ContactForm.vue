<script setup lang="ts">
// The Contact page's form. It posts to /api/contact (a Vercel function,
// api/contact.js), which emails support. "website" is a trap field people
// never see; "started" lets the function refuse forms sent faster than a
// person can type.
import { onMounted, ref } from "vue";

// lang "fr" shows the form in French (the French Contact page). The topics
// keep their English values: the function only accepts those.
const props = defineProps<{ lang?: string }>();
const fr = props.lang === "fr";
const SUPPORT = "support@undamedia.com";
const TOPICS: [string, string][] = [
  ["A price for a package", "Un prix pour une offre"],
  ["A demo", "Une démonstration"],
  ["Managed hosting (you run the server)", "Un hébergement géré (vous faites tourner le serveur)"],
  ["Help with an installation", "De l'aide pour une installation"],
  ["Partnership or reselling", "Un partenariat ou la revente"],
  ["Something else", "Autre chose"],
];
const T = fr
  ? { name: "Votre nom", email: "E-mail", org: "Organisation", optional: "(facultatif)", topic: "Comment pouvons-nous vous aider ?", message: "Message",
      placeholder: "Dites-nous ce que vous diffusez, combien de flux et de spectateurs vous prévoyez, et où se trouve votre serveur.",
      trap: "Laissez ce champ vide", sending: "Envoi…", send: "Envoyer le message", alsoEmail: "Vous pouvez aussi nous écrire à",
      thanks: "Merci. Votre message est en route, et nous répondrons à", privacy: "Nous utilisons vos coordonnées uniquement pour vous répondre. Voir notre", policy: "politique de confidentialité",
      failed: "Le message n'a pas pu être envoyé.", tooMany: "Trop de messages depuis votre connexion. Attendez 10 minutes et renvoyez-le.",
      interested: (p: string) => `Je suis intéressé par l'offre ${p}.\n\n` }
  : { name: "Your name", email: "Email", org: "Organisation", optional: "(optional)", topic: "What can we help with?", message: "Message",
      placeholder: "Tell us what you stream, how many streams and viewers you expect, and where your server is.",
      trap: "Leave this empty", sending: "Sending…", send: "Send message", alsoEmail: "You can also email us at",
      thanks: "Thank you. Your message is on its way to us, and we'll reply to", privacy: "We use your details only to answer you. See our", policy: "privacy policy",
      failed: "The message could not be sent.", tooMany: "Too many messages from your connection. Please wait 10 minutes and send it again.",
      interested: (p: string) => `I'm interested in the ${p} package.\n\n` };
// The function's own messages, in French.
const FR_ERRORS: Record<string, string> = {
  "Please give your name.": "Indiquez votre nom.",
  "Please give an email address we can reply to.": "Indiquez une adresse e-mail à laquelle nous pouvons répondre.",
  "Please write a little more in the message.": "Écrivez un peu plus dans le message.",
  "Use the form on the Contact page.": "Utilisez le formulaire de la page Contact.",
  "The form is not set up yet.": "Le formulaire n'est pas encore prêt.",
  "The message could not be sent just now.": "Le message n'a pas pu être envoyé pour le moment.",
};
const say = (m: string) => (fr ? FR_ERRORS[m] || m : m);

const name = ref("");
const email = ref("");
const organisation = ref("");
const topic = ref("A price for a package");
const message = ref("");
const website = ref("");
const started = ref(0);

const sending = ref(false);
const sent = ref(false);
const error = ref("");

onMounted(() => {
  started.value = Date.now();
  // The Packages page links here with ?package=<name>; only known names.
  const want = new URLSearchParams(location.search).get("package");
  if (want && ["Starter", "Professional", "Broadcast", "Custom"].includes(want) && !message.value) message.value = T.interested(want);
});

async function submit() {
  error.value = "";
  sending.value = true;
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        organisation: organisation.value,
        topic: topic.value,
        message: message.value,
        website: website.value,
        started: started.value,
      }),
    });
    // 429 comes from the site's firewall rule, not the function.
    if (res.status === 429) throw new Error(T.tooMany);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(say(body.error || ""));
    sent.value = true;
  } catch (e) {
    error.value = (e as Error).message || T.failed;
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <form class="m-form" @submit.prevent="submit">
    <div v-if="sent" class="m-status m-ok" role="status">
      {{ T.thanks }} {{ email }}.
    </div>
    <template v-else>
      <div class="m-row">
        <label>{{ T.name }}
          <input v-model.trim="name" name="name" autocomplete="name" required maxlength="100" />
        </label>
        <label>{{ T.email }}
          <input v-model.trim="email" name="email" type="email" autocomplete="email" required maxlength="200" />
        </label>
      </div>
      <label>{{ T.org }} <span style="font-weight: 400; color: var(--vp-c-text-2)">{{ T.optional }}</span>
        <input v-model.trim="organisation" name="organisation" autocomplete="organization" maxlength="150" />
      </label>
      <label>{{ T.topic }}
        <select v-model="topic" name="topic">
          <option v-for="[value, french] in TOPICS" :key="value" :value="value">{{ fr ? french : value }}</option>
        </select>
      </label>
      <label>{{ T.message }}
        <textarea v-model.trim="message" name="message" required minlength="10" maxlength="5000"
          :placeholder="T.placeholder"></textarea>
      </label>
      <div class="m-trap" aria-hidden="true">
        <label>{{ T.trap }} <input v-model="website" name="website" tabindex="-1" autocomplete="off" /></label>
      </div>
      <button class="m-btn m-btn-primary" type="submit" :disabled="sending">
        {{ sending ? T.sending : T.send }}
      </button>
      <div v-if="error" class="m-status m-err" role="alert">
        {{ error }} {{ T.alsoEmail }} <a :href="`mailto:${SUPPORT}`">{{ SUPPORT }}</a>.
      </div>
      <p class="m-note">{{ T.privacy }} <a href="/privacy">{{ T.policy }}</a>.</p>
    </template>
  </form>
</template>
