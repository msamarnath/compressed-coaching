# TEKS AI Alignment - Product Spec

## Overview

This document outlines the product requirements for the TEKS AI Alignment feature. TEKS AI Alignment enables teachers to generate standards-aligned multiple choice questions using AI, guided by Texas Essential Knowledge and Skills (TEKS) curriculum standards. Feature specifications are maintained in the companion YAML file `teks_ai_alignment_features.yaml`.

---

## Notes for AI Agents

When working with this product spec:

1. **Read the YAML first**: Always read `teks_ai_alignment_features.yaml` to get current feature specifications
2. **Update phase status**: Mark phases as created, in_progress, or completed as work progresses
3. **Add new features to YAML**: When adding features, update the YAML file first, then implement
4. **Sync files**: Keep this document and the YAML file in sync
5. **Use code references**: Format `filepath:line-number` when citing code

---

## Feature Scope

### In Scope

- Cascading dropdown selection for TEKS standards (Subject > Grade > Strand > Standard)
- Optional topic specifics input to narrow question focus
- AI-powered MCQ generation using OpenAI
- Generated question populates the MCQ create form for teacher review
- Teacher can edit generated content before saving
- Request and response validation with Zod schemas
- TEKS data for Mathematics (Grades 3-4) and Science (Grades 5-6)

### Out of Scope

- Additional subjects beyond Mathematics and Science
- Additional grade levels beyond 3-6
- Batch generation (multiple questions at once)
- Question difficulty targeting
- Custom prompt engineering by teachers
- Saving TEKS alignment metadata with the MCQ
- TEKS standard browsing outside of generation flow

---

## Feature Reference

**Feature definitions are maintained in**: `shared-memory/01_product/teks-ai-alignment/teks_ai_alignment_features.yaml`

The YAML file contains structured feature specifications including:

- Feature name and type (ui feature, ai feature, api feature, security feature)
- Input/output contracts
- Validation rules
- Error codes
- Status (created, in_progress, completed)

AI agents should read the YAML file for specific implementation details.

---

## Feature Categories

### UI Features

- Cascading dropdown selection (Subject, Grade, Strand, Standard)
- Topic specifics free text input
- Generation dialog modal
- Form population with generated content
- Located in: `components/teks-generation-dialog.tsx`

### AI Features

- OpenAI-powered MCQ generation
- Structured output with Zod schema validation
- Educational prompt engineering
- Located in: `app/api/mcqs/generate-teks/route.ts`

### API Features

- TEKS data structure serving
- Generation endpoint
- Located in: `app/api/mcqs/generate-teks/` and `lib/teks.ts`

### Security Features

- Request validation (required fields, data types)
- Response validation (exactly 4 choices, one correct)
- Authentication required
- Located in: `lib/mcq-generation-schema.ts`

---

## Implementation Phases

### Phase 1: TEKS Data Structure - completed

**Objective**: Define and organize TEKS curriculum data for dropdown selection

**Features** (from YAML):
1. `TEKS data structure` - api feature

**Deliverables**:
- `lib/teks.ts` with hierarchical TEKS data

### Phase 2: Generation Backend - completed

**Objective**: Implement AI generation endpoint with validation

**Features** (from YAML):
1. `generate TEKS-aligned MCQ` - ai feature
2. `generation request validation` - security feature
3. `generated content validation` - security feature

**Deliverables**:
- `lib/mcq-generation-schema.ts` with Zod schemas
- `app/api/mcqs/generate-teks/route.ts`

### Phase 3: Generation Frontend - completed

**Objective**: Build TEKS selection UI and integrate with MCQ form

**Features** (from YAML):
1. `subject dropdown` - ui feature
2. `grade level dropdown` - ui feature
3. `strand dropdown` - ui feature
4. `standard dropdown` - ui feature
5. `topic specifics input` - ui feature
6. `TEKS generation dialog` - ui feature
7. `generated MCQ populates form` - ui feature

**Deliverables**:
- `components/teks-generation-dialog.tsx`
- Integration with `app/mcqs/create/page.tsx`

---

## Feature Implementation Details

### Key Files

- `shared-memory/01_product/teks-ai-alignment/teks_ai_alignment_features.yaml` - Feature definitions
- `lib/teks.ts` - TEKS data structure and lookup functions
- `lib/mcq-generation-schema.ts` - Zod schemas, prompt templates, validation helpers
- `app/api/mcqs/generate-teks/route.ts` - AI generation API endpoint
- `components/teks-generation-dialog.tsx` - TEKS selection and generation UI

### Implementation Conventions

- Use Vercel AI SDK `generateObject` for structured AI output
- Use Zod schemas for both request validation and AI response validation
- Cascading dropdowns filter options based on parent selection
- Generated MCQ uses `useEffect` to update form state when new content arrives
- Teacher always reviews and can edit before saving

---

## Success Criteria

- [x] Teachers can select TEKS standards through cascading dropdowns
- [x] Teachers can optionally provide topic specifics
- [x] AI generates a complete MCQ with title, description, question, and 4 choices
- [x] Generated MCQ populates the create form for review
- [x] Teachers can edit generated content before saving
- [x] Invalid selections are prevented by cascading filter logic
- [x] AI generation errors display user-friendly messages

---

## Current Status

**Last Updated**: February 12, 2026
**Current Phase**: All phases complete
**Status**: completed
**Next Steps**: Proceed to dev technical PRD and QA testing
