# [Feature Name] - Test Plan

## Overview

**Instructions**: Write 2-3 sentences describing the testing strategy for this feature. Explain what is being validated and the general approach.

**Example**: "This document outlines the testing strategy for [feature name]. Test case specifications are maintained in the companion YAML file `[feature_name]_tests.yaml`. Together, these documents guide AI agents in creating, maintaining, and executing tests."

---

## Notes for AI Agents

When working with this test plan:

1. **Read the YAML first**: Always read the companion `[feature_name]_tests.yaml` to get current test specifications
2. **Update phase status**: Mark phases as created, in_progress, or completed as work progresses
3. **Add new tests to YAML**: When adding tests, update the YAML file first, then update this document
4. **Sync files**: Keep this document and the YAML file in sync
5. **Use code references**: Format `filepath:line-number` when citing code

---

## Test Scope

### In Scope

**Instructions**: List what is being tested. Be specific about the scenarios and flows covered.

**Example**:
```
- User signup flow (success and error cases)
- API response verification
- Input validation
```

### Out of Scope

**Instructions**: List what is explicitly NOT tested in this plan. This prevents scope confusion.

**Example**:
```
- Features covered by a different test plan
- Manual-only testing scenarios
```

---

## Test Case Reference

**Test definitions are maintained in**: `shared-memory/[02_dev or 03_qa]/[feature-name]/[feature_name]_tests.yaml`

The YAML file contains structured test case specifications including:

- Test name and type (unit test, api test, integration test, e2e test)
- Input data
- Expected output
- Status (created, in_progress, completed)
- Reference to test file location

AI agents should read the YAML file for specific test implementation details.

---

## Test Categories

**Instructions**: Describe the types of tests included and where they live.

### For Dev Test Plans (02_dev)

```
### Unit Tests
- Test individual functions and methods in isolation
- Mock external dependencies (database, APIs)
- Located in: `__tests__/` or `tests/unit/`

### API/Service Tests
- Test service layer logic and API route handlers
- Verify request/response contracts
- Located in: `__tests__/` or `tests/api/`
```

### For QA Test Plans (03_qa)

```
### Integration Tests
- Test interactions between multiple components
- Use test database or mock services
- Located in: `tests/integration/`

### End-to-End Tests
- Test complete user flows through the UI
- Use browser automation (e.g., Playwright, Cypress)
- Located in: `tests/e2e/`
```

---

## Implementation Phases

**Instructions**: Break test implementation into phases. Each phase groups related test cases.

**Format**:
```
### Phase 1: [Test Group Name] - created

**Objective**: [What this phase validates]

**Test Cases** (from YAML):
1. `test name` - test type
2. `test name` - test type

**Deliverables**:
- Test file for [component/feature]
- Test data and fixtures
```

**Status Values**:
- `created` - Test cases defined, not yet implemented
- `in_progress` - Tests being written
- `completed` - Tests implemented and passing

---

## Test Implementation Details

**Instructions**: Add details as tests are implemented. Include key files, test data conventions, and setup requirements.

**Format**:
```
### Key Files
- `path/to/test/file` - What it tests
- `path/to/fixtures` - Test data

### Test Data Conventions
- Standard test data used across tests
- Naming conventions for test users/entities

### Setup Requirements
- Database seeding needed
- Environment variables required
- Mock services to configure
```

---

## Success Criteria

**Instructions**: List how you know the test plan is complete. Use checkboxes.

**Format**:
```
- [ ] All test cases from YAML implemented
- [ ] All tests passing
- [ ] Code coverage meets threshold
- [ ] Edge cases covered
```

---

## Current Status

**Instructions**: Brief summary of testing progress. Update regularly.

**Format**:
```
**Last Updated**: [Date]
**Current Phase**: [Phase name]
**Status**: [created | in_progress | completed]
**Next Steps**: [What tests to implement next]
```
