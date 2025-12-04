# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow

### For New Features / User Stories

```
1. CLARIFY     → Ask questions before starting (see below)
2. UNDERSTAND  → What problem? Who uses it? (load domain.md)
3. DESIGN      → How should it work? (load architecture.md)
4. BUILD       → Database → API + Unit Tests → UI (reference quality.md)
5. TEST        → Run tests, verify coverage (90% backend, 80% frontend)
6. VALIDATE    → Does it work? Does it meet the need?
```

**Critical: When implementing API/backend changes, ALWAYS generate unit tests:**
- Write tests for commands, queries, and validators
- Target 90% coverage for business logic (reference quality.md)
- Follow xUnit patterns with Arrange/Act/Assert structure
- Tests are NOT optional - they're part of the implementation

**Before executing on a user story or requirement, always ask clarifying questions:**

- What is unclear or ambiguous in the acceptance criteria?
- Are there edge cases not covered?
- Are there dependencies on other stories?
- What should happen on error?
- Are there UI/UX details missing (e.g., loading states, empty states)?
- Does this conflict with or duplicate existing functionality?

Do NOT start implementation until the user has answered your questions or confirmed there are none.

### For Bug Fixes

```
1. REPRODUCE   → Confirm the issue
2. DIAGNOSE    → Find root cause
3. FIX         → Implement solution + Add/update unit tests
4. TEST        → Verify fix, check for regressions, ensure tests fail without fix
5. VALIDATE    → Confirm fix solves original issue
```

**For backend/API bug fixes, always add a unit test that:**
- Reproduces the bug (test should fail before fix)
- Passes after the fix is applied
- Prevents regression

### For Performance Issues

```
1. MEASURE     → Profile and identify bottlenecks
2. ANALYZE     → Understand the cause
3. OPTIMIZE    → Apply targeted fixes
4. VERIFY      → Confirm improvement
```

## Test Requirements

**Unit tests are mandatory for all API and backend changes.**

### When to Generate Tests

Always generate unit tests when creating or modifying:
- ✅ API Controllers (endpoints, request handling)
- ✅ Application Commands (CQRS command handlers)
- ✅ Application Queries (CQRS query handlers)
- ✅ Validators (FluentValidation or custom validation logic)
- ✅ Domain logic (business rules, calculations)
- ✅ Services (business logic services)

### Test Generation Pattern

For each new command/query/controller action:
1. Create corresponding test class (e.g., `CreateNoteTests.cs` for `CreateNote.cs`)
2. Test happy path with valid inputs
3. Test validation failures with invalid inputs
4. Test error handling and edge cases
5. Verify database state changes (for commands)
6. Target 90% code coverage minimum

### Example Test Structure

```csharp
public class CreateNoteCommandTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesNote()
    {
        // Arrange - setup test data and mocks
        
        // Act - execute the command/query
        
        // Assert - verify expected outcome
    }
    
    [Fact]
    public async Task Handle_InvalidInput_ThrowsValidationException()
    {
        // Test validation failures
    }
}
```

Reference `quality.md` for detailed testing patterns and standards.

## Context Files

Load relevant context based on your task:

| Context | When to Load | File |
|---------|--------------|------|
| **Domain** | Business decisions, user workflows, feature validation | `domain.md` |
| **Architecture** | Technical design, code patterns, stack decisions | `architecture.md` |
| **Quality** | Testing, deployment, definition of done | `quality.md` |

### How to Use Contexts

When working on a task, mentally load the relevant context:
- "Should this feature exist?" → domain.md
- "How should I build this?" → architecture.md
- "Is this ready to ship?" → quality.md

For complex features, you'll reference all three. For a quick bug fix, you might only need architecture.md.

## Development Commands

```bash
# Backend API
cd src/Web
dotnet run

# Frontend
cd src/Angular
ng serve

# Run backend tests (REQUIRED after any API/backend changes)
dotnet test
dotnet test --collect:"XPlat Code Coverage"  # With coverage report

# Run frontend tests
cd src/Angular && ng test
ng test --watch=false --code-coverage  # With coverage report

# Database migrations
cd src/Web
dotnet ef migrations add MigrationName
dotnet ef database update
```

**After implementing backend changes, always run `dotnet test` before considering work complete.**

## Decision Framework

### When Facing Trade-offs

1. **Mobile-first always wins** - If it doesn't work on a phone, redesign it
2. **Simplicity over flexibility** - Build what's needed now, not what might be needed
3. **User value over technical elegance** - A working feature beats a perfect architecture
4. **Standards over creativity** - Use PrimeNG components, Tailwind utilities, established patterns

### When Uncertain

Ask these questions:
1. Does this solve a real problem for users?
2. Can users complete this task easily on mobile?
3. Does this follow our established patterns?
4. Is this the simplest solution that works?

## Quick Reference

### Database Naming
- Tables: `snake_case` plural (e.g., `users`, `audit_logs`)
- Columns: `snake_case` (e.g., `created_at`, `user_id`)
- Primary keys: UUID

### API Naming
- Routes: kebab-case plural (e.g., `/api/users`, `/api/audit-logs`)
- REST verbs: GET (list/get), POST (create), PUT (update), DELETE (remove)

### Frontend Naming
- Components: PascalCase (e.g., `UserListComponent`)
- Files: kebab-case (e.g., `user-list.component.ts`)
- Services: PascalCase with Service suffix (e.g., `UserService`)

### File Locations
- Backend: `src/Web/`
- Frontend: `src/Angular/src/app/`
- Backend Tests: `tests/`
- Documentation: `documentation/`

### Test File Naming
- Test class: `{ClassName}Tests.cs` (e.g., `CreateNoteTests.cs`)
- Test project: `{ProjectName}.Tests.csproj`
- Mirror the structure of the code being tested
