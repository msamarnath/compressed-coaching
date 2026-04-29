# MCQ Management System - Technical PRD

## Overview

This document outlines the requirements for implementing the MCQ (Multiple Choice Question) management system for QuizMaker. The system will provide full CRUD operations for multiple choice questions, including dynamic choice management, search and pagination, preview mode with attempt tracking, and user ownership enforcement.

## Business Requirements

### Question Management

- Teachers need to create multiple choice questions with flexible answer options
- Questions must support 2 to 6 answer choices with exactly one correct answer
- Teachers must be able to edit, delete, and browse their questions
- Questions belong to the teacher who created them

### Assessment Workflow

- Teachers need to preview questions before using them in class
- Preview mode should simulate the student experience
- Attempt results should provide immediate feedback
- Question library should be searchable and paginated

## Technical Requirements

### Database Schema

#### MCQs Table

```sql
CREATE TABLE mcqs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT,
  question TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mcqs_created_by ON mcqs (created_by);
CREATE INDEX idx_mcqs_created_at ON mcqs (created_at);
```

#### MCQ Choices Table

```sql
CREATE TABLE mcq_choices (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  mcq_id TEXT NOT NULL REFERENCES mcqs(id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mcq_choices_mcq_id ON mcq_choices (mcq_id);
```

#### MCQ Attempts Table

```sql
CREATE TABLE mcq_attempts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  mcq_id TEXT NOT NULL REFERENCES mcqs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  selected_choice_id TEXT NOT NULL REFERENCES mcq_choices(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mcq_attempts_mcq_id ON mcq_attempts (mcq_id);
CREATE INDEX idx_mcq_attempts_user_id ON mcq_attempts (user_id);
```

### API Endpoints

#### POST /api/mcqs

Creates a new MCQ with choices.

**Request Body:**

```json
{
  "title": "string (required, max 200)",
  "description": "string (optional, max 500)",
  "question": "string (required, max 1000)",
  "choices": [
    { "choiceText": "string", "isCorrect": false, "orderIndex": 0 },
    { "choiceText": "string", "isCorrect": true, "orderIndex": 1 }
  ]
}
```

**Response:**

- Success (201): MCQ object with id and created choices
- Error (400): Validation error (missing fields, invalid choice count, no correct answer)
- Error (401): Not authenticated
- Error (500): Server error

#### GET /api/mcqs

Lists MCQs for the authenticated user with search and pagination.

**Query Parameters:**

- `search` (optional): Keyword search across title and question
- `page` (optional, default 1): Page number
- `limit` (optional, default 10): Results per page

**Response:**

- Success (200): `{ mcqs: [...], total: number, page: number, totalPages: number }`
- Error (401): Not authenticated

#### GET /api/mcqs/:id

Returns a single MCQ with its choices.

**Response:**

- Success (200): MCQ object with choices array
- Error (401): Not authenticated
- Error (404): MCQ not found

#### PUT /api/mcqs/:id

Updates an existing MCQ and its choices. Replaces all choices.

**Request Body:** Same as POST

**Response:**

- Success (200): Updated MCQ object
- Error (400): Validation error
- Error (401): Not authenticated
- Error (403): Not the owner
- Error (404): MCQ not found

#### DELETE /api/mcqs/:id

Deletes an MCQ and cascade deletes choices and attempts.

**Response:**

- Success (200): `{ success: true }`
- Error (401): Not authenticated
- Error (403): Not the owner
- Error (404): MCQ not found

#### POST /api/mcqs/:id/attempts

Records a quiz attempt.

**Request Body:**

```json
{
  "selectedChoiceId": "string"
}
```

**Response:**

- Success (201): Attempt object with `isCorrect` boolean
- Error (400): Invalid choice ID
- Error (401): Not authenticated
- Error (404): MCQ not found

#### GET /api/mcqs/:id/attempts

Returns the authenticated user's attempts for a specific MCQ.

**Response:**

- Success (200): Array of attempt objects
- Error (401): Not authenticated

### User Interface

#### MCQ Listing Page (/mcqs)

- Table displaying title, description (truncated), created date
- Search input for keyword filtering
- Pagination controls
- Actions dropdown per row: Edit, Delete, Preview
- "Create MCQ" button
- Empty state when no MCQs exist

#### MCQ Create Page (/mcqs/create)

- Form fields: Title (required), Description (optional), Question (required)
- Dynamic choice section: Add/remove choices (2-6), radio button for correct answer
- Choice reordering
- Client-side validation before submission
- "Generate with TEKS" button (handled by TEKS AI Alignment feature)

#### MCQ Edit Page (/mcqs/:id/edit)

- Same form as create, pre-populated with existing data
- Ownership verification before showing form
- Update and Cancel buttons

#### MCQ Preview Page (/mcqs/:id/preview)

- Card displaying question text
- Radio buttons for answer choices
- Submit button to record attempt
- Result display: correct/incorrect with the right answer highlighted
- Back link to MCQ listing

### Data Handling

#### SQLite Boolean Handling

- Store: Convert JavaScript booleans to integers (1/0) before INSERT/UPDATE
- Retrieve: Handle multiple return types (0/1, 'true'/'false', true/false) for backward compatibility
- Pattern: `is_correct ? 1 : 0` for writes, `Boolean(is_correct)` for reads

#### Choice Management

- On create: Insert MCQ row, then insert each choice individually
- On update: Delete existing choices, then insert new choices
- On delete: CASCADE handles choice and attempt cleanup

## Implementation Phases

### Phase 1: Database Schema - completed

**Objective**: Create MCQ, choices, and attempts tables

