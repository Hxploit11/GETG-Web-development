# GETG Web development

Bilingual Green Earth Technologies Global website based on the approved cinematic green design. Static HTML pages are generated with Node.js; the visitor experience uses plain CSS and JavaScript. There are no third-party runtime dependencies.

## Run locally

Requires Node.js 22 or newer.

```sh
npm run dev
```

Open `http://127.0.0.1:4173/en/`. The preview server supports MP4 byte ranges for playback and seeking. Re-run `npm run build` and reload the browser after changing source files.

```sh
npm run build
npm test
```

The deployable static files are in `dist/`. Run the build before tests. The server binds only to `127.0.0.1`; it is a local preview server, not a production email backend.

## Pages

| English | Spanish |
| --- | --- |
| `/en/` | `/es/` |
| `/en/solutions/` | `/es/soluciones/` |
| `/en/in-the-field/` | `/es/en-campo/` |
| `/en/privacy/` | `/es/privacidad/` |

The language switch preserves the equivalent page. The site includes solution application sections, two supplied videos, a field-photo gallery, a keyboard-accessible video modal, a responsive navigation menu, and quote requests.

## Quote requests

The displayed contact address is **team@getg.com**. Quote-request drafts are addressed separately to **tom@sterlingbrandcleaners.com**. Without a configured `FORM_ENDPOINT`, a valid form prepares a `mailto:` draft. The visitor must open and send it from their email application. The site does not claim the message has been sent, send test emails, or store form entries.

For automatic delivery, set `FORM_ENDPOINT` to a configured HTTPS form provider endpoint that accepts multipart form data and responds with JSON. Configure its recipient as Tom, server-side validation, and spam protection in that provider. The frontend only reports successful submission after a successful HTTP response. No service credentials belong in public JavaScript.

## Content and media

- `src/content.mjs`: English/Spanish page copy, solution discussion areas, form labels.
- `src/media.mjs`: independent video records, title translations, posters, caption tracks, and language eligibility.
- `public/assets/`: optimized concept imagery, supplied field photos, logo.
- `public/assets/video/`: the two original supplied MP4 files.
- `scripts/build.mjs`: templates, metadata, localized routes, and sitemap generation.
- `public/app.js` and `public/styles.css`: interactions and responsive design.

Both videos are currently marked `language: 'und'` and intentionally appear in both languages, per the user's request. Once narration is identified, assign `en` or `es`; shared/unknown clips remain visible in both. These clips are not assumed to be translated equivalents. Add verified caption files through each video's `captions` array. No transcript or subtitles have been fabricated.

The field photographs and videos were supplied by the user. The sunset hero, barrel detail, and technician concept are AI-generated and labeled as such. They do not establish actual product capabilities, results, or facilities. Solution categories and descriptions are provisional discussion copy pending GETG review.

## Build configuration

The builder reads environment variables (see `.env.example`). It does not automatically load `.env` files. To load one with a supported Node release, use `node --env-file=.env scripts/build.mjs`.

- `SITE_URL`: canonical production origin, default `https://getg.com`.
- `SITE_INDEXABLE`: `false` by default; preview pages have `noindex,nofollow` and robots disallow. Set `true` only for an approved production deployment.
- `CONTACT_EMAIL`: public contact address, defaults to `team@getg.com`.
- `REQUEST_EMAIL`: quote-request recipient, defaults to Tom's supplied address. This address is included in browser-generated email drafts, not displayed as the contact address.
- `FORM_ENDPOINT`: optional public HTTPS form endpoint. No endpoint means the email-draft workflow.
- `PLAUSIBLE_DOMAIN` and `PLAUSIBLE_SCRIPT_URL`: optional cookieless analytics configuration. Both are required; no tracking is loaded by default. Use the exact script URL supplied by your Plausible account.

Analytics events contain only language, video identifiers, or a solution category. They never receive form names, email addresses, or message contents. A quote conversion is emitted only after successful automatic submission, not when preparing an email draft. Update the privacy notice to match the final configured services before launch.

## Hosting

GitHub Pages builds, tests, and publishes `dist/` automatically on pushes to `codex/initial-website`. The workflow in `.github/workflows/pages.yml` can also be run manually from the Actions tab. It enables search indexing for the production origin, `https://getg.com`. The repository's Pages source must be **GitHub Actions**, with **getg.com** as the custom domain. Root-relative links assume this custom domain, not the default project URL's repository subpath.

The site will be reachable at the custom domain after its DNS records point to GitHub Pages. DNS is managed separately; see [DNS setup](docs/dns-setup.md). After DNS validation and certificate provisioning finish, enable **Enforce HTTPS** in the repository's Pages settings.

For a larger video library, replace MP4 source URLs with your video hosting/CDN URLs without changing the page templates.
