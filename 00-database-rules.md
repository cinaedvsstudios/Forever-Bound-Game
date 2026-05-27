# ChatGPT Database Rules

## Purpose

This repository is a long-term external memory system for ChatGPT conversations. It stores stable facts, decisions, summaries, timelines, preferences, unresolved issues, reusable context, and project notes so future chats can continue without losing important details.

The database is organised by subject, not by chat, project, conversation window, or date.

The goal is to create one reliable source of truth for each subject.

## Core Principles

1. Organise by subject, not by chat.
2. Keep one main home for each topic.
3. Use tags and related categories for crossover topics.
4. Check the index before creating or updating files.
5. Avoid duplicate topic files.
6. Split large files before they become hard to use.
7. Keep facts, user preferences, assumptions, and unresolved questions clearly separate.
8. Update the index whenever files or folders change.
9. Do not store temporary chat noise unless it affects future decisions.
10. Preserve useful history even when the current situation changes.

## Required Files

The database must always contain:

- `00-database-rules.md` — this rules document.
- `index.md` — the master map of all folders, topic files, tags, statuses, and cross-references.

ChatGPT should read `00-database-rules.md` and `index.md` before making structural changes.

## Approved Global Subject Folders

Use global subject folders only. Do not create folders based on individual ChatGPT projects, chats, or conversation windows.

Approved starting folders:

- `admin-logistics` — shipping, customs, platforms, documents, verification, accounts, bureaucracy.
- `money-budgeting` — budgeting, saving money, payments, purchases, price comparisons, financial decisions.
- `travel-events` — trips, hotels, transport, Eurovision, city plans, event travel strategy.
- `health-body` — medication, symptoms, body image, grooming, Botox, PrEP, fitness, weight, sleep.
- `language-learning` — German, French, grammar shortcuts, phrase systems, language memory.
- `people-social` — named people, friendships, social patterns, interpersonal situations.
- `nightlife-dating` — apps, sex, clubs, parties, venues, queer nightlife, SNAX/Lab/Schwuz/etc.
- `legal-housing` — housing disputes, Anmeldung, court/case prep, evidence, landlord/property issues.
- `media-entertainment` — TV, movies, music, news media, streaming sites, viewing preferences.
- `projects-builds` — apps, websites, games, Artifex, Forever Bound, coding workflows, technical builds.
- `personal-patterns` — recurring self-reflections, preferences, emotional patterns, decision systems.
- `personality` — communication preferences, response style, validation style, correction preferences, tone requirements.
- `personal-history` — life chapters, past events, country chapters, personal stories, major turning points.
- `work-career` — job history, career identity, professional achievements, roles, workplace patterns, CV/career narrative.

## New Folder Rule

Use existing global subject folders wherever possible.

A new folder may only be created if:

1. No existing folder reasonably fits the topic.
2. The new folder represents a reusable subject area, not a one-off conversation.
3. The folder name is broad enough to hold future related files.
4. The folder name uses lowercase kebab-case.
5. `index.md` is updated immediately.
6. The approved folder list in this rules document is updated immediately.
7. Any related files are cross-referenced through tags or related categories.

Do not create a new folder just because a topic feels slightly different. Prefer tags and related categories unless the subject genuinely needs its own home.

## Topic File Metadata

Every topic file should begin with YAML-style metadata:

```yaml
---
topic:
primary_category:
related_categories:
tags:
status:
last_updated:
part:
continues_from:
continues_to:
---
```

Use `primary_category` for the folder where the file lives.

Use `related_categories` and `tags` so ChatGPT knows what else to check.

Use `part`, `continues_from`, and `continues_to` only when a topic has been split into multiple files.

## Status Values

Use these status labels:

- `active` — currently ongoing and likely to be updated soon.
- `resolved` — completed or no longer requiring action.
- `reference` — stable background information to consult later.
- `watching` — no action now, but future updates are likely.
- `paused` — temporarily inactive.
- `archived` — retained for history, unlikely to be used often.

## Standard Topic File Sections

Each topic file should use this structure when relevant:

```md
# Topic Name

## Current Status

## Key Facts

## Timeline / History

## Decisions Made

## User Preferences / Patterns

## Open Questions

## Useful Wording / Scripts

## Related Files
```

Only include sections that are useful. Do not add empty filler.

## Before Adding a New Entry

ChatGPT must:

1. Identify the main subject.
2. Check `index.md`.
3. Check whether an existing topic file already covers it.
4. Check related categories and tags.
5. Decide whether to update an existing file or create a new one.
6. Add cross-references if the topic overlaps multiple areas.
7. Update `index.md` after changing or creating a topic file.

Before committing a change, ChatGPT should be able to state:

- Main file being updated or created.
- Related files/categories to check.
- Whether this is an update, new file, split, or index change.

## When Updating an Existing File

ChatGPT must:

1. Preserve existing useful information.
2. Add the new information under the correct section.
3. Update the `last_updated` field.
4. Add new tags or related categories if needed.
5. Avoid rewriting the whole file unless the structure is messy.
6. Keep facts, assumptions, opinions, and unresolved questions clearly separate.
7. Add a short update note if the new information changes the current status.
8. Update `index.md` if the file status, tags, summary, related files, or continuation parts change.

## When Creating a New File

ChatGPT must:

