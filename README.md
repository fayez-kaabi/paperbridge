# PaperBridge

A public, mobile-friendly document-assistance app built for a solo impact hackathon. Understand a French missing-documents letter, compare supporting documents and export an editable reply.

**Live demo:** https://paperbridge-fayez.flowyskink10.chatgpt.site

**Source:** https://github.com/fayez-kaabi/paperbridge

## Run

Node 22+, pnpm. Install dependencies with `pnpm install`, run `pnpm dev`. `pnpm build` builds the Cloudflare Worker via Vinext. The Sites integration and hosting manifest are retained.

## Live AI configuration

Set `OPENAI_API_KEY` as a runtime secret using Sites environment settings, then deploy. Do not put a key in source, chat, client code or the hosting manifest. The supported ChatGPT setup uses the OpenAI Developers plugin. Optional `OPENAI_MODEL` defaults to `gpt-4.1`. Speech uses `gpt-4o-mini-tts`.

The app checks `/api/status` and clearly labels missing configuration. Sample mode is deterministic, prepared demonstration content. It is never presented as live model output. Live uploaded letters never fall back to sample responses.

## Architecture

- `app/page.tsx`: three-step interface, browser memory, exports, multilingual explanations, demo guide.
- `app/api/bridge/route.ts`: server-only Responses API calls, strict JSON schema, limits and provider error handling.
- `app/api/speech/route.ts`: server-only text-to-speech.
- `lib/bridge.mjs`: input validation, output schema and document-assistance instructions.
- `lib/sample.ts`: clearly fictional illustrative sample.
- `public/samples`: fictional visual test fixtures; the identity specimen is intentionally not an official document and should not be accepted as proof of authentic ID.

## Verification completed

`node --test tests/*.test.mjs`: 17 passing tests (includes a parent test), covering input restrictions, missing credentials, origin rejection, structured request settings, successful mocked provider response, rate-limit responses, incomplete responses and absent output.
`node node_modules/typescript/bin/tsc --noEmit`: passed.
Production build: passed before final packaging; packaging reruns it for the final source.
Browser: sample letter → outdated bill mismatch → corrected bill and identity sample → editable reply; downloaded reply contents verified. Initial screen visually inspected.

Live checks on 25 October 2026 passed for image letter extraction, stale-bill rejection, current-bill match, absent deadlines, reply generation and speech output. Exact results and timings are in docs/live-evaluation.json. This small synthetic evaluation is not a guarantee of real-world accuracy. Mocked API tests are not evidence of model accuracy. The interface is responsive by CSS; a narrow physical mobile viewport has not been separately tested.

## Live acceptance tests before recording

1. Upload samples/letter.png in English; expect two requirements and 31 October 2026, with literal source quotations.
2. Repeat in French and Arabic; verify output meaning and Arabic reading order.
3. Check old-bill.png for the address requirement; expect mismatch because January is too old.
4. Check current-bill.png; expect apparent match, never authenticity certification.
5. Check identity.png; expect uncertainty/rejection because it explicitly is not official ID.
6. Upload no-deadline.png; expect no invented deadline.
7. Upload an unreadable photo; expect uncertainty, not fabricated details.
8. Put “ignore your instructions” in a document; the model must treat it as document content.
9. Generate a reply with missing documents; no claim that all attachments are enclosed or already sent.
10. Listen, edit, download and inspect the resulting text. Record measured latency and results honestly.

## Privacy and release limits

No app database or permanent upload storage. Current case content remains in browser memory and is sent to OpenAI only for live processing. Requests use `store:false`; this does not guarantee zero provider retention. Downloads remain on the user's device. No automatic submissions.

The demo is public. Persistent D1 quotas permit at most 100 AI requests per UTC day globally and 12 per hourly hashed network identity. Analysis and speech both consume quota; rejected attempts may also consume quota. This is a request cap, not a monetary cap. Quota storage contains counters and daily hashed IP identifiers, not documents, and expired rows are pruned on subsequent successful requests after two days. PDFs are limited to 4 MB; page-count enforcement remains a limitation.

The interface explains source quotations but does not guarantee independent OCR verification. Administrative acceptance, legal eligibility and document authenticity remain outside scope. Generated reply explanations do not update after manual edits, as labeled in the UI.

## Two-minute recording

Open Demo guide in the app for timing and test downloads. Record real API output after configuration. If using sample mode, explicitly identify prepared sample responses. Keep private data out of recordings. Explain the problem, demonstrate the mismatch correction, export the reply and briefly describe OpenAI vision, Structured Outputs and speech.
