# [Feature Name] - Technical PRD

## Overview

**Instructions**: Write 2-3 sentences describing what this feature does and why it is needed. Keep it simple and clear.

**Example**: "This document outlines the requirements for implementing [feature name] in [application name]. The system will [main purpose] to support [business goal]."

---

## Business Requirements

**Instructions**: List what the business needs from this feature. Use bullet points. Group related requirements under subheadings.

**Structure**:
- Use subheadings like "User Management", "Security Requirements", "Data Requirements"
- Each requirement should be one clear sentence
- Focus on "what" not "how"

**Example**:
```
### User Management
- Users can [action]
- Users must be able to [action]
- System should [behavior]
```

---

## Technical Requirements

**Instructions**: Describe how the feature will be built. Include database, API, and UI details. Use code examples where helpful.

### Database Schema

**Instructions**: Show all database tables needed. Include:
- Table name
- Column names and types
- Primary keys and foreign keys
- Indexes if needed
- Use SQL CREATE TABLE statements

**Example**:
```sql
CREATE TABLE table_name (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  column_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

**Instructions**: List all API routes needed. For each endpoint, include:
- HTTP method (GET, POST, PUT, DELETE)
- Route path
- Request body structure (if any)
- Response structure
- Error codes and messages

**Format**:
```
#### POST /api/resource
**Request Body:**
```json
{
  "field": "value"
}
```

**Response:**
- Success (200): Response object
- Error (400): Validation error
- Error (500): Server error
```

### User Interface Requirements

**Instructions**: Describe all pages and components needed. Include:
- Page routes
- Form fields
- Validation rules
- User interactions
- Error handling

**Format**:
```
#### Page Name (/route/path)
- List of features
- Form fields with validation
- User actions available
```

---

## Implementation Phases

**Instructions**: Break work into phases. Each phase should have:
- Clear objective
- List of tasks
- Status marker (✅ COMPLETED, 🚧 IN PROGRESS, ⏳ PLANNED)
- Update status as work progresses

**Format**:
```
### Phase 1: [Phase Name] - ⏳ PLANNED

**Objective**: [What this phase achieves]

**Tasks**:
1. Task description
2. Task description
3. Task description

**Deliverables**:
- File or component created
- Feature implemented
- Testing completed
```

**Status Markers**:
- ✅ COMPLETED - Phase is done
- 🚧 IN PROGRESS - Currently working on this
- ⏳ PLANNED - Not started yet

---

## Technical Implementation Details

**Instructions**: Add code examples and patterns used. Include:
- Key files and their purpose
- Code patterns and conventions
- Important implementation notes
- Configuration details

**Format**:
```
### Key Files
- `path/to/file.ts` - Purpose description
- `path/to/file.tsx` - Purpose description

### Implementation Patterns
```typescript
// Code example showing pattern
```

### Important Notes
- Critical gotchas or important details
- Best practices followed
- Known limitations
```

---

## Success Criteria

**Instructions**: List how you will know the feature is complete. Use checkboxes that can be marked as done.

**Format**:
```
- [ ] Users can [action]
- [ ] System handles [scenario]
- [ ] Error cases are handled
- [ ] Performance meets requirements
```

---

## Troubleshooting Guide

**Instructions**: Document common problems and solutions. Include:
- Problem description
- Root cause
- Solution steps
- Code references if helpful

**Format**:
```
### Common Issue Name
**Problem**: [What goes wrong]
**Cause**: [Why it happens]
**Solution**: [How to fix it]
**Code Reference**: `file.ts:line-number`
```

---

## Future Enhancements

**Instructions**: List features that are not in current scope but may be added later. Keep it brief.

**Format**:
```
- Feature idea 1
- Feature idea 2
- Feature idea 3
```

---

## Dependencies

**Instructions**: List what this feature needs to work:
- External services or APIs
- Internal services or modules
- Database requirements
- Environment variables

**Format**:
```
### External Dependencies
- Service name - Purpose
- API name - Purpose

### Internal Dependencies
- Module name - Purpose
- Service name - Purpose
```

---

## Risks and Mitigation

**Instructions**: Identify potential problems and how to prevent or handle them.

**Format**:
```
### Technical Risks
- **Risk**: [What could go wrong]
- **Mitigation**: [How to prevent or handle it]

### User Experience Risks
- **Risk**: [What could go wrong]
- **Mitigation**: [How to prevent or handle it]
```

---

## Notes for AI Agents

**Instructions for AI**: When updating this PRD:
1. Update phase status markers as work progresses
2. Add implementation details under "Technical Implementation Details" as code is written
3. Mark success criteria as complete when features work
4. Add troubleshooting entries when bugs are found and fixed
5. Keep all sections current - remove outdated information
6. Use code references format: `filepath:line-number` when citing code
7. Update "Current Status" section at the top if needed

---

## Current Status

**Instructions**: Add a brief summary of current state. Update this section regularly.

**Example**:
```
**Last Updated**: [Date]
**Current Phase**: Phase 2 - Backend Implementation
**Status**: 🚧 IN PROGRESS
**Next Steps**: Complete API endpoint testing
```

