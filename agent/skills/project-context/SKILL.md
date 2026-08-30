\---  
name: brew-buzz-project-context  
description: Core project context and non-negotiable development rules for the Brew Buzz Agentic AI Franchise Operations Intelligence Platform. Use this skill whenever working on any part of the Brew Buzz project.  
\---

\# Brew Buzz — Project Context Skill

\#\# 1\. Purpose

You are developing \*\*Brew Buzz\*\*, an Agentic AI-powered Franchise Operations Intelligence Platform for a fictional \*\*Pizza \+ Coffee franchise\*\*.

Brew Buzz is designed to help franchise owners, franchise managers, and outlet managers understand and improve franchise operations using centralized data, analytics, specialized AI agents, dashboards, alerts, and recommendations.

This file provides the global context and rules that apply to the entire project.

Before implementing any major feature, understand and follow this skill together with the specialized skill relevant to the feature being developed.

\---

\# 2\. Product Vision

Brew Buzz should evolve from a traditional franchise dashboard into an intelligent operational decision-support system.

The system should progressively follow this pattern:

Observe  
→ Analyze  
→ Detect  
→ Explain  
→ Recommend  
→ Act / Escalate

The objective is not merely to display business data.

The objective is to help management understand:

1\. What happened?  
2\. Why did it happen?  
3\. What is likely to happen next?  
4\. What should management do about it?

\---

\# 3\. Business Domain

Brew Buzz is a fictional Pizza \+ Coffee franchise.

Example product categories include:

\- Pizza  
\- Coffee  
\- Cold beverages  
\- Desserts  
\- Snacks  
\- Combos

The franchise operates multiple outlets.

Each outlet may have:

\- Location information  
\- Sales  
\- Orders  
\- Products  
\- Inventory  
\- Staff  
\- Marketing activity  
\- Operational/audit information

The system should support both:

\- Individual outlet analysis  
\- Overall franchise analysis

\---

\# 4\. Primary Users

\#\# Franchise Owner

Needs high-level visibility into:

\- Overall franchise health  
\- Outlet performance  
\- Revenue  
\- Growth  
\- Risks  
\- Opportunities  
\- Strategic recommendations

\#\# Franchise Manager

Needs operational visibility into:

\- Outlet performance  
\- Inventory  
\- Workforce  
\- Marketing  
\- Operational issues  
\- Alerts  
\- Recommended actions

\#\# Outlet Manager

Needs outlet-specific information such as:

\- Revenue  
\- Orders  
\- Performance score  
\- Trends  
\- Operational issues  
\- Recommendations

\---

\# 5\. Overall Agent Ecosystem

The final platform is expected to contain specialized agents.

\#\# Outlet Performance Agent

Responsible for:

\- Outlet sales analysis  
\- Revenue trends  
\- Outlet benchmarking  
\- Performance scoring  
\- Underperformance detection  
\- Performance insights  
\- Recommendations

\#\# Inventory Agent

Responsible for:

\- Inventory monitoring  
\- Demand forecasting  
\- Stock-out detection  
\- Wastage analysis  
\- Replenishment recommendations

\#\# Staff Agent

Responsible for:

\- Workforce analysis  
\- Productivity analysis  
\- Attendance/scheduling analysis  
\- Staffing-gap detection  
\- Workforce recommendations

\#\# Marketing Agent

Responsible for:

\- Campaign analysis  
\- Customer engagement analysis  
\- Promotion effectiveness  
\- Marketing ROI  
\- Marketing recommendations

\#\# Audit Agent

Responsible for:

\- Operational compliance  
\- Franchise standards  
\- Policy violations  
\- Audit findings  
\- Corrective actions

\#\# Franchise Intelligence Engine

Responsible for:

\- Combining findings from specialized agents  
\- Overall franchise health  
\- Cross-domain risks  
\- Growth opportunities  
\- Strategic recommendations

Do NOT implement all agents when working on Milestone 1\.

Only implement functionality required by the current milestone.

\---

\# 6\. Current Development Priority

The current development target is:

\#\# Milestone 1 — Outlet Performance Intelligence

Milestone 1 focuses on:

