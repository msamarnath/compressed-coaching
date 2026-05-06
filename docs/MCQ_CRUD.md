# MCQ CRUD (Questions + Options) - Technical PRD

## Overview

This document defines the requirements for authenticated users to create, view, search, sort, paginate, preview, edit, and delete Multiple Choice Questions (MCQs). The feature includes bulk selection + bulk deletion and an empty-state experience when no questions exist.

---

## Business Requirements

### Access & Ownership
- Only authenticated users can access MCQ management.
- Each MCQ question must belong to exactly one user (the creator/owner).
- Users must only be able to view and mutate their own questions.

### Question Listing (Core)
- Users must see a list of their created MCQ questions after login.
- If no questions exist, the page must show an empty state message: **“NO questions created yet”**.
- The listing must support:
  - Searching
  - Sorting
  - Pagination

### CRUD Operations
- Users must be able to:
  - Add a new MCQ question
  - Edit an existing MCQ question
  - Delete an existing MCQ question

### Bulk Operations
- Users must be able to select multiple questions from the list.
- Users must be able to delete selected questions in one action.

### Preview
- Users must be able to preview an MCQ question.
- Preview must show the answer choices and clearly identify the correct answer (owner-only).

---

## Scope & Phasing

### Phase 1 (Immediate scope)
This phase is intentionally minimal, enabling you to complete auth first and land on the MCQ list:
- Authenticated navigation to the MCQ listing page
- MCQ list page renders for the logged-in user
- Empty state message shown when the user has zero questions: **“NO questions created yet”**
- Logout available after login

> No create/edit/delete/search/sort/pagination/bulk/preview required in Phase 1 unless you decide to pull some forward.

### Phase 2+ (Full MCQ CRUD)
All functionality defined below (search/sort/pagination, CRUD, bulk delete, preview).

---

## Technical Requirements

## Database Schema (Cloudflare D1 / SQLite)

### Data Model Notes
- A question has:
  - Question text (prompt)
  - Optional metadata (difficulty/tags) (future)
  - Multiple options (typically 4, but allow N)
  - Exactly one correct option
- A question is always owned by a user: `mcq_questions.user_id`

### Tables

```sql
-- MCQ Questions: 1 row per question
CREATE TABLE IF NOT EXISTS mcq_questions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  explanation TEXT, -- optional: why the answer is correct (preview/learning)
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mcq_questions_user_id ON mcq_questions (user_id);
CREATE INDEX IF NOT EXISTS idx_mcq_questions_user_created_at ON mcq_questions (user_id, created_at DESC);

-- Options: 1 row per option (choice) for a question
CREATE TABLE IF NOT EXISTS mcq_options (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  question_id TEXT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0, -- SQLite boolean convention: 0/1
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mcq_options_question_id ON mcq_options (question_id);
CREATE INDEX IF NOT EXISTS idx_mcq_options_question_order ON mcq_options (question_id, display_order);
```

### Integrity Rules (Enforced in Application Logic)
Because SQLite/D1 constraints for “exactly one correct option per question” are non-trivial, enforce via application logic:
- Each question must have at least 2 options.
- Exactly one option must be `is_correct = 1`.
- `display_order` must be unique per `question_id` (recommended to enforce in logic; optionally a unique index can be added if desired).

### Search Support
Baseline approach (no FTS):
- Search is performed against `mcq_questions.prompt` using `LIKE` with normalization.
- For scale, consider adding SQLite FTS5 virtual table later (future enhancement).

Indexing for baseline:
- `idx_mcq_questions_user_created_at` supports default ordering and pagination.
- If search becomes slow, add a `user_id,prompt` index (limited help for `%term%` patterns).

---

## Query Patterns (Search / Sort / Pagination)

### Pagination Model
Two acceptable models:

1) **Offset pagination** (simpler)
- Params: `page`, `pageSize`
- Pros: easiest
- Cons: can be slower for deep pages

2) **Cursor pagination** (recommended for stability)
- Params: `cursor` (e.g., last seen `created_at` + `id`), `pageSize`
- Pros: stable and fast for large datasets
- Cons: slightly more complex

For this app, **Offset pagination is acceptable initially**. Cursor pagination can be introduced when needed.

