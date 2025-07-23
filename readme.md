# Phase 2 – Structured Monolith (Scalable Foundations)

### 🎯 **Goal**

Refactor the MVP monolith into a **clean, scalable, production-grade monolith** with real persistence, structured layers, testing, and early architectural decisions that will support future transformations.

---

## 📦 Updated Project Scenario: *Mini Commerce Pro*

Following initial success, the platform now needs to:

- Handle **real users and products**
- Prepare for **multiple teams to work concurrently**
- Be **testable, maintainable, and extendable**

The stakeholders want better data integrity, stability, and readiness for scaling in the coming months.

---

### 🔧 New Business Requirements

### 🧑‍💼 User Enhancements

- Store users persistently (DB)
- Add user roles: `customer`, `admin`
- Passwords must be hashed
- Improve auth with **JWT** and middleware to guard routes

### 🛍 Product Catalog Enhancements

- Store products in a real database
- Add product categories and `isActive` flag
- Add pagination to product listing

### 🛒 Cart & Checkout

- Persist carts to allow cross-session cart saving
- Calculate total with basic tax (static %)
- Validate stock availability on checkout

---

### 📐 Architectural Evolution

### 🔄 Clean/Layered Structure

```
arduino
CopyEdit
src/
  ├── controllers/
  ├── services/
  ├── repositories/
  ├── models/ (DB models)
  ├── middlewares/
  ├── config/
  └── utils/

```

### 🗃 Persistence

- Use **PostgreSQL** (or SQLite if you want local simplicity)
- Use **Prisma** (recommended) or **TypeORM**

### 🔐 Auth & Roles

- Implement role-based middleware guards
- Add helper to extract and verify user info from JWT

### 🧪 Testing Stack

- Use **Jest** for unit & integration tests
- Add **TDD** for at least 1 feature (e.g., checkout)
- Use **Supertest** for testing HTTP routes

### 📦 Docker Dev Environment (Optional)

- Dockerfile + docker-compose for API + DB
- `.env` config management

---

### 🧰 Tooling Suggestions

| Purpose | Tool |
| --- | --- |
| Database | PostgreSQL / SQLite |
| ORM | Prisma or TypeORM |
| Auth | jsonwebtoken, bcrypt |
| Testing | Jest, Supertest, Cucumber (optional) |
| API Docs | Swagger (OpenAPI spec) |
| Dev Environment | Docker / Docker Compose |

---

### ✅ Evaluation & Validation

### 📋 Acceptance Criteria

- [ ]  Users can register/login with role-based access
- [ ]  All data (users, products, carts) persists in DB
- [ ]  Product listing supports filtering & pagination
- [ ]  Cart survives across sessions
- [ ]  Checkout verifies stock, calculates total with tax

### 🧪 Testing Expectations

- [ ]  All critical features are covered by tests
- [ ]  Checkout developed using **TDD**
- [ ]  All endpoints return consistent status codes
- [ ]  Error handling is unified (error middleware)

### 🔍 Code Structure Expectations

| Area | Validation Criteria |
| --- | --- |
| Modularity | Clear separation between layers (controllers, services, repositories) |
| Reusability | Helpers, middlewares, error handling are extracted to reusable utilities |
| Type Safety | Models, DTOs, responses all typed with TypeScript |
| Config | No secrets or constants hardcoded; use `.env` + `config/` pattern |
| Extensibility | Easy to add more product types, user roles, payment types, etc. |

---

### 🔄 Phase Transition Conditions

✅ You're ready for **Phase 3 – Microservices** when:

- The monolith handles all functional requirements and edge cases cleanly
- You feel confident extending and testing new features
- Teams are starting to complain about **shared codebase conflicts** and **deployment bottlenecks**