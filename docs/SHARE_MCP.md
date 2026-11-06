# Share MCP settings between Claude Code and Codex

Keep one selected MCP definition in Hub and connect your native clients to it. Agent Hub can collect existing definitions and deliver client-specific launcher entries while retaining unrelated settings. It also supports DeepSeek Harness.

This guide shares configuration. It does not combine subscriptions, transfer provider sign-ins or make every client share one running MCP process.

## Inspect what is already configured

Install Hub using the [Quick start](QUICKSTART.md). Inspect the current setup without starting MCP servers:

```sh
ahub status
ahub ui
```

In **All data → MCP servers**, select the server. Compare the Hub and client copies. Private values are hidden. A same-name server can have different credentials, arguments or scope; its name alone is not proof that the copies should be merged.

## Choose and deliver one server

1. If the trusted definition is in a client, choose that client's settings for Hub and review the import.
2. Choose **Use Hub settings** for the destination client and review that server's delivery preview.
3. Apply the reviewed change, then repeat for other intended clients.
4. Restart affected client sessions so they load the entry and complete any native trust prompts.

Each preview identifies its direction and files. Importing into Hub is separate from delivering to a client. **Uses Hub settings** means the existing launcher already targets this Hub; a different Node/package path alone does not require a conflict decision.

For a first shared setup covering tools, skills and instructions together, preview:

```sh
ahub quick --dry-run
```

Then run the interactive setup when ready:

```sh
ahub quick
```

Quick has a broader scope than the single-server route. Read its plan before confirming; explicit dry runs and noninteractive calls do not apply it.

## Check connection separately

Use **Test the connection** for the selected server, or run:

```sh
ahub doctor
```

Doctor starts MCP connections and lists tools without invoking them. Matching settings do not prove a service is reachable; successful tool discovery does not prove every backend operation or permission works.

## Handle later edits

Change the canonical Hub definition to update selected client views through a fresh reviewed delivery. If you edit a native copy independently, inspect the difference and choose which copy to keep. Hub does not currently offer automatic bidirectional reconciliation of all MCP edits.

Native-only approval policies remain client-specific. External tools do not honor Hub's advisory lock, so keep affected clients idle during configuration writes. A stale preview must be rebuilt; do not reuse an old apply command after editing files.

## Recover or use a simpler approach

Applied changes include recovery information. Review the recorded restore or workflow undo before using it; later edits can block an unsafe rollback. Uninstalling the CLI alone neither restores native settings nor removes launcher entries. See [recovery](RECOVERY.md).

For one or two servers you can maintain each client's supported config manually. Git-managed templates and tools such as [Rulesync](https://rulesync.dyoshikawa.com/) are other options. Avoid linking entire incompatible config files together. Hub is useful when its collection, reviewed delivery and recovery save you work compared with your existing approach.

See [content and sync](CONTENT.md) and [MCP interface controls](UI.md#guided-first-run).
