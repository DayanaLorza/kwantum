import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

const defaultRecipients = ["kwantumconsulting@gmail.com"];
const minimumSubmissionMs = 2500;
const disposableDomains = new Set([
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com"
]);

function stripWrappingQuotes(value) {
  const trimmed = String(value || "").trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function getRecipients() {
  if (!env.CONTACT_TO_EMAILS) return defaultRecipients;

  return env.CONTACT_TO_EMAILS.split(",").map(stripWrappingQuotes).filter(Boolean);
}

function getValue(data, key) {
  return String(data.get(key) || "").trim();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function hasValidEmailShape(email) {
  if (email.length > 254) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) return false;

  const [local, domain] = email.toLowerCase().split("@");
  if (!local || !domain) return false;
  if (domain.includes("..") || local.includes("..")) return false;
  if (disposableDomains.has(domain)) return false;

  return true;
}

function countMatches(value, pattern) {
  return value.match(pattern)?.length || 0;
}

function looksRandomToken(value) {
  const compact = value.replace(/[^a-z0-9]/gi, "");
  if (compact.length < 12) return false;

  const letters = countMatches(compact, /[a-z]/gi);
  const vowels = countMatches(compact, /[aeiou]/gi);
  const uppercase = countMatches(value, /[A-Z]/g);
  const lowercase = countMatches(value, /[a-z]/g);
  const vowelRatio = letters ? vowels / letters : 0;
  const caseMixed = uppercase >= 3 && lowercase >= 3;
  const hasLongConsonantRun = /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(compact);

  return caseMixed && (vowelRatio < 0.24 || hasLongConsonantRun);
}

function hasRepeatedFragment(value) {
  const compact = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (compact.length < 9) return false;

  for (let size = 2; size <= 5; size += 1) {
    for (let index = 0; index <= compact.length - size * 3; index += 1) {
      const fragment = compact.slice(index, index + size);
      if (/^(.)\1+$/.test(fragment)) continue;

      const repeated = fragment.repeat(3);
      if (compact.includes(repeated)) return true;
    }
  }

  return false;
}

function hasLowCharacterVariety(value) {
  const compact = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (compact.length < 12) return false;

  const uniqueRatio = new Set(compact).size / compact.length;
  return uniqueRatio < 0.34;
}

function looksLikePlaceholderText(value) {
  const compact = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (compact.length < 6) return false;

  return /(asdf|qwer|zxcv|test|demo|sample|lorem|ipsum|dasd|sadas|sadasd)/.test(compact);
}

function hasRepeatedShortParts(email) {
  const [local] = email.toLowerCase().split("@");
  const parts = local.split(/[._+-]+/).filter(Boolean);
  if (parts.length < 4) return false;

  const repeated = parts.filter((part, index) => parts.indexOf(part) !== index);
  const numericParts = parts.filter((part) => /^\d+$/.test(part));

  return repeated.length >= 1 || numericParts.length >= 3;
}

function scoreSpam({ name, company, email, message, startedAt, honeypot }) {
  let score = 0;
  const emailLocalPart = email.split("@")[0] || "";

  if (honeypot) score += 6;

  const parsedStartedAt = Number(startedAt);
  if (Number.isFinite(parsedStartedAt) && parsedStartedAt > 0) {
    const elapsedMs = Date.now() - parsedStartedAt;
    if (elapsedMs >= 0 && elapsedMs < minimumSubmissionMs) score += 3;
  }

  if (!hasValidEmailShape(email)) score += 5;
  if (hasRepeatedShortParts(email)) score += 2;
  if (looksRandomToken(name)) score += 3;
  if (company && looksRandomToken(company)) score += 2;
  if (looksRandomToken(message)) score += 3;
  if (hasRepeatedFragment(name)) score += 4;
  if (company && hasRepeatedFragment(company)) score += 3;
  if (hasRepeatedFragment(message)) score += 4;
  if (hasRepeatedFragment(emailLocalPart)) score += 3;
  if (hasLowCharacterVariety(name)) score += 2;
  if (company && hasLowCharacterVariety(company)) score += 1;
  if (hasLowCharacterVariety(message)) score += 2;
  if (looksLikePlaceholderText(name)) score += 4;
  if (company && looksLikePlaceholderText(company)) score += 3;
  if (looksLikePlaceholderText(message)) score += 4;
  if (looksLikePlaceholderText(emailLocalPart)) score += 3;
  if (message.length < 24) score += 1;
  if (/https?:\/\//i.test(message)) score += 2;

  return score;
}

async function verifyTurnstile(token, ip) {
  const body = new URLSearchParams();
  body.set("secret", env.TURNSTILE_SECRET);
  body.set("response", token);
  body.set("remoteip", ip || "");

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      }
    );
    const result = await response.json().catch(() => ({ success: false }));
    return result.success === true;
  } catch (error) {
    console.error("Turnstile verification request failed", error);
    return false;
  }
}

function blockedResponse() {
  return json(
    { message: "Please include a valid name, email, and project details." },
    { status: 400 }
  );
}

export async function POST({ request, getClientAddress }) {
  const data = await request.formData();
  const name = getValue(data, "name");
  const company = getValue(data, "company");
  const email = getValue(data, "email");
  const service = getValue(data, "service");
  const budget = getValue(data, "budget");
  const message = getValue(data, "message");
  const honeypot = getValue(data, "website");
  const startedAt = getValue(data, "contactStartedAt");

  if (!name || !email || !message) {
    return json({ message: "Please include your name, email, and project details." }, { status: 400 });
  }

  if (!env.TURNSTILE_SECRET) {
    return json({ message: "Turnstile verification is not configured." }, { status: 503 });
  }

  {

    const token = getValue(data, "cf-turnstile-response");
    if (!token) {
      return json({ message: "Please complete the verification and try again." }, { status: 400 });
    }

    let clientIp = "";
    try {
      clientIp = getClientAddress?.() || "";
    } catch {
      clientIp = "";
    }

    const passed = await verifyTurnstile(token, clientIp);
    if (!passed) {
      return json({ message: "Verification failed. Please try again." }, { status: 400 });
    }
  }

  const spamScore = scoreSpam({ name, company, email, message, startedAt, honeypot });
  if (spamScore >= 5) {
    console.warn("Blocked likely spam contact submission", {
      spamScore,
      emailDomain: email.split("@")[1] || "",
      service,
      budget
    });
    return blockedResponse();
  }

  if (!env.RESEND_API_KEY) {
    return json({ message: "Missing RESEND_API_KEY. Email delivery is not configured." }, { status: 503 });
  }

  const from = stripWrappingQuotes(env.CONTACT_FROM_EMAIL || "onboarding@resend.dev");
  const subject = `New Project Inquiry from ${name}`;
  const text = [
    "New Project Inquiry",
    `Name: ${name}`,
    `Company: ${company || "N/A"}`,
    `Email: ${email}`,
    `Service: ${service || "N/A"}`,
    `Budget: ${budget || "N/A"}`,
    "",
    "Message:",
    message
  ].join("\n");

  const html = `
    <h2>New Project Inquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Company:</strong> ${escapeHtml(company || "N/A")}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Service:</strong> ${escapeHtml(service || "N/A")}</p>
    <p><strong>Budget:</strong> ${escapeHtml(budget || "N/A")}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: getRecipients(),
      reply_to: email,
      subject,
      text,
      html
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Resend contact email failed", errorText);
    return json(
      {
        message: "Message failed to send. Please try again.",
        detail: errorText
      },
      { status: 502 }
    );
  }

  return json({ ok: true });
}
