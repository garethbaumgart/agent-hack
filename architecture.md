# Technical Architecture Context

Load this context when making technical decisions, designing implementations, or reviewing code.

## Technology Stack

### Backend
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | .NET | 10 Preview |
| Language | C# | 13 |
| ORM | Entity Framework Core | 9.0+ |
| Database | PostgreSQL | 17+ |
| Validation | FluentValidation | 12.0+ |
| CQRS | MediatR | 13.0+ |
| Real-time | SignalR | (bundled with ASP.NET Core) |
| API Docs | Swashbuckle | Latest |

### Frontend
| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Angular | 20.2.4+ |
| Language | TypeScript | 5.9.2+ (strict mode) |
| UI Library | PrimeNG | 20.1.1+ |
| CSS | Tailwind CSS | (via PrimeNG 20+) |
| Icons | PrimeIcons | (bundled with PrimeNG) |

### Infrastructure
| Component | Technology |
|-----------|------------|
| Containers | Docker |
| Dev Database | PostgreSQL Alpine |
| CI/CD | GitHub Actions |

## Architecture Patterns

### Backend: Clean Architecture + Vertical Slices

```
src/Web/
├── Features/              # Vertical slices by feature
│   ├── Users/
│   │   ├── GetUsers.cs        # Query + Handler
│   │   ├── CreateUser.cs      # Command + Handler
│   │   └── UserDto.cs
│   └── [OtherFeatures]/
│       └── ...
├── Domain/                # Entity classes
├── Infrastructure/        # EF Core, external services
└── Common/                # Shared utilities
```

### Frontend: Feature Modules

```
src/app/
├── features/              # Feature areas
│   ├── dashboard/
│   ├── users/
│   └── settings/
├── shared/                # Reusable components
├── services/              # API clients, state
└── models/                # TypeScript interfaces
```

## Database Conventions

### Naming
- Tables: `snake_case`, plural (e.g., `users`, `audit_logs`)
- Columns: `snake_case` (e.g., `created_at`, `user_id`)
- Indexes: `ix_{table}_{columns}` (e.g., `ix_orders_user_id`)
- Foreign keys: `fk_{table}_{referenced_table}` (e.g., `fk_orders_users`)

### Standard Columns
Every table should have:
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### Keys
- Primary keys: UUID (Guid in C#)
- No auto-increment integers for PKs
- Composite keys only when semantically appropriate

## API Conventions

### URL Structure
```
GET    /api/users              # List all
GET    /api/users/{id}         # Get one
POST   /api/users              # Create
PUT    /api/users/{id}         # Update
DELETE /api/users/{id}         # Delete
```

### Request/Response
- Use DTOs, never expose domain entities
- Consistent property naming (camelCase in JSON)
- Pagination: `?page=1&pageSize=20`
- Filtering: `?status=active&search=term`
- Sorting: `?sortBy=name&sortOrder=asc`

### Error Responses
```json
{
  "type": "ValidationError",
  "title": "One or more validation errors occurred",
  "status": 400,
  "errors": {
    "name": ["Name is required"]
  }
}
```

### Validation
- Use FluentValidation for all input validation
- Validate at API boundary, trust internal code
- Return 400 with structured error response

## Frontend Conventions

### TypeScript
- Strict mode enabled (no `any` types)
- Explicit return types on public methods
- Interfaces for all data shapes
- Enums for fixed value sets

```typescript
// Good
interface User {
  id: string;
  name: string;
  status: UserStatus;
}

enum UserStatus {
  Active = 'active',
  Inactive = 'inactive'
}

// Bad
const user: any = response.data;
```

### Angular Components
- Standalone components only (no NgModules)
- OnPush change detection
- Angular Signals for state (not RxJS subjects for local state)
- `trackBy` functions for all `*ngFor`

```typescript
@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TableModule],
  template: `...`
})
export class UserListComponent {
  users = signal<User[]>([]);
}
```

### Styling Rules
- **No component stylesheets** - delete `.scss` files from components
- Use Tailwind utilities directly in templates
- Use PrimeNG component classes for component-specific styling
- Generate components with: `ng generate component --skip-styles`

```html
<!-- Good: Tailwind utilities -->
<div class="flex flex-col gap-4 p-4 md:flex-row">
  <p-button label="Save" class="w-full md:w-auto" />
</div>

<!-- Bad: Custom CSS -->
<div class="my-custom-container">  <!-- Don't do this -->
```

### PrimeNG Usage
- Use PrimeNG components for all UI elements
- Don't create custom components when PrimeNG has one
- Follow PrimeNG patterns for forms, tables, dialogs
- Use PrimeNG theme tokens for colors

### State Management
- Services with Signals for shared state
- Component-local state with signals
- RxJS for async operations and HTTP
- No NgRx (overkill for most projects)

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private usersSignal = signal<User[]>([]);
  users = this.usersSignal.asReadonly();

  async loadUsers(): Promise<void> {
    const data = await firstValueFrom(this.http.get<User[]>('/api/users'));
    this.usersSignal.set(data);
  }
}
```

## Code Quality Standards

### C# Standards
- Enable nullable reference types
- Use `async/await` for all I/O
- No `Task.Result` or `.Wait()` (deadlock risk)
- File-scoped namespaces
- Primary constructors where appropriate

```csharp
// Good
public async Task<User?> GetUserAsync(Guid id, CancellationToken ct)
{
    return await _context.Users
        .FirstOrDefaultAsync(u => u.Id == id, ct);
}

// Bad
public User GetUser(Guid id)
{
    return _context.Users.FirstOrDefault(u => u.Id == id);
}
```

### Error Handling
- Use global exception middleware
- Don't catch exceptions unless you can handle them
- Log errors with structured logging
- Return appropriate HTTP status codes

### Performance Considerations
- Use `AsNoTracking()` for read-only queries
- Select only needed columns for list endpoints
- Pagination for all list endpoints
- Indexes for frequently filtered columns

## Architecture Decision Checklist

Before implementing a feature:

- [ ] Follows vertical slice pattern (feature folder, not layer folder)
- [ ] Uses existing patterns (don't invent new ones)
- [ ] Database schema follows conventions
- [ ] API follows REST conventions
- [ ] Frontend uses PrimeNG components (no custom UI)
- [ ] No custom CSS files (Tailwind utilities only)
- [ ] TypeScript strict mode compliance
- [ ] Proper async/await usage
- [ ] Mobile-responsive by default
