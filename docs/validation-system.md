# User Schema Validation System

This document explains the comprehensive schema validation system implemented with Zod for the user authentication system.

## Overview

The validation system provides:
- **Input validation** using Zod schemas
- **Output validation** to ensure consistent API responses
- **Type safety** with TypeScript integration
- **Detailed error messages** for validation failures
- **Middleware integration** for clean separation of concerns

## Files Structure

```
src/
├── schemas/
│   └── user.schema.ts          # Zod schemas and validation functions
├── middlewares/
│   └── validation.middleware.ts # Express middleware for validation
├── controllers/
│   └── user.controller.ts      # Controllers with type-safe validation
├── utils/
│   └── entity-mappers.ts       # Entity to schema type converters
└── tests/
    └── schema-validation.test.ts # Validation tests
```

## Schemas

### Input Schemas
- **registerUserSchema**: Validates user registration data
  - Email: Must be valid email format, trimmed, and lowercase
  - Password: Min 8 chars, must contain uppercase, lowercase, and number
  
- **loginUserSchema**: Validates user login data
  - Email: Must be valid email format, trimmed, and lowercase
  - Password: Required field (no strength validation for login)

- **getUserByIdSchema**: Validates user ID parameter
  - ID: Must be valid UUID format

### Output Schemas
- **userResponseSchema**: Standard user response format
- **userWithPasswordResponseSchema**: User response with password (for testing)
- **registerResponseSchema**: Registration success response
- **loginResponseSchema**: Login success response

## Validation Middleware

The validation middleware automatically:
1. Validates request data against schemas
2. Replaces request data with validated/transformed data
3. Provides detailed error messages on validation failure
4. Passes validation errors to error handler

### Usage Examples

```typescript
// Body validation
userRouter.post("/register", validateBody(registerUserSchema), registerUser);

// Parameter validation
userRouter.get("/:id", validateParams(getUserByIdSchema), getUserById);

// Query validation (for future use)
userRouter.get("/", validateQuery(searchUserSchema), searchUsers);
```

## Error Handling

Validation errors include:
- **Field-specific messages**: Which field failed and why
- **Multiple error reporting**: All validation errors in one response
- **Structured error details**: Machine-readable error information

Example error response:
```json
{
  "error": "Validation failed: password: Password must be at least 8 characters long",
  "details": {
    "validationErrors": [
      {
        "field": "password",
        "message": "Password must be at least 8 characters long"
      }
    ]
  }
}
```

## Type Safety

The system provides full TypeScript integration:
- Input types are automatically inferred from schemas
- Controllers receive properly typed request data
- Response types ensure consistent API output
- Compile-time validation of schema usage

## Password Security

The password validation enforces:
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- Regex pattern: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)`

## Testing

Run schema validation tests:
```bash
npx tsx src/tests/schema-validation.test.ts
```

The tests verify:
- Valid data passes validation
- Invalid data fails with appropriate messages
- Edge cases are handled correctly
- All schemas work as expected

## Benefits

1. **Clean Architecture**: Validation logic is centralized and reusable
2. **Type Safety**: Full TypeScript support with inferred types
3. **Better UX**: Detailed, field-specific error messages
4. **Maintainability**: Single source of truth for validation rules
5. **Security**: Input sanitization and validation at the boundary
6. **Consistency**: Standardized error handling across all endpoints

## Future Enhancements

- Add rate limiting validation
- Implement custom validation rules
- Add schema versioning for API evolution
- Create schema-based API documentation
- Add request/response logging with schema validation
