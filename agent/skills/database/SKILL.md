## **`database/SKILL.md`**

name: brew-buzz-database

description: Defines PostgreSQL database architecture, data modelling, SQLAlchemy conventions, migrations, seed data, relationships, and data-access rules for Brew Buzz. Use this skill whenever creating, modifying, querying, seeding, or reviewing the Brew Buzz database.

\---

\# Brew Buzz — Database Skill

\#\# 1\. Purpose

Brew Buzz uses PostgreSQL as its primary relational database.

The database is the source of truth for structured franchise business data.

The database must support:

\- Multiple franchises if required in the future

\- Multiple outlets

\- Products

\- Orders

\- Sales

\- Future inventory data

\- Future workforce data

\- Future marketing data

\- Future audit data

\- Future agent findings and recommendations

The database must be designed so later milestones can extend it without requiring a complete rewrite.

\---

\# 2\. Database Technology

Primary database:

\*\*PostgreSQL\*\*

Application ORM/data-access technology:

\*\*SQLAlchemy\*\*

Database migrations:

\*\*Alembic\*\*

Do not introduce MongoDB, Firebase, SQLite, or another primary database unless explicitly approved.

SQLite may be used for isolated tests only if there is a clear reason and the behavior being tested is compatible with PostgreSQL.

\---

\# 3\. Core Database Principles

Follow these principles:

1\. PostgreSQL is the source of truth.

2\. Keep schema design relational and normalized where practical.

3\. Use foreign keys for relationships.

4\. Avoid duplicating authoritative data unnecessarily.

5\. Use appropriate database constraints.

6\. Use indexes for frequently queried fields.

7\. Use migrations for schema changes.

8\. Never manually modify production schema as a substitute for migrations.

9\. Never store secrets in database source files.

10\. Do not store calculated values unless there is a clear reason to persist them.

\---

\# 4\. Initial Domain Model

The initial Brew Buzz domain should contain the concepts required for Milestone 1\.

Core entities:

\`\`\`text

Franchise

    ↓

Outlet

    ↓

Order

    ↓

Order Item

    ↓

Product

Sales/performance information should be derivable from the transactional data.

The exact final schema should be determined before implementation of the database layer.

---

# **5\. Franchise Entity**

A franchise represents the Brew Buzz business organization.

Conceptual fields:

franchise\_id

name

description

created\_at

updated\_at

Example:

franchise\_id: 1

name: Brew Buzz

The schema should allow the system to support multiple franchise records if required by future expansion.

Do not hardcode the franchise ID throughout the application.

---

# **6\. Outlet Entity**

An outlet represents an individual Brew Buzz location.

Conceptual fields:

outlet\_id

franchise\_id

name

city

state

address

status

opened\_at

created\_at

updated\_at

An outlet belongs to a franchise.

Relationship:

Franchise 1 ──────── N Outlets

An outlet should have a stable identifier.

Do not use the outlet name as the primary key.

---

# **7\. Product Entity**

A product represents something sold by Brew Buzz.

Example categories:

Pizza

Coffee

Cold Beverage

Dessert

Snack

Combo

Conceptual fields:

product\_id

name

category

price

is\_active

created\_at

updated\_at

The product catalog should be independent from individual orders.

Do not duplicate complete product information inside every order record.

---

# **8\. Order Entity**

An order represents a customer transaction.

Conceptual fields:

order\_id

outlet\_id

order\_timestamp

order\_status

subtotal

discount

tax

total\_amount

created\_at

Relationship:

Outlet 1 ──────── N Orders

The order should identify the outlet where the transaction occurred.

The order timestamp is important because Milestone 1 requires time-based performance analysis.

---

# **9\. Order Item Entity**

An order can contain multiple products.

Conceptual fields:

order\_item\_id

order\_id

product\_id

quantity

unit\_price

line\_total

Relationships:

Order 1 ──────── N Order Items

Product 1 ──────── N Order Items

The unit price recorded on an order item should represent the price at the time of purchase.

Do not assume the current product catalog price is always the historical transaction price.

---

# **10\. Sales Data Philosophy**

Do not create a redundant sales table merely because the application needs "sales."

For Milestone 1, sales metrics can generally be derived from orders and order items.

For example:

Orders

   \+

Order Items

   ↓

Revenue

Order Count

Units Sold

Product Mix

Average Order Value

If a separate sales/fact table becomes necessary for analytics performance or a future warehouse architecture, that decision must be justified before introducing it.

Do not create duplicate sources of truth.

---

# **11\. Milestone 1 Required Data**

The database must provide enough information to calculate:

* Revenue  
* Order count  
* Sales trends  
* Revenue growth  
* Average order value  
* Outlet comparisons  
* Product/category performance where useful  
* Outlet rankings  
* Performance scores  
* Underperformance indicators

At minimum, the system needs:

Franchise

Outlet

Product

Order

Order Item

---

# **12\. Time-Based Data**

Order timestamps are essential.

The system should be able to aggregate performance by:

Day

Week

Month

The application should use database-supported date/time operations where practical.

Be consistent about timezone handling.

Do not silently mix local outlet time with UTC timestamps.

The application's timezone strategy must be explicitly defined during implementation.

---

# **13\. Revenue Calculation**

Revenue must be calculated from transactional data.

Conceptually:

Revenue

\=

Sum of valid order totals

The exact inclusion rules must respect order status.

For example, cancelled orders should not automatically contribute to revenue.

Do not calculate revenue by asking an LLM to infer it.

Use SQL/Python.

---

# **14\. Order Count**

Order count should be calculated from valid orders.

Example:

Number of completed/valid orders

The exact status values must be defined in the schema and consistently used by the application.

Do not count cancelled or invalid transactions as successful sales.

---

# **15\. Average Order Value**

Conceptually:

AOV \= Revenue / Valid Order Count

The calculation must handle zero orders safely.

Do not allow division-by-zero errors.

---

# **16\. Revenue Growth**

Revenue growth compares two equivalent time periods.

Conceptually:

Growth %

\=

(Current Period Revenue \- Previous Period Revenue)

\----------------------------------------------- × 100

Previous Period Revenue

The analytics layer, not the database model itself, should own the business calculation.

The database provides the underlying transactional data.

Edge cases such as zero previous-period revenue must be explicitly handled.

---

# **17\. Database Constraints**

Use database constraints where appropriate.

Examples:

* Primary keys  
* Foreign keys  
* NOT NULL constraints  
* Unique constraints  
* Check constraints where appropriate

Examples of business expectations:

Outlet must belong to a valid franchise.

Order must belong to a valid outlet.

Order item must belong to a valid order.

Order item must reference a valid product.

Quantity must be positive.

Prices should not be negative.

Do not rely entirely on frontend validation.

---

# **18\. Primary Keys**

Use stable primary keys.

Preferred approach:

* Integer or UUID primary keys depending on the finalized implementation strategy.

The project must choose one consistent strategy.

Do not mix arbitrary identifier strategies without a reason.

Business-readable identifiers such as outlet codes may exist separately from database primary keys.

---

# **19\. Indexing**

Indexes should support common query patterns.

Likely candidates include:

outlet\_id

franchise\_id

order\_timestamp

product\_id

order\_id

Composite indexes may be introduced when actual query patterns justify them.

Do not create indexes indiscriminately.

Every index has storage and write overhead.

---

# **20\. SQLAlchemy Model Rules**

SQLAlchemy models should:

* Represent database entities clearly  
* Define relationships explicitly  
* Use appropriate types  
* Avoid embedding complex business logic  
* Avoid API-specific response formatting

Keep ORM models separate from:

* API schemas  
* Analytics calculations  
* Agent output schemas

Conceptually:

models/

    ↓

Database representation

schemas/

    ↓

API representation

services/

    ↓

Business operations

---

# **21\. Pydantic vs SQLAlchemy**

Use SQLAlchemy models for database persistence.

Use Pydantic schemas for API input/output validation.

Do not use database ORM models directly as the complete API contract.

Conceptually:

PostgreSQL

    ↓

SQLAlchemy Model

    ↓

Service

    ↓

Pydantic Response Schema

    ↓

FastAPI

---

# **22\. Repository Layer**

Database access should preferably be isolated through repository/data-access components.

Example:

OutletRepository

OrderRepository

ProductRepository

Repositories should handle:

* Queries  
* Persistence  
* Filtering  
* Relationships  
* Transactions where appropriate

Repositories should not generate LLM responses.

Repositories should not contain UI logic.

---

# **23\. Service Layer**

Business operations belong in services.

Example:

OutletService

SalesService

PerformanceService

BenchmarkService

Example flow:

API

 ↓

PerformanceService

 ↓

OutletRepository

OrderRepository

 ↓

PostgreSQL

This keeps API routes thin and makes business logic reusable by agents and other application components.

---

# **24\. Analytics Access**

Analytics services should obtain data through controlled data-access/service mechanisms.

Preferred:

Performance Analytics

       ↓

Repository / Query Service

       ↓

PostgreSQL

Avoid allowing every analytics function to independently construct arbitrary database connections.

Use the project's established database session and access patterns.

---

# **25\. Database Sessions**

Use managed SQLAlchemy sessions.

Sessions must be:

* Properly created  
* Properly closed  
* Safe for request handling  
* Not stored globally in an unsafe manner

Do not create a new unmanaged database connection inside every function.

Follow one consistent session-management pattern throughout the backend.

---

# **26\. Transactions**

Use transactions for operations that modify multiple related records.

For example:

Create Order

    ↓

Create Order Items

    ↓

Commit

If a required part fails, the transaction should be rolled back.

Do not leave partially created transactional records.

---

# **27\. Migrations**

Use Alembic for schema evolution.

Workflow:

Modify SQLAlchemy model

        ↓

Generate migration

        ↓

Review migration

        ↓

Apply migration

        ↓

Test

Do not manually edit the database schema as the normal development workflow.

Migrations must be reviewed before being applied.

---

# **28\. Seed Data**

Brew Buzz requires realistic synthetic/demo data for development and demonstrations.

Seed data should include:

* Brew Buzz franchise  
* Multiple outlets  
* Multiple cities/locations  
* Product catalog  
* Orders  
* Order items

The dataset should deliberately contain variation.

Example:

High-performing outlets

Average outlets

Underperforming outlets

Growing outlets

Declining outlets

This is important because a dataset where every outlet performs similarly cannot demonstrate meaningful benchmarking.

---

# **29\. Synthetic Data Quality**

Do not generate completely random data without business logic.

Synthetic data should model realistic relationships.

For example:

Outlet characteristics

        ↓

Expected sales volume

        ↓

Daily/weekly variation

        ↓

Seasonality

        ↓

Occasional anomalies

Different outlets should have different performance profiles.

The generated dataset should allow the Performance Agent to discover meaningful findings.

---

# **30\. Reproducibility**

Synthetic data generation should preferably support deterministic seeds.

Example concept:

SEED \= fixed value

This allows developers to reproduce the same dataset during debugging and testing.

If randomized generation is used, document how to reproduce the dataset.

---

# **31\. Development Database**

Local development should use PostgreSQL through Docker.

Conceptually:

Docker Compose

      ↓

PostgreSQL Container

      ↓

Brew Buzz Database

The database connection should be configurable through environment variables.

Example:

DATABASE\_URL

Never hardcode database credentials.

---

# **32\. Environment Configuration**

Local `.env` may contain:

DATABASE\_URL=...

The repository may contain:

.env.example

The actual:

.env

must not be committed.

Do not place credentials inside:

* SQL files  
* Python source  
* Dockerfiles  
* React source  
* GitHub commits

---

# **33\. Database Security**

Follow these rules:

* Do not expose PostgreSQL publicly during local development.  
* Do not commit credentials.  
* Use environment variables.  
* Use least-privilege credentials where appropriate.  
* Do not log database passwords.  
* Do not expose raw database errors directly to end users.

---

# **34\. Data Validation**

Validate important data at multiple appropriate layers.

Example:

Frontend validation

        ↓

API/Pydantic validation

        ↓

Service validation

        ↓

Database constraints

Do not rely solely on frontend validation.

---

# **35\. Deletion Strategy**

Do not casually hard-delete business records.

For entities such as products or outlets, prefer status/soft-deactivation when historical data must remain valid.

For example:

is\_active

or an appropriate status field.

Historical orders should remain interpretable even if a product is no longer sold.

The exact deletion policy must be defined before implementing destructive operations.

---

# **36\. Historical Integrity**

Historical transactions must preserve the information needed to interpret past business activity.

For example:

If a product's current price changes from:

₹200 → ₹250

historical orders should not suddenly appear to have been sold for ₹250.

Therefore order items should preserve the transaction-time unit price.

---

# **37\. Future Expansion**

The database should be extendable for later milestones.

Potential future domains:

Inventory

Inventory Transactions

Staff

Attendance

Schedules

Marketing Campaigns

Campaign Metrics

Audits

Audit Findings

Alerts

Agent Findings

Recommendations

Do not implement these tables during Milestone 1 unless they are required by an actual feature.

Design for extension, not premature implementation.

---

# **38\. Agent Data Access**

AI agents must not receive unrestricted database credentials or arbitrary database access.

Preferred flow:

Agent

  ↓

Defined Tool

  ↓

Service

  ↓

Repository

  ↓

PostgreSQL

Example:

Performance Agent

      ↓

get\_outlet\_performance()

      ↓

PerformanceService

      ↓

PostgreSQL

The tool should return only the data required for the agent's task.

---

# **39\. Performance Considerations**

For Milestone 1:

* Prefer efficient SQL aggregation for simple aggregations.  
* Avoid loading the entire database into memory unnecessarily.  
* Use Pandas when data manipulation is genuinely useful.  
* Use database filtering before transferring large datasets.  
* Add indexes based on actual query patterns.

Do not prematurely optimize.

Correctness comes first.

---

# **40\. Database Testing**

Important database behavior should be tested.

Tests should cover:

* Model relationships  
* Constraints  
* Order creation  
* Order item relationships  
* Revenue calculations  
* Date filtering  
* Outlet aggregation  
* Invalid data handling

Integration tests should use a database environment that behaves sufficiently like PostgreSQL.

---

# **41\. Milestone 1 Database Target**

Before the Outlet Performance Agent can be considered functional, the database foundation should support:

Brew Buzz

   ↓

Multiple Outlets

   ↓

Product Catalog

   ↓

Historical Orders

   ↓

Order Items

   ↓

Reliable Revenue Data

The system should be able to query:

Revenue by outlet

Revenue by date

Orders by outlet

Orders by date

Product sales

Outlet sales trends

These become the inputs to the performance analytics layer.

---

# **42\. Database Golden Rule**

The database stores **facts**.

It should not store AI-generated guesses as if they were raw business facts.

Keep the distinction:

Database

→ What happened

Analytics

→ What the data shows

Agent

→ What it means

