# Sutton SignWriting Back Office Guide

## Purpose

The Back Office turns a specifically approved outcome into a bounded, verified change. It keeps
work close to the project that owns it, preserves unrelated work, and records evidence for review.

**Steve is the hinge: Front prepares; Back implements; nothing is approved until he says so.**

Use one clear outcome per conversation. A short investigation may remain with its parent task;
unrelated goals deserve separate sessions and separate review.

## Working loop

1. **Enter** — Open the project that owns the outcome and inspect its instructions.
2. **State** — Describe the result, constraints, permissions, and acceptance checks.
3. **Inspect** — Read the relevant code, documentation, history, and working state.
4. **Change** — Make the smallest coherent edit that fully addresses the outcome.
5. **Verify** — Run checks proportionate to the risk and inspect visible behavior.
6. **Review** — Examine the diff, preserve unrelated work, and record a clear handoff.

## What crosses the boundary

### Packet in

The ask, constraints, Stewardship vetoes, and acceptance conditions arrive as one specifically
authorized packet. The packet supplies context; the implementation state must still be checked.

### Verified result out

Back Office returns evidence of the result or a bounded handoff with remaining gaps. Steve
authorizes each crossing. A packet is not standing access or standing implementation authority.

## Durable context

- **README** explains project identity, purpose, layout, operation, and recovery.
- **AGENTS.md** records durable instructions for work in its directory.
- **Decisions** record consequential choices and reasoning when a project benefits.
- **Tasks** track unfinished multi-session work only when a simpler issue or conversation is
  insufficient.

## Safety and review

Before changing, confirm that the request authorizes the mutation, protect credentials and private
records, and check for unrelated or concurrent work.

Before declaring success, run the appropriate syntax, build, test, health, and behavior checks;
review the diff and repository state; and separate verified facts from inference and uncertainty.

## Multiple sessions

Several read-only conversations may inspect the same project. Concurrent writers require isolated
branches or worktrees. Delegated work should be bounded; the main conversation remains responsible
for integration and verification.

## Continue

- [Read the public Front Office guide](../front-office/).
- [Visit the public Sutton SignWriting Office](https://office.signwriting.org/).
- [Use current official Codex documentation](https://developers.openai.com/codex/).
