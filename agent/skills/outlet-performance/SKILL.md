# **`outlet-performance/SKILL.md`**

\---

name: brew-buzz-outlet-performance

description: Defines the Milestone 1 Outlet Performance Agent for Brew Buzz, including its business objective, analytical workflow, metrics, benchmarking, investigation strategy, findings, recommendations, scoring, and structured output. Use this skill whenever implementing or modifying the Outlet Performance Agent.

\---

\# Brew Buzz — Outlet Performance Agent Skill

\#\# 1\. Purpose

The Outlet Performance Agent is the primary Agentic AI capability for Milestone 1 of Brew Buzz.

Its purpose is to analyze the performance of an individual pizza-and-coffee franchise outlet and provide management with:

\- A clear performance summary

\- Important performance metrics

\- Comparison against relevant benchmarks

\- Trend analysis

\- Identification of performance issues

\- Evidence supporting those issues

\- Possible explanations or hypotheses

\- Actionable recommendations

\- Appropriate confidence and limitations

The agent must use Brew Buzz's actual business data rather than generating generic business advice.

\---

\# 2\. Primary Business Question

The agent should primarily answer:

\`\`\`text

How is this outlet performing, what changed,

why might it have changed, and what should

management investigate or do next?

The agent should answer progressively:

Performance

    ↓

Change

    ↓

Comparison

    ↓

Investigation

    ↓

Finding

    ↓

Recommendation

---

# **3\. Milestone 1 Scope**

The Outlet Performance Agent should initially focus on:

Sales

Revenue

Orders

Average Order Value

Growth

Outlet Benchmarking

Trends

Product / Category Performance

Performance Score

Evidence-Based Recommendations

Do not implement unrelated business agents during this milestone.

Do not prematurely implement:

* Inventory agent  
* Workforce agent  
* Marketing agent  
* Procurement agent  
* Autonomous business actions

Those can be added in later milestones.

---

# **4\. Agent Input**

The agent should support a structured analysis request.

Conceptually:

{

  "outlet\_id": 12,

  "start\_date": "2026-01-01",

  "end\_date": "2026-01-31",

  "objective": "Analyze outlet performance"

}

The system may additionally support a natural-language question.

Example:

Why is Outlet 12 underperforming?

The application should resolve the outlet and analysis period before or during the agent workflow.

---

# **5\. Required Context**

Before making conclusions, the agent should establish:

Outlet

Analysis Period

Comparison Period

Available Data

Benchmark Population

If a required value is unavailable, the agent must not silently assume it.

---

# **6\. Core Metrics**

The agent should have access to:

### **Revenue**

Total valid sales revenue during the selected period.

### **Order Count**

Number of valid orders during the selected period.

### **Average Order Value**

AOV \= Revenue / Order Count

### **Revenue Growth**

Growth % \=

(Current Revenue \- Previous Revenue)

/

Previous Revenue × 100

### **Outlet Benchmark**

Comparison of outlet performance against its defined peer group.

### **Trend**

Direction and behavior of performance over time.

### **Product / Category Contribution**

Identify important product or category-level changes where the required data exists.

---

# **7\. Performance Analysis Sequence**

The agent should generally begin with the highest-value information.

Preferred sequence:

1\. Revenue

2\. Orders

3\. AOV

4\. Growth

5\. Benchmark

6\. Trend

7\. Product/category breakdown if necessary

8\. Additional investigation if justified

The agent does not need to call every tool if sufficient evidence is already available.

---

# **8\. First-Level Analysis**

The agent should first determine whether the outlet is:

Strong

Healthy

Stable

Underperforming

Critical

The exact classification thresholds must come from the approved Brew Buzz scoring/business rules.

Do not invent thresholds inside the agent prompt.

---

# **9\. Change Detection**

The agent should identify meaningful changes such as:

Revenue increasing

Revenue decreasing

Orders increasing

Orders decreasing

AOV increasing

AOV decreasing

Category performance changing

A change should be interpreted relative to a meaningful comparison period or benchmark.

Avoid declaring a performance problem from a single isolated value when comparison data is available.

---

# **10\. Revenue vs Orders vs AOV**

The agent should distinguish between:

Revenue problem

Order-volume problem

Order-value problem

For example:

### **Case A**

Revenue ↓

Orders ↓ significantly

AOV stable

Possible interpretation:

The primary issue appears to be order volume.

### **Case B**

Revenue ↓

Orders roughly stable

AOV ↓ significantly

Possible interpretation:

The decline appears more associated with lower value per order.

### **Case C**

Revenue ↓

Orders ↓

AOV ↓

Possible interpretation:

Both transaction volume and order value are contributing.

These are analytical interpretations, not automatic causal conclusions.

---

# **11\. Benchmark Analysis**

The agent should compare the outlet with its defined benchmark group.

Example:

Outlet Revenue:

₹1.25M

Peer Average:

₹1.10M

Possible finding:

Outlet revenue is above the peer benchmark.

The agent should clearly identify what benchmark is being used.

---

# **12\. Benchmark Context**

A low-performing outlet should not automatically be considered problematic if the entire peer group is also declining.

Example:

Outlet growth:

\-10%

Peer growth:

\-12%

The outlet may actually be outperforming its peers despite having negative growth.

Therefore evaluate:

Absolute Performance

\+

Relative Performance

---

# **13\. Relative Performance**

The agent should distinguish:

"Revenue declined"

from:

"The outlet declined less than comparable outlets."

Both pieces of information may be important.

---

# **14\. Trend Analysis**

The agent should inspect trends when determining whether a change is:

Temporary

Persistent

Improving

Worsening

Stable

Volatile

Trend classification must rely on actual time-series data.

Do not infer a trend from two arbitrary values if sufficient historical observations are available.

---

# **15\. Trend Granularity**

Use an appropriate aggregation level.

Examples:

Short analysis period

→ Daily

Medium period

→ Weekly

Long historical period

→ Monthly

Do not produce unnecessarily noisy analysis.

---

# **16\. Product and Category Investigation**

The agent should investigate product/category data when it can explain a meaningful performance change.

For Brew Buzz, the initial business domain includes:

Pizza

Coffee

Other approved menu categories

The actual categories must come from the application data model.

Do not hardcode menu categories if the database provides dynamic categories.

---

# **17\. Conditional Investigation**

The agent should investigate deeper only when the evidence indicates that it is useful.

Example:

Revenue decline detected

        ↓

Check orders and AOV

        ↓

AOV decline detected

        ↓

Check product/category mix

        ↓

Coffee category decline detected

        ↓

Create finding

This demonstrates actual agentic behavior.

---

# **18\. Example Investigation**

Suppose:

Revenue: \-12%

Orders: \-3%

AOV: \-9%

Coffee sales: \-18%

Peer revenue: \+4%

The agent may conclude:

Finding:

Outlet revenue declined significantly and underperformed its peer group.

Evidence:

\- Revenue decreased 12%.

\- Orders decreased 3%.

\- AOV decreased 9%.

\- Coffee sales decreased 18%.

Interpretation:

The decline appears more strongly associated with lower order value than order volume.

The coffee category may be contributing to the decline.

Limitation:

The available data does not establish why coffee sales declined.

This is the expected style of evidence-based reasoning.

---

# **19\. Finding Categories**

Findings may be classified as:

Positive

Negative

Neutral

Opportunity

Risk

Anomaly

The classification must be based on defined analytical rules.

---

# **20\. Finding Severity**

Where appropriate, findings may have:

Low

Medium

High

Critical

Severity should be based on measurable impact and approved business thresholds.

Do not let the LLM arbitrarily decide severity without supporting rules.

---

# **21\. Finding Structure**

Findings should be structured.

Conceptually:

{

  "type": "performance\_decline",

  "metric": "revenue",

  "value": \-12.4,

  "benchmark": 4.2,

  "severity": "high",

  "evidence": \[

    "Revenue declined 12.4%.",

    "Peer outlets grew 4.2%."

  \]

}

The exact schema should be implemented consistently across the backend.

---

# **22\. Performance Score**

The agent should expose an overall outlet performance score when the scoring system has been defined.

Preferred representation:

0–100

The score must be deterministic.

The agent must not invent the score using subjective LLM judgment.

---

# **23\. Score Inputs**

The score may use:

Revenue Performance

Growth Performance

Order Performance

AOV Performance

Benchmark Performance

The final weighting and normalization method must be explicitly defined in the application's scoring logic.

Do not hardcode arbitrary weights in the agent.

---

# **24\. Score Explanation**

The agent must be able to explain the major factors behind the score.

Example:

Performance Score: 72

Positive:

\- Revenue remains above peer benchmark.

Negative:

\- Revenue growth is declining.

\- AOV is below benchmark.

\- Coffee category sales have weakened.

The explanation must be derived from analytical results.

---

# **25\. Recommendations**

Recommendations should follow from identified findings.

Preferred structure:

Finding

    ↓

Evidence

    ↓

Potential action

Example:

Finding:

Coffee sales declined 18%.

Recommendation:

Review coffee-category availability, pricing,

promotions, and product mix before making broader

pricing or marketing changes.

---

# **26\. Recommendation Priority**

Recommendations may have:

Low

Medium

High

Priority should reflect:

* Business impact  
* Evidence strength  
* Urgency  
* Potential reversibility

Do not assign "high priority" to every recommendation.

---

# **27\. Recommendation Types**

Recommendations may be categorized as:

Investigate

Monitor

Optimize

Review

Test

Escalate

Examples:

Investigate:

Determine why coffee sales declined.

Monitor:

Track whether the decline continues next week.

Optimize:

Review product mix if low-performing items are identified.

Test:

Consider a controlled promotion if the business rules support it.

---

# **28\. Avoid Unsupported Actions**

The agent must not automatically recommend:

30% discount

Hire employees

Fire employees

Close outlet

Change prices

Launch campaign

Remove product

unless the available evidence and approved business rules justify such recommendations.

Recommendations should generally be framed as investigation or controlled action when evidence is limited.

---

# **29\. Facts, Interpretations, Hypotheses**

Every conclusion should implicitly follow this hierarchy:

FACT

↓

INTERPRETATION

↓

HYPOTHESIS

↓

RECOMMENDATION

Example:

FACT:

Coffee revenue declined 18%.

INTERPRETATION:

Coffee is a significant contributor to the outlet's decline.

HYPOTHESIS:

Reduced coffee demand or availability may be contributing.

RECOMMENDATION:

Investigate coffee availability, product mix, and promotions.

Do not collapse these into one unsupported statement.

---

# **30\. Insufficient Evidence**

If the agent cannot determine why something happened, it should say so.

Example:

Revenue declined 12%, but the available data does not

contain sufficient information to determine the underlying cause.

Then suggest the next useful investigation.

---

# **31\. Data Quality**

The agent should consider:

Missing transactions

Missing periods

Incomplete product data

Invalid records

Tool failures

If data quality materially affects the analysis, disclose it.

---

# **32\. Empty Outlet**

If an outlet has no valid transactions:

Revenue \= 0

Orders \= 0

AOV \= null or defined zero representation

The agent should report:

No valid sales activity was recorded during the selected period.

It should not call the outlet "poor performing" without context.

---

# **33\. New Outlet**

A newly opened outlet may not have enough historical data for meaningful growth analysis.

The agent should detect:

No previous comparable period

and return:

Growth comparison unavailable.

Do not fabricate a growth percentage.

---

# **34\. Previous Revenue \= Zero**

When previous-period revenue is zero:

Growth % cannot be calculated normally.

Do not return:

∞%

or another misleading value.

Return the project's standardized "not available" representation.

---

# **35\. Benchmark Availability**

If only one outlet exists in the selected benchmark group:

Peer comparison may not be meaningful.

The agent should state that limitation.

---

# **36\. Tool Strategy**

The Outlet Performance Agent should have access to tools such as:

get\_outlet\_metrics

get\_outlet\_trend

get\_outlet\_benchmark

get\_product\_performance

get\_category\_performance

get\_outlet\_anomalies

Only implement tools that correspond to actual backend capabilities.

Do not create fake tools merely to make the architecture appear agentic.

---

# **37\. Tool Calling Strategy**

Preferred pattern:

Core Metrics

    ↓

Benchmark

    ↓

Trend

    ↓

Conditional Investigation

Avoid blindly calling every tool.

---

# **38\. Example Tool Decision**

User asks:

Why is Outlet 5 underperforming?

Agent:

get\_outlet\_metrics()

        ↓

Revenue declining?

        ↓

YES

        ↓

get\_outlet\_benchmark()

        ↓

Underperforming peers?

        ↓

YES

        ↓

get\_outlet\_trend()

        ↓

Persistent decline?

        ↓

YES

        ↓

get\_category\_performance()

The exact graph can differ, but the implementation must preserve this evidence-driven behavior.

---

# **39\. Agent Stop Condition**

Once the agent has:

Enough evidence

\+

Supported findings

\+

Actionable recommendations

it should stop investigating.

Do not continue calling tools simply because tools remain available.

---

# **40\. Final Response Structure**

The Outlet Performance Agent should return a result containing:

Executive Summary

Performance Score

Key Metrics

Benchmark Comparison

Key Findings

Recommendations

Confidence

Limitations

Example:

{

  "summary": "...",

  "performance\_score": 72,

  "metrics": {},

  "benchmark": {},

  "findings": \[\],

  "recommendations": \[\],

  "confidence": "medium",

  "limitations": \[\]

}

---

# **41\. Executive Summary**

The summary should be concise and decision-oriented.

Example:

Outlet 12 is underperforming its peer group this month.

Revenue declined 12.4%, driven primarily by lower AOV.

Coffee-category sales also declined significantly.

Avoid repeating every metric.

---

# **42\. Key Metrics**

The response should expose important metrics separately so the frontend can visualize them.

Example:

Revenue

Orders

AOV

Growth

Benchmark

Performance Score

The frontend should not need to parse natural-language text to obtain these values.

---

# **43\. Frontend Compatibility**

Agent output must be structured enough for the frontend to render:

Metric Cards

Charts

Performance Score

Finding Cards

Recommendation Cards

Do not design the agent output solely for plain-text chat.

---

# **44\. Explainability**

Each important recommendation should be traceable to one or more findings.

Conceptually:

Recommendation

      ↓

Finding

      ↓

Metric

      ↓

Tool Result

      ↓

Database

This provides an evidence chain.

---

# **45\. No Hidden Business Logic**

Do not hide critical business rules inside the LLM prompt.

Examples that belong in deterministic code:

Performance thresholds

Score calculation

Growth calculation

Benchmark calculation

Severity thresholds

Data validation

The LLM should interpret the resulting structured information.

---

# **46\. API Boundary**

The frontend should communicate with the backend.

Preferred architecture:

React Frontend

      ↓

FastAPI

      ↓

Agent Service

      ↓

LangGraph

      ↓

Agent Tools

      ↓

Analytics / Services

      ↓

PostgreSQL

The frontend must not call the LLM directly.

---

# **47\. Error Handling**

If agent execution fails:

Do not fabricate a response.

Return a controlled error or partial result.

Examples:

Analysis unavailable

or:

Partial analysis completed.

Product-level investigation was unavailable.

---

# **48\. Partial Results**

If core analytics succeeds but deeper investigation fails, preserve the valid results.

Example:

Core Metrics

✓ Available

Benchmark

✓ Available

Trend

✓ Available

Product Investigation

✗ Unavailable

The final response should reflect this limitation.

---

# **49\. Logging**

Record enough information to debug an agent run.

Useful metadata:

Execution ID

Outlet ID

Agent name

Tools called

Execution status

Duration

Errors

Do not log API keys, passwords, or unnecessary sensitive information.

---

# **50\. Testing Requirements**

The Outlet Performance Agent should be tested with scenarios including:

### **Strong outlet**

Revenue ↑

Orders ↑

AOV ↑

### **Declining outlet**

Revenue ↓

Orders ↓

AOV ↓

### **AOV-driven decline**

Revenue ↓

Orders stable

AOV ↓

### **Order-driven decline**

Revenue ↓

Orders ↓

AOV stable

### **Peer-group decline**

Outlet ↓

Peers ↓ more

### **No historical data**

Current period available

Previous period unavailable

### **No sales**

Orders \= 0

### **Missing product data**

Core metrics available

Product analysis unavailable

---

# **51\. Grounding Tests**

Test that the agent does not claim:

"Customers disliked the coffee."

when customer feedback data does not exist.

Instead:

"The available data shows coffee sales declined,

but it does not establish the reason."

---

# **52\. Agent Evaluation**

Evaluate the agent on:

Correct tool selection

Correct numerical interpretation

Evidence grounding

Reasoning quality

Recommendation relevance

Uncertainty handling

Output schema compliance

Failure handling

Do not judge the agent solely by conversational fluency.

---

# **53\. Milestone 1 Definition of Done**

The Outlet Performance Agent is complete when it can:

* Receive an outlet analysis request.  
* Identify the relevant outlet and period.  
* Retrieve core performance metrics.  
* Compare performance against a defined benchmark.  
* Analyze trends.  
* Identify meaningful performance changes.  
* Conditionally investigate product/category performance.  
* Produce evidence-backed findings.  
* Generate grounded recommendations.  
* Distinguish facts from hypotheses.  
* Handle insufficient data.  
* Return structured output.  
* Provide information suitable for frontend visualization.  
* Handle tool failures safely.  
* Avoid fabricated business facts.  
* Demonstrate genuine tool-based agentic behavior.

---

# **54\. Golden Rules**

1. **Analyze before recommending.**  
2. **Use tools to obtain evidence.**  
3. **Never invent business data.**  
4. **Never let the LLM calculate authoritative metrics.**  
5. **Separate facts from interpretations and hypotheses.**  
6. **Compare outlets using an explicit benchmark population.**  
7. **Consider both absolute and relative performance.**  
8. **Investigate deeper only when evidence justifies it.**  
9. **Recommendations must be traceable to findings.**  
10. **Do not claim causation without evidence.**  
11. **Handle missing data explicitly.**  
12. **Preserve valid partial results.**  
13. **Return structured output for the frontend.**  
14. **Keep scoring deterministic.**  
15. **Do not invent scoring weights or thresholds.**  
16. **Do not implement unrelated agents during Milestone 1\.**  
17. **The agent must actually use tools and adapt its investigation.**  
18. **Do not confuse a chatbot response with agentic behavior.**  
19. **Prefer a small reliable agent over an unnecessarily complex multi-agent system.**  
20. **Every important conclusion should have an evidence trail.**

