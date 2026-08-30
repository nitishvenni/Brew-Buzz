# **`data-analytics/SKILL.md`**

name: brew-buzz-data-analytics

description: Defines deterministic data analysis, business metrics, benchmarking, trend analysis, anomaly detection, and performance scoring rules for Brew Buzz. Use this skill whenever implementing or reviewing sales analytics, outlet performance calculations, benchmarking, scoring, or analytical insights.

\---

\# Brew Buzz — Data Analytics Skill

\#\# 1\. Purpose

The Brew Buzz analytics layer converts raw franchise transaction data into reliable, structured business intelligence.

Its primary responsibility is to answer:

\- What happened?

\- How much did it change?

\- Which outlets are performing better or worse?

\- How does an outlet compare with its peers?

\- Which outlets require attention?

\- What evidence supports the finding?

Analytics must produce \*\*deterministic, reproducible results\*\*.

The LLM must not be responsible for calculating core business metrics.

\---

\# 2\. Analytics Technology

Preferred technologies:

\- Python

\- Pandas

\- NumPy

\- SQLAlchemy/database queries

\- Scikit-learn where appropriate

Use PostgreSQL for aggregation when the operation is naturally handled efficiently by SQL.

Use Python/Pandas when data transformation or statistical analysis benefits from in-memory processing.

Do not automatically load the entire database into Pandas.

\---

\# 3\. Analytics Architecture

Use this conceptual flow:

