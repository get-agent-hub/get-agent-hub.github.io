# Search and export local Claude Code and Codex chat history

Find a previous answer even when you cannot remember the chat title. Agent Hub saves supported local conversations from Claude Code, Codex and DeepSeek Harness into one archive on your computer. It searches saved messages and can include tool results. Your native clients keep their originals.

## Save the conversations you want

Follow the [Quick start](QUICKSTART.md) to install and set up Hub, then open the local interface:

```sh
ahub ui
```

1. Open **All data → Chats**.
2. Expand **Sources & automatic updates** and select the stores to read.
3. Choose **Save chats to Hub**, or **Update archive now** if you already have an archive.
4. Check each source's read result. Partial or unavailable sources are not a complete backup.

This copies available supported events into private Hub storage. It does not move conversations or change the native files. Capture can include private messages and tool output; select only stores you want to keep in Hub.

## Find an earlier solution

Search for a phrase from the problem or answer, such as an error message or endpoint name. Filter by client or project if you have too many results. Use **Show → All events** when the relevant text is a command result or technical record.

Open a result to read the surrounding conversation. **Read original event** opens the complete native record. Details show preserved versions and incomplete coverage. Sorting newest first uses the first recorded date of each conversation, rather than its latest reply.

The terminal can search the same archive:

```sh
ahub history search "retry policy"
ahub history ls --client codex --limit 20
ahub history show CHAT_ID --offset 0 --limit 50
```

Replace `CHAT_ID` with an ID from the list or search result. CLI output is JSON; event windows include a continuation when more data remains.

## Export an original or prepare reusable context

In the open chat, expand **Conversation details & preserved versions**, select the version you need and choose **Download preserved source**. This downloads the native source bytes, not a normalized Markdown transcript. Keep the file private if it contains private work.

For a smaller readable packet to paste into another conversation, use **Continue in…**, review the excerpts and choose **Download context**. See [Continue a task in another client](CONTINUE_CHAT.md). The packet is bounded; it is not a full transcript export.

## Keep the archive current

**Update selected sources in the background** checks the saved selection every 30 seconds, even after the interface closes. Optional login startup is a separate reviewed setting. An unavailable original does not remove an already saved chat. See [archive updates and storage](HISTORY.md#keep-it-updated).

## Alternatives and limits

You can use the native client's history/export, or search readable local logs yourself. Hub is useful when you want one searchable preserved collection across supported clients. [Hansard](https://www.hansard.dev/) also provides a cross-client archive; try the workflow that suits you.

Hub currently reads supported local Claude Code/Codex JSONL and DeepSeek Harness session formats. It does not read Cursor databases, import every cloud account, recover deleted messages or preserve every attachment reference as a file. Missing attachments are reported separately from message coverage. Search is text retrieval, not a claim that an old answer remains correct. Check current files before reusing it.

See [supported history and coverage](HISTORY.md) and [recovery](RECOVERY.md).