### Sorting
Supported sort keys (initial):
- `created_at` (default): newest first / oldest first
- `updated_at`: newest first / oldest first
- `prompt`: A→Z / Z→A

Sort behavior:
- Always scope to `user_id`.
- Tie-breaker for stable ordering: `id`.

### Searching
Supported initial behavior:
- Search by `prompt` substring (case-insensitive where feasible).
- Search must be scoped to the logged-in user.

---

## API / Server Actions (Contract-Level)

The contracts below can be implemented as **Server Actions** (preferred) or API routes. All actions must verify the authenticated user and enforce ownership.

### List Questions

**Action**: `listQuestions({ query, sortBy, sortDir, page, pageSize })`

**Inputs**
- `query` (optional string): search term
- `sortBy`: `created_at | updated_at | prompt`
- `sortDir`: `asc | desc`
- `page`: 1+
- `pageSize`: 10–100 (default 10/20)

**Response**
```json
{
  "items": [
    {
      "id": "string",
      "prompt": "string",
      "optionCount": 4,
      "createdAt": "ISO/SQLite datetime string",
      "updatedAt": "ISO/SQLite datetime string"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalItems": 42,
  "totalPages": 3
}
```

**Notes**
- `optionCount` can be derived via a subquery or join aggregate.

### Get Question Detail (for Edit/Preview)

**Action**: `getQuestion({ id })`

