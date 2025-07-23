# API Documentation

This API provides Swagger/OpenAPI documentation for the authentication endpoints.

## Accessing the Documentation

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

## Available Endpoints

### Authentication

#### POST /users/register
- **Description**: Register a new user account
- **Request Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123"
  }
  ```
- **Responses**:
  - `201`: User successfully registered
  - `400`: Validation error (invalid email format, weak password)
  - `409`: User with this email already exists

#### POST /users/login  
- **Description**: Authenticate user and receive JWT token
- **Request Body**:
  ```json
  {
    "email": "user@example.com", 
    "password": "StrongPassword123"
  }
  ```
- **Responses**:
  - `200`: User successfully authenticated (returns user data + JWT token)
  - `400`: Validation error
  - `401`: Invalid credentials

## Password Requirements

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter  
- At least one number

## JWT Token Usage

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Development

To start the development server and access the documentation:

```bash
pnpm dev
```

Then visit `http://localhost:3000/api-docs` to view the interactive Swagger UI.
