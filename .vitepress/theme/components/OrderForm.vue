<script setup lang="ts">
// The Order page's form: the licence agreement's Part A, the terms and a typed
// signature, in a page that works in any browser, phones included. It posts to
// /api/order (a Vercel function, api/order.js), which fills in the PDF, emails
// it to us and answers with it, so the buyer downloads their copy at once.
// Labels and terms come from api/_lib/contract-text.js, the same source as the
// PDF. "website" is a trap field people never see; "started" lets the function
// refuse forms sent faster than a person can fill them in.
//
// lang "fr" shows the form in French (the French Order page). The agreement
// itself stays English, so every choice keeps its English value (that is what
// the function accepts and what goes into the PDF), and the terms are shown in
// English with a note.
import { onMounted, reactive, ref } from "vue";
import {
  FIELDS, PACKAGES, HOSTING, TERMS, COUNTRIES, COMMON_COUNTRIES, CURRENCIES, LICENCE_TERMS, BILLING_PERIODS,
  PAYMENT_DAYS, JOB_TITLES, OTHER_TITLE, md,
} from "../../../api/_lib/contract-text.js";
import { COUNTRY_FR } from "./countries-fr";

const props = defineProps<{ lang?: string }>();
const fr = props.lang === "fr";
const SUPPORT = "support@undamedia.com";
const PDF = "/unda-licence-agreement.pdf";
const page = (p: string) => (fr ? "/fr" + p : p);

// The form's own words in French, by their English text.
const FR: Record<string, string> = {
  "Your organisation": "Votre organisation",
  "Choose a country": "Choisissez un pays",
  "Choose a job title": "Choisissez une fonction",
  "Other (type it)": "Autre (saisissez-la)",
  "Contact person’s job title": "Fonction de la personne à contacter",
  "Package": "Offre",
  "Choose one. The packages are described on the": "Choisissez-en une. Les offres sont décrites sur la",
  "Packages page": "page Offres",
  "A whole number, e.g. 20": "Un nombre entier, par exemple 20",
  "How Unda runs": "Comment Unda tourne",
  "Term and fees": "Durée et tarifs",
  "Copy these from our quote. Don't have one yet?": "Recopiez-les depuis notre devis. Vous n'en avez pas encore ?",
  "Ask for a price": "Demandez un prix",
  "first.": "d'abord.",
  "Choose": "Choisir",
  "e.g. 12,000": "p. ex. 12,000",
  "e.g. 1,500": "p. ex. 1,500",
  "A number, e.g. 12000 or 12,000.00": "Un nombre, par exemple 12000 ou 12,000.00",
  "A number, e.g. 1500 or 1,500.00": "Un nombre, par exemple 1500 ou 1,500.00",
  "days": "jours",
  "Anything else we agreed": "Tout autre accord entre nous",
  "Terms": "Conditions",
  "These terms apply to every licence. You can also": "Ces conditions s'appliquent à chaque licence. Vous pouvez aussi",
  "read them in the PDF": "les lire dans le PDF",
  "Read the terms": "Lire les conditions",
  "Sign": "Signature",
  "Your full name (this is your signature)": "Vos nom et prénom (c'est votre signature)",
  "Your job title": "Votre fonction",
  "Type your job title": "Saisissez votre fonction",
  "I have read the terms and agree to them for the organisation above, and I am allowed to sign for it.":
    "J'ai lu les conditions et je les accepte pour l'organisation ci-dessus, et je suis autorisé à signer pour elle.",
  "Leave this empty": "Laissez ce champ vide",
  "Signing…": "Signature…",
  "Sign and send": "Signer et envoyer",
  "You can also": "Vous pouvez aussi",
  "download the PDF": "télécharger le PDF",
  "and email it to": "et l'envoyer par e-mail à",
  "You get a copy of the signed PDF straight away. With your answers we keep the time, your IP address and your browser, as a record of your signature. See our":
    "Vous recevez tout de suite une copie du PDF signé. Avec vos réponses, nous gardons l'heure, votre adresse IP et votre navigateur, comme trace de votre signature. Voir notre",
  "privacy policy": "politique de confidentialité",
  "Download your copy (PDF)": "Télécharger votre copie (PDF)",
  "Keep your copy. Questions? Email": "Gardez votre copie. Des questions ? Écrivez à",
  "Too many tries from your connection. Please wait 10 minutes and send it again.":
    "Trop d'essais depuis votre connexion. Attendez 10 minutes et renvoyez-le.",
  "The agreement could not be sent.": "Le contrat n'a pas pu être envoyé.",
};
const t = (s: string) => (fr ? FR[s] ?? s : s);

