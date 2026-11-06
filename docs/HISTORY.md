# Chats and projects

Hub keeps a local copy of supported conversations from Claude Code, Codex and DeepSeek Harness. Read messages, search tool results and find the projects you worked on, even when a native source is no longer available. Active sessions still belong to their clients.

These features describe the current source checkout. The published beta archive may be older; check the source revision on the landing page.

## Save your history

```sh
ahub ui
```

1. Open **All data → Chats** and expand **Sources & automatic updates**.
2. Choose the supported stores to include, then **Save chats to Hub**. For an existing archive, use **Update archive now**.
3. Read the progress and coverage result. Conversations now live in Hub; originals stay in place.

**Your local archive** shows conversation and event counts, captured source bytes, update status and the last complete update. Captured data is not exact disk usage. Each source card shows its read status; expand folder details when needed. Attachment warnings describe references whose files are not preserved, separately from missing or unsupported events.

Projects come from recorded working folders. You do not need to register each project to browse its chats. Memory and client access are connected separately. Subfolders and worktrees remain available under their project; unavailable historical locations are retained.

## Read and search

The list shows a readable title, client, project and first recorded date in your browser's timezone. Newer **first-record dates** appear first; **Date → Oldest first** reverses the order. This is not sorting by the latest reply. Unknown dates stay at the end.

Open a conversation to read its messages. **All events** includes technical records and runtime context. **Read original event** opens the full native record. Conversation details contain preserved versions, coverage, source download and archive removal. Older technical title excerpts are repaired from saved events without another capture.

Search reads the saved archive, including messages and tool data. It does not execute old instructions. Missing attachments and unsupported data remain visibly incomplete; capture cannot recover deleted, cloud-only or unsaved sessions.

## Keep it updated

Enable **Update selected sources in the background** to check the saved selection every 30 seconds. A separate local process continues after the page, terminal and UI server close. Pause updates before changing the selection. Updates preserve earlier revisions and respect exclusions and archive removals.

Enable **Resume selected updates when I sign in** for optional user-level startup on macOS or Linux. Review the startup files before applying. No administrator access is needed; installation and removal take effect at the next user-session startup. A persistent Linux user manager may need restarting. A hard crash is not automatically supervised and can require inspected lock recovery.

The CLI can manage the same worker:

```sh
ahub history watch --background
ahub history status
ahub history watch --stop
```

Preview optional login startup or its removal, then use the exact apply command printed by that preview:

```sh
ahub history watch --login on
ahub history watch --login off
```

Plain `ahub history watch` stays in the foreground. Chat capture and memory automation are separate: saving chats does not turn every message into a memory record or replace native history.

## Continue in another client

Open a saved chat and choose **Continue in…**. Select Claude Code, Codex or DeepSeek Harness, optionally describe the next step, then **Prepare context**. Review the original excerpts and their source links. **Copy context** or **Download context**, then paste into a new conversation in the target client.

The packet contains original text with pinned revision and event references. Preparing it makes no model call, launches no client, writes no native history and grants no archive access. This is a starting point for a new conversation; the original running session stays in its client.

The compact packet uses the first substantive request and up to ten recent text messages from a bounded read: the first 1 MiB and last 4 MiB, with up to 2,000 characters per excerpt. It reports omitted content. Tool output, reasoning and runtime records remain in the full archive. Review private information before sharing.

```sh
ahub history handoff CHAT_ID --client codex
```

## Let another client read it

In **Projects**, expand **Access & project settings**, then **Connect clients…**. Review the project and sources, choose clients and apply the preview. The generated History MCP connection lets clients list, search and read that part of the archive. Revoking access keeps saved data.

Scoped MCP access and copying a context packet are separate choices. Hub does not transfer a running native session between clients.

## Where the data lives

The server reuses derived titles and dates for unchanged saved indexes. The first sorted list after a restart can take longer; later lists reuse those summaries. Access checks still use the current catalog.

The default archive is under `~/.agent-hub/state/history`, excluded from normal Hub Git history. It contains preserved source bytes and derived indexes. New messages appear after another manual or background capture. Source disappearance alone does not remove saved history. Removing a chat from Hub leaves its native original in place and prevents automatic reimport of that archived chat.

```sh
ahub history status
ahub history rebuild
```

Status reports the archive. Rebuild verifies preserved raw data and recreates event indexes without reading native clients or calling a model. In the interface it is under **Storage & troubleshooting**. It does not repair a damaged catalog or raw block. Review [recovery](RECOVERY.md) before reset: reset archives current managed state and may restore an older archive or access policy.

See [the interface guide](UI.md), [memory](MEMORY.md) and [automation](AUTOMATION.md) for the other parts of Hub.
