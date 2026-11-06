# Agent Hub vs Hansard: choose around your workflow

Both tools help you find work across coding-agent conversations. Agent Hub focuses on a local archive and shared setup for Claude Code, Codex and DeepSeek Harness. Hansard covers a broader set of agents and workflows.

Comparison checked on 6 November 2026 against the [Hansard website](https://www.hansard.dev/) and Agent Hub source described in this guide. This is written by the Agent Hub project, not an independent benchmark. Features change; try the task you actually need.

## What do you need to do?

| Your task                              | Agent Hub                                                                                          | Hansard                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Find a previous conversation           | Preserved local events from three supported clients, text search and original records.             | Cross-agent archive with word and semantic search.       |
| Continue work in another client        | Review source excerpts, copy or download them, then paste into a new native chat.                  | Contextual continuation in another harness.              |
| Reuse tools and skills                 | Collect definitions and bundles, review delivery to selected clients, retain recovery information. | Shared tool access and a skill/MCP inventory.            |
| Work across more sources and computers | Supported local stores on this computer; no built-in multi-device archive sync.                    | Broader agent coverage, cloud imports and personal sync. |
| Run agents from the same interface     | Keep working in native clients; Hub prepares context and settings.                                 | Agent-running and review workflows.                      |

Hansard capabilities above are described by its website; we have not benchmarked their reliability or speed against Hub. Local storage alone does not distinguish Agent Hub: both describe local archives.

## When Agent Hub may fit

You already work in the three supported native clients and want one place to inspect saved conversations and shared configuration. You are comfortable reviewing imports, applying previews and pasting context into a new chat.

Try these concrete workflows:

- [Find and export a previous answer](SEARCH_CHATS.md).
- [Use one selected MCP definition in multiple clients](SHARE_MCP.md).
- [Share a skill bundle and common instructions](SHARE_SKILLS.md).
- [Prepare inspected context for another client](CONTINUE_CHAT.md).

No account with Agent Hub is required. Its archive and interface are local; native clients and configured MCP servers still use their own services and permissions. Configuration delivery does not combine provider accounts or subscriptions.

## When to try Hansard first

You need sources or device-sharing workflows beyond Agent Hub's supported local stores, or want an interface that also runs agents. Check Hansard's current platform and source support before choosing. A broader interface may suit your work; we do not claim it is inherently harder to use.

If you only use one client and can find its history reliably, its native search and a short project note may already solve the problem. Neither tool is required just to keep a task checklist.

## Check Agent Hub's limits before installing

Hub does not import every client database or cloud history. Attachment references may remain without local file contents. Background capture must be enabled for selected sources, and login startup is a separate reviewed option. See [preserving history](PRESERVE_HISTORY.md).

Context packets contain bounded excerpts, not a complete live session or a guarantee that an earlier decision is still valid. Shared MCP, skills, instructions and memory each have their own delivery rules; Hub does not silently reconcile every external edit. The [Quick start](QUICKSTART.md) explains the candidate source versus the older published beta.

## Compare with one real task

Pick an old decision you remember but cannot locate immediately. Find its original messages, identify what remains current and continue a small task in another client. Check whether the new agent can use the evidence without you retelling the entire conversation.

For shared setup, edit one harmless skill or MCP definition and inspect the destination client's actual view. Keep the tool that saves you repeat work. A longer feature list, a generated context packet or a successful install alone does not answer that question.