// Part A's labels in French, by field name.
const FR_LABELS: Record<string, string> = {
  customer_name: "Nom légal complet de l'organisation",
  customer_reg_no: "Numéro d'immatriculation, s'il y en a un",
  customer_country: "Pays",
  customer_address: "Adresse du siège",
  contact_name: "Personne à contacter",
  contact_title: "Fonction",
  contact_email: "E-mail (nous y envoyons les avis)",
  contact_phone: "Téléphone",
  billing_email: "E-mail pour les factures, s'il est différent",
  custom_streams: "Sur mesure seulement : flux en direct simultanés",
  custom_members: "Sur mesure seulement : membres de l'équipe en plus des propriétaires",
  custom_tools: "Sur mesure seulement : outils compris",
  domains: "Noms de domaine auxquels lier la licence (facultatif), p. ex. tv.example.com",
  quote_number: "Numéro de devis",
  start_date: "Date de début",
  licence_term: "Durée de la licence",
  licence_fee: "Prix de la licence",
  currency: "Devise",
  billing_period: "Facturation",
  hosting_fee: "Prix de l'hébergement géré (géré seulement)",
  payment_days: "Régler les factures sous",
  special_terms: "Par exemple des délais de réponse de l'assistance, plusieurs installations, ou une remise",
};

// What each English choice shows in French; the English value is still sent.
const FR_CHOICES: Record<string, string> = {
  // Packages' descriptions
  "5 live streams at the same time, 5 team members": "5 flux en direct simultanés, 5 membres de l'équipe",
  "15 live streams at the same time, 15 team members": "15 flux en direct simultanés, 15 membres de l'équipe",
  "50 live streams at the same time, 50 team members": "50 flux en direct simultanés, 50 membres de l'équipe",
  "the limits and tools below": "les limites et les outils ci-dessous",
  Custom: "Sur mesure",
  // Hosting
  "Self-hosted": "Auto-hébergé",
  Managed: "Géré",
  "you install and run Unda on your own server": "vous installez et faites tourner Unda sur votre propre serveur",
  "we run the server for you (Part B, section 5)": "nous faisons tourner le serveur pour vous (partie B, section 5)",
  // Licence terms
  "1 month": "1 mois", "3 months": "3 mois", "6 months": "6 mois",
  "12 months": "12 mois", "24 months": "24 mois", "36 months": "36 mois",
  // Billing periods
  Monthly: "Chaque mois", "Every 3 months": "Tous les 3 mois", "Every 6 months": "Tous les 6 mois",
  Yearly: "Chaque année", "Once, in advance": "Une fois, à l'avance",
  // Currencies
  "US dollar": "Dollar américain", Euro: "Euro",
  // Job titles
  Owner: "Propriétaire", "Chief Executive Officer": "Directeur général", "Managing Director": "Directeur général délégué",
  Director: "Directeur", "General Manager": "Directeur général des opérations", "Station Manager": "Directeur de station",
  "Operations Manager": "Responsable des opérations", "Technical Director": "Directeur technique", "Chief Engineer": "Ingénieur en chef",
  "Head of IT": "Responsable informatique", "IT Manager": "Gestionnaire informatique", "Finance Manager": "Responsable financier",
  "Procurement Officer": "Responsable des achats", "Programme Manager": "Responsable des programmes", Producer: "Producteur",
};
const show = (s: string) => (fr ? FR_CHOICES[s] ?? s : s);
// Countries by their French name, in French order; the English name is sent.
const country = (c: string) => (fr ? COUNTRY_FR[c] ?? c : c);
const countries = fr ? [...COUNTRIES].sort((a, b) => country(a).localeCompare(country(b), "fr")) : COUNTRIES;

