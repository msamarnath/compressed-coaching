# MCQ Management - Product Spec

## Overview

This document outlines the product requirements for the MCQ (Multiple Choice Question) Management feature. MCQ Management enables teachers to create, organize, and preview a personal library of multiple choice questions. Feature specifications are maintained in the companion YAML file `mcq_management_features.yaml`.

---

## Notes for AI Agents

When working with this product spec:

1. **Read the YAML first**: Always read `mcq_management_features.yaml` to get current feature specifications
2. **Update phase status**: Mark phases as created, in_progress, or completed as work progresses
3. **Add new features to YAML**: When adding features, update the YAML file first, then implement
4. **Sync files**: Keep this document and the YAML file in sync
5. **Use code references**: Format `filepath:line-number` when citing code

---

## Feature Scope

### In Scope

- Create MCQs with title, description, question, and 2-6 choices
- Edit existing MCQs (question text, choices, correct answer)
- Delete MCQs with cascade cleanup of choices and attempts
- List MCQs with keyword search and pagination
- Preview MCQs in a quiz-taking interface
- Record and display attempt results
- User ownership enforcement (users manage only their own MCQs)

### Out of Scope

- Sharing MCQs between users
- Organizing MCQs into quizzes or assessments
- Bulk import/export of questions
- Student-facing quiz delivery
- Analytics and reporting on attempt data
- Question categories or tags

---

## Feature Reference

**Feature definitions are maintained in**: `shared-memory/01_product/mcq/mcq_management_features.yaml`

The YAML file contains structured feature specifications including:

- Feature name and type (ui feature, api feature, security feature)
- Input/output contracts
- Validation rules
- Error codes
- Status (created, in_progress, completed)

AI agents should read the YAML file for specific implementation details.

---

## Feature Categories

### UI Features

- MCQ creation form with dynamic choice management
- MCQ listing page with search and pagination
- MCQ edit form pre-populated with existing data
- MCQ delete confirmation dialog
- MCQ preview/quiz-taking interface
- Located in: `app/mcqs/` and `components/`

### API Features

- CRUD endpoints for MCQs
- Attempt recording and retrieval
- Search and pagination support
- Located in: `app/api/mcqs/`

### Security Features

- User ownership enforcement on edit and delete
- Authentication required for all MCQ operations
- Located in: `lib/services/mcq-service.ts`

---

## Implementation Phases

### Phase 1: Database Schema - completed

**Objective**: Create database tables for MCQs, choices, and attempts

**Features** (from YAML):
- MCQs table with foreign key to users
- MCQ choices table with ordering
- MCQ attempts table for tracking

**Deliverables**:
- `migrations/0002_mcqs_table.sql`
- `migrations/0003_mcq_choices_table.sql`
- `migrations/0004_mcq_attempts_table.sql`

### Phase 2: MCQ Backend API - completed

**Objective**: Implement CRUD endpoints and service layer

**Features** (from YAML):
1. `create MCQ` - api feature
2. `list MCQs with search and pagination` - api feature
3. `get single MCQ` - api feature
4. `update MCQ` - api feature
5. `delete MCQ` - api feature
6. `record MCQ attempt` - api feature
7. `get user attempts` - api feature
8. `user ownership enforcement` - security feature

**Deliverables**:
- `lib/services/mcq-service.ts`
- `app/api/mcqs/route.ts`
- `app/api/mcqs/[id]/route.ts`
- `app/api/mcqs/[id]/attempts/route.ts`

### Phase 3: MCQ Management Frontend - completed

**Objective**: Build UI for creating, listing, editing, and deleting MCQs

**Features** (from YAML):
1. `MCQ creation form` - ui feature
2. `dynamic choice management` - ui feature
3. `MCQ listing page` - ui feature
4. `MCQ edit form` - ui feature
5. `MCQ delete confirmation` - ui feature

**Deliverables**:
- `app/mcqs/page.tsx`
- `app/mcqs/create/page.tsx`
- `app/mcqs/[id]/edit/page.tsx`
- `components/mcq-form.tsx`

### Phase 4: MCQ Preview and Attempts - completed

**Objective**: Build quiz-taking preview with attempt tracking

**Features** (from YAML):
1. `MCQ preview page` - ui feature
2. `record MCQ attempt` - api feature
3. `get user attempts` - api feature

**Deliverables**:
- `app/mcqs/[id]/preview/page.tsx`

---

## Feature Implementation Details

### Key Files

- `shared-memory/01_product/mcq/mcq_management_features.yaml` - Feature definitions
- `lib/services/mcq-service.ts` - MCQ CRUD operations and business logic
- `app/api/mcqs/` - MCQ API endpoints
- `app/mcqs/` - MCQ pages (list, create, edit, preview)
- `components/mcq-form.tsx` - Reusable MCQ creation/edit form

### Implementation Conventions

- Use shadcn/ui for all form components (Table, Card, Form, Input, Button)
- Use D1 client helpers for database access with parameterized queries
- SQLite boolean handling: convert JavaScript booleans to integers (1/0) for storage
- Dynamic choice management: minimum 2, maximum 6 choices per question
- Cascade deletes: removing an MCQ deletes associated choices and attempts
- Ownership check: compare `created_by` field against authenticated user's ID

---

## Success Criteria

- [x] Teachers can create MCQs with 2-6 choices and one correct answer
- [x] Teachers can search and browse their question library
- [x] Teachers can edit existing MCQs
- [x] Teachers can delete MCQs with confirmation
- [x] Teachers can preview MCQs in a quiz-taking interface
- [x] Attempt results show correct/incorrect feedback
- [x] Users can only edit/delete their own MCQs

---

## Current Status

**Last Updated**: February 5, 2026
**Current Phase**: All phases complete
**Status**: completed
**Next Steps**: Proceed to QA testing phase
