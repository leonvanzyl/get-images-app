---
name: checkpoint
description: >
  Create a comprehensive checkpoint commit with detailed analysis of all changes. Use this skill
  when the user says "checkpoint", "commit everything", "save my progress", "create a commit",
  or wants to stage and commit all current changes with a well-crafted message. Also use when
  the user says "/checkpoint" or asks to snapshot current work. This skill stages all changes
  and creates a descriptive commit — it does not push.
---

# Checkpoint Commit

Create a comprehensive checkpoint commit that captures all current changes with a detailed, well-structured commit message.

## Instructions

### Step 1: Analyze Changes

Run these commands to understand the full picture:

1. `git status` — see all tracked and untracked files
2. `git diff` — see detailed changes in tracked files
3. `git diff --cached` — see already-staged changes
4. `git log -5 --oneline` — understand this repo's commit message style

### Step 2: Stage Everything

Stage all changes — tracked modifications, deletions, and new untracked files:

```bash
git add -A
```

### Step 3: Craft the Commit Message

Write a commit message following the project's existing conventions (observed from `git log`). Structure:

- **First line**: clear, concise summary in imperative mood (50-72 chars)
  - Use conventional commit prefixes where the project uses them: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, etc.
- **Body** (separated by blank line): detailed description including:
  - What changes were made (key modifications)
  - Why these changes were made (purpose/motivation)
  - Important technical details or decisions
  - Breaking changes or migration notes if applicable
- **Footer**: co-author attribution

### Step 4: Commit

Create the commit using a heredoc for proper formatting:

```bash
git commit -m "$(cat <<'EOF'
{first line}

{body}

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Step 5: Report

Display:
- The commit hash and message summary
- Files changed count
- Insertions/deletions summary

## Important

- Stage and commit everything — do not skip files unless they are clearly sensitive (`.env`, credentials)
- If the repo has no git history, run `git init` first
- Make the commit message descriptive enough that someone reading `git log` understands what was accomplished
- Follow the project's existing commit conventions (check the log first)
- Do not push — only commit locally
