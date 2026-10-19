<script setup lang="ts">
// The Order page's form: the licence agreement's Part A, the terms and a typed
// signature, in a page that works in any browser, phones included. It posts to
// /api/order (a Vercel function, api/order.js), which fills in the PDF, emails
// it to us and answers with it, so the buyer downloads their copy at once.
// Labels and terms come from api/_lib/contract-text.js, the same source as the
// PDF. "website" is a trap field people never see; "started" lets the function
// refuse forms sent faster than a person can fill them in.
import { onMounted, reactive, ref } from "vue";
import { FIELDS, PACKAGES, HOSTING, TERMS, COUNTRIES, COMMON_COUNTRIES, md } from "../../../api/_lib/contract-text.js";

const SUPPORT = "support@undamedia.com";
const PDF = "/unda-licence-agreement.pdf";

const v = reactive<Record<string, string>>(Object.fromEntries(Object.keys(FIELDS).map((k) => [k, ""])));
const choice = reactive({ package: "", hosting: "" });
const signer = reactive({ name: "", title: "" });
const agree = ref(false);
const website = ref("");
const started = ref(0);

const sending = ref(false);
const sent = ref(false);
const error = ref("");
const copyURL = ref("");
const copyName = ref("unda-licence-agreement.pdf");

const label = (name: string) => FIELDS[name].label;
const max = (name: string) => FIELDS[name].max;

onMounted(() => {
  started.value = Date.now();
  // The Packages page links here with ?package=<name>; only known names.
  const want = new URLSearchParams(location.search).get("package");
  if (want && PACKAGES.some((p) => p.value === want)) choice.package = want;
});