// The function's messages in French. The ones naming a field name it in English.
const LABEL_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(FIELDS).flatMap(([k, f]: [string, any]) => [[f.label, k], ...(f.form ? [[f.form, k]] : [])]),
);
const frLabel = (l: string) => FR_LABELS[LABEL_TO_NAME[l]] ?? l;
const FR_ERRORS: Record<string, string> = {
  "Send the form as JSON.": "Envoyez le formulaire au format JSON.",
  "Please choose your country from the list.": "Choisissez votre pays dans la liste.",
  "Please pick the start date from the calendar.": "Choisissez la date de début dans le calendrier.",
  "Please choose the currency from the list.": "Choisissez la devise dans la liste.",
  "Please choose the licence term from the list.": "Choisissez la durée de la licence dans la liste.",
  "Please choose how often you are billed from the list.": "Choisissez la fréquence de facturation dans la liste.",
  "Please choose the days to pay an invoice from the list.": "Choisissez le délai de paiement dans la liste.",
  "Please choose a package.": "Choisissez une offre.",
  "Please choose how Unda runs: self-hosted or managed.": "Choisissez comment Unda tourne : auto-hébergé ou géré.",
  "For the Custom package, please give the live streams and team members from our quote.":
    "Pour l'offre sur mesure, indiquez les flux en direct et les membres de l'équipe de notre devis.",
  "For the Custom package, please give the live streams and team members as whole numbers.":
    "Pour l'offre sur mesure, indiquez les flux en direct et les membres de l'équipe en nombres entiers.",
  "Please type your full name to sign.": "Saisissez vos nom et prénom pour signer.",
  "Please give your job title.": "Indiquez votre fonction.",
  "Please tick the box to agree to the terms.": "Cochez la case pour accepter les conditions.",
  "Use the form on the Order page.": "Utilisez le formulaire de la page Commande.",
  "The order form is not set up yet.": "Le formulaire de commande n'est pas encore prêt.",
  "The agreement could not be prepared just now.": "Le contrat n'a pas pu être préparé pour le moment.",
  "The agreement could not be sent just now.": "Le contrat n'a pas pu être envoyé pour le moment.",
};
function say(m: string): string {
  if (!fr) return m;
  if (FR_ERRORS[m]) return FR_ERRORS[m];
  let x = /^Please fill in “(.+)”\.$/.exec(m);
  if (x) return `Remplissez « ${frLabel(x[1])} ».`;
  x = /^Please check “(.+)”: it doesn’t look like an email address\.$/.exec(m);
  if (x) return `Vérifiez « ${frLabel(x[1])} » : ce n'est pas une adresse e-mail.`;
  x = /^Please write “(.+)” as a number/.exec(m);
  if (x) return `Écrivez « ${frLabel(x[1])} » sous forme de nombre, par exemple 12000 ou 12,000.00.`;
  return m;
}

const v = reactive<Record<string, string>>(Object.fromEntries(Object.keys(FIELDS).map((k) => [k, ""])));
v.payment_days = "14";
// Job titles: picked from the list, or typed after choosing "Other".
const titles = reactive({ contact: { pick: "", other: "" }, signer: { pick: "", other: "" } });
const titleOf = (t: { pick: string; other: string }) => (t.pick === OTHER_TITLE ? t.other.trim() : t.pick);
const choice = reactive({ package: "", hosting: "" });
const signer = reactive({ name: "" });
const agree = ref(false);
const website = ref("");
const started = ref(0);

const sending = ref(false);
const sent = ref(false);
const error = ref("");
const copyURL = ref("");
const copyName = ref("unda-licence-agreement.pdf");

