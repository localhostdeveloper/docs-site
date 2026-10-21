// The Order page's handler: a Vercel serverless function at /api/order. It
// checks the buyer's answers, fills in the licence agreement PDF with them
// (their side locked, ours left to fill in), emails it to support through
// Resend with the buyer as Reply-To, and answers with the same PDF so the
// buyer keeps a copy at once.
//
// It never emails the address typed into the form: anyone can type any
// address, and the site must not become a way to send mail to strangers. We
// send the buyer the countersigned copy ourselves.
//
// Settings (Vercel → Project → Settings → Environment Variables), shared with
// the Contact form:
//   RESEND_API_KEY  required; without it the form answers "not set up yet"
//   ORDER_TO        where signed agreements go (default CONTACT_TO, then
//                   support@undamedia.com)
//   CONTACT_FROM    the sender, on a domain verified in Resend
//                   (default "UndaMedia website <support@undamedia.com>",
//                   the address verified in Resend for now)

import { buildContract } from "./_lib/contract-pdf.js";
import { FIELDS, PACKAGES, HOSTING, COUNTRIES, CURRENCIES, LICENCE_TERMS, BILLING_PERIODS, PAYMENT_DAYS, VERSION } from "./_lib/contract-text.js";
import { apiKey, keyHint } from "./_lib/resend.js";

const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
const SUPPORT = "support@undamedia.com";
const FROM = `UndaMedia website <${SUPPORT}>`;
// Nobody fills in a contract this fast; a script does.
const MIN_FILL_MS = 8000;
// A fee: 12000, 12,000 or 12,000.50.
const AMOUNT = /^(\d{1,3}(,\d{3})+|\d+)(\.\d{1,2})?$/;
// A Custom package's streams or members: a whole number.
const COUNT = /^[1-9]\d{0,5}$/;
// The quote's figures the order page offers as lists; anything else is a
// mistake (or not the page).
const LISTS = [
  ["currency", CURRENCIES.map((c) => c.code), "the currency"],
  ["licence_term", LICENCE_TERMS, "the licence term"],
  ["billing_period", BILLING_PERIODS, "how often you are billed"],
  ["payment_days", PAYMENT_DAYS, "the days to pay an invoice"],
];

function field(v, max) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

// One line, no control characters, single spaces.
function oneLine(s) {
  return s.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/ {2,}/g, " ").trim();
}

