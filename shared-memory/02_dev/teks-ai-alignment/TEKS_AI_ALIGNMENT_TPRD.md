# TEKS AI Alignment - Technical PRD

## Overview

This document outlines the requirements for implementing AI-powered MCQ generation aligned to Texas Essential Knowledge and Skills (TEKS) standards. The system will allow teachers to select a TEKS standard from cascading dropdowns and generate a structured multiple choice question using OpenAI, which populates the MCQ creation form for teacher review.

## Business Requirements

### Content Generation

- Teachers need to create standards-aligned questions quickly
- Generated questions must follow a specific TEKS standard
- Teachers must be able to review and edit generated content before saving
- AI output must be structured and predictable (title, description, question, 4 choices)

### Curriculum Coverage

- Support Mathematics standards for Grades 3-4
- Support Science standards for Grades 5-6
- Each standard identified by TEKS code (e.g., TEKS.MA.3.2.A)
- Hierarchical selection: Subject > Grade > Strand > Standard

## Technical Requirements

### TEKS Data Structure

The application maintains a static TEKS data structure in code:

```typescript
// lib/teks.ts
interface TeksStandard {
  code: string;        // e.g., "TEKS.MA.3.2.A"
  description: string; // Full standard description
}

interface TeksStrand {
  name: string;        // e.g., "Number and operations"
  standards: TeksStandard[];
}

interface TeksGrade {
  grade: string;       // e.g., "Grade 3"
  strands: TeksStrand[];
}

interface TeksSubject {
  subject: string;     // e.g., "Mathematics"
  grades: TeksGrade[];
}
```

### API Endpoints

#### POST /api/mcqs/generate-teks

Generates a TEKS-aligned MCQ using OpenAI.

**Request Body:**

```json
{
  "subject": "Mathematics",
  "grade_level": "Grade 3",
  "strand_name": "Number and operations",
  "standard_code": "TEKS.MA.3.2.A",
  "standard_description": "compose and decompose numbers up to 100,000",
  "topic_specifics": "focus on place value with 5-digit numbers"
}
```

**Response:**

```json
{
  "title": "Place Value with 5-Digit Numbers",
  "description": "A question aligned to TEKS.MA.3.2.A testing understanding of place value",
  "question": "What is the value of the digit 7 in the number 47,823?",
  "choices": [
    { "choice_text": "7", "is_correct": false, "order_index": 0 },
    { "choice_text": "700", "is_correct": false, "order_index": 1 },
    { "choice_text": "7,000", "is_correct": true, "order_index": 2 },
    { "choice_text": "70,000", "is_correct": false, "order_index": 3 }
  ]
}
```

**Error Responses:**

- Error (400): Missing required fields
- Error (401): Not authenticated
- Error (429): OpenAI rate limit exceeded
- Error (500): AI generation failure

### AI Integration

#### Model Configuration

- **Model**: `gpt-4o-mini` (supports structured output / JSON schema)
- **Temperature**: 0.7 (balance between creativity and consistency)
- **SDK**: Vercel AI SDK `generateObject` function
- **Environment Variable**: `OPENAI_API_KEY`

#### Prompt Engineering

**System Prompt**: Instructs the AI to act as an educational content creator specializing in K-12 assessment items, generating grade-appropriate questions aligned to specific curriculum standards.

**User Prompt**: Includes the selected TEKS standard details (subject, grade, strand, code, description) and any topic specifics provided by the teacher.

#### Schema Validation

```typescript
// lib/mcq-generation-schema.ts
const GenerationRequestSchema = z.object({
  subject: z.string().min(1),
  grade_level: z.string().min(1),
  strand_name: z.string().min(1),
  standard_code: z.string().min(1),
  standard_description: z.string().min(1),
  topic_specifics: z.string().optional().default(""),
});

const GeneratedMcqSchema = z.object({
  title: z.string(),
  description: z.string(),
  question: z.string(),
  choices: z.array(z.object({
    choice_text: z.string(),
    is_correct: z.boolean(),
    order_index: z.number(),
  })).length(4),
});
```

### User Interface

#### TEKS Generation Dialog

- Modal dialog triggered by "Generate with TEKS" button on MCQ create page
- Cascading dropdowns: Subject > Grade Level > Strand > Standard
- Each dropdown filters based on parent selection
- Topic specifics text input (optional)
- Generate button with loading state
- Error display for generation failures
- On success: close dialog and populate MCQ form

#### Form Integration

- Generated MCQ data passed back to MCQ form component
- `useEffect` hook in MCQ form watches for new generated data and updates form state
- Teacher can modify any field before saving
- No automatic save -- teacher explicitly clicks Create

### Environment Handling

```typescript
// Dual environment support for API key access
function getOpenAIKey(): string {
  // Cloudflare Workers environment
  const cfEnv = getCloudflareContext?.()?.env;
  if (cfEnv?.OPENAI_API_KEY) return cfEnv.OPENAI_API_KEY;
  // Local development
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  throw new Error("OPENAI_API_KEY not configured");
}
```

## Implementation Phases