\- Sales and outlet data  
\- Outlet performance analytics  
\- Revenue trends  
\- Outlet benchmarking  
\- Performance scoring  
\- Underperformer identification  
\- Outlet Performance Agent  
\- Performance dashboard

The initial implementation should establish a clean foundation that can later support the other agents.

Do not prematurely implement Inventory, Staff, Marketing, Audit, or the final Franchise Intelligence Engine unless explicitly requested.

\---

\# 7\. Technology Direction

The planned stack is:

\#\# Frontend

\- React  
\- Tailwind CSS  
\- Recharts

\#\# Backend

\- Python  
\- FastAPI  
\- SQLAlchemy

\#\# Database

\- PostgreSQL

\#\# Data / Analytics

\- Pandas  
\- NumPy  
\- Scikit-learn where appropriate  
\- Appropriate statistical/forecasting libraries when required

\#\# Agentic AI

\- LangGraph  
\- LLM API  
\- Tool/function calling  
\- Structured outputs

\#\# Development / Infrastructure

\- Git  
\- GitHub  
\- Docker  
\- Docker Compose

Do not introduce a new major technology or replace an existing technology without a clear technical reason and explicit approval.

\---

\# 8\. AI Engineering Principles

\#\# 8.1 Do not use an LLM for deterministic calculations

Calculations such as:

\- Revenue  
\- Order count  
\- Growth percentage  
\- Rankings  
\- Performance scores  
\- Aggregations  
\- Statistical metrics

should be calculated using reliable deterministic code or database queries.

The LLM should not be responsible for producing business numbers that can be calculated programmatically.

\---

\#\# 8.2 Use LLMs where language intelligence is useful

LLMs may be used for:

\- Explaining analytical results  
\- Summarizing findings  
\- Generating natural-language recommendations  
\- Converting structured findings into understandable business insights  
\- Reasoning over tool outputs  
\- Natural-language interaction with the system

\---

\#\# 8.3 Agents must use tools/data

An agent should not pretend to know live business information.

When an agent needs business data, it should obtain that data through defined tools, services, or database-backed operations.

Conceptually:

User  
→ Agent  
→ Tool  
→ Data / Analytics  
→ Agent  
→ Explanation / Recommendation

\---

\#\# 8.4 Preserve source-of-truth data

The database and deterministic analytical services are the source of truth for numerical business information.

LLM-generated explanations must be grounded in the actual analytical results.

\---

\# 9\. Software Architecture Principles

Keep major responsibilities separated.

Preferred conceptual architecture:

Frontend  
→ API  
→ Application Services  
→ Analytics / Agent Services  
→ Database

Do not place:

\- Database queries directly inside React components  
\- Business calculations directly inside UI components  
\- Complex agent logic directly inside API route handlers  
\- Secrets directly inside source code

Use appropriate layers and modules.

\---

\# 10\. Data Principles

The initial project will use synthetic/demo data unless actual franchise data is explicitly provided.

Synthetic data should be realistic enough to demonstrate:

\- Multiple outlets  
\- Different outlet sizes  
\- Different locations  
\- Different sales volumes  
\- Growth and decline  
\- High-performing outlets  
\- Underperforming outlets  
\- Product differences  
\- Seasonal behavior  
\- Potential anomalies

Data should be reproducible where practical.

Do not generate meaningless random numbers merely to populate charts.

The data should support realistic business scenarios and demonstrate the intelligence capabilities of Brew Buzz.

\---

\# 11\. Performance Intelligence Principles

Outlet performance should not depend on a single metric.

The system should be designed to consider multiple relevant indicators such as:

\- Revenue  
\- Revenue growth  
\- Order volume  
\- Average order value  
\- Performance relative to other outlets  
\- Performance consistency  
\- Relevant operational indicators

The exact scoring formula must be explicitly defined in the Outlet Performance skill before implementation.

Do not invent arbitrary scoring weights during implementation.

\---

\# 12\. UI Principles

The Brew Buzz application should prioritize:

\- Clear information hierarchy  
\- Business-oriented dashboards  
\- Readability  
\- Actionable insights  
\- Consistent components  
\- Responsive design  
\- Useful visualizations  
\- Minimal unnecessary decoration

