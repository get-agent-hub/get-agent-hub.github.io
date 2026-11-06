# Share skills and instructions between Claude Code and Codex

Keep a skill bundle in one local Hub and deliver it to the supported native clients that need it. Agent Hub supports Claude Code, Codex and DeepSeek Harness. Shared instructions use a separate managed block so personal client notes can remain in place.

This guide covers the current source checkout. Follow the [Quick start](QUICKSTART.md) to install and initialize Hub first.

## Collect a skill you already use

Start with a preview:

```sh
ahub import skills --dry-run
```

The plan reads enabled clients' supported user skill roots and shows what would be copied into Hub. If two clients have different bundles with the same name, inspect both before choosing a source. The importer does not silently select a winner.

For one known skill and an explicit source preference:

```sh
ahub import skills:my-skill --prefer codex --dry-run
```

Replace `my-skill` with the skill's actual name. Use the exact apply command printed by the reviewed preview. If the source changes, make a new preview. Import keeps the original client directories in place; it does not deliver the skill to other clients yet.

## Add your own local skill

```sh
ahub skill add /path/to/my-skill --dry-run
```

Hub copies the local bundle, including its references and assets, after a reviewed application. It does not execute the skill's scripts. Remote URLs are not accepted by this command: install or inspect a trusted local bundle first. For Codex delivery, its metadata needs a name and description in the skill file.

## Deliver the selected Hub copies

```sh
ahub sync --area skills --dry-run
```

Review the affected clients and paths, then use the preview's exact apply command. Delivery creates individual links to Hub bundles and preserves unrelated skills. Codex and DeepSeek Harness can share one physical user skill directory; the preview lists all affected clients. Client-local differences require an explicit reviewed replacement.

Restart affected client sessions and check their skill catalogs. A file link alone does not prove that a client has enabled the skill or that an agent invoked it. Project, plugin and administrator skill scopes remain client-owned.

For the broader first-run workflow that also collects MCP settings and delivers existing shared context, use the interactive setup instead:

```sh
ahub quick
```

It shows a plan and asks before applying. See [share MCP settings](SHARE_MCP.md) if you only need one server.

## Share a small set of common instructions

Put common rules in `instructions/AGENTS.md` inside your Hub. The default Hub is `~/.agent-hub`. For example, keep your test and review conventions there; keep repository-specific facts with the repository.

Preview shared context delivery:

```sh
ahub sync --area context --dry-run
```

This delivers the shared rules and existing shared memory index. Claude receives imports; Codex and DeepSeek Harness receive managed text blocks. Personal text outside the owned block is preserved. A conflicting edited block or a shadowing Codex override blocks delivery and needs inspection.

Global personal instructions are not automatically imported into common rules. Choose what should be shared. This operation does not merge every client's native memory or import chats; [project memory](MEMORY.md) and [chat capture](PRESERVE_HISTORY.md) have separate scopes.

## Edit once, then check the result

Skill links point at the canonical Hub bundle. Shared instruction delivery is different: after changing the common rules, preview and apply context sync again so copied blocks stay current. Hub does not automatically reconcile every external edit across these areas.

For a few files, a manually maintained shared directory or repository may be enough. Hub adds collection, per-client delivery previews and recorded recovery. See [content rules and recovery](CONTENT.md) for supported paths, metadata, link restrictions and restoring an applied change.
