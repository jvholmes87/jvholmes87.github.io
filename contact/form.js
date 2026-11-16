"use strict";
(() => {
  const form = document.getElementById("professional-contact");
  const send = document.getElementById("contact-submit");
  const status = document.getElementById("contact-status");
  const container = document.getElementById("turnstile-container");
  if (!form || !send || !status || !container) return;
  const config = window.PORTFOLIO_CONTACT_CONFIG || {};
  // Never send data to an unset endpoint. This must be populated and reviewed before publication.
  const readyConfig = /^[a-zA-Z0-9]{6,32}$/.test(config.formId || "") &&
    /^[a-zA-Z0-9_-]{8,128}$/.test(config.turnstileSiteKey || "");
  if (!readyConfig) {
    status.textContent = "The contact form is not yet accepting messages. Please use LinkedIn in the meantime.";
    return;
  }
  let widgetId = null;
  const setStatus = (msg) => { status.textContent = msg; };
  const loadScript = document.createElement("script");
  loadScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  loadScript.async = true;
  loadScript.onload = () => {
    if (!window.turnstile) {
      setStatus("Verification is unavailable. Please try again later.");
      return;
    }
    widgetId = window.turnstile.render(container, {
      sitekey: config.turnstileSiteKey,
      callback: () => { send.disabled = false; setStatus("Verification complete. You can send your message."); },
      "expired-callback": () => { send.disabled = true; setStatus("Verification expired. Please verify again."); },
      "error-callback": () => { send.disabled = true; setStatus("Verification could not be completed. Please retry."); }
    });
    setStatus("Complete the verification to send your message.");
  };
  loadScript.onerror = () => setStatus("Verification service unavailable. Please try again later.");
  document.head.appendChild(loadScript);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (!data.get("cf-turnstile-response")) {
      setStatus("Please complete verification before submitting.");
      send.disabled = true;
      return;
    }
    send.disabled = true;
    setStatus("Sending your message…");
    try {
      const response = await fetch("https://formspree.io/f/" + encodeURIComponent(config.formId), {
        method: "POST",
        body: data,
        headers: { "Accept": "application/json" }
      });
      if (!response.ok) {
        setStatus("We couldn't send your message. Please try again.");
        return;
      }
      form.reset();
      setStatus("Your message was submitted successfully. Thank you.");
    } catch (_) {
      setStatus("Network error. Please check your connection and try again.");
    } finally {
      // Tokens are single-use and must be verified server-side by Formspree.
      if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
      send.disabled = true;
    }
  });
})();