Charts should answer meaningful business questions.

Do not add charts merely because charts look impressive.

The final marketing/landing-page experience is a separate future task and is NOT part of the current Milestone 1 implementation.

\---

\# 13\. Code Quality Rules

Generated code must be:

\- Readable  
\- Modular  
\- Maintainable  
\- Typed where appropriate  
\- Properly structured  
\- Testable

Avoid:

\- Huge files  
\- Giant functions  
\- Duplicate business logic  
\- Hardcoded secrets  
\- Hardcoded environment-specific configuration  
\- Unnecessary abstractions  
\- Dead code  
\- Unused dependencies

Prefer simple solutions when they are sufficient.

\---

\# 14\. Configuration and Secrets

Never hardcode:

\- API keys  
\- Database passwords  
\- JWT secrets  
\- Cloud credentials  
\- Other sensitive credentials

Use environment variables.

The repository should contain:

.env.example

but should NOT commit:

.env

The actual \`.env\` file is local to each developer/environment.

\---

\# 15\. Git and Collaboration

The project is developed collaboratively.

Use Git and GitHub.

Develop features through feature branches rather than directly modifying the main branch.

Conceptually:

main  
├── feature/database  
├── feature/outlet-performance  
├── feature/performance-agent  
├── feature/dashboard  
└── feature/testing

Keep commits focused and meaningful.

Do not overwrite another developer's work unnecessarily.

Before making broad structural changes, inspect the existing implementation.

\---

\# 16\. Antigravity Development Rules

When asked to implement a feature:

\#\#\# First

Inspect:

\- Existing project structure  
\- Relevant SKILL.md files  
\- Existing implementation  
\- Existing dependencies  
\- Existing configuration

\#\#\# Then

Determine the smallest correct implementation required.

\#\#\# Then

Implement incrementally.

\#\#\# Then

Run appropriate tests, type checks, linting, or validation.

\#\#\# Finally

Report:

\- What was changed  
\- Files changed  
\- Tests/checks performed  
\- Any remaining issues  
\- Any assumptions made

\---

\# 17\. Do Not Rewrite Existing Work Without Reason

If functionality already exists:

\- Reuse it when appropriate  
\- Extend it when appropriate  
\- Refactor only when necessary

Do not rewrite an entire module simply because another implementation is aesthetically preferable.

Preserve working functionality.

\---

\# 18\. Do Not Expand Scope Automatically

If the requested task is:

"Implement outlet performance scoring"

do NOT automatically implement:

\- Inventory  
\- Workforce  
\- Marketing  
\- Audit  
\- Authentication redesign  
\- Deployment infrastructure  
\- Landing page  
\- Unrelated UI redesign

Implement the requested scope and its necessary dependencies only.

\---

\# 19\. Handling Ambiguity

If an implementation detail is already defined by another project skill, follow that skill.

If it is not defined:

1\. Inspect the existing architecture.  
2\. Choose the simplest reasonable approach.  
3\. Avoid introducing unnecessary technologies.  
4\. Clearly report important assumptions.

Do not silently change major architecture decisions.

\---

\# 20\. Milestone Discipline

Brew Buzz will be developed incrementally.

The current milestone is the source of implementation scope.

Milestone completion requires working functionality, not merely generated code.

Before declaring a milestone complete:

\- Build the required functionality  
\- Validate the data flow  
\- Test the important paths  
\- Verify the UI  
\- Verify API behavior  
\- Verify agent behavior where applicable  
\- Fix obvious errors  
\- Confirm the feature works end-to-end

\---

\# 21\. Current State

Current project phase:

\*\*Specification → Architecture → Foundation\*\*

Current implementation target:

\*\*Milestone 1 — Outlet Performance Intelligence\*\*

Do not assume that later milestone functionality already exists.

\---

\# 22\. Golden Rule

When developing Brew Buzz, prioritize:

\*\*Correctness \> Reliability \> Maintainability \> Simplicity \> Visual polish\*\*

The system should work correctly before adding unnecessary complexity or visual effects.

The goal is to build a credible Agentic AI franchise operations platform, not merely a visually impressive demo.