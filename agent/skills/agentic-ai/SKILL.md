Absolutely. Continuing with the **skills only**.

# **`agentic-ai/SKILL.md`**

Create:

.agent/skills/agentic-ai/SKILL.md

This skill tells Antigravity **how Agentic AI must be implemented in Brew Buzz**—especially the boundary between deterministic analytics and AI reasoning.

\---

name: brew-buzz-agentic-ai

description: Defines the Agentic AI architecture, agent behavior, tool usage, state management, LLM integration, structured outputs, grounding, validation, and safety rules for Brew Buzz. Use this skill whenever implementing, modifying, testing, or reviewing AI agents or agentic workflows.

\---

\# Brew Buzz — Agentic AI Skill

\#\# 1\. Purpose

Brew Buzz is an Agentic AI business intelligence platform.

The AI system must do more than generate text.

Agents should be able to:

\- Understand a business objective

\- Inspect relevant business data through tools

\- Analyze the available evidence

\- Identify meaningful findings

\- Reason about possible causes

\- Determine what additional information may be required

\- Produce grounded recommendations

\- Explain the reasoning behind recommendations

\- Return structured results to the application

The AI must remain grounded in actual Brew Buzz data.

\---

\# 2\. Agentic AI Principle

The fundamental distinction is:

\`\`\`text

Traditional AI:

Input → Model → Output

Brew Buzz Agent:

Goal

 ↓

Perceive / Gather Data

 ↓

Reason

 ↓

Use Tools

 ↓

Analyze

 ↓

Evaluate Findings

 ↓

Decide Next Step

 ↓

Recommend Action

 ↓

Return Result

The agent must be able to interact with tools rather than relying exclusively on a single LLM response.

---

# **3\. What the LLM Does**

The LLM is responsible primarily for:

* Understanding natural-language business questions  
* Selecting appropriate tools  
* Interpreting structured analytical results  
* Connecting multiple findings  
* Generating explanations  
* Generating grounded recommendations  
* Communicating uncertainty

The LLM must NOT be treated as the authoritative source for:

* Revenue  
* Order count  
* AOV  
* Growth percentage  
* Rankings  
* Performance scores  
* Raw transaction facts

Those must come from deterministic systems.

---

# **4\. Deterministic vs AI Responsibilities**

Use this separation:

Database

→ Facts

Analytics

→ Calculations

Agent Tools

→ Controlled access to facts/calculations

Agent

→ Reasoning and orchestration

LLM

→ Language understanding and interpretation

Frontend

→ Visualization and interaction

This separation is mandatory.

---

# **5\. Agent Architecture**

The preferred conceptual architecture is:

                   ┌───────────────┐

                    │   User Goal   │

                    └───────┬───────┘

                            ↓

                    ┌───────────────┐

                    │     Agent     │

                    └───────┬───────┘

                            ↓

                   ┌────────────────┐

                   │ Tool Selection │

                   └───────┬────────┘

                           ↓

              ┌────────────────────────┐

              │   Brew Buzz Tools      │

              └───────────┬────────────┘

                          ↓

                 ┌─────────────────┐

                 │ Data / Analytics│

                 └────────┬────────┘

                          ↓

                    Tool Results

                          ↓

                    Agent Reasoning

                          ↓

                Findings / Recommendation

                          ↓

                 Structured Response

---

# **6\. Agent Framework**

If the project architecture specifies LangGraph, use LangGraph for stateful agent workflows.

Do not introduce a second agent orchestration framework without a clear reason.

LangGraph should be used where the workflow benefits from:

* State  
* Multiple steps  
* Tool calls  
* Conditional routing  
* Iterative reasoning  
* Human approval in future workflows  
* Persistent execution in future milestones

Do not use LangGraph merely to wrap a single LLM call.

---

# **7\. Agent Types**

The initial agentic system should be designed around specialized business agents.

Potential agents:

Outlet Performance Agent

Inventory Agent

Workforce Agent

Marketing Agent

Audit Agent

Manager / Orchestrator Agent

Milestone 1 should focus on the:

Outlet Performance Agent

Do not implement all future agents prematurely.

---

# **8\. Outlet Performance Agent**

The Outlet Performance Agent analyzes the performance of a Brew Buzz outlet.

Its objective is to answer questions such as:

How is this outlet performing?

What changed?

Is the change meaningful?

How does it compare with other outlets?

What areas require attention?

What could management investigate or improve?

The agent must base its conclusions on available evidence.

---

# **9\. Agent Input**

The agent may receive:

Outlet ID

Date range

Business question

Analysis objective

Example:

{

  "outlet\_id": 12,

  "start\_date": "2026-01-01",

  "end\_date": "2026-01-31",

  "objective": "Analyze outlet performance"

}

Natural-language questions may also be supported.

Example:

"Why did Outlet 12 perform poorly this month?"

---

# **10\. Agent State**

Agent state should contain only information required for the workflow.

Conceptually:

AgentState

├── user\_request

├── outlet\_id

├── date\_range

├── gathered\_metrics

├── benchmark\_data

├── findings

├── hypotheses

├── recommendations

├── tool\_history

├── data\_quality

└── final\_response

Do not place arbitrary application state into the agent state.

---

# **11\. State Should Be Structured**

Prefer structured state over passing large unstructured text between nodes.

Example:

{

    "revenue": 1250000,

    "growth\_rate": \-12.4,

    "aov": 297.15

}

is preferable to:

"The outlet made approximately 1.25 million rupees..."

Structured state improves:

* Reliability  
* Validation  
* Testing  
* Debugging  
* Tool interoperability

---

# **12\. Agent Tools**

Agents should interact with Brew Buzz through explicitly defined tools.

Examples:

get\_outlet\_metrics

get\_outlet\_trend

get\_outlet\_benchmark

get\_product\_performance

get\_sales\_breakdown

get\_outlet\_anomalies

Tool names should describe their purpose clearly.

Do not expose raw database access as an unrestricted agent tool.

---

# **13\. Tool Design**

Every tool should have:

* Clear name  
* Clear description  
* Typed inputs  
* Typed outputs  
* Defined error behavior  
* Limited scope

Example concept:

get\_outlet\_metrics(

    outlet\_id,

    start\_date,

    end\_date

)

Returns structured metrics.

The tool should not return unnecessary database fields.

---

# **14\. Tool Results**

Tool results should be structured.

Example:

{

  "outlet\_id": 12,

  "period": {

    "start": "2026-01-01",

    "end": "2026-01-31"

  },

  "revenue": 1250000,

  "order\_count": 4210,

  "aov": 297.15,

  "growth\_rate": \-12.4

}

Avoid returning raw SQL output directly to the LLM.

---

# **15\. Tool Access Boundary**

The agent must access business information through approved tools/services.

Preferred:

Agent

 ↓

Tool

 ↓

Service

 ↓

Repository

 ↓

PostgreSQL

Never:

Agent

 ↓

Arbitrary SQL

 ↓

Database

unless a future architecture explicitly introduces a tightly controlled read-only SQL tool with validation and security safeguards.

---

# **16\. Tool Selection**

The agent should choose tools based on the business question.

Example:

Question:

"How did this outlet perform?"

Tools:

→ get\_outlet\_metrics

→ get\_outlet\_benchmark

→ get\_outlet\_trend

Question:

"Which products caused the decline?"

Tools:

→ get\_outlet\_metrics

→ get\_product\_performance

→ get\_sales\_breakdown

Do not call every available tool for every question.

---

# **17\. Minimize Unnecessary Tool Calls**

The agent should gather enough evidence to answer the question without repeatedly requesting identical information.

Avoid:

Tool A

Tool A again

Tool A again

Tool B

Tool B again

Tool calls should be purposeful.

---

# **18\. Agent Reasoning**

The agent should reason over structured evidence.

Example:

Revenue:

\-12.4%

Orders:

\-3%

AOV:

\-9.7%

Peer benchmark:

\+4%

Coffee category:

\-18%

Possible reasoning:

Revenue declined significantly.

Order volume declined only modestly.

AOV declined substantially.

Coffee category also declined.

The outlet underperformed its peer group.

The recommendation should follow from these findings.

---

# **19\. No Fabricated Evidence**

The agent must never invent:

* Sales figures  
* Customer counts  
* Product performance  
* Competitor information  
* Reasons for decline  
* Business events  
* Operational incidents

If the data does not contain the information, say so.

---

# **20\. Facts vs Hypotheses**

The agent must distinguish:

### **Fact**

Directly supported by data.

Example:

Revenue declined by 12.4%.

### **Inference**

Reasonable interpretation of available evidence.

Example:

The decline appears to be driven more by lower order value than order volume.

### **Hypothesis**

Possible explanation requiring investigation.

Example:

A reduction in coffee-category demand may be contributing to the decline.

The agent must not present hypotheses as confirmed facts.

---

# **21\. Causal Reasoning**

The agent must be conservative about causality.

Bad:

Revenue declined because the coffee menu is bad.

Better:

Coffee sales declined 18% during the same period as the overall revenue decline. This may be a contributing factor, but the available data does not establish causation.

Use evidence before making causal claims.

---

# **22\. Agent Workflow**

The Outlet Performance Agent should conceptually follow:

1\. Understand request

       ↓

2\. Identify outlet and period

       ↓

3\. Gather core metrics

       ↓

4\. Gather benchmark

       ↓

5\. Examine trend

       ↓

6\. Identify significant findings

       ↓

7\. Gather additional data if needed

       ↓

8\. Form evidence-based interpretation

       ↓

9\. Generate recommendations

       ↓

10\. Validate response

       ↓

11\. Return structured result

The actual graph implementation may use fewer or more nodes where justified.

---

# **23\. Conditional Tool Usage**

Agent workflows should support conditional decisions.

Example:

Revenue decline detected?

        ↓

      YES

        ↓

Check product/category performance

        ↓

Significant category decline?

        ↓

      YES

        ↓

Investigate category trend

This demonstrates actual agentic behavior.

Do not build a workflow where every tool is always called in a fixed sequence if conditional reasoning provides meaningful value.

---

# **24\. Iterative Investigation**

The agent may perform additional investigation when initial findings indicate that more evidence is needed.

Example:

Initial analysis:

Revenue declining

       ↓

Agent determines:

Need category breakdown

       ↓

Tool call:

get\_product\_performance()

       ↓

New evidence:

Coffee sales down 18%

       ↓

Agent updates finding

This is an important part of the agentic architecture.

---

# **25\. Stop Conditions**

Agents must have clear termination conditions.

The workflow should stop when:

* Required evidence has been gathered  
* Findings are sufficiently supported  
* No useful additional tool call is available  
* The question cannot be answered with available data

Do not allow infinite tool-calling loops.

---

# **26\. Maximum Iterations**

Agent workflows should have a configurable maximum number of reasoning/tool iterations.

If the limit is reached:

Stop

 ↓

Return best-supported findings

 ↓

Clearly indicate limitations

Never continue indefinitely.

---

# **27\. Structured Output**

The final agent response should use a defined schema.

Conceptually:

{

  "outlet\_id": 12,

  "summary": "...",

  "performance\_score": 72,

  "findings": \[\],

  "recommendations": \[\],

  "confidence": "medium",

  "limitations": \[\]

}

The exact schema belongs to the backend/agent implementation.

---

# **28\. Finding Schema**

A finding should contain structured information.

Example:

{

  "metric": "revenue\_growth",

  "observation": "Revenue declined by 12.4%.",

  "severity": "medium",

  "evidence": {

    "current": 1250000,

    "previous": 1427000

  }

}

This allows the frontend to render findings independently from the LLM's prose.

---

# **29\. Recommendation Schema**

Recommendations should be structured.

Example:

{

  "recommendation": "Investigate the decline in coffee-category sales.",

  "reason": "Coffee sales declined 18% during the analysis period.",

  "priority": "high",

  "evidence": \[

    "Coffee category revenue declined 18%.",

    "Overall outlet revenue declined 12.4%."

  \]

}

Recommendations must remain grounded in findings.

---

# **30\. Recommendation Quality**

Recommendations should be:

* Specific  
* Actionable  
* Evidence-based  
* Proportionate to the problem

Avoid generic statements such as:

"Improve marketing."

"Increase sales."

"Focus on customers."

Prefer:

"Review coffee-category promotions and availability because coffee sales declined 18% while total outlet revenue declined 12.4%."

---

# **31\. Recommendation Uncertainty**

When evidence is insufficient, the agent should recommend investigation rather than pretending to know the answer.

Example:

"Investigate staffing and product availability data to determine whether operational constraints contributed to the decline."

This is preferable to asserting an unsupported cause.

---

# **32\. Confidence**

Agent conclusions may include a confidence indicator.

Possible values:

high

medium

low

Confidence must reflect evidence quality, not the LLM's subjective certainty alone.

For example:

High confidence:

Revenue declined 15%.

because the value is directly calculated.

Lower confidence:

A product availability issue may have contributed.

if inventory data is unavailable.

---

# **33\. Data Quality Awareness**

The agent must receive data-quality information when available.

Example:

{

  "status": "warning",

  "warnings": \[

    "Three days of transaction data are missing."

  \]

}

The agent should mention important limitations when they materially affect the conclusion.

---

# **34\. Missing Tool Data**

If a required tool fails:

Tool failure

 ↓

Agent recognizes missing evidence

 ↓

Do not fabricate replacement data

 ↓

Continue if possible

 ↓

Mention limitation

Example:

"Product-level analysis could not be completed because category sales data was unavailable."

---

# **35\. LLM Failure**

If the LLM fails:

* Do not fabricate an answer.  
* Preserve deterministic analytics where possible.  
* Return an explicit failure/partial-result state.  
* Log the failure appropriately.  
* Avoid exposing provider secrets or internal stack traces.

---

# **36\. Hallucination Prevention**

Use multiple safeguards:

1. Structured tool outputs  
2. Explicit system instructions  
3. Schema validation  
4. Evidence grounding  
5. Separation of facts and hypotheses  
6. Deterministic business calculations  
7. Tool-access boundaries  
8. Output validation

Do not rely on the prompt alone to prevent hallucinations.

---

# **37\. Prompt Design**

Agent prompts should clearly define:

* Role  
* Objective  
* Available tools  
* Data interpretation rules  
* Evidence requirements  
* Output schema  
* Uncertainty behavior  
* Prohibited behavior

Do not write giant prompts containing application logic that should live in code.

---

# **38\. System Prompt vs Code**

Use prompts for:

Reasoning behavior

Communication style

Evidence requirements

Agent objectives

Use code for:

Business calculations

Validation

Database access

Security

Permissions

Workflow limits

Deterministic rules

Do not move critical business rules entirely into an LLM prompt.

---

# **39\. Agent Memory**

Do not introduce persistent conversational memory unnecessarily.

For Milestone 1, the agent should primarily reason from:

Current Request

\+

Current Analysis Data

\+

Current Tool Results

Long-term memory can be introduced later if the project requires it.

---

# **40\. Conversation Context**

If conversational interactions are implemented, maintain only relevant context.

Example:

User:

"Why is Outlet 12 declining?"

Agent:

...

User:

"What about coffee?"

Agent:

The agent should understand that "coffee" refers to Outlet 12 and the relevant period when that context is available.

Do not retain irrelevant information indefinitely.

---

# **41\. Agent Observability**

Agent execution should be debuggable.

Capture appropriate metadata such as:

Agent name

Execution ID

Tools used

Execution duration

Success/failure

Important state transitions

Do not log secrets or unnecessarily sensitive data.

---

# **42\. Agent Execution IDs**

Agent runs should preferably have an execution identifier.

Example:

execution\_id

This helps connect:

API Request

 ↓

Agent Run

 ↓

Tool Calls

 ↓

Final Result

during debugging.

---

# **43\. Tool Execution Logging**

Useful metadata includes:

Tool name

Execution time

Success/failure

Avoid logging entire sensitive tool payloads unless necessary.

---

# **44\. Security**

Agents must operate within application permissions.

An agent must not:

* Access arbitrary files  
* Execute arbitrary shell commands  
* Execute unrestricted SQL  
* Expose secrets  
* Modify production data without explicit authorization  
* Invent permissions

Tool capabilities must be explicitly defined.

---

# **45\. Read vs Write Tools**

Milestone 1 should primarily use **read-only tools**.

Example:

get\_outlet\_metrics

get\_outlet\_trend

get\_outlet\_benchmark

Write operations should not be exposed to the agent unless a later milestone explicitly requires them.

This minimizes unintended side effects.

---

# **46\. Human Approval**

Future action-taking agents may require human approval.

Conceptually:

Agent Recommendation

       ↓

Human Review

       ↓

Approve / Reject

       ↓

Action

Do not automatically execute high-impact business actions from an LLM.

Milestone 1 should focus on analysis and recommendations.

---

# **47\. Multi-Agent Architecture**

Do not create a multi-agent system simply because the project is called Agentic AI.

Start with specialized agents.

For Milestone 1:

Outlet Performance Agent

Later:

Manager / Orchestrator

        ↓

 ┌──────┼────────┬─────────┐

 ↓      ↓        ↓         ↓

Outlet Inventory Workforce Marketing

Agent   Agent     Agent     Agent

Introduce orchestration only when multiple specialized agents provide actual value.

---

# **48\. Agent-to-Agent Communication**

If multiple agents are introduced later, communication should use structured messages/results.

Avoid passing large uncontrolled natural-language transcripts between agents.

Prefer:

{

  "finding\_type": "inventory\_risk",

  "severity": "high",

  "evidence": \[\]

}

---

# **49\. Agent Testing**

Agent testing should include:

### **Tool tests**

Verify tools return correct data.

### **Workflow tests**

Verify the agent selects appropriate tools and reaches expected states.

### **Output tests**

Verify structured output conforms to schema.

### **Grounding tests**

Verify unsupported claims are not produced.

### **Failure tests**

Verify tool/LLM failures are handled safely.

---

# **50\. Deterministic Agent Tests**

Where possible, mock the LLM and test:

Tool selection

State transitions

Conditional routing

Validation

Error handling

This makes tests reproducible.

---

# **51\. LLM Evaluation**

When using a real LLM, evaluate:

* Factual grounding  
* Recommendation relevance  
* Correct tool usage  
* Unsupported claims  
* Output schema compliance  
* Handling of missing data  
* Explanation quality

Do not evaluate the agent only by whether the final response "sounds good."

---

# **52\. Agent Performance**

Track useful execution metrics:

Tool calls per run

Execution time

LLM calls

Token usage where available

Failure rate

Validation failures

Optimization should focus on reliability and useful reasoning rather than minimizing every token.

---

# **53\. Cost Awareness**

LLM calls have cost and latency.

Prefer:

Deterministic calculation

        ↓

Relevant evidence

        ↓

LLM interpretation

rather than sending large raw datasets to the LLM.

Do not send entire database tables to the model when a summarized analytical result is sufficient.

---

# **54\. Context Size**

Provide the LLM only the information necessary for the current reasoning task.

Prefer:

Revenue: \-12.4%

Orders: \-3%

AOV: \-9.7%

Benchmark growth: \+4%

over thousands of raw transaction rows when those rows are not required.

---

# **55\. Agentic AI vs Chatbot**

Brew Buzz must not be implemented as merely:

User Question

 ↓

LLM

 ↓

Text Answer

That is a chatbot.

The intended architecture is:

User Goal

 ↓

Agent

 ↓

Tool Selection

 ↓

Business Data

 ↓

Analysis

 ↓

Reasoning

 ↓

Additional Investigation if Required

 ↓

Grounded Recommendation

The agent's ability to **act on the environment through tools and adapt its workflow** is central to the project.

---

# **56\. Milestone 1 Agentic Workflow**

The initial Outlet Performance Agent should be capable of:

User selects outlet

        ↓

Agent receives objective

        ↓

Get core performance metrics

        ↓

Compare against benchmark

        ↓

Inspect trend

        ↓

Detect meaningful issue

        ↓

Conditionally inspect supporting data

        ↓

Generate evidence-based findings

        ↓

Generate recommendations

        ↓

Return structured analysis

This is the minimum meaningful agentic workflow.

---

# **57\. Example**

User:

"Why is Outlet 12 underperforming?"

Agent:

1\. Identify Outlet 12

2\. Retrieve current metrics

3\. Retrieve comparison metrics

4\. Detect revenue decline

5\. Compare with peer outlets

6\. Detect AOV decline

7\. Request product/category breakdown

8\. Detect coffee-category decline

9\. Form evidence-based finding

10\. Recommend investigation

The agent should not simply produce a generic answer from its pretrained knowledge.

---

# **58\. Grounded Final Response**

A final response should distinguish:

### **Summary**

What happened.

### **Evidence**

What the data shows.

### **Interpretation**

What the evidence may indicate.

### **Recommendations**

What management could investigate or do.

### **Limitations**

What the available data cannot establish.

Example:

Summary:

Outlet 12 underperformed its peer group.

Evidence:

Revenue declined 12.4%.

AOV declined 9.7%.

Coffee sales declined 18%.

Interpretation:

The decline appears more strongly associated with lower order value than order volume.

Recommendation:

Investigate coffee-category availability, pricing, and promotions.

Limitation:

The available data does not establish the exact cause.

---

# **59\. Golden Rules**

1. **The database is the source of truth.**  
2. **Analytics calculates business numbers.**  
3. **Agents reason over evidence.**  
4. **LLMs do not invent facts.**  
5. **Tools provide controlled access to business data.**  
6. **Use structured state.**  
7. **Use structured outputs.**  
8. **Separate facts, inferences, and hypotheses.**  
9. **Do not claim causation without evidence.**  
10. **Do not expose unrestricted database access to agents.**  
11. **Prefer read-only tools for Milestone 1\.**  
12. **Prevent infinite tool loops.**  
13. **Handle missing data explicitly.**  
14. **Handle LLM/tool failures safely.**  
15. **Do not build unnecessary multi-agent complexity.**  
16. **Keep deterministic logic outside the LLM.**  
17. **Recommendations must be grounded in findings.**  
18. **The agent must demonstrate actual tool-based reasoning, not merely text generation.**  
19. **Do not implement future agent capabilities before they are required.**  
20. **Reliability is more important than making the agent appear autonomous.**

\#\#\# Skill structure so far

\`\`\`text

.agent/

└── skills/

    ├── project-context/

    │   └── SKILL.md

    │

    ├── architecture/

    │   └── SKILL.md

    │

    ├── database/

    │   └── SKILL.md

    │

    ├── backend/

    │   └── SKILL.md

    │

    ├── data-analytics/

    │   └── SKILL.md

    │

    └── agentic-ai/

        └── SKILL.md       ✅

The next important skill should be **`outlet-performance/SKILL.md`**. That will be more specific than the general Agentic AI skill and define **exactly what the Milestone 1 Outlet Performance Agent must accomplish, its metrics, investigation workflow, findings, scoring, and recommendation behavior**.