const label = (name: string) => (fr && FR_LABELS[name]) || FIELDS[name].form || FIELDS[name].label;
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
        contact_title: titleOf(titles.contact),
        package: choice.package,
        hosting: choice.hosting,
        signer_name: signer.name,
        signer_title: titleOf(titles.signer),
        agree: agree.value,
        website: website.value,
        started: started.value,
      }),
    });
    // 429 comes from the site's firewall rule, not the function.
    if (res.status === 429) throw new Error(t("Too many tries from your connection. Please wait 10 minutes and send it again."));
    const type = res.headers.get("Content-Type") || "";
    if (!res.ok || !type.includes("application/pdf")) {
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(say(body.error || ""));
    } else {
      const named = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") || "");
      if (named) copyName.value = named[1];
      copyURL.value = URL.createObjectURL(await res.blob());
    }
    sent.value = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    error.value = (e as Error).message || t("The agreement could not be sent.");
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <form class="m-form m-order" @submit.prevent="submit">
    <div v-if="sent" class="m-done">
      <div class="m-status m-ok" role="status">
        <template v-if="fr">Signé et envoyé. Nous le vérifierons par rapport à notre devis, signerons notre partie et le renverrons à {{ v.contact_email }} avec votre facture.</template>
        <template v-else>Signed and sent. We'll check it against our quote, sign our side and email it back to {{ v.contact_email }} with your invoice.</template>
      </div>
      <a v-if="copyURL" class="m-btn m-btn-primary" :href="copyURL" :download="copyName">{{ t("Download your copy (PDF)") }}</a>
      <p class="m-note">{{ t("Keep your copy. Questions? Email") }} <a :href="`mailto:${SUPPORT}`">{{ SUPPORT }}</a>.</p>
    </div>
    <template v-else>
      <h3 class="m-form-h"><span>A1</span>{{ t("Your organisation") }}</h3>
      <label>{{ label("customer_name") }}
        <input v-model.trim="v.customer_name" autocomplete="organization" required :maxlength="max('customer_name')" />
      </label>
      <div class="m-row">
        <label>{{ label("customer_reg_no") }}
          <input v-model.trim="v.customer_reg_no" :maxlength="max('customer_reg_no')" />
        </label>
        <label>{{ label("customer_country") }}
          <select v-model="v.customer_country" autocomplete="country-name" required>
            <option value="" disabled>{{ t("Choose a country") }}</option>
            <option v-for="c in COMMON_COUNTRIES" :key="'common-' + c" :value="c">{{ country(c) }}</option>
            <option v-if="COMMON_COUNTRIES.length" disabled>──────────</option>
            <option v-for="c in countries" :key="c" :value="c">{{ country(c) }}</option>
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
        <div>
          <label>{{ label("contact_title") }}
            <select v-model="titles.contact.pick">
              <option value="">{{ t("Choose a job title") }}</option>
              <option v-for="jt in JOB_TITLES" :key="jt" :value="jt">{{ show(jt) }}</option>
              <option :value="OTHER_TITLE">{{ t("Other (type it)") }}</option>
            </select>
          </label>
          <label v-if="titles.contact.pick === OTHER_TITLE" class="m-other">{{ t("Contact person’s job title") }}
            <input v-model="titles.contact.other" autocomplete="organization-title" required :maxlength="max('contact_title')" />
          </label>
        </div>
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

      <h3 class="m-form-h"><span>A2</span>{{ t("Package") }}</h3>
      <p class="m-hint">{{ t("Choose one. The packages are described on the") }} <a :href="page('/packages')">{{ t("Packages page") }}</a>.</p>
      <div role="radiogroup" :aria-label="t('Package')">
        <label v-for="p in PACKAGES" :key="p.value" class="m-choice">
          <input v-model="choice.package" type="radio" name="package" :value="p.value" required />
          <span><strong>{{ show(p.value) }}</strong>{{ show(p.desc) }}</span>
        </label>
      </div>
      <template v-if="choice.package === 'Custom'">
        <div class="m-row">
          <label>{{ label("custom_streams") }}
            <input v-model.trim="v.custom_streams" inputmode="numeric" pattern="[1-9][0-9]{0,5}" :title="t('A whole number, e.g. 20')" required :maxlength="max('custom_streams')" />
          </label>
          <label>{{ label("custom_members") }}
            <input v-model.trim="v.custom_members" inputmode="numeric" pattern="[1-9][0-9]{0,5}" :title="t('A whole number, e.g. 20')" required :maxlength="max('custom_members')" />
          </label>
        </div>
        <label>{{ label("custom_tools") }}
          <input v-model.trim="v.custom_tools" :maxlength="max('custom_tools')" />
        </label>
      </template>

      <h3 class="m-form-h"><span>A3</span>{{ t("How Unda runs") }}</h3>
      <div role="radiogroup" :aria-label="t('How Unda runs')">
        <label v-for="h in HOSTING" :key="h.value" class="m-choice">
          <input v-model="choice.hosting" type="radio" name="hosting" :value="h.value" required />
          <span><strong>{{ show(h.value) }}</strong>{{ show(h.desc) }}</span>
        </label>
      </div>
      <label>{{ label("domains") }}
        <input v-model.trim="v.domains" :maxlength="max('domains')" />
      </label>

      <h3 class="m-form-h"><span>A4</span>{{ t("Term and fees") }}</h3>
      <p class="m-hint">{{ t("Copy these from our quote. Don't have one yet?") }} <a :href="page('/contact')">{{ t("Ask for a price") }}</a> {{ t("first.") }}</p>
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
          <select v-model="v.licence_term">
            <option value="">{{ t("Choose") }}</option>
            <option v-for="lt in LICENCE_TERMS" :key="lt" :value="lt">{{ show(lt) }}</option>
          </select>
        </label>
        <label>{{ label("licence_fee") }}
          <input v-model.trim="v.licence_fee" inputmode="decimal" :placeholder="t('e.g. 12,000')" pattern="(\d{1,3}(,\d{3})+|\d+)(\.\d{1,2})?" :title="t('A number, e.g. 12000 or 12,000.00')" :maxlength="max('licence_fee')" />
        </label>
      </div>
      <div class="m-row">
        <label>{{ label("currency") }}
          <select v-model="v.currency">
            <option value="">{{ t("Choose") }}</option>
            <option v-for="c in CURRENCIES" :key="c.code" :value="c.code">{{ show(c.name) }} ({{ c.code }})</option>
          </select>
        </label>
        <label>{{ label("billing_period") }}
          <select v-model="v.billing_period">
            <option value="">{{ t("Choose") }}</option>
            <option v-for="b in BILLING_PERIODS" :key="b" :value="b">{{ show(b) }}</option>
          </select>
        </label>
      </div>
      <div class="m-row">
        <label v-if="choice.hosting === 'Managed'">{{ label("hosting_fee") }}
          <input v-model.trim="v.hosting_fee" inputmode="decimal" :placeholder="t('e.g. 1,500')" pattern="(\d{1,3}(,\d{3})+|\d+)(\.\d{1,2})?" :title="t('A number, e.g. 1500 or 1,500.00')" :maxlength="max('hosting_fee')" />
        </label>
        <label>{{ label("payment_days") }}
          <select v-model="v.payment_days">
            <option v-for="d in PAYMENT_DAYS" :key="d" :value="d">{{ d }} {{ t("days") }}</option>
          </select>
        </label>
      </div>

      <h3 class="m-form-h"><span>A5</span>{{ t("Anything else we agreed") }}</h3>
      <label>{{ label("special_terms") }}
        <textarea v-model.trim="v.special_terms" class="m-short" :maxlength="max('special_terms')"></textarea>
      </label>

      <h3 class="m-form-h"><span>B</span>{{ t("Terms") }}</h3>
      <p class="m-hint">{{ t("These terms apply to every licence. You can also") }} <a :href="PDF" target="_blank" rel="noopener">{{ t("read them in the PDF") }}</a>.</p>
      <p v-if="fr" class="m-hint">Le contrat et ses conditions sont en anglais : c'est la version anglaise qui vous engage, et ce que vous saisissez ci-dessus y est reporté tel quel. Une question sur une clause ? Écrivez-nous avant de signer.</p>
      <details class="m-terms">
        <summary>{{ t("Read the terms") }}</summary>
        <div class="m-terms-body" :lang="fr ? 'en' : undefined">
          <template v-for="[n, title, items] in TERMS" :key="n">
            <h4>{{ n }}. {{ title }}</h4>
            <p v-for="[num, text] in items" :key="num">
              <b>{{ num }}</b><template v-for="(part, i) in md(text)" :key="i"><strong v-if="part.bold">{{ part.t }}</strong><template v-else>{{ part.t }}</template></template>
            </p>
          </template>
        </div>
      </details>

      <h3 class="m-form-h"><span>C</span>{{ t("Sign") }}</h3>
      <div class="m-row">
        <label>{{ t("Your full name (this is your signature)") }}
          <input v-model.trim="signer.name" autocomplete="name" required maxlength="100" />
        </label>
        <div>
          <label>{{ t("Your job title") }}
            <select v-model="titles.signer.pick" required>
              <option value="" disabled>{{ t("Choose a job title") }}</option>
              <option v-for="jt in JOB_TITLES" :key="jt" :value="jt">{{ show(jt) }}</option>
              <option :value="OTHER_TITLE">{{ t("Other (type it)") }}</option>
            </select>
          </label>
          <label v-if="titles.signer.pick === OTHER_TITLE" class="m-other">{{ t("Type your job title") }}
            <input v-model="titles.signer.other" autocomplete="organization-title" required maxlength="100" />
          </label>
        </div>
      </div>
      <label class="m-check">
        <input v-model="agree" type="checkbox" required />
        <span>{{ t("I have read the terms and agree to them for the organisation above, and I am allowed to sign for it.") }}</span>
      </label>
      <div class="m-trap" aria-hidden="true">
        <label>{{ t("Leave this empty") }} <input v-model="website" name="website" tabindex="-1" autocomplete="off" /></label>
      </div>
      <button class="m-btn m-btn-primary" type="submit" :disabled="sending">
        {{ sending ? t("Signing…") : t("Sign and send") }}
      </button>
      <div v-if="error" class="m-status m-err" role="alert">
        {{ error }} {{ t("You can also") }} <a :href="PDF" download>{{ t("download the PDF") }}</a> {{ t("and email it to") }} <a :href="`mailto:${SUPPORT}`">{{ SUPPORT }}</a>.
      </div>
      <p class="m-note">{{ t("You get a copy of the signed PDF straight away. With your answers we keep the time, your IP address and your browser, as a record of your signature. See our") }} <a :href="page('/privacy')">{{ t("privacy policy") }}</a>.</p>
    </template>
  </form>
</template>
