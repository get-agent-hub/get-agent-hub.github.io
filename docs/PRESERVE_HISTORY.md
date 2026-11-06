# Preserve local Claude Code and Codex chat history

Keep a readable copy of a coding conversation before its native history becomes unavailable. Agent Hub saves supported local Claude Code, Codex and DeepSeek Harness events in a local archive. The original files stay with the clients.

This guide covers the current source checkout. See the [Quick start](QUICKSTART.md) for installation and the difference between the candidate and the published beta.

## Save the history that still exists

Open the local interface:

```sh
ahub ui
```

1. Go to **All data → Chats → Sources & automatic updates**.
2. Select the supported stores you want to preserve.
3. Choose **Save chats to Hub**, or **Update archive now** for an existing archive.
4. Read each source's result and the coverage warnings. Open one saved conversation and check an original message.

Capture copies available supported events, including messages and tool output. It does not read every cloud account or recover files deleted before capture. A detected source is not proof that its full history was saved.

## Keep new messages after closing the interface

Enable **Update selected sources in the background** after choosing your stores. The local worker checks that selection every 30 seconds and continues after the page and Hub UI server close. Later captures retain earlier preserved revisions.

Check or stop it from the terminal:

```sh
ahub history status
ahub history watch --stop
```

Stopping updates leaves saved chats intact. An unavailable native store also leaves its already saved chats in Hub. To change the source selection, pause updates first, review the new selection, then enable them again.

Optional **Resume selected updates when I sign in** installs a reviewed user-level startup entry on macOS or Linux. Closing a browser and rebooting a computer are different cases: background updates alone do not enable login startup. See [background updates](HISTORY.md#keep-it-updated).

## Read the completeness warnings

| What you see                                | What it means                                                                                            |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Complete source read                        | The selected supported store was read successfully for that update.                                      |
| Incomplete or unsupported event coverage    | Some native events could not be fully indexed. Inspect that conversation's details.                      |
| Attachment references not locally preserved | A record mentions a file, but Hub has not preserved that file's contents. Messages can still be present. |
| Source unavailable                          | Hub cannot read that original now. Previously saved versions remain available.                           |

Check both event coverage and attachments. A complete source read does not mean every referenced image, uploaded document or external link has been copied. New messages also remain unsaved until a later successful capture.

## Is this a full backup?

The archive protects against losing access to native files that Hub has already captured. It lives on the same computer by default, under `~/.agent-hub/state/history`, and is excluded from normal Hub Git history. It is not an independent off-device backup or an encrypted vault.

Use your normal private computer backup for device failure. Preserve Hub data and recovery data; do not commit them to a public repository. A source-code ZIP, a Git push of the Hub or a reinstall of the CLI is not a backup of the archive. See [recovery boundaries](RECOVERY.md) before moving or resetting managed state.

## Can I export a saved conversation?

Open the chat, expand **Conversation details & preserved versions**, select the version and choose **Download preserved source**. This returns the native source bytes for that version. For a smaller readable set of excerpts to paste into another client, use [Continue in another client](CONTINUE_CHAT.md).

If search results need rebuilding, **Storage & troubleshooting → Rebuild search index** regenerates derived event indexes from preserved raw data. It cannot reconstruct missing source bytes or repair every kind of archive damage.

Next: [find an earlier answer](SEARCH_CHATS.md), or read the [archive reference](HISTORY.md).
