# Phase 3 – Microservices Architecture

### 🎯 **Goal**

Break down the structured monolith into a **set of independent, deployable microservices**, each owning its own domain, data, and lifecycle.

Introduce **API contracts**, **service communication patterns**, and **DevOps workflows** to support this distributed architecture.

---

## 📦 Updated Project Scenario: *Commerce Hub*

Your company now wants to onboard more developers and handle **larger traffic and feature growth**. To scale development and deployment independently, the backend will transition into a **microservices architecture**.

---

### 🧭 Microservices Breakdown

| Domain              | Responsibilities                                                      | Tech Stack           |
| ------------------- | --------------------------------------------------------------------- | -------------------- |
| **Auth Service**    | Registration, login, JWT issuance, role management                    | Node.js + TypeScript |
| **User Service**    | User profiles, addresses, preferences                                 | Node.js + PostgreSQL |
| **Product Service** | Product management, categories, stock tracking                        | Node.js + PostgreSQL |
| **Cart Service**    | Session carts, cart persistence, cart APIs                            | Node.js + Redis      |
| **Order Service**   | Checkout processing, order creation, stock verification (via Product) | Node.js + PostgreSQL |
| **Gateway / API**   | Public-facing API aggregating internal services                       | Express + OpenAPI    |

---

### 🔄 Business Evolution

The business now needs:

- Support for millions of users
- Feature teams to work on isolated domains
- Separate deployment cycles per domain
- Increased reliability (no monolith downtime)

---

### 🧰 Key Changes & Tools

| Area                        | Tool / Approach                                    |
| --------------------------- | -------------------------------------------------- |
| Inter-Service Communication | **REST** for now (synchronous)                     |
| Service Discovery           | Hardcoded for now (later: Consul/NATS)             |
| Message Format              | JSON + OpenAPI Spec                                |
| Configuration               | `.env` + Docker per service                        |
| Auth Flow                   | Gateway checks JWT, forwards user info to services |
| CI/CD                       | Docker Compose (multi-service dev)                 |
| Documentation               | Swagger / OpenAPI per service                      |

---

### 🧪 Evaluation Strategy

### ✅ Each Service Must:

- Be fully independent: own its DB, models, and logic
- Be dockerized for local dev (`Dockerfile`, `docker-compose`)
- Expose an OpenAPI spec for documentation and testing
- Validate inputs, return consistent HTTP codes
- Use **controller/service/repository** layering

### 📋 Gateway Responsibilities:

- Route incoming requests to the right service
- Validate JWT and inject user context
- Provide a unified external interface

---

### 🔍 Functional Expectations

| Flow            | Services Involved         | Must Work As...                              |
| --------------- | ------------------------- | -------------------------------------------- |
| Register/Login  | Gateway → Auth            | Token issued, used across services           |
| View Profile    | Gateway → User            | Uses JWT to pull data securely               |
| Browse Products | Gateway → Product         | Products retrieved with category, pagination |
| Add to Cart     | Gateway → Cart            | Cart stored per user in Redis                |
| Checkout        | Gateway → Order → Product | Stock validated, order saved, cart cleared   |

---

### 🚨 Phase 3 Challenges You Must Address

1. **Service Contracts**
    - Use OpenAPI specs for stable interfaces between services
    - Maintain backward compatibility for gateway ↔ service
2. **Authentication Propagation**
    - Services trust JWT forwarded from gateway
    - Role-based access handled by gateway and individual services
3. **Error Handling Across Services**
    - Unified format: `{ code, message, details }`
    - Gateway wraps and forwards service errors cleanly
4. **Local Dev Environment**
    - `docker-compose` that spins up all services + PostgreSQL + Redis
    - Services watch source code for live reloads (`nodemon`, etc.)

---

### 🧪 Phase 3 Evaluation Checklist

### ✅ System Behaviors

- [ ]  Auth, Product, Cart, Order all function independently
- [ ]  Gateway successfully routes and handles JWTs
- [ ]  Carts persist per user using Redis
- [ ]  Products decrement stock on order
- [ ]  Services log clearly and fail gracefully

### 🧪 Testing Targets

- [ ]  End-to-end flow through Gateway (register → order)
- [ ]  One service (e.g., Cart or Product) covered by **BDD**
- [ ]  Unit tests per service with Jest or similar

---

### 🚀 Transition Readiness to Phase 4 (Event-Driven)

✅ You’re ready to move forward when:

- You **feel the pain of synchronous coupling**
- Services begin to depend too much on direct API calls
- You want to **decouple flows** (e.g., send email after checkout without blocking it)