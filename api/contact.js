// The Contact page's form handler: a Vercel serverless function at
// /api/contact. It checks the message and emails it to support through
// Resend (https://resend.com), with the sender as Reply-To.
//
// Settings (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  required; without it the form answers "not set up yet"
//   CONTACT_TO      where messages go (default support@undamedia.com)
//   CONTACT_FROM    the sender, on a domain verified in Resend
//                   (default "UndaMedia website <website@undamedia.com>")

const TOPICS = new Set([
  "A price for a package",
  "A demo",
  "Managed hosting (you run the server)",
  "Help with an installation",
  "Partnership or reselling",
  "Something else",
]);
const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
const SUPPORT = "support@undamedia.com";
// A person takes longer than this to fill the form in; a script doesn't.
const MIN_FILL_MS = 3000;

function field(v, max) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

// One line, no control characters: these go into the subject.
function oneLine(s) {
  return s.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
}

export function check(body, now = Date.now()) {
  if (!body || typeof body !== "object") return { error: "Send the form as JSON." };
  const msg = {
    name: oneLine(field(body.name, 100)),
    email: oneLine(field(body.email, 200)),
    organisation: oneLine(field(body.organisation, 150)),
    topic: field(body.topic, 100),
    message: field(body.message, 5000),
  };
  // The trap field and the fill time: answer as if sent, so a bot learns nothing.
  if (field(body.website, 200) !== "") return { spam: true };
  const started = Number(body.started);
  if (!Number.isFinite(started) || now - started < MIN_FILL_MS) return { spam: true };

  if (!msg.name) return { error: "Please give your name." };
  if (!EMAIL.test(msg.email)) return { error: "Please give an email address we can reply to." };
  if (!TOPICS.has(msg.topic)) msg.topic = "Something else";
  if (msg.message.length < 10) return { error: "Please write a little more in the message." };
  return { msg };
}

export function compose(msg) {
  const who = msg.organisation ? `${msg.name} (${msg.organisation})` : msg.name;
  return {
    subject: oneLine(`Website: ${msg.topic} from ${who}`).slice(0, 200),
    text:
      `Name: ${msg.name}\n` +
      `Email: ${msg.email}\n` +
      `Organisation: ${msg.organisation || "-"}\n` +
      `Topic: ${msg.topic}\n\n` +
      `${msg.message}\n`,
  };
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

export default async function handler(req, res, deps = {}) {
  const env = deps.env || process.env;
  const send = deps.fetch || fetch;
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use the form on the Contact page." });
  }
  if (!sameSite(req)) return res.status(403).json({ error: "Use the form on the Contact page." });

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  const checked = check(body);
  if (checked.spam) return res.status(200).json({ ok: true });
  if (checked.error) return res.status(400).json({ error: checked.error });

  if (!env.RESEND_API_KEY) {
    return res.status(503).json({ error: "The form is not set up yet." });
  }
  const { subject, text } = compose(checked.msg);
  try {
    const r = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.CONTACT_FROM || "UndaMedia website <website@undamedia.com>",
        to: [env.CONTACT_TO || SUPPORT],
        reply_to: checked.msg.email,
        subject,
        text,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) {
      // The provider's answer stays in the function log, not with the visitor.
      console.error("contact: email provider answered", r.status, (await r.text()).slice(0, 500));
      return res.status(502).json({ error: "The message could not be sent just now." });
    }
  } catch (e) {
    console.error("contact: email provider unreachable", e && e.name);
    return res.status(502).json({ error: "The message could not be sent just now." });
  }
  return res.status(200).json({ ok: true });
}
