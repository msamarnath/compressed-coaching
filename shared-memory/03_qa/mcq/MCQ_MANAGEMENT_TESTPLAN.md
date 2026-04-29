# MCQ Management - QA Test Plan

## Overview

This document outlines the QA testing strategy for the MCQ Management feature. Test case specifications are maintained in the companion YAML file `mcq_management_tests.yaml`. Together, these documents guide AI agents in creating, maintaining, and executing integration and end-to-end tests for question management.

---

## Notes for AI Agents

When working with this test plan:

1. **Read the YAML first**: Always read `mcq_management_tests.yaml` to get current test specifications
2. **Update phase status**: Mark phases as created, in_progress, or completed as work progresses
3. **Add new tests to YAML**: When adding tests, update the YAML file first, then implement
4. **Sync files**: Keep this document and the YAML file in sync
5. **Use code references**: Format `filepath:line-number` when citing code

---

## Test Scope

### In Scope

- Complete MCQ creation flow (form submission through database persistence)
- MCQ listing with search and pagination behavior
- MCQ edit flow with data pre-population and update
- MCQ delete flow with cascade verification
- MCQ preview flow with attempt recording and feedback display
- Ownership enforcement across all operations
- Error handling and validation feedback

### Out of Scope

- Unit tests for individual service methods (covered by dev tests)
- API contract tests in isolation (covered by dev tests)
- Performance and load testing
- Accessibility testing

---

## Test Case Reference

**Test definitions are maintained in**: `shared-memory/03_qa/mcq/mcq_management_tests.yaml`

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

- Test interactions between service layer, database, and API routes
- Verify data flows correctly through the full stack
- Located in: `tests/integration/`

### End-to-End Tests

- Test complete user flows through the browser
- Simulate real user interactions (form filling, clicking, navigation)
- Located in: `tests/e2e/`

---

## Implementation Phases

### Phase 1: MCQ CRUD Integration Tests - in_progress

**Objective**: Validate full create, read, update, delete flows through the API with real database

**Test Cases** (from YAML):
1. `create MCQ through full stack` - integration test
2. `list MCQs with search returns correct results` - integration test
3. `update MCQ persists all changes` - integration test
4. `delete MCQ cascades to choices and attempts` - integration test
5. `ownership enforcement blocks non-owner operations` - integration test

**Deliverables**:
- Integration test file for MCQ CRUD operations
- Test database setup and teardown utilities

### Phase 2: MCQ User Flow E2E Tests - created

**Objective**: Validate complete user workflows through the browser

**Test Cases** (from YAML):
1. `teacher creates MCQ end-to-end` - e2e test
2. `teacher searches and finds MCQ` - e2e test
3. `teacher edits MCQ and verifies changes` - e2e test
4. `teacher deletes MCQ with confirmation` - e2e test
5. `teacher previews MCQ and submits attempt` - e2e test

**Deliverables**:
- E2E test file for MCQ user flows
- Page object models for MCQ pages

### Phase 3: Edge Cases and Error Handling - created

**Objective**: Validate error scenarios and boundary conditions

**Test Cases** (from YAML):
1. `form validation prevents submission with fewer than 2 choices` - e2e test
2. `form validation requires exactly one correct answer` - e2e test
3. `viewing nonexistent MCQ shows error` - integration test
4. `concurrent edit does not corrupt data` - integration test

**Deliverables**:
- Additional test cases in existing test files

---

## Test Implementation Details

### Key Files

- `shared-memory/03_qa/mcq/mcq_management_tests.yaml` - Test case definitions
- `tests/integration/mcq.integration.test.ts` - Integration tests (to be created)
- `tests/e2e/mcq.e2e.test.ts` - E2E tests (to be created)

### Test Data Conventions

- Test teacher: `teacher@example.com` / `password123`
- Second teacher (for ownership tests): `other.teacher@example.com` / `password123`
- Sample MCQ: Title "Sample Math Question", Question "What is 2+2?", Choices ["3", "4", "5", "6"], Correct: "4"

### Setup Requirements

- Test database seeded with test users
- Authenticated session established before MCQ operations
- Cleanup after each test to prevent data leakage

---

## Success Criteria

- [ ] All integration test cases from YAML implemented
- [x] Integration test cases defined in YAML
- [ ] All E2E test cases from YAML implemented
- [x] E2E test cases defined in YAML
- [ ] All tests passing in CI pipeline
- [ ] Edge cases and error scenarios covered

---

## Current Status

**Last Updated**: February 10, 2026
**Current Phase**: Phase 1 - MCQ CRUD Integration Tests
**Status**: in_progress
**Next Steps**: Complete integration tests, then implement E2E tests
