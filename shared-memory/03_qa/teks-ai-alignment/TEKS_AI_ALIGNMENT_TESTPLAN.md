# TEKS AI Alignment - QA Test Plan

## Overview

This document outlines the QA testing strategy for the TEKS AI Alignment feature. Test case specifications are maintained in the companion YAML file `teks_ai_alignment_tests.yaml`. Together, these documents guide AI agents in creating, maintaining, and executing integration and end-to-end tests for AI-powered question generation.

---

## Notes for AI Agents

When working with this test plan:

1. **Read the YAML first**: Always read `teks_ai_alignment_tests.yaml` to get current test specifications
2. **Update phase status**: Mark phases as created, in_progress, or completed as work progresses
3. **Add new tests to YAML**: When adding tests, update the YAML file first, then implement
4. **Sync files**: Keep this document and the YAML file in sync
5. **Use code references**: Format `filepath:line-number` when citing code

---

## Test Scope

### In Scope

- Complete TEKS selection flow through cascading dropdowns
- AI generation request/response through the full stack
- Form population with generated content
- Teacher edit-before-save workflow
- Error handling for API failures and validation errors
- Dropdown filtering behavior

### Out of Scope

- Unit tests for Zod schemas (covered by dev tests)
- Unit tests for TEKS data lookup (covered by dev tests)
- OpenAI API reliability testing
- Performance benchmarking of generation time
- Testing with all possible TEKS standard combinations

---

## Test Case Reference

**Test definitions are maintained in**: `shared-memory/03_qa/teks-ai-alignment/teks_ai_alignment_tests.yaml`

The YAML file contains structured test case specifications including:

- Test name and type (integration test, e2e test)
- Input data and preconditions
- Expected output
- Status (created, in_progress, completed)
- Reference to test file location

AI agents should read the YAML file for specific test implementation details.

---

## Test Categories

### Integration Tests

- Test AI generation through the full API stack
- Verify request validation and error responses
- Mock OpenAI API for deterministic testing
- Located in: `tests/integration/`

### End-to-End Tests

- Test complete teacher workflow through the browser
- Simulate dropdown selection, generation, and form editing
- Located in: `tests/e2e/`

---

## Implementation Phases

### Phase 1: Generation Integration Tests - created

**Objective**: Validate AI generation flow through the API with mocked OpenAI

**Test Cases** (from YAML):
1. `generation request with valid TEKS selection returns MCQ` - integration test
2. `generation validates required fields` - integration test
3. `generation handles AI service failure` - integration test
4. `generated MCQ has exactly 4 choices with 1 correct` - integration test

**Deliverables**:
- Integration test file for generation endpoint
- OpenAI mock setup for deterministic testing

### Phase 2: TEKS Selection E2E Tests - created

**Objective**: Validate cascading dropdown behavior and full generation flow in browser

**Test Cases** (from YAML):
1. `teacher selects TEKS standard through cascading dropdowns` - e2e test
2. `teacher generates MCQ and reviews in form` - e2e test
3. `teacher edits generated MCQ before saving` - e2e test
4. `dropdown resets when parent selection changes` - e2e test

**Deliverables**:
- E2E test file for TEKS generation flow
- Page object model for generation dialog

### Phase 3: Error Handling E2E Tests - created

**Objective**: Validate error scenarios in the browser

**Test Cases** (from YAML):
1. `generation error displays user-friendly message` - e2e test
2. `generate button disabled until all required fields selected` - e2e test

**Deliverables**:
- Additional test cases in existing E2E test file

---

## Test Implementation Details

### Key Files

- `shared-memory/03_qa/teks-ai-alignment/teks_ai_alignment_tests.yaml` - Test case definitions
- `tests/integration/teks-generation.integration.test.ts` - Integration tests (to be created)
- `tests/e2e/teks-generation.e2e.test.ts` - E2E tests (to be created)

### Test Data Conventions

- Test TEKS selection: Subject "Mathematics", Grade "Grade 3", Strand "Number and operations", Standard "TEKS.MA.3.2.A"
- Test teacher: `teacher@example.com` / `password123`
- Mock AI response: deterministic MCQ about place value

### Setup Requirements

- OpenAI API mock for integration tests (deterministic responses)
- Authenticated session for all generation requests
- MCQ create page accessible and rendered

---

## Success Criteria

- [ ] All integration test cases from YAML implemented
- [ ] All E2E test cases from YAML implemented
- [ ] All tests passing with mocked AI
- [ ] Cascading dropdown behavior verified
- [ ] Error scenarios covered
- [ ] Teacher edit-before-save flow verified

---

## Current Status

**Last Updated**: February 15, 2026
**Current Phase**: Phase 1 - Generation Integration Tests
**Status**: created
**Next Steps**: Implement integration tests with mocked OpenAI, then E2E tests