**Response**
```json
{
  "id": "string",
  "prompt": "string",
  "explanation": "string|null",
  "options": [
    { "id": "string", "optionText": "string", "isCorrect": true, "displayOrder": 0 }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Create Question

**Action**: `createQuestion({ prompt, explanation, options, correctOptionIndex })`

**Validations**
- `prompt`: required, 1–2000 chars, trimmed
- `options`: array length 2–10 (configurable)
- each `optionText`: required, 1–500 chars, trimmed
- `correctOptionIndex`: required, must be a valid index into `options`

**Behavior**
- Insert into `mcq_questions`
- Insert N options into `mcq_options`:
  - exactly one with `is_correct = 1`
  - set `display_order` based on array order

### Update Question

**Action**: `updateQuestion({ id, prompt, explanation, options, correctOptionIndex })`

**Behavior**
- Verify ownership (`mcq_questions.user_id`)
- Update question fields
- Update options:
  - simplest: delete existing options and re-insert
  - alternative: diff update (future optimization)

### Delete Question

**Action**: `deleteQuestion({ id })`

**Behavior**
- Verify ownership
- Delete from `mcq_questions` (cascade removes options)

### Bulk Delete

**Action**: `bulkDeleteQuestions({ ids: string[] })`

**Validations**
- `ids.length` must be 1–200 (configurable safety limit)

**Behavior**
- Delete only questions owned by current user.
- Return counts:
```json
{ "requested": 10, "deleted": 9 }
```

---

## User Interface Requirements

### MCQ Listing Page (`/mcq`)

#### Layout
- Page title: “MCQ Questions”
- Primary CTA: “Add new question”
- Secondary actions:
  - “Delete selected” (disabled until at least 1 selected)

#### Table/List Columns (initial)
- Selection checkbox
- Question prompt (truncate long text, show full on hover or detail page)
- Options count
- Updated at (or Created at)
- Row actions: Preview, Edit, Delete

#### Searching
- Search input above table
- Debounce input (e.g., 300ms) and reset to page 1 on change
- Empty results message:
  - If query is non-empty and no results: “No questions match your search.”

#### Sorting
- Clickable column headers for supported fields
- Show sort direction indicator

#### Pagination
- Page size selector (optional)
- Next/Prev and page numbers (or simple pagination)
- Show “Showing X–Y of Z”

#### Empty State (required in Phase 1)
- When `totalItems === 0` (no query filter), show:
  - **“NO questions created yet”**
  - CTA: “Add your first question” (Phase 2+)

#### Bulk Selection
- Header checkbox selects visible page rows
- Show count of selected items
- Bulk delete requires confirmation dialog

### Create/Edit Question Page (`/mcq/new`, `/mcq/[id]/edit`)

#### Form Fields
- Prompt (textarea)
- Optional explanation (textarea)
- Options list (repeatable):
  - option text input
  - radio button to mark correct answer
  - add/remove option buttons

#### Validations
- Prompt required
- Min 2 options
- Exactly 1 correct answer
- No empty option texts

#### Actions
- Save
- Cancel (return to list)

### Preview (`/mcq/[id]` or modal)

#### Display
- Prompt
- Options as a list
- Correct answer visually highlighted (badge/indicator)
- Optional explanation shown below

#### Access Control
- Only the owner can preview.

---

## Error Handling & Security

### Authorization
Every read/write operation must ensure:
- request has a valid session
- the `user_id` matches the record owner

### Input Validation
Validate all input server-side using a schema approach (recommended: Zod).

### Deletion Safety
- Single delete should confirm with user.
- Bulk delete must confirm and show number of items selected.

---

## Implementation Phases

### Phase 1: Auth Landing + Empty List - ⏳ PLANNED

**Objective**: After login, user lands on MCQ list and sees empty state. Logout is available.

**Tasks**:
1. Create `/mcq` route protected by auth
2. Query user’s question count (or list) scoped to user
3. Render empty state **“NO questions created yet”** when there are no questions
4. Add logout button in authenticated layout/nav

**Deliverables**:
- `/mcq` page with empty state
- logout accessible post-login

### Phase 2: Create + Preview - ⏳ PLANNED

**Objective**: Users can add new questions and preview them.

**Tasks**:
1. Build create form and server action
2. Persist question + options
3. Add preview route/modal

### Phase 3: Edit + Delete - ⏳ PLANNED

**Objective**: Users can update and delete questions.

**Tasks**:
1. Edit form + update action
2. Row delete action + confirmation

### Phase 4: Search + Sort + Pagination + Bulk Delete - ⏳ PLANNED

**Objective**: Full list management at scale.

**Tasks**:
1. Implement list query with filters/sorting/pagination
2. Add UI controls
3. Add bulk selection + bulk delete action

---

## Success Criteria

### Phase 1
- [ ] Authenticated user is routed to `/mcq` after login
- [ ] `/mcq` is protected; unauthenticated users go to `/login`
- [ ] When user has 0 questions, `/mcq` shows **“NO questions created yet”**
- [ ] Logged-in user can log out

### Full Feature
- [ ] User can create a question with N options and mark exactly one correct answer
- [ ] User can preview a question and see correct answer
- [ ] User can edit question/options and change correct answer
- [ ] User can delete a question
- [ ] User can search/sort/paginate their questions
- [ ] User can multi-select and bulk delete questions

---

## Troubleshooting Guide

### “List shows other users’ questions”
**Problem**: User sees data they do not own.  
**Cause**: Missing `WHERE user_id = currentUserId` on list/detail queries.  
**Solution**: Enforce ownership filtering in all queries; add tests for cross-user access.

### “Bulk delete removed fewer items than selected”
**Problem**: Some IDs weren’t deleted.  
**Cause**: IDs not owned by user (expected to be ignored), or already deleted.  
**Solution**: Return deleted count; update UI to reconcile selection with results.

---

## Future Enhancements

- SQLite FTS5 for fast full-text search
- Tags / difficulty / standards alignment fields
- Import/export questions (CSV/JSON)
- Question folders/collections
- Audit log for edits/deletions

---

## Dependencies

### External Dependencies
- None for baseline CRUD

### Internal Dependencies
- Auth session helper from `docs/BASIC_AUTHENTICATION.md`
- D1 data access via `lib/d1-client.ts`

---

## Risks and Mitigation

### Technical Risks
- **Risk**: Search performance degrades with large datasets.  
  **Mitigation**: Add FTS5 in future; keep initial query indexed by `user_id` and paginate.

### User Experience Risks
- **Risk**: Editing options is confusing (correct answer selection changes).  
  **Mitigation**: Clear radio selection and immediate validation messaging.

---

## Current Status

**Last Updated**: 2026-05-05  
**Current Phase**: Phase 1 - Auth Landing + Empty List  
**Status**: ⏳ PLANNED  
**Next Steps**: Implement auth + protected `/mcq` route that shows the “NO questions created yet” empty state.