async function submit() {
  error.value = "";
  sending.value = true;
  try {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...v,
        package: choice.package,
        hosting: choice.hosting,
        signer_name: signer.name,
        signer_title: signer.title,
        agree: agree.value,
        website: website.value,
        started: started.value,
      }),
    });
    const type = res.headers.get("Content-Type") || "";
    if (!res.ok || !type.includes("application/pdf")) {
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "");
    } else {
      const named = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") || "");
      if (named) copyName.value = named[1];
      copyURL.value = URL.createObjectURL(await res.blob());
    }
    sent.value = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    error.value = (e as Error).message || "The agreement could not be sent.";
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <form class="m-form m-order" @submit.prevent="submit">
    <div v-if="sent" class="m-done">
      <div class="m-status m-ok" role="status">
        Signed and sent. We'll check it against our quote, sign our side and email it back to {{ v.contact_email }} with your invoice.
      </div>
      <a v-if="copyURL" class="m-btn m-btn-primary" :href="copyURL" :download="copyName">Download your copy (PDF)</a>
      <p class="m-note">Keep your copy. Questions? Email <a :href="`mailto:${SUPPORT}`">{{ SUPPORT }}</a>.</p>
    </div>
    <template v-else>
      <h3 class="m-form-h"><span>A1</span>Your organisation</h3>
      <label>{{ label("customer_name") }}
        <input v-model.trim="v.customer_name" autocomplete="organization" required :maxlength="max('customer_name')" />
      </label>
      <div class="m-row">
        <label>{{ label("customer_reg_no") }}
          <input v-model.trim="v.customer_reg_no" :maxlength="max('customer_reg_no')" />
        </label>
        <label>{{ label("customer_country") }}
          <select v-model="v.customer_country" autocomplete="country-name" required>
            <option value="" disabled>Choose a country</option>
            <option v-for="c in COMMON_COUNTRIES" :key="'common-' + c" :value="c">{{ c }}</option>
            <option disabled>──────────</option>
            <option v-for="c in COUNTRIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>
      </div>
      <label>{{ label("customer_address") }}
        <textarea v-model.trim="v.customer_address" class="m-short" autocomplete="street-address" required :maxlength="max('customer_address')"></textarea>
      </label>
      <div class="m-row">
        <label>{{ label("contact_name") }}
          <input v-model.trim="v.contact_name" autocomplete="name" required :maxlength="max('contact_name')" />
        </label>
        <label>{{ label("contact_title") }}
          <input v-model.trim="v.contact_title" autocomplete="organization-title" :maxlength="max('contact_title')" />
        </label>
      </div>
      <div class="m-row">
        <label>{{ label("contact_email") }}
          <input v-model.trim="v.contact_email" type="email" autocomplete="email" required :maxlength="max('contact_email')" />
        </label>
        <label>{{ label("contact_phone") }}
          <input v-model.trim="v.contact_phone" type="tel" autocomplete="tel" :maxlength="max('contact_phone')" />
        </label>
      </div>
      <label>{{ label("billing_email") }}
        <input v-model.trim="v.billing_email" type="email" :maxlength="max('billing_email')" />
      </label>

      <h3 class="m-form-h"><span>A2</span>Package</h3>
      <p class="m-hint">Choose one. The packages are described on the <a href="/packages">Packages page</a>.</p>
      <div role="radiogroup" aria-label="Package">
        <label v-for="p in PACKAGES" :key="p.value" class="m-choice">
          <input v-model="choice.package" type="radio" name="package" :value="p.value" required />
          <span><strong>{{ p.value }}</strong>{{ p.desc }}</span>
        </label>
      </div>
      <template v-if="choice.package === 'Custom'">
        <div class="m-row">
          <label>{{ label("custom_streams") }}
            <input v-model.trim="v.custom_streams" required :maxlength="max('custom_streams')" />
          </label>
          <label>{{ label("custom_members") }}
            <input v-model.trim="v.custom_members" required :maxlength="max('custom_members')" />
          </label>
        </div>
        <label>{{ label("custom_tools") }}
          <input v-model.trim="v.custom_tools" :maxlength="max('custom_tools')" />
        </label>
      </template>

      <h3 class="m-form-h"><span>A3</span>How Unda runs</h3>
      <div role="radiogroup" aria-label="How Unda runs">
        <label v-for="h in HOSTING" :key="h.value" class="m-choice">
          <input v-model="choice.hosting" type="radio" name="hosting" :value="h.value" required />
          <span><strong>{{ h.value }}</strong>{{ h.desc }}</span>
        </label>
      </div>
      <label>{{ label("domains") }}
        <input v-model.trim="v.domains" :maxlength="max('domains')" />
      </label>

      <h3 class="m-form-h"><span>A4</span>Term and fees</h3>
      <p class="m-hint">Copy these from our quote. Don't have one yet? <a href="/contact">Ask for a price</a> first.</p>
      <div class="m-row">
        <label>{{ label("quote_number") }}
          <input v-model.trim="v.quote_number" :maxlength="max('quote_number')" />
        </label>
        <label>{{ label("start_date") }}
          <input v-model="v.start_date" type="date" min="2000-01-01" max="2100-12-31" />
        </label>
      </div>
      <div class="m-row">
        <label>{{ label("licence_term") }}
          <input v-model.trim="v.licence_term" :maxlength="max('licence_term')" />
        </label>
        <label>{{ label("licence_fee") }}
          <input v-model.trim="v.licence_fee" :maxlength="max('licence_fee')" />
        </label>
      </div>
      <div class="m-row">
        <label>{{ label("currency") }}
          <input v-model.trim="v.currency" :maxlength="max('currency')" />
        </label>
        <label>{{ label("billing_period") }}
          <input v-model.trim="v.billing_period" :maxlength="max('billing_period')" />
        </label>
      </div>
      <div class="m-row">
        <label v-if="choice.hosting === 'Managed'">{{ label("hosting_fee") }}
          <input v-model.trim="v.hosting_fee" :maxlength="max('hosting_fee')" />
        </label>
        <label>{{ label("payment_days") }}
          <input v-model.trim="v.payment_days" inputmode="numeric" :maxlength="max('payment_days')" />
        </label>
      </div>

      <h3 class="m-form-h"><span>A5</span>Anything else we agreed</h3>
      <label>{{ label("special_terms") }}
        <textarea v-model.trim="v.special_terms" class="m-short" :maxlength="max('special_terms')"></textarea>
      </label>

      <h3 class="m-form-h"><span>B</span>Terms</h3>
      <p class="m-hint">These terms apply to every licence. You can also <a :href="PDF" target="_blank" rel="noopener">read them in the PDF</a>.</p>
      <details class="m-terms">
        <summary>Read the terms</summary>
        <div class="m-terms-body">
          <template v-for="[n, title, items] in TERMS" :key="n">
            <h4>{{ n }}. {{ title }}</h4>
            <p v-for="[num, text] in items" :key="num">
              <b>{{ num }}</b><template v-for="(part, i) in md(text)" :key="i"><strong v-if="part.bold">{{ part.t }}</strong><template v-else>{{ part.t }}</template></template>
            </p>
          </template>
        </div>
      </details>

      <h3 class="m-form-h"><span>C</span>Sign</h3>
      <div class="m-row">
        <label>Your full name (this is your signature)
          <input v-model.trim="signer.name" autocomplete="name" required maxlength="100" />
        </label>
        <label>Your job title
          <input v-model.trim="signer.title" autocomplete="organization-title" required maxlength="100" />
        </label>
      </div>
      <label class="m-check">
        <input v-model="agree" type="checkbox" required />
        <span>I have read the terms and agree to them for the organisation above, and I am allowed to sign for it.</span>
      </label>
      <div class="m-trap" aria-hidden="true">
        <label>Leave this empty <input v-model="website" name="website" tabindex="-1" autocomplete="off" /></label>
      </div>
      <button class="m-btn m-btn-primary" type="submit" :disabled="sending">
        {{ sending ? "Signing…" : "Sign and send" }}
      </button>
      <div v-if="error" class="m-status m-err" role="alert">
        {{ error }} You can also <a :href="PDF" download>download the PDF</a> and email it to <a :href="`mailto:${SUPPORT}`">{{ SUPPORT }}</a>.
      </div>
      <p class="m-note">You get a copy of the signed PDF straight away. With your answers we keep the time, your IP address and your browser, as a record of your signature. See our <a href="/privacy">privacy policy</a>.</p>
    </template>
  </form>
</template>
