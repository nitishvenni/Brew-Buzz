

name: brew-buzz-backend

description: Defines backend development standards for Brew Buzz using Python, FastAPI, SQLAlchemy, Pydantic, repositories, services, analytics, and agent integrations. Use this skill whenever implementing, modifying, testing, or reviewing backend functionality.

\---

\# Brew Buzz — Backend Development Skill

\#\# 1\. Purpose

The Brew Buzz backend is responsible for providing reliable APIs and coordinating:

\- Database access

\- Business logic

\- Analytics

\- Performance calculations

\- Agent tools

\- Agent execution

\- Authentication when introduced

\- Reporting

\- Notifications when introduced

The backend must provide a clean boundary between the React frontend and the underlying business/data systems.

\---

\# 2\. Backend Technology

Primary technologies:

\- Python

\- FastAPI

\- SQLAlchemy

\- Pydantic

\- PostgreSQL

\- Alembic

Potential supporting technologies:

\- Pandas

\- NumPy

\- Scikit-learn

\- LangGraph

\- LLM provider SDK

Do not introduce alternative frameworks without a clear reason.

\---

\# 3\. Backend Responsibility

The backend should handle:

\`\`\`text

Frontend Request

      ↓

API Validation

      ↓

Application Service

      ↓

Business Logic

      ↓

Database / Analytics / Agent

      ↓

Structured Response

      ↓

Frontend

The backend should NOT become a dumping ground for unrelated logic.

---

# **4\. Recommended Backend Structure**

The backend should evolve toward:

backend/

│

├── app/

│   ├── api/

│   │   ├── routes/

│   │   └── dependencies.py

│   │

│   ├── core/

│   │   ├── config.py

│   │   ├── database.py

│   │   └── logging.py

│   │

│   ├── models/

│   │

│   ├── schemas/

│   │

│   ├── repositories/

│   │

│   ├── services/

│   │

│   ├── analytics/

│   │

│   ├── agents/

│   │

│   └── main.py

│

└── tests/

Do not create every directory immediately.

Create modules as functionality is introduced.

---

# **5\. `main.py`**

`main.py` should primarily:

* Create/configure the FastAPI application  
* Register routers  
* Configure application-level middleware where required  
* Configure startup/shutdown behavior when required

Do not place major business logic inside `main.py`.

Avoid turning `main.py` into a large application file.

---

# **6\. API Routes**

API route handlers should remain thin.

Preferred:

Route

 ↓

Service

 ↓

Repository / Analytics / Agent

Example:

@router.get("/outlets/{outlet\_id}/performance")

def get\_outlet\_performance(...):

    return performance\_service.get\_outlet\_performance(...)

The route should not contain:

* Complex SQL  
* Large Pandas operations  
* Performance scoring formulas  
* LLM prompts  
* Complex agent orchestration

Those belong in appropriate layers.

---

# **7\. API Versioning**

Use a consistent API prefix.

Preferred pattern:

/api/v1/

Example:

/api/v1/outlets

/api/v1/outlets/{outlet\_id}

/api/v1/performance/summary

Do not mix versioning styles across endpoints.

If the initial implementation intentionally starts without versioning, establish the convention before expanding the API.

---

# **8\. Router Organization**

Organize routes by domain.

For example:

routes/

├── outlets.py

├── performance.py

├── sales.py

└── agents.py

Later:

routes/

├── inventory.py

├── staff.py

├── marketing.py

└── audit.py

Avoid one enormous `routes.py` file.

---

# **9\. Pydantic Schemas**

Use Pydantic schemas for API contracts.

Separate:

Request schemas

Response schemas

Example:

schemas/

├── outlet.py

├── performance.py

├── sales.py

└── agent.py

Do not expose SQLAlchemy ORM objects as the application's complete API contract.

---

# **10\. Schema Responsibility**

Pydantic schemas should handle:

* Input validation  
* Output validation  
* Serialization  
* API contracts

They should not become the primary location for complex business calculations.

Example:

Pydantic

→ validates performance request

PerformanceService

→ calculates/retrieves performance

PerformanceResponse

→ structures the API result

---

# **11\. SQLAlchemy Models**

SQLAlchemy models represent persistence.

Example:

models/

├── franchise.py

├── outlet.py

├── product.py

├── order.py

└── order\_item.py

Models should define:

* Columns  
* Relationships  
* Constraints  
* Database-specific configuration

Avoid placing large business workflows inside ORM models.

---

# **12\. Database Sessions**

Use dependency-based session management with FastAPI.

Conceptually:

Request

  ↓

Database Session

  ↓

Repository / Service

  ↓

Commit / Rollback

  ↓

Session Close

Sessions must be properly managed.

Never use an unmanaged global SQLAlchemy session for request handling.

---

# **13\. Repository Layer**

Repositories provide database access.

Examples:

OutletRepository

OrderRepository

ProductRepository

Responsibilities:

* Query database  
* Filter data  
* Fetch relationships  
* Persist records  
* Handle data-access concerns

Repositories should not:

* Call LLMs  
* Generate UI responses  
* Contain React-specific logic

---

# **14\. Service Layer**

Services contain application/business operations.

Examples:

OutletService

SalesService

PerformanceService

BenchmarkService

Services may coordinate:

* Repositories  
* Analytics  
* Validation  
* Agent tools

Example:

PerformanceService

   ↓

OrderRepository

   ↓

PostgreSQL

or:

PerformanceService

   ↓

PerformanceAnalytics

   ↓

Performance Metrics

---

# **15\. Dependency Injection**

Use FastAPI dependency injection for shared dependencies such as:

* Database sessions  
* Authentication  
* Current user  
* Services where appropriate

Avoid manually constructing dependencies repeatedly inside route handlers.

Keep dependency injection understandable.

Do not build an unnecessarily complicated dependency container.

---

# **16\. Configuration**

Centralize configuration.

Use environment variables.

Example:

DATABASE\_URL

LLM\_API\_KEY

JWT\_SECRET

ENVIRONMENT

A configuration module should expose validated application settings.

Do not access `os.environ` randomly throughout the codebase.

Prefer one consistent configuration mechanism.

---

# **17\. Secrets**

Never hardcode:

* API keys  
* Passwords  
* JWT secrets  
* Cloud credentials

Bad:

LLM\_API\_KEY \= "actual-secret-key"

Good:

Environment

    ↓

Configuration

    ↓

Application

`.env` is local configuration.

`.env.example` documents required variables.

---

# **18\. Error Handling**

The API must return consistent errors.

Examples:

400

→ Invalid request

401

→ Authentication required

403

→ Permission denied

404

→ Resource not found

422

→ Validation error

500

→ Unexpected server error

Do not expose internal stack traces or secrets to clients.

---

# **19\. Resource Not Found**

When a requested entity does not exist, return an appropriate `404`.

Example:

GET /api/v1/outlets/999999

If the outlet does not exist:

{

  "detail": "Outlet not found"

}

Do not silently return fabricated data.

---

# **20\. Validation**

Validate inputs at the API boundary.

Examples:

* IDs  
* Dates  
* Date ranges  
* Pagination  
* Filter parameters  
* Numeric ranges

Business-level validation may additionally occur inside services.

Do not rely exclusively on frontend validation.

---

# **21\. Pagination**

Endpoints returning potentially large collections should support pagination where appropriate.

Example:

?page=1\&page\_size=20

Do not return an unbounded number of database records simply because the initial dataset is small.

For dashboard aggregation endpoints, return summarized data instead of unnecessary raw transactions.

---

# **22\. Filtering**

Use explicit query parameters.

Example:

GET /api/v1/outlets?city=Bengaluru

or:

GET /api/v1/performance/summary?start\_date=...\&end\_date=...

Do not encode complex filter logic into arbitrary URL strings.

---

# **23\. Date Handling**

Performance APIs will frequently operate on date ranges.

Use a consistent date/time representation.

The backend must clearly distinguish:

* Date  
* Datetime  
* Timezone

Do not silently mix timezone-aware and timezone-naive values.

The chosen timezone policy must be consistent across:

* PostgreSQL  
* SQLAlchemy  
* FastAPI  
* Analytics  
* Frontend

---

# **24\. API Response Design**

Responses should be predictable and structured.

Example:

{

  "outlet\_id": 12,

  "outlet\_name": "Brew Buzz Koramangala",

  "metrics": {

    "revenue": 1250000,

    "order\_count": 4210,

    "average\_order\_value": 297.15,

    "growth\_rate": 8.4

  },

  "performance\_score": 87

}

Avoid inconsistent response structures between similar endpoints.

---

# **25\. Backend and Analytics Separation**

The backend coordinates analytics.

Analytics performs calculations.

For example:

PerformanceService

       ↓

PerformanceAnalytics

       ↓

Metrics

Do not place large analytical calculations directly inside FastAPI route functions.

---

# **26\. Backend and Agent Separation**

Agents should be integrated through controlled services/tools.

Preferred:

API

 ↓

Agent Service

 ↓

Outlet Performance Agent

 ↓

Defined Tools

 ↓

Performance Service

 ↓

Database / Analytics

Do not let route handlers contain full agent logic.

---

# **27\. Agent API Endpoints**

When agent endpoints are introduced, they should expose clear operations.

Example:

POST /api/v1/agents/outlet-performance/analyze

Possible request:

{

  "outlet\_id": 12,

  "start\_date": "2026-01-01",

  "end\_date": "2026-01-31"

}

The agent endpoint should return structured results.

Example:

{

  "outlet\_id": 12,

  "severity": "medium",

  "findings": \[\],

  "recommendations": \[\]

}

The exact contract must be defined in the agent skill before implementation.

---

# **28\. LLM Calls**

LLM calls must not be scattered randomly throughout the backend.

Centralize LLM configuration and use a defined agent layer.

Preferred:

Agent

 ↓

LLM Client

 ↓

Provider

Do not call the LLM directly from:

* React  
* Database repositories  
* SQLAlchemy models  
* Random API routes

---

# **29\. LLM Failure Handling**

LLM calls can fail.

Possible failures:

* Timeout  
* Rate limit  
* Invalid response  
* Provider error  
* Network error  
* Malformed structured output

The application must handle these failures explicitly.

Never fabricate an AI response when the LLM failed.

If deterministic analytics are available, the system may still return those results while clearly indicating that the AI explanation/recommendation was unavailable.

---

# **30\. Structured Agent Output**

Agent responses should preferably use validated structured schemas.

Example:

class AgentFinding(BaseModel):

    severity: str

    finding: str

    recommendation: str

Avoid relying on arbitrary free-form text when the result needs to be consumed by the application.

---

# **31\. Business Numbers**

The backend must treat calculated business metrics as authoritative only when they originate from deterministic calculations/data.

Examples:

Revenue

Order Count

Growth

AOV

Rank

Performance Score

Do not allow an LLM to overwrite these values.

---

# **32\. Performance Scoring**

Performance scoring belongs in the analytics/business logic layer.

Example:

PerformanceService

       ↓

PerformanceScoring

       ↓

Score

The score formula must be explicitly defined by the Outlet Performance skill.

Do not invent arbitrary weights while implementing an API.

---

# **33\. API Naming**

Use predictable REST-oriented naming.

Preferred:

/outlets

/outlets/{id}

/products

/orders

/performance/summary

/performance/benchmarks

Avoid inconsistent naming such as:

/getOutlet

/fetchOutletData

/get\_performance

Use one naming convention.

---

# **34\. HTTP Methods**

Use HTTP methods according to operation.

GET

→ Retrieve

POST

→ Create or execute an operation

PUT/PATCH

→ Update

DELETE

→ Delete/deactivate

Agent analysis operations may appropriately use `POST` when the operation represents an execution rather than simple retrieval.

---

# **35\. CORS**

During local development, configure CORS so the React frontend can communicate with FastAPI.

Do not allow unrestricted origins in production configuration.

Use environment-specific configuration where appropriate.

---

# **36\. Logging**

Backend logging should help diagnose:

* API failures  
* Database errors  
* Agent execution  
* LLM failures  
* Important application events

Never log:

* API keys  
* Passwords  
* Authentication tokens  
* Secrets

Avoid logging entire sensitive request payloads.

---

# **37\. Health Endpoint**

The backend should eventually provide a basic health endpoint.

Example:

GET /health

Possible response:

{

  "status": "ok"

}

If infrastructure health checks are introduced, distinguish application health from dependency health.

---

# **38\. Testing**

Backend tests should be organized by responsibility.

Example:

tests/

├── unit/

│   ├── analytics/

│   └── services/

│

├── integration/

│   ├── database/

│   └── api/

│

└── agents/

At minimum, important Milestone 1 logic should have automated tests.

---

# **39\. Unit Testing**

Unit tests should cover deterministic business logic.

Examples:

Revenue calculation

Growth calculation

AOV

Benchmarking

Performance scoring

Date-range handling

These tests should not require an actual LLM.

---

# **40\. API Testing**

Test:

* Valid requests  
* Invalid requests  
* Missing resources  
* Date filters  
* Response structure  
* Error responses

Example:

GET /api/v1/outlets

GET /api/v1/outlets/{id}/performance

---

# **41\. Integration Testing**

Integration tests should verify important flows such as:

API

 ↓

Service

 ↓

Repository

 ↓

PostgreSQL

Do not mock every layer in an integration test.

The purpose is to verify that the layers actually work together.

---

# **42\. Agent Testing**

Agent tests should distinguish:

### **Deterministic tool tests**

Test that tools return correct data.

### **Agent behavior tests**

Test that the agent:

* Uses the correct tools  
* Produces structured output  
* Does not invent unsupported metrics  
* Handles missing data  
* Produces grounded recommendations

Do not require every agent test to depend on a live paid LLM API.

Use mocks/stubs where appropriate.

---

# **43\. Async vs Sync**

Choose async or synchronous database/API patterns deliberately.

Do not mix patterns randomly.

If asynchronous FastAPI endpoints and database operations are introduced, maintain consistency throughout the relevant layer.

Do not use `async` merely because it appears modern.

Use it where it provides actual value.

---

# **44\. Performance**

Avoid:

* N+1 database queries  
* Loading huge datasets unnecessarily  
* Repeated identical queries  
* Blocking expensive operations inside request handlers when avoidable

For dashboard endpoints, prefer aggregated queries where appropriate.

---

# **45\. Long-Running Agent Operations**

If an agent operation becomes expensive or long-running, do not force a large computation into a normal synchronous request indefinitely.

Future architecture may use:

API

 ↓

Job / Task

 ↓

Agent Execution

 ↓

Result

However, do not introduce a queue/task system during Milestone 1 unless there is a real requirement.

---

# **46\. Backend Docker Development**

The backend should run consistently inside the project's Docker development environment.

The backend container should:

* Install declared dependencies  
* Read environment configuration  
* Connect to PostgreSQL  
* Run the FastAPI application

Do not rely on undocumented machine-specific setup.

---

# **47\. Dependency Management**

Keep backend dependencies explicit.

When adding a package:

1. Confirm it is actually required.  
2. Add it to the project's dependency configuration.  
3. Avoid duplicate libraries that solve the same problem.  
4. Verify compatibility.  
5. Update Docker installation if necessary.

Do not install packages globally and assume other developers have them.

---

# **48\. Milestone 1 Backend Scope**

The first backend implementation should eventually support:

Franchise

   ↓

Outlets

   ↓

Products

   ↓

Orders

   ↓

Order Items

and APIs/services for:

Outlet listing

Outlet details

Sales metrics

Performance metrics

Benchmarking

Performance scoring

Outlet Performance Agent analysis

Only implement these progressively through development prompts.

---

# **49\. Recommended Milestone 1 Flow**

The intended backend flow is:

React

 ↓

GET /api/v1/performance/summary

 ↓

Performance Route

 ↓

Performance Service

 ↓

Analytics

 ↓

Repository

 ↓

PostgreSQL

 ↓

Structured Metrics

 ↓

React

For AI analysis:

React

 ↓

POST /api/v1/agents/outlet-performance/analyze

 ↓

Agent Service

 ↓

Outlet Performance Agent

 ↓

Performance Tools

 ↓

Analytics / Database

 ↓

Structured Findings

 ↓

LLM Explanation

 ↓

Validated Agent Response

 ↓

React

---

# **50\. Backend Golden Rules**

Always follow these rules:

1. Keep API routes thin.  
2. Keep database access in repositories/data-access components.  
3. Keep business operations in services.  
4. Keep deterministic calculations in analytics/business logic.  
5. Keep AI reasoning in agents.  
6. Keep API contracts in Pydantic schemas.  
7. Keep persistence models in SQLAlchemy models.  
8. Never expose secrets.  
9. Never let the LLM become the source of truth for numerical business data.  
10. Do not implement future milestones prematurely.  
11. Test important business logic.  
12. Inspect existing code before modifying it.  
13. Reuse established project patterns.  
14. Prefer simple architecture over unnecessary abstraction.  
15. Preserve existing working functionality.

---

# **51\. Definition of Done for Backend Features**

A backend feature should not be considered complete merely because the code compiles.

Before declaring it complete:

* API endpoint works  
* Validation works  
* Database interaction works where applicable  
* Business logic is in the correct layer  
* Error cases are handled  
* Tests exist for important logic  
* No secrets are committed  
* Existing functionality still works  
* API response matches its intended schema

The implementation should be verified end-to-end where practical.