\`\`\`text

PostgreSQL

    ↓

Data Access / Query

    ↓

Clean Structured Data

    ↓

Analytics Functions

    ↓

Business Metrics

    ↓

Benchmarking / Scoring

    ↓

Structured Findings

    ↓

Agent

Analytics should not depend on the React frontend.

Analytics should not directly generate UI components.

Analytics should not make LLM calls.

---

# **4\. Source of Truth**

The source of truth is:

Transactional Data

\+

Defined Business Rules

The analytics layer must derive metrics from the underlying data.

Do not manually hardcode performance numbers.

Do not use an LLM to determine numerical values.

---

# **5\. Core Milestone 1 Metrics**

Milestone 1 should support the following metrics:

### **Primary**

* Revenue  
* Order count  
* Average Order Value  
* Revenue growth  
* Outlet ranking  
* Outlet performance score

### **Supporting**

* Units sold  
* Product/category contribution  
* Sales trend  
* Outlet comparison  
* Benchmark comparison  
* Performance status

Additional metrics may be added only when they provide clear business value.

---

# **6\. Revenue**

Revenue should be derived from valid sales transactions.

Conceptually:

Revenue \= Sum of valid order totals

Cancelled or invalid orders must not be treated as successful revenue.

The exact order-status rules must come from the database/domain configuration.

Do not use the LLM to calculate revenue.

---

# **7\. Order Count**

Order count represents the number of valid customer transactions during the selected period.

Conceptually:

Order Count \= Number of valid orders

Cancelled orders should not be counted as completed sales unless explicitly defined by business rules.

---

# **8\. Average Order Value**

Average Order Value:

AOV \= Revenue / Order Count

Handle:

Order Count \= 0

without producing an exception.

A zero-order period should return a clearly defined value such as `0` or `null`, depending on the API contract.

Do not silently create misleading values.

---

# **9\. Date Range Analysis**

Analytics functions must support explicit date ranges.

Example:

start\_date

end\_date

The selected period must be clearly defined.

Avoid ambiguous comparisons such as:

"this month" vs "last month"

unless the application explicitly defines how those periods are calculated.

---

# **10\. Period Comparison**

When comparing performance between two periods, the periods must be comparable.

For example:

Current Period:

January 1–31

Previous Period:

December 1–31

or another explicitly defined equivalent-period strategy.

Do not compare arbitrary periods and label the result as growth.

---

# **11\. Revenue Growth**

Revenue growth:

Growth %

\=

(Current Revenue \- Previous Revenue)

\----------------------------------- × 100

Previous Revenue

Example:

Previous Revenue \= ₹100,000

Current Revenue  \= ₹120,000

Growth \= 20%

If previous revenue is zero, the system must not divide by zero.

Possible handling:

* `null`  
* `"N/A"`  
* Explicit "no previous-period baseline"

The chosen representation must be consistent across the API.

Do not arbitrarily return an extremely large percentage.

---

# **12\. Outlet Benchmarking**

Benchmarking compares an outlet against a defined peer group.

Possible peer groups:

* All outlets  
* Same city  
* Same region  
* Similar outlet class

For Milestone 1, the default benchmark should be clearly defined before implementation.

Do not silently change the peer group between endpoints.

---

# **13\. Benchmark Metrics**

Useful benchmark comparisons include:

Outlet Revenue

vs

Average Outlet Revenue

and:

Outlet Growth

vs

Average Outlet Growth

and potentially:

Outlet AOV

vs

Average Outlet AOV

The system should clearly identify the benchmark population.

---

# **14\. Mean vs Median**

Do not automatically assume the mean is always the best benchmark.

Franchise data may contain extreme high-performing outlets.

Therefore:

* Mean is useful for overall average performance.  
* Median may be more robust when outliers significantly distort the distribution.

The chosen statistic should be documented and used consistently.

If the dataset demonstrates substantial skew, consider median-based benchmarking.

Do not switch between mean and median without documenting the reason.

---

# **15\. Outlet Ranking**

Outlet rankings should be based on a clearly defined metric.

Examples:

Revenue Ranking

Growth Ranking

Performance Score Ranking

Do not call an outlet "best performing" without specifying the basis.

For example:

> "Outlet A is \#1 by revenue."

is more precise than:

> "Outlet A is the best outlet."

A combined performance score may be used for an overall ranking.

---

# **16\. Trend Analysis**

Trend analysis should identify meaningful changes over time.

Possible aggregation levels:

Daily

Weekly

Monthly

The chosen aggregation should depend on the requested analysis period.

For example:

Short period

→ Daily trend

Longer period

→ Weekly/monthly trend

Do not generate unnecessarily noisy daily charts for long historical periods.

---

# **17\. Trend Direction**

A trend should not be classified based on a single arbitrary data point.

Possible classifications:

Growing

Declining

Stable

Volatile

Insufficient Data

The thresholds must be defined explicitly.

Do not invent thresholds inside individual functions.

---

# **18\. Insufficient Data**

Analytics must recognize when there is not enough information.

Examples:

* No transactions  
* Only one period available  
* Missing comparison period  
* Too few observations for a reliable trend  
* Missing required fields

Do not manufacture conclusions from insufficient data.

Possible result:

{

  "status": "insufficient\_data",

  "reason": "No previous-period revenue available."

}

---

# **19\. Missing Data**

Missing data should be handled explicitly.

Distinguish between:

Zero

and:

Missing

These are not automatically equivalent.

Example:

Revenue \= 0

means the outlet had no recorded revenue.

Whereas:

Revenue \= null

may mean the data is unavailable.

Do not replace missing values with zero without a business justification.

---

# **20\. Outlier Handling**

Do not automatically remove outliers.

An unusually high or low value may represent:

* Genuine business behavior  
* A major promotion  
* A holiday  
* An operational incident  
* Data-entry error

Outlier treatment must be intentional.

If anomaly detection is introduced, preserve the original data and flag the observation rather than silently deleting it.

---

# **21\. Anomaly Detection**

Anomaly detection may be used to identify unusual performance.

Potential approaches:

* Statistical thresholds  
* Z-score  
* IQR  
* Rolling statistics  
* Isolation Forest  
* Other appropriate methods

Do not introduce complex ML merely because the project is called Agentic AI.

Start with interpretable methods.

For Milestone 1, deterministic/statistical approaches are preferred unless a clear ML requirement exists.

---

# **22\. Performance Score**

The outlet performance score must combine meaningful performance indicators.

Potential components:

Revenue Performance

Growth Performance

Order Performance

AOV Performance

Benchmark Performance

However, the exact formula and weights must be explicitly defined before implementation.

Do NOT invent arbitrary weights such as:

Revenue \= 40%

Growth \= 30%

AOV \= 20%

Orders \= 10%

unless those weights have been approved as the project's scoring specification.

---

# **23\. Score Normalization**

If multiple metrics are combined into a performance score, they must be normalized before combining when their scales differ.

For example:

Revenue:

₹50,000 – ₹5,000,000

Growth:

\-30% – \+50%

AOV:

₹100 – ₹1,000

These raw values cannot simply be added together.

Normalize them using an explicitly defined method.

Possible methods include:

* Min-max normalization  
* Percentile ranking  
* Benchmark-relative scoring  
* Standardized scores

The chosen method should be consistent.

---

# **24\. Score Range**

If the application exposes a performance score, use a fixed understandable range.

Preferred conceptual range:

0 – 100

The meaning of the score must be documented.

Example interpretation:

80–100 → Strong

60–79  → Healthy

40–59  → Needs Attention

0–39   → Critical

These thresholds are examples only.

Do not implement them until they are explicitly adopted as the project's scoring specification.

---

# **25\. Score Explainability**

A performance score should never be presented without supporting information.

The system should be able to explain the major factors influencing the score.

Example:

Performance Score: 72

Positive:

\+ Revenue above outlet benchmark

\+ Strong order growth

Negative:

\- AOV below benchmark

\- Recent revenue decline

The explanation should originate from deterministic metric results.

The LLM may later convert these structured findings into natural language.

---

# **26\. Benchmark-Relative Analysis**

A useful approach for outlet intelligence is to compare each outlet against its peer group.

Example:

Outlet Revenue

       ↓

Peer Group Median

       ↓

Relative Performance

This helps distinguish:

Low revenue because the entire region is weak

from:

Low revenue despite strong regional performance

The benchmark population must therefore be explicit.

---

# **27\. Business Finding**

Analytics should produce structured findings rather than only prose.

Example:

{

  "metric": "revenue\_growth",

  "value": \-12.4,

  "benchmark": 3.8,

  "direction": "declining",

  "severity": "medium"

}

This structure can later be consumed by the Outlet Performance Agent.

---

# **28\. Analytics Output**

A performance analytics result should conceptually contain:

Outlet Identity

Metrics

Period

Comparison Period

Benchmark

Score

Trend

Findings

Data Quality

Example:

{

  "outlet\_id": 12,

  "period": {

    "start": "2026-01-01",

    "end": "2026-01-31"

  },

  "metrics": {

    "revenue": 1250000,

    "orders": 4210,

    "aov": 297.15,

    "growth\_rate": 8.4

  },

  "benchmark": {

    "average\_revenue": 1100000,

    "average\_growth": 5.2

  },

  "performance\_score": 87

}

The exact API schema belongs to the backend/API implementation.

---

# **29\. Analytics Module Organization**

Prefer focused modules.

Example:

analytics/

├── revenue.py

├── sales.py

├── growth.py

├── benchmarking.py

├── trends.py

├── scoring.py

└── performance.py

Do not create one enormous `analytics.py`.

Do not create excessive micro-modules for trivial one-line functions.

---

# **30\. Pure Functions Where Practical**

Deterministic calculations should preferably be implemented as testable functions.

Example concept:

calculate\_growth(current, previous)

calculate\_aov(revenue, orders)

calculate\_benchmark(value, benchmark)

calculate\_performance\_score(metrics)

These functions should be easy to unit test.

---

# **31\. Analytics and Database Separation**

Analytics should not contain unnecessary database connection logic.

Preferred:

Repository

    ↓

Structured Data

    ↓

Analytics Function

    ↓

Result

This allows analytics functions to be tested independently.

---

# **32\. Analytics and LLM Separation**

Never do:

Raw Data

 ↓

LLM

 ↓

Revenue

Prefer:

Raw Data

 ↓

SQL/Python

 ↓

Metrics

 ↓

Findings

 ↓

LLM

 ↓

Explanation

The LLM is an interpretation layer, not a numerical calculation engine.

---

# **33\. Reproducibility**

Given the same input data and configuration, deterministic analytics should produce the same result.

Avoid uncontrolled randomness.

If an ML algorithm requires randomness, use a fixed random seed where appropriate for reproducible development/testing.

---

# **34\. Precision and Rounding**

Keep adequate precision internally.

Round only when presenting values.

Example:

Internal:

297.153847

Display:

₹297.15

Do not repeatedly round intermediate calculations.

This prevents cumulative numerical errors.

---

# **35\. Currency**

Brew Buzz is being developed for an Indian context.

The initial demonstration currency should be:

INR / ₹

Currency formatting belongs to the presentation layer.

Analytics should preferably operate on numeric values rather than formatted strings.

Bad:

"₹1,25,000"

inside analytical calculations.

Good:

125000

and format it as currency in the UI.

---

# **36\. Data Types**

Keep numerical metrics numeric.

Examples:

revenue → number

growth\_rate → number

order\_count → integer

aov → number

performance\_score → number

Do not return numeric values as strings unless the API contract explicitly requires it.

---

# **37\. Performance Analytics Caching**

Do not introduce caching before it is necessary.

If performance calculations later become expensive, caching may be considered.

Any caching strategy must define:

* Cache key  
* Expiration  
* Invalidation  
* Source of truth

PostgreSQL remains authoritative.

---

# **38\. Testing Analytics**

Every important deterministic metric should have unit tests.

At minimum:

Revenue

AOV

Growth

Benchmarking

Score

Test normal and edge cases.

---

# **39\. Required Edge Cases**

Analytics tests should consider:

### **Revenue**

* No orders  
* One order  
* Multiple orders  
* Cancelled orders

### **AOV**

* Zero orders  
* Normal orders

### **Growth**

* Previous revenue \> 0  
* Previous revenue \= 0  
* Negative growth  
* Positive growth  
* No previous data

### **Benchmarking**

* One outlet  
* Multiple outlets  
* Missing values  
* Identical values

### **Scoring**

* Minimum values  
* Maximum values  
* Missing metrics  
* Boundary values

---

# **40\. Data Quality Metadata**

Where useful, analytics should expose data-quality information.

Example:

{

  "data\_quality": {

    "status": "good",

    "missing\_records": 0,

    "warnings": \[\]

  }

}

This is particularly important for AI-generated recommendations.

An agent should know when its conclusion is based on incomplete data.

---

# **41\. Insight Generation**

Analytics should produce factual findings.

Example:

Revenue declined by 12.4%.

The agent may then interpret this:

The outlet is showing a meaningful decline in revenue and may require investigation.

Keep these responsibilities separate.

---

# **42\. Recommendation Grounding**

Recommendations must be grounded in actual findings.

Bad:

Revenue is down, so launch a 30% discount campaign.

unless the data and business rules justify that recommendation.

Better:

Revenue declined 12.4% while order volume declined 3%.

AOV declined substantially.

Investigate product mix and promotion performance before changing pricing.

The system should distinguish:

Evidence

→ Finding

→ Possible action

---

# **43\. Avoid Causal Claims Without Evidence**

Analytics may identify correlations or changes.

It should not automatically claim causation.

For example:

Bad:

> "Revenue decreased because the coffee menu is poor."

unless there is evidence supporting that conclusion.

Better:

> "Revenue decreased while coffee-category sales also declined."

The agent may propose hypotheses, but they must be clearly identified as hypotheses.

---

# **44\. Statistical vs Business Significance**

A small numerical change may not be operationally important.

Likewise, a large change may require immediate attention.

Where practical, distinguish:

Numerical change

from:

Business significance

Thresholds should be explicitly defined rather than invented inside individual functions.

---

# **45\. Milestone 1 Analytics Pipeline**

The expected pipeline is:

Orders \+ Order Items

        ↓

Data Cleaning / Validation

        ↓

Revenue

        ↓

Order Count

        ↓

AOV

        ↓

Period Comparison

        ↓

Growth

        ↓

Outlet Benchmarking

        ↓

Trend Analysis

        ↓

Performance Score

        ↓

Structured Findings

This output becomes the foundation for the Outlet Performance Agent.

---

# **46\. Milestone 1 Definition of Done**

Analytics for Milestone 1 should be considered ready when:

* Revenue is correctly calculated.  
* Order counts are correct.  
* AOV is correct.  
* Growth calculations handle edge cases.  
* Outlet benchmarking is deterministic.  
* Performance scoring uses an explicitly defined formula.  
* Results are reproducible.  
* Important calculations have unit tests.  
* Missing/insufficient data is handled.  
* Structured findings can be consumed by the agent.  
* No LLM is used for deterministic numerical calculations.

---

# **47\. Analytics Golden Rules**

1. **Data first.**  
2. **Deterministic calculations stay deterministic.**  
3. **Never fabricate missing data.**  
4. **Zero is not automatically the same as missing.**  
5. **Benchmark populations must be explicit.**  
6. **Scores must be explainable.**  
7. **Do not invent scoring weights.**  
8. **Do not claim causation without evidence.**  
9. **Keep analytics separate from LLM reasoning.**  
10. **Test edge cases.**  
11. **Prefer interpretable methods before complex ML.**  
12. **Business numbers must be traceable to source data.**

