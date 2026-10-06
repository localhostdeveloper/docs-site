<script setup lang="ts">
// The Contact page's form. It posts to /api/contact (a Vercel function,
// api/contact.js), which emails support. "website" is a trap field people
// never see; "started" lets the function refuse forms sent faster than a
// person can type.
import { onMounted, ref } from "vue";

const SUPPORT = "support@undamedia.com";

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
  if (want && ["Starter", "Professional", "Broadcast", "Custom"].includes(want) && !message.value) message.value = `I'm interested in the ${want} package.\n\n`;
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
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "");
    sent.value = true;
  } catch (e) {
    error.value = (e as Error).message || "The message could not be sent.";
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <form class="m-form" @submit.prevent="submit">
    <div v-if="sent" class="m-status m-ok" role="status">
      Thank you. Your message is on its way to us, and we'll reply to {{ email }}.
    </div>
    <template v-else>
      <div class="m-row">
        <label>Your name
          <input v-model.trim="name" name="name" autocomplete="name" required maxlength="100" />
        </label>
        <label>Email
          <input v-model.trim="email" name="email" type="email" autocomplete="email" required maxlength="200" />
        </label>
      </div>
      <label>Organisation <span style="font-weight: 400; color: var(--vp-c-text-2)">(optional)</span>
        <input v-model.trim="organisation" name="organisation" autocomplete="organization" maxlength="150" />
      </label>
      <label>What can we help with?
        <select v-model="topic" name="topic">
          <option>A price for a package</option>
          <option>A demo</option>
          <option>Managed hosting (you run the server)</option>
          <option>Help with an installation</option>
          <option>Partnership or reselling</option>
          <option>Something else</option>
        </select>
      </label>
      <label>Message
        <textarea v-model.trim="message" name="message" required minlength="10" maxlength="5000"
          placeholder="Tell us what you stream, how many streams and viewers you expect, and where your server is."></textarea>
      </label>
      <div class="m-trap" aria-hidden="true">
        <label>Leave this empty <input v-model="website" name="website" tabindex="-1" autocomplete="off" /></label>
      </div>
      <button class="m-btn m-btn-primary" type="submit" :disabled="sending">
        {{ sending ? "Sending…" : "Send message" }}
      </button>
      <div v-if="error" class="m-status m-err" role="alert">
        {{ error }} You can also email us at <a :href="`mailto:${SUPPORT}`">{{ SUPPORT }}</a>.
      </div>
      <p class="m-note">We use your details only to answer you. See our <a href="/privacy">privacy policy</a>.</p>
    </template>
  </form>
</template>
