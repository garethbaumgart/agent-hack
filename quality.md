# Quality & Deployment Context

Load this context when writing tests, preparing for deployment, or validating that work is complete.

## Testing Strategy

### Backend Testing

#### Unit Tests (xUnit)
- **Coverage target:** 90% for business logic
- **What to test:** Commands, queries, validators, domain logic
- **What to skip:** Simple DTOs, EF configurations, generated code

```csharp
public class CreateUserCommandTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesUser()
    {
        // Arrange
        var command = new CreateUserCommand { Name = "John Doe" };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("John Doe", result.Name);
    }
}
```

#### Integration Tests
- Use TestContainers for PostgreSQL
- Test full request/response cycle
- Verify database state after operations

### Frontend Testing

#### Unit Tests (Jasmine/Karma)
- **Coverage target:** 80% for business logic
- **What to test:** Services, complex component logic, utilities
- **What to skip:** Simple template bindings, PrimeNG component wrappers

```typescript
describe('UserService', () => {
  it('should load users', async () => {
    httpMock.expectOne('/api/users').flush(mockUsers);
    await service.loadUsers();
    expect(service.users()).toEqual(mockUsers);
  });
});
```

#### E2E Tests (Playwright)
- Critical user journeys
- Cross-browser validation
- Mobile viewport testing

### Visual Testing (Playwright)

Visual tests validate UI against mockups:

```typescript
test('dashboard displays correctly on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard-mobile.png');
});
```

#### Visual Test Workflow
1. Create mockup (HTML with PrimeNG)
2. Implement feature
3. Generate baseline screenshot
4. Future changes compared against baseline
5. Update baseline only when intentional changes made

## Code Quality Gates

### Before Committing

```bash
# Backend
dotnet build --warnaserror
dotnet test

# Frontend
ng build --configuration production
ng test --watch=false
ng lint
```

### CI Pipeline Checks
- Build succeeds (both projects)
- All tests pass
- Linting passes
- No TypeScript errors
- Docker image builds

## Definition of Done

A feature is complete when:

### Functionality
- [ ] Feature works as specified
- [ ] Edge cases handled appropriately
- [ ] Error states display user-friendly messages
- [ ] Loading states shown during async operations

### Mobile Experience
- [ ] Tested on mobile viewport (375px width)
- [ ] Touch targets are 44x44px minimum
- [ ] No horizontal scrolling required
- [ ] Tested on actual mobile device (not just browser)

### Code Quality
- [ ] No TypeScript `any` types
- [ ] No custom CSS files (Tailwind only)
- [ ] Uses PrimeNG components correctly
- [ ] Follows project conventions
- [ ] No linting warnings/errors

### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] Manual testing completed
- [ ] Visual regression test baseline updated (if UI changed)

### Documentation
- [ ] API documented in Swagger
- [ ] Complex logic has inline comments
- [ ] README updated if setup changed

## Deployment

### Local Development

```bash
# Start backend
cd src/Web
dotnet run

# Start frontend
cd src/Angular
ng serve

# Access
# API: http://localhost:5000
# UI: http://localhost:4200
```

### Docker

```bash
# Build and run everything
docker-compose up --build

# Just database
docker-compose up postgres
```

### Environment Configuration

| Environment | Database | Config Source |
|-------------|----------|---------------|
| Development | InMemory or local PostgreSQL | appsettings.Development.json |
| Staging | PostgreSQL container | Environment variables |
| Production | Managed PostgreSQL | Environment variables + secrets |

### Health Checks

All deployments must have:
- `/health` endpoint returning 200 when healthy
- Database connectivity check
- Logging configured and working
- Error tracking enabled

## Deployment Checklist

Before deploying:

- [ ] All CI checks passing
- [ ] Feature tested in staging-like environment
- [ ] Database migrations tested (up and down)
- [ ] No sensitive data in logs
- [ ] Environment variables documented
- [ ] Rollback plan identified

## Monitoring & Observability

### Logging
- Use structured logging
- Log levels: Debug (dev), Information (production)
- Include correlation IDs for request tracing

```csharp
_logger.LogInformation("Entity {EntityId} updated by {UserId}", entityId, userId);
```

### Metrics to Track
- API response times (p50, p95, p99)
- Error rates by endpoint
- Active WebSocket connections
- Database query duration

### Alerts
- API error rate > 1%
- Response time p95 > 2 seconds
- Database connection failures
- SignalR hub disconnection spikes

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
- Run `ng build` to see full error output
- Check for missing imports or type mismatches

**Tests fail locally but pass in CI**
- Check for time-dependent tests
- Verify test isolation (no shared state)

**Database migration fails**
- Check migration order
- Verify database is accessible
- Try `dotnet ef database update --verbose`

**Visual tests fail**
- Compare screenshots manually
- Update baseline if change was intentional: `npx playwright test --update-snapshots`

### Debug Commands

```bash
# Check .NET SDK
dotnet --list-sdks

# Check Node/npm
node -v && npm -v

# Check Angular CLI
ng version

# Check database connection
dotnet ef database update --verbose

# Rebuild everything
dotnet clean && dotnet build
rm -rf node_modules && npm install && ng build
```
