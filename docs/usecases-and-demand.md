# Use cases and demand: research context

This English editorial summary preserves the problem categories from the original planning notes. Linked discussions are historical research leads; their contents and activity were not revalidated during the quick-start update. This page does not advertise unsupported Agent Hub features or claim that market demand has been established.

## Repeated MCP configuration

A user may configure the same tool in several AI clients, each with a different configuration file and syntax. Updating credentials or arguments separately creates drift.

Agent Hub collects supported existing definitions and delivers reviewed launcher configurations. Quick setup combines those steps. An existing Hub entry remains authoritative; later client edits require a visible decision.

Research lead: [MCPHub: managing MCP servers across AI tools](https://ai.rundatarun.io/practical-applications/mcphub-managing-mcp-servers-across-ai-tools).

## Shared instructions that drift

Teams and individuals may copy the same rules into AGENTS.md, CLAUDE.md and client-specific files. Copies can diverge intentionally or accidentally.

Hub delivers existing shared rules through owned blocks while preserving personal text. It does not decide that every instruction found in a client should become a global rule.

Research lead: [agentmeld](https://github.com/moneytool/agentmeld).

## Skills copied across projects and clients

Repeated copies make it hard to know which procedure and asset bundle is current. Hub can import complete local bundles and link client roots to the canonical copies. It preserves conflicts and shared-path protections. It does not execute skill scripts during collection or act as a remote package installer.

Research leads: [manage-skills](https://github.com/Getty/manage-skills), [skills](https://github.com/vercel-labs/skills).

## Team distribution and reproducibility

Company-managed skill catalogs, pinned dependencies and repeatable setup are related needs. They also introduce questions about trust, updates, source ownership and supply-chain policy.

Agent Hub's current contract is local collection and guarded delivery. Quick does not publish a team registry, configure a cloud remote or install a cross-machine synchronization service.

Research leads: [Ask HN: how do you manage skills files?](https://news.ycombinator.com/item?id=49589914), [NAV tooling](https://ki-utvikling.nav.no/verktoy), [Microsoft APM](https://github.com/microsoft/apm).

## Project knowledge across sessions

Switching clients should not require reconstructing every useful fact or task decision. Hub keeps project knowledge in one scoped collection and handoff files in the repository. Enabled hooks provide project context and request evidenced learning from the active model.

This does not guarantee model compliance, move every native store, ingest old conversations, or silently refresh an existing conversation's context. Standalone Memory MCP access is configured separately for a fixed workspace.

## Predictable changes and recovery

A useful synchronization tool must explain what it reads and writes, preserve unrelated settings, reject stale inputs, and support recovery. Quick shows workflow scope and per-stage outcomes. Individual planners retain their guarded writes and backups; reset returns to the first recorded baseline.

The whole workflow is staged rather than one transaction. A later conflict can leave earlier stages completed. Real client validation remains necessary after restarting clients and handling their trust prompts.

## Alternatives considered

The original notes considered package managers, configuration tools, skill distribution utilities and memory systems. Examples included [APM](https://github.com/microsoft/apm), [agentctl](https://github.com/iheanyi/agentctl), [agentmeld](https://github.com/moneytool/agentmeld), [manage-skills](https://github.com/Getty/manage-skills), and [capshelf](https://github.com/genged/capshelf).

These tools are research references, not a current comparison of supported features. A future comparison should verify capabilities directly and date its evidence.

## What still needs user evidence

A successful automated test does not establish that a workflow saves time or produces useful memory. The next evidence is a real two-client working trial: create a Hub, retrieve a fact in another client, review a native-note conflict, inspect what the model actually saved, and reset a disposable setup.

Use [Quick start](QUICKSTART.md) for the short first-run route and [Working guide](WORKING_GUIDE.md) for detailed scenarios. Keep intentional failure cases inside the isolated laboratory.
