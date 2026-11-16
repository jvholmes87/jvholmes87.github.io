# Portfolio contact form — setup and release checklist

**Owner-approved concept:** 16 November 2026. **Destination:** contact@jasonvholmes.com (owner confirms this mailbox can be answered through Google Workspace).

## Architecture

This is a **static GitHub Pages** form. Client-side HTML/JS sends POST requests to a Formspree form endpoint. The Formspree project must be configured to deliver submissions to the approved mailbox. A **Cloudflare Turnstile public site key** is rendered on the page; its **private secret** is stored only in Formspree's CAPTCHA settings, where token verification occurs server-side.

**Never commit Formspree account credentials, Turnstile private secret, API tokens, or mailbox credentials.** The public Formspree form ID and public Turnstile site key are expected in `contact/config.js`.

The public Formspree form ID (`xeaganzl`) and Turnstile site key have been entered in the draft PR. The submit button stays disabled until a browser Turnstile token is obtained. AJAX explicitly sends `cf-turnstile-response` for server-side validation by Formspree. This does **not** prove Formspree is configured with the matching Turnstile secret; verify that in the Formspree CAPTCHA settings before merge.

The form includes a hidden `_gotcha` field that Formspree ignores when filled by simple spambots. This defense is not a substitute for server-side Turnstile verification.

## Required account setup (owner)

1. Create / sign into Formspree, add a portfolio project and form. Set the notification destination to **contact@jasonvholmes.com**, and verify that address as required.
2. In Formspree, enable basic spam filtering, **restrict submissions to the site domain** if available, and set account-level submission notifications/limits. Test any rules: referring-origin restrictions alone are not strong authentication.
3. In Cloudflare Turnstile, create a **Managed** widget allowing `jasonvholmes.com` and `www.jasonvholmes.com` (and any dedicated preview host actually needed for tests).
4. In the Formspree form CAPTCHA settings, select **Cloudflare Turnstile**, paste the **private secret** there only, and save. Turnstile is effective only with server-side token verification. Do not put secret in source control.
5. **Completed in draft PR:** public Formspree form ID and Turnstile site key are in `contact/config.js`.
6. Verify Formspree submission emails arrive at contact@jasonvholmes.com, including the reply-to email, before marking live.
7. Because `jasonvholmes.com` is moving from LiteSpeed hosting to GitHub Pages, verify domain and HTTPS configuration independently. Do not change MX, SPF, DKIM, or DMARC records for Google Workspace.

## Test matrix before requesting merge

- Mobile 390px and desktop 1280px: no horizontal overflow; labels and focus order work.
- Valid submission: Formspree receives it and destination mailbox receives notification.
- Missing/invalid email, missing required field and short message: blocked client-side.
- Blank / invalid Turnstile token: rejected **server-side by Formspree**, not just disabled by client-side JavaScript.
- Turnstile expiry, network error, Formspree 4xx/5xx and retry: show safe status, no false success.
- Bots / high-rate abuse: Formspree dashboard spam and limits tested; note that **no service guarantees blocking all AI agents or spam**.
- Google Workspace mail deliverability and sender reply-to verified. No attachments, confidential content or secrets stored in repo.
- Accessibility: keyboard navigation, labels, status announcements, reduced motion.
- Privacy: third-party form/verification policies disclosed; no hidden analytics added.

## Plan assumptions

Formspree's `_gotcha` honeypot is available on all plans, including Free, as documented by Formspree. Other advanced anti-spam rules may require a paid plan. Verify the current plan's submission limits and active Formshield settings before release. If stronger abuse protection or high volume is needed, reassess plan and service architecture.

## Release gate

Draft PR only until credentials are configured, actual form submissions and failure cases pass, owner reviews the page, and Jason explicitly approves merge/deployment.
