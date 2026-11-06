# Search discovery and site metadata

The site ships 15 task landing pages in English and Russian, plus its existing home and documentation routes: **80 canonical HTML URLs**. The ten additions below describe different supported workflows. They are not measured search-demand claims or promises about ranking.

| Added topic                                                   | Route (also available under `/ru/`) | Detailed guide          |
| ------------------------------------------------------------- | ----------------------------------- | ----------------------- |
| Preserve a local copy and understand device-backup limits     | `/local-ai-chat-backup/`            | Preserve history        |
| Download preserved native bytes or prepare bounded excerpts   | `/export-ai-chat-history/`          | Search chats            |
| Find an error or test result inside original tool events      | `/search-ai-tool-results/`          | Search chats            |
| Browse recorded project folders and repository relationships  | `/organize-ai-coding-projects/`     | Chats and projects      |
| Read scoped project knowledge from another native client      | `/share-project-memory/`            | Memory                  |
| Discover and import existing supported Markdown notes         | `/import-agent-memory/`             | Memory                  |
| Deliver common instructions while retaining personal text     | `/sync-ai-agent-instructions/`      | Skills and instructions |
| Choose a trusted MCP copy and review the change direction     | `/resolve-mcp-config-conflicts/`    | Share MCP               |
| Choose workflow undo, stage restore or first-baseline reset   | `/restore-ai-agent-settings/`       | Recovery                |
| Keep selected chat sources updated and review sign-in startup | `/automatic-chat-history-backup/`   | Preserve history        |

Copy, descriptions and accessibility labels live in both locale files. Home keeps five featured cards and a native disclosure containing the ten additional workflows. Each task page has three relevant cross-links, a visible breadcrumb and a detailed-guide link. Its content and links work without JavaScript. The site still documents the published beta.4 revision; unreleased core changes are not advertised as available in that archive.

## Files and markup

| Item                                        | Behavior                                                                                                                                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/robots.txt`                               | Generated from the configured origin; allows public resources and points to the sitemap. It does not claim to hide private files.                                                                                         |
| `/sitemap.xml`                              | Generated from the same route registry as the build. Lists only canonical HTML pages, with EN/RU/self and x-default alternatives. Excludes 404, assets, query strings and fragments.                                      |
| Canonical and language links                | Each page has its own HTTPS canonical and reciprocal EN/RU/x-default links. A translation canonicalizes to itself, not to English.                                                                                        |
| Title and description                       | Localized, page-specific task copy; documentation titles agree with their social and structured-data titles.                                                                                                              |
| Social metadata                             | Open Graph and Twitter cards use the existing 1200×630 image and canonical URL.                                                                                                                                           |
| JSON-LD                                     | WebSite and WebPage identify the actual site and page. Task pages also describe the visible two-level breadcrumb. No invented ratings, reviews, prices or FAQ rich-result claims.                                         |
| Favicons and bookmarks                      | Existing SVG plus a 96×96 PNG, multi-size ICO and 180×180 Apple touch icon. They are derived from the same local mark.                                                                                                    |
| `/site.webmanifest`, `/ru/site.webmanifest` | Small localized browser manifests with locale-preserving start URLs and 192/512 PNG icons. `display: browser`; no service worker, offline cache or install prompt. These are browser metadata, not a ranking requirement. |
| `/404.html`                                 | Custom missing-page response with noindex; absent from sitemap. Production must return HTTP 404 for missing routes.                                                                                                       |

The sitemap deliberately omits lastmod rather than using build time as a fake content-edit date. A sitemap index is unnecessary at this size. There is no maintained news feed or separate installed web application, so RSS, legacy browserconfig and extra PWA caching are outside this change. No llms.txt or bot-specific shadow copy is required by this implementation; readable linked documentation is the source for visitors and crawlers.

All task pages use existing reviewed coarse analytics groups. New page paths and free-text values are not added to the relay contract. Local browser previews do not send analytics events.

## Reproduce and check

Run `npm run check`. The build creates robots.txt, sitemap.xml, both manifests and all localized pages. Tests check real internal destinations, reciprocal language links, canonical URLs, JSON-LD consistency/escaping, icon sizes and manifest HTTP responses.

Generated icons are committed so a normal build needs no image tooling. After changing `public/favicon.svg`, run `npm run icons` with ImageMagick installed. The helper reads the simple rectangle/path mark, renders its geometry directly, and regenerates all PNG/ICO variants. Inspect the result visually; some ImageMagick SVG decoders omit path strokes.

Before publication, inspect the home disclosure, one new English page and one new Russian page at desktop and narrow widths. After Pages succeeds, check all sitemap URLs over HTTPS, compare deployed HTML/assets with the checked build and verify the custom 404. Parsing a schema is not a claim that Google granted a rich result.

## Account-level follow-up

1. Verify domain ownership in [Google Search Console](https://search.google.com/search-console/). A DNS TXT challenge is convenient for a domain property. Use the exact provider-issued value; never invent verification files or tokens.
2. Submit `https://getahub.dev/sitemap.xml`. Inspect the English and Russian home plus a few new landing pages and request crawling where appropriate.
3. Add the site and same sitemap in Bing Webmaster Tools and Yandex Webmaster if these search engines matter to the launch. Their ownership challenges also require the real account-issued value.
4. Monitor indexing, actual queries and landing-page conversions. Use that evidence to revise topics; page count is not a result metric.

The code change cannot establish Search Console ownership or guarantee crawling/indexing. No account verification or sitemap submission is claimed here.

Official references checked on 2026-11-06: [sitemap discovery](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview), [robots.txt scope](https://developers.google.com/search/docs/crawling-indexing/robots/intro), [localized alternatives](https://developers.google.com/search/docs/specialty/international/localized-versions), [breadcrumb markup](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), [favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search), and [browser manifest purpose](https://web.dev/articles/add-manifest).
