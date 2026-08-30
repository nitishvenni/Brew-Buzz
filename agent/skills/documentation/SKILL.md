# **`performance/SKILL.md`**

1. \---  
2. name: brew-buzz-performance  
3. description: Defines performance engineering standards for Brew Buzz across the React frontend, FastAPI backend, PostgreSQL database, analytics services, Agentic AI workflows, Docker environment, APIs, and background processing. Use this skill when implementing, reviewing, optimizing, or troubleshooting Brew Buzz performance.  
4. \---  
5.   
6. \# Brew Buzz — Performance Skill  
7.   
8. \#\# 1\. Purpose  
9.   
10. Brew Buzz combines:  
11.   
12. \- React frontend  
13. \- FastAPI backend  
14. \- PostgreSQL  
15. \- Analytics services  
16. \- Agentic AI  
17. \- Docker  
18. \- External AI APIs  
19.   
20. Performance must therefore be considered across the entire system.  
21.   
22. The objective is:  
23.   
24. \`\`\`text  
25. Fast UI  
26.    ↓  
27. Efficient API  
28.    ↓  
29. Efficient business logic  
30.    ↓  
31. Efficient database queries  
32.    ↓  
    Efficient agent/tool execution

Do not optimize one layer while unnecessarily making another layer slower.

---

# **2\. Core Principle**

Do not optimize based on assumptions.

Before making a performance optimization:

33. Identify bottleneck  
34.       ↓  
35. Measure  
36.       ↓  
37. Optimize  
38.       ↓  
    Measure again

Do not introduce complexity merely because it is theoretically faster.

---

# **3\. Performance Priorities**

Prioritize:

39. 1\. Correctness  
40. 2\. Reliability  
41. 3\. Security  
42. 4\. User-perceived performance  
43. 5\. Backend performance  
44. 6\. Database performance  
45. 7\. AI efficiency  
    8\. Infrastructure optimization

Never sacrifice correctness to gain a small performance improvement.

---

# **4\. User-Perceived Performance**

The user should receive useful feedback quickly.

For long-running operations:

46. Loading  
47. Analyzing  
48. Processing  
49. Completed  
    Failed

should be represented clearly.

Never leave the UI appearing frozen while the backend is working.

---

# **5\. Frontend Performance**

React should avoid unnecessary rendering.

Components should:

* Keep state as local as practical.  
* Avoid unnecessary global state.  
* Avoid expensive calculations during every render.  
* Avoid repeatedly fetching identical data.  
* Render only the information required by the current view.  
  ---

  # **6\. Component Design**

Prefer focused components.

Avoid creating a single massive dashboard component containing:

50. Data fetching  
51. Business calculations  
52. Charts  
53. Tables  
54. Agent state  
55. Navigation  
    Formatting

Separate responsibilities where practical.

---

# **7\. API Requests**

Do not make duplicate API requests for the same data.

Bad pattern:

56. Dashboard  
57.  ├── request performance  
58.  ├── request performance  
     └── request performance

Prefer centralized data-fetching logic.

---

# **8\. Request Waterfalls**

Avoid unnecessary sequential requests.

Bad:

59. Request A  
60.    ↓  
61. Request B  
62.    ↓  
    Request C

when B and C do not depend on A.

Prefer parallel requests where appropriate:

63. Request A ─┐  
64. Request B ─┼→ Dashboard  
    Request C ─┘

Do not parallelize requests that genuinely depend on one another.

---

# **9\. API Payload Size**

Return only the data required by the client.

Avoid:

65. Database  
66.  ↓  
67. Entire dataset  
68.  ↓  
    Frontend

when the screen only needs aggregated metrics.

---

# **10\. Pagination**

Large datasets must not be loaded completely into the browser.

Use pagination for potentially large collections.

Example:

/api/v1/outlets?page=1\&page\_size=25

---

# **11\. Backend Performance**

FastAPI endpoints should remain lightweight.

Prefer:

69. Router  
70.  ↓  
71. Service  
72.  ↓  
    Repository

Do not place expensive computation directly inside route handlers when it can be isolated.

---

# **12\. Blocking Operations**

Avoid blocking the API event loop with expensive synchronous operations.

Examples that may require special handling:

73. Large data processing  
74. Long-running AI calls  
75. Large file processing  
    Expensive computations

Use appropriate asynchronous/background mechanisms where justified.

---

# **13\. Async Does Not Automatically Mean Faster**

Do not convert everything to async merely for appearance.

Async is useful when operations spend significant time waiting on I/O.

CPU-heavy work may require a different strategy.

---

# **14\. Database Performance**

PostgreSQL is a critical performance boundary.

Avoid:

SELECT \*

when only a few fields are required.

Prefer selecting required columns.

---

# **15\. Database Indexes**

Create indexes for frequently queried fields.

Potential examples:

76. outlet\_id  
77. date  
    category

The actual indexes must be based on real query patterns.

Do not create indexes for every column.

---

# **16\. Index Trade-offs**

Indexes improve reads but add:

78. Storage  
79. Write overhead  
    Maintenance cost

Therefore:

80. Frequently filtered column  
81. \+  
82. Meaningful query frequency  
83. \=  
    Potential index  
    ---

    # **17\. Query Performance**

Avoid unnecessary database queries.

Bad:

84. For each outlet:  
        query database

when the same result can be retrieved using a single query.

This is a common N+1 query problem.

---

# **18\. N+1 Query Prevention**

Prefer:

One optimized query

over:

85. 1 query  
86. \+  
    N additional queries

where possible.

---

# **19\. Aggregation**

Business metrics should preferably be calculated close to the data layer when appropriate.

For example:

87. SUM(revenue)  
88. AVG(order\_value)  
    COUNT(orders)

can often be calculated efficiently in PostgreSQL rather than transferring every raw record to Python.

---

# **20\. Do Not Over-Aggregate**

However, do not move every calculation into SQL automatically.

Complex business logic may belong in the service layer.

Choose the layer based on:

89. Data volume  
90. Query efficiency  
91. Maintainability  
92. Reusability  
    Correctness  
    ---

    # **21\. Query Inspection**

When a query becomes performance-sensitive, inspect its execution plan.

Use PostgreSQL tools such as:

93. EXPLAIN  
    EXPLAIN ANALYZE

when appropriate.

Do not optimize queries blindly.

---

# **22\. Database Connection Management**

Use a controlled database connection/pool strategy.

Do not create a new uncontrolled database connection for every request.

---

# **23\. Connection Pooling**

Use connection pooling appropriate to the deployment environment.

The pool size should not be arbitrarily large.

Too many database connections can reduce performance rather than improve it.

---

# **24\. Transactions**

Keep transactions appropriately scoped.

Avoid holding a transaction open while performing:

94. LLM requests  
95. External API calls  
96. Long computations  
    User interaction

A database transaction should not remain open while waiting for an external AI provider.

---

# **25\. Caching**

Caching may be used when data is:

97. Frequently requested  
98. Relatively stable  
    Expensive to compute

Potential candidates:

99. Aggregated metrics  
100. Reference data  
101. Stable configuration  
     Repeated analytics results  
     ---

     # **26\. Cache Invalidation**

Do not introduce caching without considering invalidation.

Ask:

When does this data become stale?

If that question has no clear answer, avoid unnecessary caching.

---

# **27\. AI Cost and Latency**

LLM calls can be significantly slower and more expensive than normal application operations.

Therefore:

Do not call the LLM when deterministic code can answer the question.

---

# **28\. Deterministic First**

Example:

"What was revenue last month?"

should be answered from database/analytics data.

The LLM is useful for:

"What does this performance pattern mean?"

not for retrieving a number that PostgreSQL can provide directly.

---

# **29\. Agent Tool Efficiency**

The agent should use the minimum tools necessary.

Bad:

102. Question  
103.  ↓  
104. Tool A  
105.  ↓  
106. Tool B  
107.  ↓  
108. Tool C  
109.  ↓  
     Tool D

when only Tool A is needed.

---

# **30\. Tool Result Size**

Agent tools should return focused results.

Avoid sending huge raw datasets to the LLM when an aggregate can answer the question.

Prefer:

110. Revenue:  
111. Current \= ₹900,000  
112. Previous \= ₹1,000,000  
     Change \= \-10%

over sending thousands of raw transactions.

---

# **31\. LLM Context Size**

Keep agent context focused.

Do not include:

113. Entire database  
114. Entire application documentation  
115. Unrelated outlet data  
     Unrelated historical records

in every agent request.

---

# **32\. Context Selection**

Provide only information relevant to:

116. Current user request  
117. Authorized outlet  
118. Relevant period  
119. Required metrics  
     Required tool results  
     ---

     # **33\. Repeated AI Calls**

Avoid calling the LLM repeatedly for the same unchanged input.

If caching agent results is introduced, define:

120. Input identity  
121. Data freshness  
122. Model version  
123. Prompt version  
     Expiration

before implementation.

---

# **34\. AI Retry Policy**

AI retries must be limited.

Do not create:

124. Failure  
125.  ↓  
126. Retry  
127.  ↓  
128. Retry  
129.  ↓  
130. Retry  
131.  ↓  
     Retry indefinitely

Use bounded retries.

---

# **35\. Expensive Operations**

Potentially expensive operations should be identified explicitly.

Examples:

132. Large analytics queries  
133. LLM requests  
134. Complex calculations  
     Large dataset processing  
     ---

     # **36\. Long-Running Agent Tasks**

If analysis becomes long-running:

135. POST /analysis  
136.       ↓  
137. analysis\_id  
138.       ↓  
139. background execution  
140.       ↓  
     GET /analysis/{analysis\_id}

may be preferable to holding a request open indefinitely.

Use this only when actual execution time justifies it.

---

# **37\. Loading States**

Every potentially slow UI operation should have an appropriate loading state.

Examples:

141. Loading dashboard  
142. Loading outlet  
143. Running analysis  
     Generating recommendations  
     ---

     # **38\. Error States**

Performance optimization must not hide failures.

If a request times out:

144. Timeout  
145.  ↓  
     Clear error state

not:

Infinite spinner

---

# **39\. Skeleton UI**

Skeleton loading states may be used for dashboards and data-heavy screens when they improve perceived performance.

Do not use excessive animation.

---

# **40\. Charts**

Charts can become expensive when rendering large datasets.

Prefer:

Aggregated trend data

rather than rendering thousands of unnecessary points.

---

# **41\. Dashboard Data**

The dashboard should request metrics appropriate for the current screen.

Example:

146. Revenue  
147. Orders  
148. AOV  
149. Growth  
     Top categories

Do not fetch unrelated detailed transaction records merely because they are available.

---

# **42\. Image and Asset Performance**

Frontend assets should be appropriately sized.

Avoid loading:

150. Huge images  
151. Unused assets  
     Duplicate assets  
     ---

     # **43\. Lazy Loading**

Use lazy loading for heavy features when appropriate.

Potential examples:

152. Advanced analytics  
153. Large charts  
     Detailed reports

Do not lazy-load tiny components where the complexity outweighs the benefit.

---

# **44\. Bundle Size**

Keep frontend dependencies intentional.

Before adding a large library, consider whether existing capabilities are sufficient.

Do not add multiple libraries that solve the same problem.

---

# **45\. Dependency Discipline**

Avoid unnecessary dependencies.

Every dependency adds:

154. Bundle size  
155. Maintenance  
156. Security surface  
     Build complexity  
     ---

     # **46\. Docker Performance**

Docker development should remain efficient.

Avoid unnecessarily large images.

Use:

157. Appropriate base images  
158. Dependency caching  
     Multi-stage builds when useful

where appropriate.

---

# **47\. Docker Development**

Development containers should not unnecessarily rebuild the entire application after every source change.

Use appropriate volume/watch configurations.

---

# **48\. Production Docker Images**

Production images should contain only what is required to run the service.

Do not ship unnecessary:

159. Development tools  
160. Source caches  
161. Temporary files  
     Secrets  
     ---

     # **49\. Environment Variables**

Performance configuration must remain environment-specific.

Examples:

162. Database pool size  
163. Worker count  
164. Cache settings  
     AI timeout

should not be blindly hardcoded.

---

# **50\. Logging Performance**

Logging should be useful without overwhelming the system.

Avoid logging enormous payloads for every request.

Never log:

165. API keys  
166. Passwords  
167. Tokens  
168. Secrets  
     Sensitive data  
     ---

     # **51\. Request Logging**

Useful request information may include:

169. request\_id  
170. endpoint  
171. method  
172. status  
     duration

where appropriate.

---

# **52\. Performance Measurement**

Track meaningful measurements such as:

173. API response time  
174. Database query duration  
175. Agent execution duration  
176. LLM latency  
     Frontend load performance

Do not invent performance numbers.

---

# **53\. Percentiles**

Average latency can hide slow requests.

Where performance monitoring is implemented, consider:

177. p50  
178. p95  
     p99

especially for user-facing APIs.

---

# **54\. Performance Budgets**

When practical, define reasonable budgets.

For example:

179. Normal API → fast response  
     AI analysis → explicitly treated as long-running

Do not set arbitrary numbers before understanding the actual workflow.

---

# **55\. Health Checks**

Services should provide lightweight health checks where appropriate.

A health endpoint should not perform expensive business analysis.

Example:

GET /health

---

# **56\. Health vs Readiness**

Where infrastructure requires it, distinguish:

180. Liveness  
     Readiness

A service being alive does not necessarily mean it is ready to serve traffic.

---

# **57\. External AI Provider**

External AI requests should have:

181. Timeout  
182. Bounded retry  
183. Error handling  
     Rate-limit handling  
     ---

     # **58\. Rate Limits**

Respect external provider rate limits.

Do not create uncontrolled concurrent LLM requests.

---

# **59\. Concurrency**

Concurrency should be controlled.

More parallel operations do not automatically mean better performance.

Excessive concurrency can overwhelm:

184. Database  
185. LLM provider  
186. CPU  
187. Memory  
     Network  
     ---

     # **60\. Background Jobs**

Use background workers only when they solve a real problem.

Potential use:

188. Long-running analysis  
189. Scheduled analytics  
     Large data processing

Do not introduce a job queue into Milestone 1 without a clear requirement.

---

# **61\. Premature Optimization**

Do not implement:

190. Redis  
191. Complex distributed queues  
192. Microservices  
193. Kubernetes  
     Advanced event streaming

merely because they can improve performance at scale.

Brew Buzz should begin with a simple architecture.

---

# **62\. Monolith First**

The initial Brew Buzz backend should preferably remain a well-structured modular service.

Conceptually:

194. FastAPI  
195. ├── API  
196. ├── Services  
197. ├── Analytics  
198. ├── Agent  
199. ├── Tools  
     └── Database

Do not split into microservices without evidence that it is necessary.

---

# **63\. Performance vs Complexity**

Every optimization has a cost.

Before introducing infrastructure, consider:

200. Performance improvement  
201. vs  
202. Implementation complexity  
203. vs  
     Maintenance cost

Choose the simplest solution that solves the measured problem.

---

# **64\. Performance Testing**

Test important workflows with realistic data volumes.

Examples:

204. Dashboard loading  
205. Outlet performance query  
206. Trend query  
207. Benchmark query  
     Agent analysis  
     ---

     # **65\. Realistic Dataset Size**

Do not test only with:

10 rows

if the intended application will process substantially more data.

Create representative test datasets.

---

# **66\. Database Load Testing**

When appropriate, test:

208. Concurrent requests  
209. Large date ranges  
210. Multiple outlets  
     Large transaction counts  
     ---

     # **67\. Agent Performance Testing**

Measure:

211. Tool count  
212. Tool execution time  
213. LLM latency  
214. Total analysis duration  
     Failure/retry count  
     ---

     # **68\. Agent Quality vs Speed**

Do not optimize the agent by simply removing context.

The goal is:

Minimum sufficient context

not:

Minimum possible context

---

# **69\. Performance Regression**

When performance-sensitive code changes:

215. Before  
216.  ↓  
217. Measure  
218.  ↓  
219. Change  
220.  ↓  
221. Measure  
222.  ↓  
     Compare

A feature that is functionally correct but significantly slower should be investigated.

---

# **70\. Memory Usage**

Avoid loading unnecessarily large datasets into Python memory.

Prefer:

223. Database aggregation  
224. Streaming  
225. Pagination  
     Chunking

where appropriate.

---

# **71\. Large Exports**

If large exports are introduced later, do not load the entire dataset into memory unnecessarily.

Use streaming or chunked processing where appropriate.

---

# **72\. Frontend Memory**

Avoid retaining large datasets indefinitely in client state.

Clear or replace obsolete data when appropriate.

---

# **73\. Network Efficiency**

Avoid repeatedly transferring identical data.

Potential techniques:

226. Caching  
227. Conditional requests  
228. Pagination  
     Aggregation

should be introduced only when justified.

---

# **74\. API Compression**

Compression may be enabled at the infrastructure layer for sufficiently large responses.

Do not manually compress every response in application code.

---

# **75\. Database Data Types**

Choose appropriate PostgreSQL types.

Avoid storing numeric business metrics as strings merely for convenience.

Correct types improve:

229. Querying  
230. Sorting  
231. Aggregation  
     Storage efficiency  
     ---

     # **76\. Database Schema Design**

Do not denormalize purely for hypothetical performance.

First create a clear schema.

Denormalization should be introduced when:

232. Measured query workload  
233. \+  
     Clear performance benefit

justifies it.

---

# **77\. Materialized Views**

Materialized views may be considered later for expensive repeated analytics.

Do not introduce them during early development unless there is a demonstrated need.

---

# **78\. Precomputation**

Precompute expensive metrics only when:

234. Computation is expensive  
235. Data changes predictably  
     Results are requested frequently  
     ---

     # **79\. Performance Monitoring**

Production monitoring should eventually identify:

236. Slow endpoints  
237. Slow database queries  
238. AI latency  
239. Error rates  
     Resource usage

Do not build a complex monitoring stack before it is needed.

---

# **80\. Performance Debugging**

When the application is slow:

1. Reproduce the issue.  
2. Measure frontend timing.  
3. Measure API timing.  
4. Measure database timing.  
5. Measure external AI timing.  
6. Identify the slowest component.  
7. Optimize that component.  
8. Verify the improvement.

Do not randomly optimize unrelated code.

---

# **81\. Performance Definition of Done**

A performance-sensitive feature is complete when:

* It does not make unnecessary API calls.  
* Database queries are appropriate.  
* Large datasets are paginated or aggregated.  
* Expensive operations have loading states.  
* Timeouts are handled.  
* AI calls are bounded.  
* No unnecessary infrastructure was introduced.  
* Performance has been measured where the feature is performance-sensitive.  
* No correctness or security behavior was sacrificed.  
  ---

  # **82\. Milestone 1 Performance Scope**

Milestone 1 should prioritize:

240. 1\. Efficient PostgreSQL queries  
241. 2\. Basic indexes  
242. 3\. Reasonable API payloads  
243. 4\. No duplicate frontend requests  
244. 5\. Proper loading/error states  
245. 6\. Efficient analytics queries  
246. 7\. Controlled agent tool calls  
     8\. AI timeout/retry handling

Do not implement advanced distributed performance infrastructure yet.

---

# **83\. Golden Rules**

1. **Measure before optimizing.**  
2. **Correctness comes before speed.**  
3. **Do not optimize hypothetical bottlenecks.**  
4. **Avoid N+1 queries.**  
5. **Do not fetch data the UI does not need.**  
6. **Do not send unnecessary data to the LLM.**  
7. **Use deterministic calculations whenever possible.**  
8. **Keep AI retries bounded.**  
9. **Do not hold database transactions during LLM calls.**  
10. **Do not introduce Redis, queues, microservices, or Kubernetes prematurely.**  
11. **Use indexes based on real query patterns.**  
12. **Keep loading states explicit.**  
13. **Never hide failures behind infinite loading indicators.**  
14. **Control concurrency.**  
15. **Optimize the actual bottleneck.**  
16. **Prefer simple architecture until scale proves otherwise.**  
17. **Performance improvements must not weaken security.**  
18. **Performance improvements must not weaken AI grounding or correctness.**  
19. **Every significant optimization should be measurable.**  
20. **The fastest system is not automatically the best system—the best system is fast enough, reliable, correct, maintainable, and appropriately simple.**