1. Use a clear filename in lowercase kebab-case.
2. Put it in the most appropriate global subject folder.
3. Add metadata at the top.
4. Add the standard sections.
5. Add the topic to `index.md`.
6. Add related tags so it can be found from other subjects.
7. Cross-reference any related topic files.

Example filename:

`admin-logistics/fedex-customs-imports.md`

## Cross-Reference Rules

Each topic has one primary file, but may relate to many subjects.

Use `related_categories` and `tags` instead of duplicating the same information in multiple files.

Example:

```yaml
---
topic: FedEx customs / Botox import issue
primary_category: admin-logistics
related_categories:
  - health-body
  - money-budgeting
  - legal-housing
tags:
  - FedEx
  - customs
  - Botox
  - Korea
  - import
  - seizure-risk
status: active
last_updated: 2026-05-27
---
```

When the user asks about Botox customs issues, ChatGPT should check files tagged with `Botox`, `customs`, `import`, and `seizure-risk`, even if the primary file lives under `admin-logistics`.

## Index Rules

`index.md` is the master map of the database.

Every topic entry in `index.md` must include:

```md
## Topic Name

Path:
Primary category:
Related categories:
Tags:
Status:
Last updated:
Summary:
```

If a topic has multiple parts, list all parts under the same index entry.

`index.md` must also contain a folder directory listing approved folders and what they are for.

## Search / Check Rules

When the user asks about a topic, ChatGPT should check:

1. The direct topic file.
2. The index entry.
3. Any files listed under related categories.
4. Any files with matching tags.
5. Any continuation parts if the topic file is split.

Example:

If the user asks about Botox customs issues, check:

- `health-body/botox.md`
- `admin-logistics/fedex-customs-imports.md`
- any files tagged `botox`, `customs`, `import`, `seizure-risk`

## File Size Rule

If a topic file becomes too large, split it into parts.

Suggested maximum size:

- Soft limit: 8,000 words.
- Hard limit: 12,000 words.

When splitting:

1. Keep the original topic name, but add numbered parts.
2. Add `part`, `continues_from`, and `continues_to` metadata.
3. Keep a short summary at the top of each part.
4. Update `index.md` so all parts are listed together.
5. Link each part to the previous and next part where applicable.

Example:

```md
admin-logistics/fedex-customs-imports-part-01.md
admin-logistics/fedex-customs-imports-part-02.md
```

## Splitting Rules

Split by timeline or subtopic, not randomly.

Good split examples:

- `fedex-customs-imports-part-01-history.md`
- `fedex-customs-imports-part-02-current-issues.md`

or:

- `botox-part-01-general-use.md`
- `botox-part-02-customs-imports.md`

Avoid splitting in the middle of an active situation unless unavoidable.

## Entry Style

Entries should be concise but complete.

Use plain language.

Preserve useful context from the conversation, including:

- what happened
- what was decided
- what the user prefers
- what remains unresolved
- what should be checked next time

Do not turn topic files into full chat transcripts.

## What To Store

Store:

- stable facts
- decisions
- user preferences
- reusable summaries
- timelines
- current statuses
- unresolved questions
- useful wording/scripts
- project specifications
- recurring patterns that affect future answers

## What Not To Store

Do not store:

- temporary chat noise
- duplicate summaries in multiple files
- speculation as fact
- private information that has no future use
- one-off emotional reactions unless they explain a reusable pattern or decision
- entire conversations when a concise summary is enough

## Privacy Rule

This repository should remain private.

It may contain personal thoughts, health/body information, money/admin issues, social situations, legal/housing details, and private project context.

Do not recommend making this repository public.

## Manual Paste Fallback Rule

If a database update cannot be committed because a connector write fails, is blocked, lacks approval, or cannot safely include part of the information, ChatGPT must provide a manual paste fallback.

Manual paste fallback means:

1. Still identify the correct target file and section.
2. Save any safe partial update if possible.
3. Clearly state which information could not be committed.
4. Provide the omitted or blocked material as a clearly marked copy/paste block for the user to add manually.
5. Use a loud delimiter around the block, for example:

```md
===== INSERT DATA HERE =====
[manual paste content]
===== END INSERT DATA =====
```

6. Keep the manual paste content subject-based and concise; do not create a full chat transcript.
7. Tell the user exactly which file the block belongs in and where it should be pasted.
8. If the manual paste content also requires an index change, provide a second clearly marked block for `index.md`.

This fallback is specifically for preserving user-approved private or sensitive information that belongs in the private database but cannot be written through the connector.

## Commit Message Format

When committing changes, use short descriptive messages.

Recommended format:

`Update database: [topic name]`

Examples:

- `Add database rules`
- `Update database: FedEx customs imports`
- `Update index: Payoneer verification`
- `Add topic: German language shortcuts`
- `Split topic: Botox customs imports`

## Operating Procedure For Future ChatGPT Sessions

When asked to update the database, ChatGPT should:

1. Read `00-database-rules.md` if not already known.
2. Read `index.md`.
3. Identify the correct existing file or create a new one only if needed.
4. Check related categories/tags.
5. Make the update.
6. Update metadata.
7. Update `index.md`.
8. Confirm what was changed.

When asked to check the database, ChatGPT should:

1. Search `index.md` first.
2. Search topic files by direct subject, category, and tags.
3. Read all relevant files before answering.
4. Mention if no relevant file exists.
5. Suggest creating a new file if the topic is likely to recur.