// Several lines, no other control characters, no runs of blank lines.
function lines(s) {
  return s.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function check(body, now = Date.now()) {
  if (!body || typeof body !== "object") return { error: "Send the form as JSON." };
  // The trap field and the fill time: answer as if sent, so a bot learns nothing.
  if (field(body.website, 200) !== "") return { spam: true };
  const started = Number(body.started);
  if (!Number.isFinite(started) || now - started < MIN_FILL_MS) return { spam: true };

  const values = {};
  for (const [name, f] of Object.entries(FIELDS)) {
    const v = field(body[name], f.max);
    values[name] = f.multiline ? lines(v) : oneLine(v);
    if (f.required && !values[name]) return { error: `Please fill in “${f.label}”.` };
    if (f.email && values[name] && !EMAIL.test(values[name])) return { error: `Please check “${f.label}”: it doesn’t look like an email address.` };
  }
  if (!COUNTRIES.includes(values.customer_country)) return { error: "Please choose your country from the list." };
  if (values.start_date) {
    values.start_date = dayInWords(values.start_date);
    if (!values.start_date) return { error: "Please pick the start date from the calendar." };
  }
  for (const [name, list, what] of LISTS) {
    if (values[name] && !list.includes(values[name])) return { error: `Please choose ${what} from the list.` };
  }
  for (const name of ["licence_fee", "hosting_fee"]) {
    if (values[name] && !AMOUNT.test(values[name])) {
      return { error: `Please write “${FIELDS[name].form || FIELDS[name].label}” as a number, e.g. 12000 or 12,000.00.` };
    }
  }
  values.package = field(body.package, 40);
  values.hosting = field(body.hosting, 40);
  if (!PACKAGES.some((p) => p.value === values.package)) return { error: "Please choose a package." };
  if (!HOSTING.some((h) => h.value === values.hosting)) return { error: "Please choose how Unda runs: self-hosted or managed." };
  if (values.package === "Custom" && (!values.custom_streams || !values.custom_members)) {
    return { error: "For the Custom package, please give the live streams and team members from our quote." };
  }
  if (values.package === "Custom" && (!COUNT.test(values.custom_streams) || !COUNT.test(values.custom_members))) {
    return { error: "For the Custom package, please give the live streams and team members as whole numbers." };
  }
  values.customer_sign_name = oneLine(field(body.signer_name, 100));
  values.customer_sign_title = oneLine(field(body.signer_title, 100));
  if (!values.customer_sign_name) return { error: "Please type your full name to sign." };
  if (!values.customer_sign_title) return { error: "Please give your job title." };
  if (body.agree !== true) return { error: "Please tick the box to agree to the terms." };
  return { values };
}

// dayInWords turns the date picker's 2026-11-01 into "1 November 2026", the
// same in the contract whatever date format the buyer's browser shows; ""
// for anything that is not a real calendar day.
export function dayInWords(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  if (y < 2000 || y > 2100 || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) return "";
  return `${d} ${MONTHS[mo - 1]} ${y}`;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// signing turns a moment into the date in Part C and the record line under
// the buyer's signature (UTC).
export function signing(at) {
  const d = new Date(at);
  const date = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const time = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
  return { date, time, record: `Signed online at undamedia.com/order on ${date} at ${time}.` };
}

export function compose(values, when, client) {
  // The order page's labels: the PDF's carry examples ("e.g. 12 months").
  const label = (name) => (FIELDS[name] ? FIELDS[name].form || FIELDS[name].label : name);
  const shown = (name) => (name === "payment_days" && values[name] ? values[name] + " days" : values[name]);
  const row = (name) => `${label(name)}: ${shown(name) || "-"}`;
  const pick = (names) => names.map(row).join("\n");
  const org = values.customer_name;
  return {
    subject: oneLine(`Licence agreement signed: ${org} (${values.package}, ${values.hosting})`).slice(0, 200),
    text:
      `${values.customer_sign_name} (${values.customer_sign_title}) signed the licence agreement (version ${VERSION}) online for ${org}.\n` +
      "The filled-in PDF is attached. Check Part A against the quote, sign our side of Part C and send it back with the invoice.\n\n" +
      "ORGANISATION\n" +
      pick(["customer_name", "customer_reg_no", "customer_country", "customer_address", "contact_name", "contact_title", "contact_email", "contact_phone", "billing_email"]) +
      "\n\nPACKAGE\n" +
      `Package: ${values.package}\nHow Unda runs: ${values.hosting}\n` +
      pick(["custom_streams", "custom_members", "custom_tools", "domains"]) +
      "\n\nTERM AND FEES\n" +
      pick(["quote_number", "start_date", "licence_term", "licence_fee", "currency", "billing_period", "hosting_fee", "payment_days"]) +
      `\n\nANYTHING ELSE AGREED\n${values.special_terms || "-"}\n\n` +
      "SIGNATURE RECORD\n" +
      `Signed by: ${values.customer_sign_name}, ${values.customer_sign_title}\n` +
      `When: ${when.date} at ${when.time}\n` +
      `From address: ${client.ip || "unknown"}\n` +
      `Browser: ${client.agent || "unknown"}\n` +
      "They ticked: I have read the terms in Part B and agree to them for this organisation.\n",
  };
}

// fileName is the attachment and download name, from the organisation's.
export function fileName(org) {
  const slug = org.normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").toLowerCase().slice(0, 50);
  return `unda-licence-agreement${slug ? "-" + slug : ""}.pdf`;
}

// Only this site's own pages may post here.
function sameSite(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function clientOf(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return {
    ip: oneLine(String(req.headers["x-real-ip"] || fwd || "")).slice(0, 60),
    agent: oneLine(String(req.headers["user-agent"] || "")).slice(0, 300),
  };
}

export default async function handler(req, res, deps = {}) {
  const env = deps.env || process.env;
  const send = deps.fetch || fetch;
  const now = deps.now || Date.now;
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use the form on the Order page." });
  }
  if (!sameSite(req)) return res.status(403).json({ error: "Use the form on the Order page." });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  const checked = check(body, now());
  if (checked.spam) return res.status(200).json({ ok: true });
  if (checked.error) return res.status(400).json({ error: checked.error });

  const key = apiKey(env);
  if (!key) {
    return res.status(503).json({ error: "The order form is not set up yet." });
  }

  const at = now();
  const when = signing(at);
  const values = { ...checked.values, customer_sign_signature: checked.values.customer_sign_name, customer_sign_date: when.date };
  let pdf;
  try {
    pdf = Buffer.from(await buildContract({ values, record: when.record, signedAt: at }));
  } catch (e) {
    console.error("order: could not build the PDF", e && e.message);
    return res.status(500).json({ error: "The agreement could not be prepared just now." });
  }
  const name = fileName(values.customer_name);
  const { subject, text } = compose(values, when, clientOf(req));
  try {
    const r = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.CONTACT_FROM || FROM,
        to: [env.ORDER_TO || env.CONTACT_TO || SUPPORT],
        reply_to: values.contact_email,
        subject,
        text,
        attachments: [{ filename: name, content: pdf.toString("base64") }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) {
      // The provider's answer stays in the function log, not with the buyer.
      console.error("order: email provider answered", r.status, (await r.text()).slice(0, 500), "|", keyHint(env));
      return res.status(502).json({ error: "The agreement could not be sent just now." });
    }
  } catch (e) {
    console.error("order: email provider unreachable", e && e.name);
    return res.status(502).json({ error: "The agreement could not be sent just now." });
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
  return res.status(200).send(pdf);
}
