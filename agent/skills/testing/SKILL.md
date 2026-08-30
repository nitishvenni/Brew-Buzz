
\---

name: brew-buzz-testing

description: Defines the testing strategy for Brew Buzz, including unit testing, database testing, analytics validation, API testing, agent and tool testing, frontend testing, integration testing, end-to-end validation, fixtures, test data, mocking, failure handling, and Milestone 1 acceptance criteria. Use this skill whenever implementing, modifying, debugging, or reviewing Brew Buzz functionality.

\---

\# Brew Buzz — Testing Skill

\#\# 1\. Purpose

Testing Brew Buzz must verify both:

\`\`\`text

Technical correctness

\+

Business correctness

A feature is not complete merely because:

* The application starts.  
* The UI looks correct.  
* The API returns 200\.  
* The AI produces a fluent answer.

The system must produce correct, traceable, and reliable business results.

---

# **2\. Testing Pyramid**

Use a layered testing strategy:

                   E2E Tests

                       ▲

                Integration Tests

                       ▲

             API / Agent Workflow Tests

                       ▲

          Analytics / Service Tests

                       ▲

               Unit Tests

Most tests should be lower-level and fast.

Use end-to-end tests for important complete workflows.

---

# **3\. Testing Responsibilities**

Different layers should test different responsibilities.

Frontend

→ UI behavior and rendering

FastAPI

→ API contract and validation

Services

→ Business logic

Analytics

→ Numerical correctness

Database

→ Models, constraints, queries

Agent Tools

→ Correct data retrieval

Agent Workflow

→ Correct investigation behavior

E2E

→ Complete user workflow

Do not test the same implementation detail repeatedly at every layer.

---

# **4\. Test Environment**

Tests should run against a dedicated test environment.

Do not allow automated tests to modify production data.

Prefer:

Development DB

Test DB

Production DB

as separate environments.

---

# **5\. Test Database**

Database integration tests should use PostgreSQL when PostgreSQL-specific behavior matters.

Do not rely exclusively on SQLite if the application uses PostgreSQL in production.

Differences in:

* Types  
* Constraints  
* SQL behavior  
* Indexes  
* JSON handling

can cause tests to pass while production fails.

---

# **6\. Test Data**

Create deterministic test fixtures.

Test data should cover:

Multiple outlets

Multiple periods

Multiple categories

Different revenue levels

Different order volumes

Different AOVs

Positive growth

Negative growth

Zero values

Missing comparison periods

Benchmark differences

---

# **7\. Synthetic Test Data**

Use synthetic data for tests.

Example:

Outlet A

Revenue \= ₹100,000

Orders \= 1,000

AOV \= ₹100

Outlet B

Revenue \= ₹80,000

Orders \= 800

AOV \= ₹100

Tests should know the expected result before execution.

Do not use randomly generated values for tests unless the expected properties are explicitly controlled.

---

# **8\. Unit Tests**

Unit tests should test isolated logic.

Examples:

Revenue calculation

AOV calculation

Growth calculation

Score calculation

Threshold classification

Date-range logic

Formatting helpers

Validation logic

Unit tests should be fast and deterministic.

---

# **9\. Revenue Calculation**

Given:

Order 1 \= ₹500

Order 2 \= ₹300

Order 3 \= ₹200

Expected:

Revenue \= ₹1,000

The test must verify the exact result.

---

# **10\. AOV Calculation**

Given:

Revenue \= ₹1,000

Orders \= 10

Expected:

AOV \= ₹100

Formula:

AOV \= Revenue / Orders

---

# **11\. Zero Orders**

Given:

Revenue \= 0

Orders \= 0

The implementation must use the project's defined representation for unavailable AOV.

Do not allow division-by-zero errors.

Do not arbitrarily convert missing AOV into a misleading business value.

---

# **12\. Growth Calculation**

Given:

Previous Revenue \= ₹100,000

Current Revenue \= ₹120,000

Expected:

Growth \= \+20%

Given:

Previous Revenue \= ₹100,000

Current Revenue \= ₹80,000

Expected:

Growth \= \-20%

---

# **13\. Zero Previous Revenue**

Given:

Previous Revenue \= 0

Current Revenue \= ₹50,000

Normal percentage growth is undefined.

The system must return the project's standardized unavailable representation.

Do not return:

∞%

---

# **14\. Negative Values**

The system should validate whether negative revenue/order values are permitted.

If negative values represent refunds or adjustments, model them explicitly.

Do not silently treat invalid negative values as ordinary sales.

---

# **15\. Date Tests**

Test:

Same-day period

One-week period

One-month period

Month boundary

Year boundary

Leap year

Start date \= end date

Start date \> end date

Invalid ranges must be rejected consistently.

---

# **16\. Timezone**

Business date calculations must use a clearly defined timezone strategy.

Do not allow different services to interpret the same transaction date differently.

Test timezone-sensitive boundaries where timestamps are involved.

---

# **17\. Benchmark Tests**

Given:

Outlet Revenue \= ₹120,000

Peer Average \= ₹100,000

the benchmark comparison should indicate that the outlet is above the peer average.

Test both:

Above benchmark

Below benchmark

Equal benchmark

---

# **18\. Relative Performance Tests**

Test scenarios where:

Outlet ↓

Peers ↓ more

The system should correctly identify that the outlet may be outperforming peers despite absolute decline.

Also test:

Outlet ↑

Peers ↑ more

where the outlet may still be underperforming relatively.

---

# **19\. Score Tests**

If Brew Buzz uses a 0–100 performance score:

Test:

Minimum possible score

Maximum possible score

Typical score

Boundary values

Missing metric inputs

The score must be deterministic.

Given identical inputs:

Same input

→ Same score

---

# **20\. Score Boundary Tests**

If business rules define thresholds such as:

Excellent

Healthy

Needs Attention

Critical

test values immediately:

Below threshold

At threshold

Above threshold

This prevents off-by-one and boundary errors.

---

# **21\. Analytics Tests**

Analytics tests must verify actual business interpretation.

Examples:

Revenue trend

Order trend

AOV trend

Category contribution

Benchmark comparison

Growth

Performance classification

Do not only test that a function executes without errors.

Test the expected business result.

---

# **22\. Trend Tests**

Use controlled historical data.

Example:

Week 1 → ₹100K

Week 2 → ₹110K

Week 3 → ₹120K

Week 4 → ₹130K

Expected:

Increasing trend

Also test:

Decreasing

Stable

Volatile

according to the project's defined trend logic.

---

# **23\. Category Tests**

Example:

Pizza Revenue \= ₹700K

Coffee Revenue \= ₹300K

Total Revenue \= ₹1M

Verify:

Pizza contribution \= 70%

Coffee contribution \= 30%

Do not allow category totals to silently disagree with overall totals.

---

# **24\. Data Consistency Tests**

Verify relationships such as:

Total Revenue

≈

Sum of valid category revenue

where the data model makes this relationship expected.

Investigate discrepancies instead of hiding them.

---

# **25\. Database Model Tests**

Test:

Required fields

Foreign keys

Unique constraints

Valid relationships

Cascade behavior

Nullable fields

Indexes where behavior matters

Example:

Order

→ belongs to Outlet

An invalid outlet reference should be rejected according to the database design.

---

# **26\. Database Query Tests**

Test important queries using realistic data.

Examples:

Get outlet metrics

Get outlet trend

Get peer benchmark

Get category performance

Verify both:

Correct values

\+

Correct filtering

---

# **27\. Data Isolation Tests**

An outlet query for:

Outlet 12

must not accidentally include:

Outlet 13

This is especially important for franchise analytics.

---

# **28\. API Tests**

Test every important FastAPI endpoint.

For each endpoint test:

Valid request

Invalid request

Missing parameters

Unknown resource

Empty result

Database failure

where applicable.

---

# **29\. API Contract**

The API response structure must remain predictable.

Test:

Required fields

Field types

Nested objects

Arrays

Nullable values

Error format

Do not allow frontend assumptions to silently break.

---

# **30\. HTTP Status Codes**

Verify appropriate statuses.

Examples:

200 → successful retrieval

201 → successful creation

400 → invalid request

404 → resource not found

422 → validation failure where applicable

500 → unexpected server failure

Use the project's API conventions consistently.

---

# **31\. Outlet Endpoint Tests**

Test:

GET outlets

GET outlet/{id}

where those endpoints exist.

Verify:

Correct outlet

Correct metadata

Unknown outlet handling

---

# **32\. Performance Endpoint Tests**

For a valid outlet and date range:

Request

  ↓

API

  ↓

Analytics

  ↓

Response

Verify the returned metrics against independently calculated expected values.

---

# **33\. Agent API Tests**

For an agent analysis request:

POST /analysis

or the project's equivalent endpoint:

Verify:

Valid request

Structured response

Correct outlet context

Correct date range

Findings

Recommendations

Limitations

Do not assert exact LLM wording.

Assert structured behavior and important facts.

---

# **34\. Agent Testing Philosophy**

Agent testing must focus on:

Behavior

\+

Tool selection

\+

Evidence

\+

Grounding

\+

Output structure

not merely:

"Did the AI answer?"

---

# **35\. Agent Tool Tests**

Every agent tool should have isolated tests.

Example:

get\_outlet\_metrics()

Test:

Correct outlet

Correct date range

Correct aggregation

Empty result

Invalid outlet

Database failure

---

# **36\. Tool Input Validation**

Test invalid tool parameters.

Examples:

Invalid outlet ID

Invalid date range

Missing required field

Unexpected type

The tool should fail safely.

---

# **37\. Tool Output Contract**

Tool output should be structured.

Example:

{

  "revenue": 125000,

  "orders": 1200,

  "aov": 104.17

}

Tests should verify:

Required fields exist

Values have correct types

Values are internally consistent

---

# **38\. Agent Workflow Tests**

Test important decision paths.

Example:

User asks:

Why is Outlet 12 underperforming?

Expected behavior:

Get core metrics

        ↓

Detect decline

        ↓

Check benchmark

        ↓

Check trend

        ↓

Investigate relevant category

        ↓

Produce finding

        ↓

Produce recommendation

The agent should not blindly call every available tool.

---

# **39\. Agent Tool Selection**

Do not require one exact tool-call sequence unless the architecture explicitly requires it.

Instead verify important behavioral properties.

For example:

If revenue is declining,

benchmark analysis should be considered.

and:

If category-level evidence is needed,

the agent should investigate category data.

---

# **40\. Agent Stop Behavior**

Test that the agent stops after obtaining sufficient evidence.

An agent should not:

Call tools indefinitely

Repeat identical calls

Perform irrelevant investigation

---

# **41\. Agent Failure Tests**

Simulate:

Tool failure

Database failure

LLM failure

Timeout

Malformed tool result

Missing data

Expected behavior:

Controlled failure

\+

No fabricated facts

---

# **42\. Grounding Tests**

Use a dataset with known facts.

Example:

Coffee revenue \= \-18%

The agent may state:

Coffee revenue declined 18%.

It must not invent:

Customers disliked the coffee.

unless customer-feedback data exists.

---

# **43\. Hallucination Tests**

Explicitly test unsupported claims.

Given only:

Revenue

Orders

AOV

the agent must not claim:

Weather caused the decline.

Customers disliked the product.

Staff performance caused the decline.

Competitor opened nearby.

unless those data sources exist.

---

# **44\. Recommendation Tests**

Recommendations must be linked to findings.

Given:

AOV declined significantly.

the recommendation should relate to:

Order value

Product mix

Pricing

Promotions

only when supported by available evidence and approved business rules.

---

# **45\. Recommendation Quality**

Avoid recommendations that are:

Generic

Unrelated

Unsupported

Overly certain

Repeated

Bad:

Improve marketing.

Work harder.

Increase sales.

Better:

Investigate the decline in coffee-category sales

and review product mix and availability.

---

# **46\. Uncertainty Tests**

If evidence is insufficient, the agent should communicate uncertainty.

Test:

No category data

No benchmark

No previous period

Incomplete transactions

Expected:

Clear limitation

\+

No fabricated conclusion

---

# **47\. Frontend Unit Tests**

Test reusable components such as:

MetricCard

TrendChart

BenchmarkCard

FindingCard

RecommendationCard

StatusBadge

Verify:

Correct rendering

Correct values

Correct labels

Interaction behavior

---

# **48\. Frontend State Tests**

Test:

Loading

Success

Empty

Error

Partial result

The dashboard must behave correctly in each state.

---

# **49\. Frontend API Tests**

Mock backend responses for frontend tests.

Test:

Valid response

Malformed response

Network error

Server error

Empty data

The frontend should fail gracefully.

---

# **50\. E2E Testing**

End-to-end tests should validate the most important user journey.

Example:

Open Brew Buzz

      ↓

Select outlet

      ↓

Select period

      ↓

Start analysis

      ↓

View metrics

      ↓

View benchmark

      ↓

View findings

      ↓

View recommendations

---

# **51\. E2E Data**

E2E tests should use deterministic test data.

Do not rely on changing production-like data.

---

# **52\. E2E Agent Testing**

If the real LLM makes tests nondeterministic or expensive, use a controlled test mode.

Possible architecture:

Production

→ Real Agent / LLM

E2E Test

→ Deterministic Agent Stub

The complete UI/API integration can then be tested without relying on model randomness.

---

# **53\. LLM Evaluation**

Real LLM behavior should also be evaluated separately.

Evaluation criteria:

Correctness

Grounding

Tool use

Reasoning quality

Recommendation relevance

Uncertainty handling

Schema compliance

Do not require exact wording.

---

# **54\. Golden Test Cases**

Maintain a small collection of important business scenarios.

Example:

Case 1:

Healthy outlet

Case 2:

Revenue decline

Case 3:

AOV-driven decline

Case 4:

Order-driven decline

Case 5:

Outlet below peer benchmark

Case 6:

Outlet declining but outperforming peers

Case 7:

No previous period

Case 8:

No sales

Case 9:

Missing category data

Case 10:

Tool failure

These become regression tests.

---

# **55\. Regression Testing**

When fixing a bug:

Bug discovered

      ↓

Write failing test

      ↓

Fix implementation

      ↓

Test passes

      ↓

Keep regression test

Do not rely on manually remembering previously fixed bugs.

---

# **56\. Test Naming**

Test names should describe behavior.

Good:

test\_aov\_returns\_null\_when\_order\_count\_is\_zero

test\_growth\_handles\_zero\_previous\_revenue

test\_outlet\_metrics\_exclude\_other\_outlets

test\_agent\_discloses\_missing\_benchmark

Bad:

test1

test\_metrics

test\_agent

---

# **57\. Fixtures**

Reusable fixtures should provide common data.

Examples:

test\_outlet

test\_orders

test\_categories

test\_benchmark\_group

test\_date\_range

Avoid duplicating large setup blocks across tests.

---

# **58\. Mocking**

Mock external systems when appropriate:

LLM provider

External APIs

Email

Cloud services

Do not mock the code under test unnecessarily.

For example, analytics calculations should be tested using real calculation logic, not a mocked calculation result.

---

# **59\. Database Transactions in Tests**

Database tests should isolate their data.

Preferred patterns include:

Transaction rollback

Temporary test database

Test fixtures

so one test does not contaminate another.

---

# **60\. Test Independence**

Tests should be independently runnable.

Avoid:

Test A creates data

Test B assumes Test A ran

Every test should establish the state it requires.

---

# **61\. Determinism**

Tests should produce the same result repeatedly.

Avoid uncontrolled dependencies on:

Current time

Random values

External APIs

LLM randomness

Production data

Inject or control these values where necessary.

---

# **62\. Test Coverage**

Coverage is useful but is not the definition of quality.

High coverage with weak assertions is not sufficient.

Prioritize coverage of:

Business-critical calculations

Data access

API contracts

Agent tools

Agent decision paths

Security boundaries

---

# **63\. Security Tests**

Test that:

Secrets are not returned by APIs

Unauthorized data is not accessible

Invalid IDs are handled safely

Frontend cannot directly access protected services

Do not expose database credentials in error responses.

---

# **64\. Performance Tests**

Milestone 1 does not require sophisticated load testing.

However, identify obvious problems such as:

N+1 queries

Repeated identical API requests

Very slow analytics queries

Excessive agent tool calls

---

# **65\. Docker Test**

Verify that the application works in the actual containerized environment.

At minimum:

Build images

Start services

Run migrations

Run tests

Start application

Do not test only on the developer's host machine.

---

# **66\. CI Test Pipeline**

The CI pipeline should eventually run:

Install dependencies

        ↓

Lint

        ↓

Type check

        ↓

Unit tests

        ↓

Integration tests

        ↓

Build

E2E tests can be included according to execution time and infrastructure.

---

# **67\. Test Failure Rule**

A failing test must not be ignored simply because:

"The feature works manually."

Determine whether:

Test is wrong

OR

Implementation is wrong

OR

Requirement changed

Then resolve it deliberately.

---

# **68\. Bug Classification**

When a test fails, classify the issue:

Frontend bug

Backend bug

Database bug

Analytics bug

Agent bug

Infrastructure bug

Test bug

Fix the correct layer.

Do not patch symptoms in unrelated layers.

---

# **69\. Milestone 1 Acceptance Test**

The complete Milestone 1 flow should pass:

1\. Start Brew Buzz

2\. PostgreSQL starts

3\. Backend starts

4\. Frontend starts

5\. Demo data loads

6\. User selects outlet

7\. User selects analysis period

8\. Backend retrieves correct metrics

9\. Benchmark is calculated correctly

10\. Trend is calculated correctly

11\. Agent investigates relevant data

12\. Agent produces structured findings

13\. Recommendations are grounded

14\. Frontend renders the result

15\. Missing data is handled correctly

16\. Errors are handled safely

---

# **70\. Milestone 1 Definition of Done**

Milestone 1 testing is complete when:

* Core analytics calculations have unit tests.  
* Database models and important queries have tests.  
* API endpoints have integration tests.  
* Agent tools have isolated tests.  
* Important agent workflows have behavioral tests.  
* Hallucination/grounding cases are tested.  
* Missing-data cases are tested.  
* Frontend states are tested.  
* At least one complete E2E workflow is validated.  
* Dockerized execution is tested.  
* CI can execute the core test suite.  
* Important business scenarios have regression tests.  
* No critical test failures remain.  
  ---

  # **71\. Golden Rules**

1. **Test business correctness, not just technical execution.**  
2. **Never trust an AI response merely because it sounds correct.**  
3. **Numerical calculations must have deterministic tests.**  
4. **Test PostgreSQL behavior when PostgreSQL is the production database.**  
5. **Agent tests should evaluate behavior rather than exact wording.**  
6. **Test tool selection and tool outputs.**  
7. **Test hallucination resistance.**  
8. **Test missing data explicitly.**  
9. **Test failures, not only happy paths.**  
10. **Keep tests deterministic.**  
11. **Do not depend on production data for automated tests.**  
12. **Do not allow tests to modify production data.**  
13. **Use regression tests when bugs are fixed.**  
14. **Do not confuse code coverage with test quality.**  
15. **Keep unit tests fast and numerous.**  
16. **Use integration tests for service boundaries.**  
17. **Use E2E tests for critical user journeys.**  
18. **Do not mock away the behavior you are trying to test.**  
19. **A successful HTTP 200 does not prove business correctness.**  
20. **A fluent AI answer does not prove agent correctness.**