### Phase 1: TEKS Data and Schemas - completed

**Objective**: Define TEKS data structure and validation schemas

**Tasks**:
1. Create TEKS data structure with subjects, grades, strands, and standards
2. Create Zod schemas for generation request validation
3. Create Zod schemas for AI response validation
4. Create prompt templates

**Deliverables**:
- `lib/teks.ts`
- `lib/mcq-generation-schema.ts`

### Phase 2: Generation API Endpoint - in_progress

**Objective**: Implement the AI generation endpoint

**Tasks**:
1. Create API route handler for POST /api/mcqs/generate-teks
2. Integrate Vercel AI SDK with `generateObject`
3. Implement request validation with Zod
4. Implement response validation
5. Add error handling for AI failures, rate limits, timeouts
6. Handle dual environment for API key access

**Deliverables**:
- `app/api/mcqs/generate-teks/route.ts`

### Phase 3: Generation Frontend - created

**Objective**: Build the TEKS selection dialog and integrate with MCQ form

**Tasks**:
1. Create TEKS generation dialog component with cascading dropdowns
2. Add loading and error states
3. Integrate "Generate with TEKS" button on MCQ create page
4. Add `useEffect` hook in MCQ form for generated data population
5. Test full generation flow

**Deliverables**:
- `components/teks-generation-dialog.tsx`
- Updates to `app/mcqs/create/page.tsx`
- Updates to `components/mcq-form.tsx`

## Technical Implementation Reference

### Core Files

- **`lib/teks.ts`**: Hierarchical TEKS data for Mathematics (Grades 3-4) and Science (Grades 5-6) with strands and standards
- **`lib/mcq-generation-schema.ts`**: Zod schemas for request/response validation, prompt template functions, validation helpers
- **`app/api/mcqs/generate-teks/route.ts`**: API route using Vercel AI SDK `generateObject` with OpenAI
- **`components/teks-generation-dialog.tsx`**: Modal dialog with cascading dropdowns and generation trigger

### Key Patterns

#### Structured AI Output

```typescript
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

const result = await generateObject({
  model: openai("gpt-4o-mini"),
  schema: GeneratedMcqSchema,
  system: systemPrompt,
  prompt: userPrompt,
  temperature: 0.7,
});
```

#### Cascading Dropdown State

```typescript
// When subject changes, reset downstream selections
const handleSubjectChange = (subject: string) => {
  setSubject(subject);
  setGradeLevel("");
  setStrandName("");
  setStandardCode("");
};
```

## Success Criteria

- [x] TEKS data structure defined for Math and Science
- [x] Zod schemas validate request and response
- [ ] API endpoint generates structured MCQ via OpenAI
- [ ] Generated MCQ populates create form
- [ ] Cascading dropdowns filter correctly
- [ ] Error handling covers AI failures and rate limits
- [ ] Teacher can edit generated content before saving

## Troubleshooting Guide

### Model Compatibility

**Problem**: `gpt-4.1-mini` does not support JSON schema structured output
**Cause**: Not all OpenAI models support the `response_format: { type: "json_schema" }` parameter
**Solution**: Use `gpt-4o-mini` which supports structured output via Vercel AI SDK

### Environment Variable Access

**Problem**: `OPENAI_API_KEY` is undefined at runtime
**Cause**: Cloudflare Workers and local Node.js access environment variables differently
**Solution**: Implement dual environment lookup -- check Cloudflare context first, then `process.env`

### Form State Not Updating

**Problem**: Generated MCQ data does not appear in the form
**Cause**: React state update from parent does not trigger form re-render
**Solution**: Add `useEffect` hook in MCQ form component that watches the generated data prop and updates form state

## Future Enhancements

- Additional subjects (ELA, Social Studies)
- Additional grade levels (K-2, 7-8, high school)
- Batch generation of multiple questions per standard
- Difficulty level targeting (easy, medium, hard)
- Save TEKS alignment metadata with the MCQ for reporting
- Teacher prompt customization options

## Dependencies

### External Dependencies

- OpenAI API (gpt-4o-mini model) - AI question generation
- Vercel AI SDK - Structured output generation
- Zod - Schema validation

### Internal Dependencies

- Authentication system - User must be logged in
- MCQ Management - Generated content feeds into MCQ create form
- MCQ form component - Receives and displays generated data

## Risks and Mitigation

### Technical Risks

- **Risk**: OpenAI API downtime or rate limiting
- **Mitigation**: Error handling with user-friendly messages, retry guidance

- **Risk**: AI generates incorrect or inappropriate content
- **Mitigation**: Teacher reviews all generated content before saving; Zod validates structure

- **Risk**: API key exposure in client-side code
- **Mitigation**: Generation happens server-side only; API key never sent to browser

### User Experience Risks

- **Risk**: Slow generation time frustrates teachers
- **Mitigation**: Loading state with clear feedback; gpt-4o-mini is fast

- **Risk**: Generated questions are too easy or too hard
- **Mitigation**: Teacher can edit before saving; future enhancement for difficulty targeting
