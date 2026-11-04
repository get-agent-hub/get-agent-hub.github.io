# Website deployment

The public site repository is `get-agent-hub/get-agent-hub.github.io`. The source repository for the CLI is `get-agent-hub/agent-hub`. The production origin is configured once in `site.config.json` as `https://getahub.dev`.

## Publishing flow

The Publish website workflow runs on pushes to main and manual workflow dispatches. It installs locked dependencies, runs the complete site checks, builds dist/ and uploads that exact directory as a Pages artifact. A separate full-history Gitleaks scan must also pass. The deployment job needs both jobs and uses the github-pages environment with narrowly scoped Pages/OIDC permissions.

Deployment is enabled only when the repository variable PAGES_ENABLED is the literal string true. Until Pages is configured, pushes can validate the source without trying to publish. First setup uses Settings → Pages → Source: GitHub Actions, then enables that variable and manually runs Publish website. Later pushes to main follow the same checks and publish automatically. Pull-request checks do not publish.

Deploy the contents of dist/ only. Do not publish the repository root, local preview metadata, build logs, credentials or dependencies. The local preview server is a development tool; no server process is needed in production.

## Custom domain and DNS

Add getahub.dev in the repository's Pages settings before changing public DNS. If possible, also verify ownership in the organization's Pages settings using GitHub's generated TXT challenge. Domain verification records are account-specific; never invent a challenge value.

At the domain's DNS provider, configure these GitHub Pages records:

| Type  | Name | Value                   |
| ----- | ---- | ----------------------- |
| A     | @    | 185.199.108.153         |
| A     | @    | 185.199.109.153         |
| A     | @    | 185.199.110.153         |
| A     | @    | 185.199.111.153         |
| CNAME | www  | get-agent-hub.github.io |

Replace only conflicting parking/hosting records for the apex and www. Preserve mail records, unrelated TXT records and other services. The domain can remain at Porkbun; no registrar transfer or nameserver change is necessary. IPv6 AAAA records are optional and should use the complete current GitHub Pages set when configured.

Wait for DNS validation and GitHub's certificate issuance, then enable Enforce HTTPS. The .dev domain needs working HTTPS. A custom domain causes the default github.io address to redirect to it, so do not treat that address as an independent fallback after domain binding.

Official reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Publication checks

- Run npm run check and actionlint before pushing workflow changes.
- Confirm the Publish website run succeeds for the exact commit.
- Check /, /ru/, /docs/, /ru/docs/, a nested documentation page, language/fragment switching, robots.txt, sitemap.xml, social-card.png and an unknown path returning the custom 404.
- Canonical, alternate-language and social URLs use the configured production origin. The sitemap contains only actual language routes and excludes the error page.
- No CLI release or npm publication is triggered by this site workflow. Its GitHub links point at the separate core repository and Releases page.

## Rollback and pause

Revert a faulty site commit on main and push the revert; the same checks and deployment gates apply. Set PAGES_ENABLED to false to stop future deployments while retaining builds and the currently published site. Do not remove a custom-domain binding while its DNS still points at GitHub without arranging the domain change first.
