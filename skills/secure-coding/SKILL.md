---
name: secure-coding
description: "OWASP-based secure coding: injection, authZ/IDOR, XSS, SSRF, secrets, crypto, uploads. Use for code handling input, auth, secrets, files or PII."
---

# Secure coding

## Golden rules
1. Never trust input - validate type, length, format and range at the boundary (allow-lists over deny-lists).
2. Encode output for its context (HTML, attribute, JS, URL, SQL, shell).
3. Deny by default; check authorisation on **every** request for **every** object.
4. Secrets live in a secret manager/environment, never in code, logs, URLs or client bundles.
5. Use well-known libraries for crypto, auth, parsing and sanitisation - never roll your own.
6. Fail securely: generic error messages to clients, details in server logs (without secrets/PII).

## Vulnerability -> safe pattern
| Vulnerability | Unsafe | Safe |
|---|---|---|
| SQL injection | `"... WHERE id=" + id` | parameterised queries / ORM parameters |
| Command injection | `exec("convert " + file)` | argument arrays, no shell; allow-list inputs |
| XSS | `innerHTML = userText`, `dangerouslySetInnerHTML`, `v-html`, `@Html.Raw` | framework auto-escaping, `textContent`, DOMPurify for required HTML, CSP |
| IDOR | `GET /invoices/{id}` returns any invoice | query scoped by owner/tenant: `WHERE id=@id AND tenant_id=@tenant` |
| Mass assignment | binding request body directly to entity | explicit DTOs with only allowed fields |
| SSRF | fetching user-supplied URL | allow-list hosts, block private/link-local IPs after DNS resolution, no redirects |
| Path traversal | `Path.Combine(root, userName)` | generate server-side file names; canonicalise and verify prefix |
| Insecure deserialisation | `BinaryFormatter`, `pickle.loads`, YAML `load` on untrusted data | JSON with explicit types; `yaml.safe_load` |
| Weak passwords storage | MD5/SHA-x, unsalted | Argon2id / bcrypt / PBKDF2 with high cost |
| JWT | accepting `alg: none`, not validating `aud`/`iss`/`exp` | library validation with pinned algorithm and all claims |
| Open redirect | `redirect(req.query.next)` | relative paths only or allow-list |
| CSRF | cookie auth without protection | SameSite cookies + anti-forgery tokens |
| Randomness | `Math.random()`, `Random()` for tokens | CSPRNG (`crypto.randomBytes`, `RandomNumberGenerator`, `secrets`) |

## File uploads
Limit size, verify content type by magic bytes, store outside web root with random names, scan if possible, serve with `Content-Disposition: attachment`.

## HTTP hardening
HTTPS only + HSTS, CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, restrictive CORS (no `*` with credentials), secure/HttpOnly/SameSite cookies, rate limiting on auth and expensive endpoints.

## Logging
Log security events (login failures, permission denials, admin actions) with user ID and correlation ID; never log passwords, tokens, full card numbers or unnecessary PII.

## Dependencies
Pin versions, use lock files, run the ecosystem's vulnerability audit in CI, remove unused packages, prefer well-maintained libraries.
