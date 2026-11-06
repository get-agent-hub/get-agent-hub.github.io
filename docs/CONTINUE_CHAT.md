# Continue a Claude Code task in Codex with saved context

Use a preserved conversation as context for a new chat in another client. Agent Hub prepares original message excerpts and source references for Claude Code, Codex or DeepSeek Harness. You review and paste them into the client you want to use next.

This prepares a new conversation. The original client's hidden context, live processes, permissions and active session are not transferred.

## Save and open the source chat

Install and set up Hub using the [Quick start](QUICKSTART.md), then open:

```sh
ahub ui
```

In **All data → Chats**, save the intended sources or update the archive. Find the task by phrase, client or project and open its conversation. Check the latest messages and preserved version before preparing context. See [searching saved chats](SEARCH_CHATS.md).

## Prepare the next step

1. Choose **Continue in…** and select **Codex**.
2. Optionally describe the next step, such as checking timeout behavior and running the tests.
3. Choose **Prepare context**. Read the original excerpts and follow **Read in Hub** when you need more detail.
4. Check private information, then choose **Copy context** or **Download context**.
5. Open a new Codex conversation in the appropriate project and paste the packet. Ask it to verify the current files and unfinished work before acting.

The same flow can target Claude Code or DeepSeek Harness. Preparing the packet makes no separate model request, starts no client and changes no native history or archive grant. Sending the pasted text to a client uses that client's normal provider and permissions.

## Prepare from the terminal

```sh
ahub history ls --client claude-code --limit 20
ahub history handoff CHAT_ID --client codex --next "Check timeout behavior and run the tests."
```

Replace `CHAT_ID` with a saved conversation ID. The JSON output contains packet text, preserved revision and event references. To use an older saved version deliberately:

```sh
ahub history handoff CHAT_ID --client codex --revision PRESERVED_HASH
```

Replace `PRESERVED_HASH` with a revision from the chat details. A packet refers to that version even if the archive later changes.

## What the packet can miss

Hub inspects a bounded part of the archive: the first 1 MiB and last 4 MiB of saved event data. It includes the first substantive request found and up to ten recent text messages, with at most 2,000 characters per excerpt. Omitted or shortened content is reported.

Tool output, reasoning and runtime instructions remain in the complete archive. The packet does not infer that a proposed change succeeded or that a decision is still current. Add the next action and inspect the source when the excerpts are insufficient. The target client can use a suitable History MCP connection to read more, but copying context does not create that connection.

## When a note is enough

For a small task, a short project note with the goal, decisions, verified results and next action may be all you need. Keep it alongside the code if that fits your workflow. Native resume is useful when staying in the same client. [Hansard](https://www.hansard.dev/guides/continue/) also supports contextual continuation across clients.

Choose Hub when locating the original conversation and carrying inspectable references saves you work. Verify that the receiving agent can continue the actual task; a generated packet alone is not proof of a successful handoff.

See [full archive behavior](HISTORY.md#continue-in-another-client) and [project memory](MEMORY.md).
