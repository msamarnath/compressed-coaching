# [Feature Name] - Product Spec

## Overview

**Instructions**: Write 2-3 sentences describing this feature from the product perspective. Focus on what value it delivers to users and why it matters.

**Example**: "This document outlines the product requirements for [feature name]. [Feature name] enables users to [primary value] as part of the [application name] platform."

---

## Notes for AI Agents

When working with this product spec:

1. **Read the YAML first**: Always read the companion `[feature_name]_features.yaml` to get current feature specifications
2. **Update phase status**: Mark phases as created, in_progress, or completed as work progresses
3. **Add new features to YAML**: When adding features, update the YAML file first, then update this document
4. **Sync files**: Keep this document and the YAML file in sync
5. **Use code references**: Format `filepath:line-number` when citing code

---

## Feature Scope

### In Scope

**Instructions**: List the capabilities included in this feature. Be specific about what users can do.

**Example**:
```
- User action or capability 1
- User action or capability 2
- System behavior or requirement
```

### Out of Scope

**Instructions**: Explicitly list what is NOT included. This prevents scope creep and sets clear boundaries.

**Example**:
```
- Capability deferred to future release
- Related feature handled elsewhere
```

---

## Feature Reference

**Feature definitions are maintained in**: `shared-memory/01_product/[feature-name]/[feature_name]_features.yaml`

The YAML file contains structured feature specifications including:

- Feature name and type (ui feature, api feature, security feature, middleware feature, ai feature)
- Input/output contracts
- Validation rules
- Error codes
- Status (created, in_progress, completed)

AI agents should read the YAML file for specific implementation details.

---

## Feature Categories

**Instructions**: Group features by type. List the general purpose of each category and where the implementation lives.

**Format**:
```
### UI Features
- User-facing forms and pages
- Client-side validation
- Located in: `app/` and `components/`

### API Features
- Backend endpoints
- Request/response handling
- Located in: `app/api/`

### Security Features
- Authentication, authorization, encryption
- Located in: `lib/`

### Middleware Features
- Request interception, route protection
- Located in: `middleware.ts`
```

---

## Implementation Phases

**Instructions**: Break work into phases. Each phase maps to a logical deliverable. Reference features from the YAML by name.

**Format**:
```
### Phase 1: [Phase Name] - created

**Objective**: [What this phase achieves]

**Features** (from YAML):
- `feature name` - feature type
- `feature name` - feature type

**Deliverables**:
- File or component created
- Feature implemented
```

**Status Values**:
- `created` - Defined but not started
- `in_progress` - Currently being worked on
- `completed` - Done and verified

---

## Feature Implementation Details

**Instructions**: Add details as features are implemented. Include key files and conventions used.

**Format**:
```
### Key Files
- `path/to/file` - Purpose description
- `path/to/file` - Purpose description

### Implementation Conventions
- Convention or pattern used
- Convention or pattern used
```

---

## Success Criteria

**Instructions**: List how you know the feature is complete from the user's perspective. Use checkboxes.

**Format**:
```
- [ ] Users can [action]
- [ ] System handles [scenario]
- [ ] Error cases provide clear feedback
```

---

## Current Status

**Instructions**: Brief summary of where things stand. Update regularly.

**Format**:
```
**Last Updated**: [Date]
**Current Phase**: [Phase name]
**Status**: [created | in_progress | completed]
**Next Steps**: [What happens next]
```
