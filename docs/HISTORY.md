# Chats and projects

Hub keeps a local copy of supported conversations from Claude Code, Codex and DeepSeek Harness. You can read messages, search tool results and find the projects you worked on, even when a native source is no longer available. Active sessions still belong to their clients.

These features describe the current source checkout. The published beta archive may be older; check the source revision shown on the landing page before comparing behavior.

## Save your history

```sh
ahub ui
```

1. Open **All data → Chats** and **Manage history sources**.
2. Choose the supported stores you want to include, then **Capture selected history**.
3. Read the progress and coverage result. Captured conversations now live in Hub; originals stay in place.

Projects are grouped from recorded working folders. You do not need to register each project to browse its chats. Project memory and client access are connected separately. Subfolders and worktrees remain available under their project; unavailable historical locations are kept as such.

## Read and search

The list shows a readable title, client, project and first recorded date in your browser's timezone. Newer **first-record dates** appear first; **Date → Oldest first** reverses the order. This is not sorting by the latest reply. Unknown dates stay at the end.

Open a conversation to read its messages. **All events** includes technical records and runtime context. **Read original event** opens the full native record. Conversation details contain preserved versions, coverage, source download and archive removal. Older technical title excerpts are repaired from saved events without another capture.

Search reads the saved archive, including messages and tool data. It does not run instructions found in an old conversation. Missing attachments and unsupported data remain visibly incomplete; local archive capture does not recover deleted, cloud-only or unsaved sessions.

## Keep it updated

Enable **Keep updated** to check selected stores every 30 seconds while Chats or Projects stays open. Updates save new supported changes; a page reload keeps already captured data. Closing the browser does not install a background service.

For updates independently of the browser, leave the foreground watcher running:

```sh
ahub history watch
```

History capture and memory automation are separate. Capturing a chat does not turn all its messages into memory records or replace native client history.

## Let another client read it

In **Projects**, expand **Access & project settings**, then **Connect clients…**. Review which project and sources the connection grants, choose clients and apply the preview. The generated History MCP connection lets those clients list, search and read that part of the archive. Revoking access keeps the saved data.

This shares access to past conversations. Starting a new session with selected context and resuming a native session in another client are separate capabilities; Hub does not currently transfer a running session between clients.

## Where the data lives

The running server reuses derived titles and dates for unchanged saved indexes. The first sorted list after a server restart can take longer; later lists reuse those summaries. Access checks still use the current catalog.

The default archive is under `~/.agent-hub/state/history`, excluded from normal Hub Git history. It contains preserved source bytes and derived indexes. New messages appear after another capture. Source disappearance alone does not remove saved history. Removing a chat from Hub leaves the native original in place and prevents automatic reimport of that archived chat.

```sh
ahub history status
ahub history rebuild
```

Status reports the archive. Rebuild verifies preserved raw data and recreates derived event indexes without reading native clients or calling a model. It does not repair a damaged catalog or raw block. Review [recovery](RECOVERY.md) before reset: reset archives current managed state and may restore an older archive or access policy.

See [the interface guide](UI.md), [memory](MEMORY.md) and [automation](AUTOMATION.md) for the other parts of Hub.
