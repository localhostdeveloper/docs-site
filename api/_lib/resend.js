// The Resend API key as the Contact and Order functions use it.

// apiKey reads RESEND_API_KEY as pasted into Vercel. Spaces, a line break
// or quotes around the key are an easy slip when pasting, and Resend then
// answers "API key is invalid" although the key itself is right.
export function apiKey(env) {
  return String(env.RESEND_API_KEY || "").trim().replace(/^(["'])(.*)\1$/s, "$2").trim();
}

// keyHint describes the key a deployment is using, for the function log,
// without revealing it: compare its length and last characters with the key
// in Resend to see whether Vercel has the one you saved.
export function keyHint(env) {
  const raw = String(env.RESEND_API_KEY || "");
  const key = apiKey(env);
  if (!key) return "no RESEND_API_KEY on this deployment";
  const tidied = raw !== key ? "; spaces, line breaks or quotes around it were removed" : "";
  const shape = key.startsWith("re_") ? "" : "; it does not start with re_";
  return `key on this deployment: ${key.length} characters, ending …${key.slice(-4)}${shape}${tidied}`;
}