**Tasks**:
1. Create migration for mcqs table with foreign key to users
2. Create migration for mcq_choices table with ordering
3. Create migration for mcq_attempts table
4. Run migrations and verify schema

**Deliverables**:
- `migrations/0002_mcqs_table.sql`
- `migrations/0003_mcq_choices_table.sql`
- `migrations/0004_mcq_attempts_table.sql`

### Phase 2: Service Layer and API - completed

**Objective**: Implement MCQ business logic and REST endpoints

**Tasks**:
1. Create MCQService with CRUD operations
2. Implement boolean conversion for SQLite compatibility
3. Create API route handlers for all endpoints
4. Add ownership verification on update/delete
5. Implement search and pagination logic

**Deliverables**:
- `lib/services/mcq-service.ts`
- `app/api/mcqs/route.ts` (GET, POST)
- `app/api/mcqs/[id]/route.ts` (GET, PUT, DELETE)
- `app/api/mcqs/[id]/attempts/route.ts` (GET, POST)

### Phase 3: Management Frontend - completed

**Objective**: Build listing, create, and edit pages

**Tasks**:
1. Create reusable MCQ form component with dynamic choice management
2. Build listing page with search, pagination, and actions dropdown
3. Build create page using MCQ form
4. Build edit page with data pre-population
5. Add delete confirmation dialog

**Deliverables**:
- `components/mcq-form.tsx`
- `app/mcqs/page.tsx`
- `app/mcqs/create/page.tsx`
- `app/mcqs/[id]/edit/page.tsx`

### Phase 4: Preview and Attempts - completed

**Objective**: Build quiz-taking preview with attempt tracking

**Tasks**:
1. Create preview page with question display and radio choices
2. Implement attempt submission and result display
3. Show correct/incorrect feedback after submission
4. Handle edge cases (MCQ not found, already attempted)

**Deliverables**:
- `app/mcqs/[id]/preview/page.tsx`

## Technical Implementation Reference

### Core Files

- **`lib/services/mcq-service.ts`**: All MCQ database operations including CRUD, search, pagination, attempt recording, and ownership checks
- **`components/mcq-form.tsx`**: Reusable form component with dynamic choice management, validation, and support for both create and edit modes
- **`app/api/mcqs/route.ts`**: List and create endpoints
- **`app/api/mcqs/[id]/route.ts`**: Get, update, and delete endpoints
- **`app/api/mcqs/[id]/attempts/route.ts`**: Attempt recording and retrieval

### Key Patterns

#### Individual Mutations for D1

```typescript
// D1 batch operations have reliability issues with parameter binding.
// Use individual mutations instead.
for (const choice of choices) {
  await executeMutation(db,
    "INSERT INTO mcq_choices (id, mcq_id, choice_text, is_correct, order_index) VALUES (?, ?, ?, ?, ?)",
    [id, mcqId, choice.choiceText, choice.isCorrect ? 1 : 0, choice.orderIndex]
  );
}
```

#### Boolean Conversion

```typescript
// Writing to SQLite
const isCorrectInt = choice.isCorrect ? 1 : 0;

// Reading from SQLite (handle multiple formats)
function toBool(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val === 1;
  if (typeof val === "string") return val === "true" || val === "1";
  return false;
}
```

## Success Criteria

- [x] Teachers can create MCQs with 2-6 choices
- [x] Exactly one correct answer is enforced
- [x] MCQs are searchable by title and question text
- [x] Pagination works correctly
- [x] Edit form pre-populates with existing data
- [x] Delete cascades to choices and attempts
- [x] Preview mode records and displays attempt results
- [x] Ownership enforcement prevents unauthorized edits/deletes
- [x] SQLite booleans handled correctly across read/write operations

## Troubleshooting Guide

### D1 Batch Parameter Binding

**Problem**: `Wrong number of parameter bindings` when using `db.batch()`
**Cause**: D1 batch operations do not reliably handle parameter binding across multiple statements
**Solution**: Replace batch operations with individual `executeMutation` calls in a loop
**Code Reference**: `lib/services/mcq-service.ts`

### SQLite Boolean Storage

**Problem**: `is_correct` field returns inconsistent types (0, 1, "true", "false", true, false)
**Cause**: SQLite does not have a native boolean type; different write paths store different formats
**Solution**: Use a `toBool()` helper function that handles all possible formats on read, and always convert to integer on write

### Choice Ordering

**Problem**: Choices display in wrong order after edit
**Cause**: ORDER BY not applied when fetching choices
**Solution**: Always query with `ORDER BY order_index ASC` when retrieving choices

## Future Enhancements

- Bulk question import from CSV or JSON
- Question difficulty levels and tags
- Duplicate/clone MCQ functionality
- Question versioning and history
- Rich text and image support in questions and choices

## Dependencies

- Cloudflare D1 database (SQLite)
- Next.js API routes
- shadcn/ui components (Table, Card, Form, Input, Button, Dialog)
- Authentication system (session-based, from Basic Authentication feature)

## Risks and Mitigation

### Technical Risks

- **Risk**: SQLite boolean inconsistency causing incorrect answers
- **Mitigation**: Centralized boolean conversion functions, defensive reading

- **Risk**: Cascade delete leaving orphaned data
- **Mitigation**: Foreign key constraints with ON DELETE CASCADE, verified in schema

- **Risk**: Race conditions on concurrent MCQ edits
- **Mitigation**: Last-write-wins is acceptable for single-user MVP; no concurrent editing expected

### User Experience Risks

- **Risk**: Accidentally deleting an MCQ with attempt history
- **Mitigation**: Confirmation dialog before delete
