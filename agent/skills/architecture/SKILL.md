# **`architecture/SKILL.md`**

name: brew-buzz-architecture  
description: Defines the technical architecture, system boundaries, communication patterns, and architectural rules for the Brew Buzz platform. Use this skill when creating, modifying, or reviewing application structure, services, APIs, agents, data flow, or infrastructure.  
\---

\# Brew Buzz — Architecture Skill

\#\# 1\. Purpose

This skill defines the technical architecture of the Brew Buzz Agentic AI Franchise Operations Intelligence Platform.

The architecture must support:

\- Multiple franchise outlets  
\- Centralized operational data  
\- Data analytics  
\- Specialized AI agents  
\- REST APIs  
\- Interactive dashboards  
\- Future multi-agent orchestration  
\- Local development with Docker  
\- Collaborative development through GitHub  
\- Progressive expansion across milestones

The architecture must remain modular so that later milestones can be added without rewriting the foundation.

\---

\# 2\. High-Level Architecture

The preferred architecture is:

Frontend  
↓  
Backend API  
↓  
Application Services  
↓  
Analytics / Agent Services  
↓  
Database

Conceptually:

\`\`\`text  
┌─────────────────────────────────────────────────────────┐  
│                     BREW BUZZ                           │  
│                                                         │  
│  ┌───────────────────────────────────────────────────┐  │  
│  │                  React Frontend                   │  │  
│  │                                                   │  │  
│  │ Dashboard │ Outlet Views │ Charts │ Insights      │  │  
│  └──────────────────────┬────────────────────────────┘  │  
│                         │ HTTP/JSON                     │  
│                         ▼                               │  
│  ┌───────────────────────────────────────────────────┐  │  
│  │                  FastAPI Backend                  │  │  
│  │                                                   │  │  
│  │ Routes │ Validation │ Authentication │ API Logic  │  │  
│  └──────────────────────┬────────────────────────────┘  │  
│                         │                               │  
│                         ▼                               │  
│  ┌───────────────────────────────────────────────────┐  │  
│  │               Application Services                │  │  
│  │                                                   │  │  
│  │ Outlet │ Analytics │ Performance │ Reporting      │  │  
│  └───────────────┬──────────────────┬────────────────┘  │  
│                  │                  │                   │  
│                  ▼                  ▼                   │  
│        ┌─────────────────┐   ┌─────────────────────┐   │  
│        │ Data Analytics  │   │   Agent Layer       │   │  
│        │                 │   │                     │   │  
│        │ Pandas/NumPy    │   │ Performance Agent   │   │  
│        │ Metrics/Models  │   │ Inventory Agent     │   │  
│        └────────┬────────┘   │ Staff Agent         │   │  
│                 │            │ Marketing Agent     │   │  
│                 │            │ Audit Agent         │   │  
│                 │            └──────────┬──────────┘   │  
│                 │                       │              │  
│                 └───────────┬───────────┘              │  
│                             ▼                          │  
│                    ┌─────────────────┐                 │  
│                    │   PostgreSQL    │                 │  
│                    │                 │                 │  
│                    │ Franchise Data  │                 │  
│                    │ Outlet Data     │                 │  
│                    │ Sales Data      │                 │  
│                    │ Inventory Data  │                 │  
│                    │ Staff Data      │                 │  
│                    │ Marketing Data  │                 │  
│                    │ Audit Data      │                 │  
│                    └─────────────────┘                 │  
└─────────────────────────────────────────────────────────┘

This is the conceptual architecture.

The exact implementation structure must remain consistent with this separation of responsibilities.

---

# **3\. Architectural Layers**

Brew Buzz should be organized into distinct layers.

## **Layer 1 — Presentation**

Technology:

* React  
* Tailwind CSS  
* Recharts

Responsibilities:

* Display data  
* Display dashboards  
* Collect user input  
* Call backend APIs  
* Display agent insights  
* Display recommendations  
* Display alerts

The frontend must NOT directly access PostgreSQL.

The frontend must NOT contain database credentials.

The frontend must NOT implement core business calculations that belong to the backend.

---

# **4\. Backend API Layer**

Technology:

* Python  
* FastAPI

Responsibilities:

* Expose HTTP APIs  
* Validate requests  
* Validate responses  
* Handle authentication when implemented  
* Call application services  
* Return structured responses  
* Handle API-level errors

API routes should remain thin.

Do not place complex business logic directly inside route functions.

Bad:

@app.get("/outlets/{outlet\_id}")  
def get\_outlet(outlet\_id: int):  
    \# dozens of lines of business logic  
    ...

Preferred:

API Route  
    ↓  
Service  
    ↓  
Repository / Data Access  
    ↓  
Database  
---

# **5\. Application Service Layer**

Application services contain business operations.

Examples:

OutletService  
PerformanceService  
SalesService  
BenchmarkService  
ReportingService

Responsibilities include:

* Coordinating application operations  
* Calling repositories  
* Calling analytics functions  
* Preparing structured results  
* Coordinating agent tools where appropriate

Services should not depend on React.

---

# **6\. Data Access Layer**

Use:

* SQLAlchemy  
* PostgreSQL

The data access layer is responsible for:

* Database queries  
* CRUD operations  
* Transactions  
* Database model interaction

Keep database access centralized.

Do not scatter raw SQL queries throughout the application.

---

# **7\. Database**

PostgreSQL is the primary relational database.

The database should store structured franchise information.

The initial domain includes concepts such as:

Franchise  
Outlet  
Product  
Order  
Order Item  
Sales

Later milestones may introduce:

Inventory  
Inventory Transactions  
Staff  
Attendance  
Marketing Campaign  
Campaign Metrics  
Audit  
Alerts  
Agent Findings  
Recommendations

The exact schema belongs in the database skill.

Do not invent database tables during unrelated feature implementation.

---

# **8\. Analytics Layer**

The analytics layer is responsible for deterministic analysis.

Technologies may include:

* Pandas  
* NumPy  
* Scikit-learn  
* Statistical libraries  
* Forecasting libraries where appropriate

Examples:

Revenue calculation  
Growth calculation  
Order metrics  
AOV  
Outlet ranking  
Benchmarking  
Trend analysis  
Anomaly detection  
Performance scoring

The analytics layer should return structured results.

Example:

{  
  "outlet\_id": 12,  
  "revenue": 1250000,  
  "growth\_rate": 8.4,  
  "order\_count": 4210,  
  "average\_order\_value": 297.15,  
  "performance\_score": 87  
}

The analytics layer should NOT generate the final natural-language response.

---

# **9\. Agent Layer**

The agent layer provides reasoning and decision-support capabilities.

The architecture should support specialized agents.

Example:

Agent  
 ├── Tools  
 ├── Instructions  
 ├── State  
 ├── Reasoning  
 └── Structured Output

For Milestone 1:

Outlet Performance Agent

Later:

Inventory Agent  
Staff Agent  
Marketing Agent  
Audit Agent  
---

# **10\. Agent Boundary**

Agents should not directly manipulate arbitrary database state.

Preferred:

Agent  
  ↓  
Defined Tool  
  ↓  
Application Service  
  ↓  
Database

For example:

Performance Agent  
       ↓  
get\_outlet\_performance()  
       ↓  
PerformanceService  
       ↓  
PostgreSQL

This makes agent behavior controlled, testable, and auditable.

---

# **11\. Agent and Analytics Separation**

This separation is important.

Analytics:

Raw Data  
   ↓  
Calculation  
   ↓  
Structured Finding

Agent:

Structured Findings  
   ↓  
Reasoning  
   ↓  
Explanation  
   ↓  
Recommendation

Do not make the LLM responsible for basic numerical calculations that can be performed deterministically.

---

# **12\. LLM Boundary**

The LLM should receive relevant structured information rather than unrestricted database access.

Example:

Database  
   ↓  
Analytics Service  
   ↓  
Structured Metrics  
   ↓  
Agent  
   ↓  
LLM

Not:

LLM  
 ↓  
Entire Database

The LLM should only receive the information necessary for the current task.

---

# **13\. Structured Agent Outputs**

Agent outputs should preferably use structured schemas.

Example:

{  
  "agent": "outlet\_performance",  
  "outlet\_id": 12,  
  "severity": "medium",  
  "finding": "Revenue declined significantly.",  
  "evidence": {  
    "revenue\_change\_percent": \-11.8  
  },  
  "recommendation": "Investigate recent sales and campaign performance."  
}

Structured outputs make agent results easier to:

* Test  
* Store  
* Display  
* Pass to other agents  
* Audit  
* Process programmatically

---

# **14\. API Communication**

Frontend ↔ Backend communication should use HTTP/JSON APIs.

Example:

GET /api/outlets  
GET /api/outlets/{outlet\_id}  
GET /api/outlets/{outlet\_id}/performance  
GET /api/performance/summary  
GET /api/performance/benchmarks  
POST /api/agents/outlet-performance/analyze

These are examples of API responsibilities, not a command to create every endpoint immediately.

Only implement endpoints required by the current feature.

---

# **15\. Milestone 1 Architecture**

Milestone 1 should be intentionally simpler than the final architecture.

Preferred flow:

                   React Dashboard  
                          │  
                          ▼  
                    FastAPI API  
                          │  
                          ▼  
                 Performance Service  
                    │           │  
                    ▼           ▼  
              Analytics      Agent  
                    │           │  
                    └─────┬─────┘  
                          ▼  
                     PostgreSQL

More specifically:

Sales Data  
    ↓  
PostgreSQL  
    ↓  
Performance Service  
    ↓  
Analytics Engine  
    ├── Revenue  
    ├── Growth  
    ├── Orders  
    ├── AOV  
    ├── Benchmarking  
    └── Performance Score  
    ↓  
Outlet Performance Agent  
    ├── Findings  
    ├── Explanation  
    └── Recommendations  
    ↓  
FastAPI  
    ↓  
React Dashboard  
---

# **16\. Milestone 1 Data Flow**

The system should support a flow similar to:

1\. Sales data exists in PostgreSQL.

2\. Backend retrieves the required sales/outlet data.

3\. Analytics services calculate deterministic metrics.

4\. Benchmarking compares outlets.

5\. Performance scoring produces an outlet score.

6\. The Outlet Performance Agent receives structured findings.

7\. The agent generates an explanation/recommendation.

8\. FastAPI exposes the result.

9\. React displays the result.  
---

# **17\. Dependency Direction**

Prefer this dependency direction:

Frontend  
   ↓  
API  
   ↓  
Services  
   ↓  
Analytics / Repositories  
   ↓  
Database

Agents may use services/tools:

Agent  
   ↓  
Tools  
   ↓  
Services

Avoid circular dependencies.

For example:

Service → Agent → Service → Agent

should not become an uncontrolled dependency cycle.

---

# **18\. Folder Structure**

The project should evolve toward a structure similar to:

brew-buzz/  
│  
├── frontend/  
│  
├── backend/  
│   ├── app/  
│   │   ├── api/  
│   │   ├── core/  
│   │   ├── models/  
│   │   ├── schemas/  
│   │   ├── repositories/  
│   │   ├── services/  
│   │   ├── analytics/  
│   │   ├── agents/  
│   │   └── main.py  
│   │  
│   └── tests/  
│  
├── database/  
│   ├── migrations/  
│   └── seed/  
│  
├── agents/  
│  
├── ml/  
│  
├── docker-compose.yml  
├── .env.example  
├── .gitignore  
└── README.md

This is a target architectural structure.

Do not create every directory merely because it appears here.

Create directories when their functionality is actually introduced.

---

# **19\. Docker Architecture**

Docker Compose should eventually manage local infrastructure.

Conceptually:

Docker Compose  
│  
├── frontend  
│  
├── backend  
│  
└── postgres

Additional services should only be introduced when actually required.

Do not add unnecessary containers.

---

# **20\. Environment Configuration**

Configuration should be environment-driven.

Examples:

DATABASE\_URL  
LLM\_API\_KEY  
JWT\_SECRET

Never hardcode these values.

Use:

.env

locally.

Commit:

.env.example

Do not commit:

.env  
---

# **21\. Error Handling**

Each layer should handle errors appropriately.

Example:

Database error  
      ↓  
Repository  
      ↓  
Service  
      ↓  
API error response  
      ↓  
Frontend error state

Agent errors should also be handled explicitly.

An agent failure should not silently become a fabricated business recommendation.

---

# **22\. Observability and Logging**

The system should eventually provide useful logging for:

* API requests  
* Application errors  
* Agent execution  
* Tool execution  
* Important business operations

Do not log:

* API keys  
* Passwords  
* Tokens  
* Sensitive credentials

---

# **23\. Testing Architecture**

Tests should exist at appropriate layers.

Examples:

Unit Tests  
    ↓  
Analytics calculations  
Scoring  
Benchmarking

API Tests  
    ↓  
FastAPI endpoints

Integration Tests  
    ↓  
API \+ Database

Agent Tests  
    ↓  
Tools  
Structured outputs  
Agent behavior

Frontend Tests  
    ↓  
Important UI behavior

The level of testing should grow with the feature.

---

# **24\. Extensibility**

The architecture must allow later agents to be added without rewriting the core system.

For example:

agents/  
├── outlet\_performance/  
├── inventory/  
├── staff/  
├── marketing/  
└── audit/

Each agent should have clear boundaries.

The later Franchise Intelligence Engine should consume structured findings rather than directly depending on implementation details of every agent.

---

# **25\. Avoid Premature Microservices**

Brew Buzz should initially use a modular application architecture rather than splitting every component into separate network services.

Do NOT create:

Performance Microservice  
Inventory Microservice  
Staff Microservice  
Marketing Microservice  
Audit Microservice

unless there is a demonstrated technical requirement.

Start with a modular backend.

This reduces unnecessary complexity during development.

---

# **26\. Avoid Architecture Drift**

When implementing a feature:

1. Inspect existing architecture.  
2. Read the relevant skill.  
3. Reuse existing patterns.  
4. Add only necessary components.  
5. Do not replace the technology stack without justification.  
6. Do not introduce competing architectural patterns.

Consistency is more important than constantly changing to a newer pattern.

---

# **27\. Implementation Rule**

Before writing code, determine:

What layer does this feature belong to?  
What existing service should it use?  
What data does it require?  
What API should expose it?  
Does it require an agent?  
How will it be tested?

Then implement the smallest architecture that satisfies the requirement.

---

# **28\. Current Priority**

The current implementation priority is:

## **Milestone 1**

Build:

PostgreSQL  
    ↓  
Sales / Outlet Data  
    ↓  
Analytics  
    ↓  
Benchmarking  
    ↓  
Performance Scoring  
    ↓  
Outlet Performance Agent  
    ↓  
FastAPI  
    ↓  
React Dashboard

Do not implement the complete multi-agent architecture prematurely.

The architecture should be extensible, but implementation should remain milestone-driven.

---

# **29\. Architectural Golden Rule**

Keep responsibilities clear:

PostgreSQL  
→ stores data

Repositories  
→ retrieve/store data

Services  
→ execute business operations

Analytics  
→ calculate and analyze

Agents  
→ reason, explain, and recommend

FastAPI  
→ expose capabilities

React  
→ present information and collect user interaction

Docker  
→ provide reproducible development infrastructure

Do not mix these responsibilities unnecessarily.