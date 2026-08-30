# **`api-contracts/SKILL.md`**

1. \---  
2. name: brew-buzz-api-contracts  
3. description: Defines API contract standards for Brew Buzz, including REST endpoint design, request and response schemas, validation, errors, pagination, filtering, authentication context, frontend-backend communication, analytics APIs, agent APIs, versioning, and contract consistency. Use this skill whenever creating, modifying, integrating, or reviewing Brew Buzz APIs.  
4. \---  
5.   
6. \# Brew Buzz — API Contracts Skill  
7.   
8. \#\# 1\. Purpose  
9.   
10. This skill defines how the different Brew Buzz components communicate.  
11.   
12. The primary communication flow is:  
13.   
14. Frontend  
15.     ↓  
16. FastAPI Backend  
17.     ↓  
18. Business / Analytics Services  
19.     ↓  
20. PostgreSQL  
21.   
22. For Agentic AI workflows:  
23.   
24. Frontend  
25.     ↓  
26. FastAPI Backend  
27.     ↓  
28. Agent Orchestrator  
29.     ↓  
30. Agent Tools  
31.     ↓  
32. Analytics / Database  
33.     ↓  
34. Agent Response  
35.     ↓  
36. Frontend  
37.   
38. Every boundary must have a clearly defined contract.  
39.   
40. \---  
41.   
42. \# 2\. Core Principle  
43.   
44. An API contract defines:  
45.   
46. \- What the client sends.  
47. \- What the server receives.  
48. \- What the server returns.  
49. \- What errors can occur.  
50. \- What authentication is required.  
51. \- What data types are expected.  
52.   
53. Do not allow frontend and backend developers to independently invent request and response formats.  
54.   
55. \---  
56.   
57. \# 3\. Single Source of Truth  
58.   
59. API schemas should have one authoritative definition.  
60.   
61. If the backend defines:  
62.   
63. \`\`\`text  
    revenue: number

the frontend must not independently assume:

revenue: string

unless an explicit serialization rule requires it.

---

# **4\. REST Principles**

Use clear REST-style endpoints.

Examples:

64. GET    /api/v1/outlets  
65. GET    /api/v1/outlets/{outlet\_id}  
66. GET    /api/v1/performance  
    POST   /api/v1/analysis

Use HTTP methods according to the operation.

---

# **5\. HTTP Methods**

Use:

GET

for retrieving data.

Use:

POST

for creating resources or triggering operations such as AI analysis when appropriate.

Use:

PUT/PATCH

for updates.

Use:

DELETE

only when deletion is actually required.

Milestone 1 should avoid unnecessary destructive operations.

---

# **6\. API Versioning**

Use an explicit API version.

Preferred structure:

/api/v1/...

Example:

67. /api/v1/outlets  
68. /api/v1/performance  
    /api/v1/analysis

Do not introduce versioning inconsistently across endpoints.

---

# **7\. Endpoint Naming**

Use resource-oriented names.

Prefer:

69. /outlets  
70. /performance  
    /analysis

Avoid inconsistent names such as:

71. /getOutlets  
72. /fetchOutletData  
    /runPerformanceCalculation

unless there is a specific reason for an action-oriented endpoint.

---

# **8\. URL Naming**

Use lowercase path segments.

Prefer:

/api/v1/outlets/123

Avoid:

/api/v1/GetOutlet/123

---

# **9\. Resource IDs**

Use stable identifiers for resources.

Example:

GET /api/v1/outlets/{outlet\_id}

Do not use outlet names as the primary identifier unless the architecture explicitly requires it.

---

# **10\. Query Parameters**

Use query parameters for filtering and retrieval options.

Example:

GET /api/v1/outlets?search=central

or:

GET /api/v1/performance?outlet\_id=101\&period=30d

Do not encode arbitrary JSON inside query parameters.

---

# **11\. Date Ranges**

Use a consistent date representation.

For explicit ranges:

73. start\_date=2026-08-01  
    end\_date=2026-08-30

The backend must validate:

start\_date \<= end\_date

---

# **12\. Time Periods**

For common predefined periods, use a consistent representation.

Examples:

74. 7d  
75. 30d  
76. 90d  
77. 6m  
    1y

The backend should define what each period means.

Do not allow frontend and backend to interpret the same period differently.

---

# **13\. Request Schemas**

Every non-trivial POST/PATCH request should have a defined schema.

Example:

78. {  
79.   "outlet\_id": 101,  
80.   "start\_date": "2026-08-01",  
81.   "end\_date": "2026-08-30"  
    }

Validate the request before business logic executes.

---

# **14\. Pydantic Schemas**

For the FastAPI backend, use Pydantic models for request and response validation where appropriate.

Example conceptual structure:

82. class AnalysisRequest(BaseModel):  
83.     outlet\_id: int  
84.     start\_date: date  
        end\_date: date

Do not accept arbitrary unvalidated dictionaries for important APIs.

---

# **15\. Response Schemas**

Responses should have predictable structures.

Example:

85. {  
86.   "outlet\_id": 101,  
87.   "revenue": 1240000,  
88.   "orders": 12450,  
89.   "average\_order\_value": 99.6  
    }

Do not return different structures depending on unrelated runtime conditions.

---

# **16\. Consistent Field Naming**

Use one naming convention across the API.

Recommended JSON naming:

snake\_case

Examples:

90. outlet\_id  
91. start\_date  
92. end\_date  
93. average\_order\_value  
    performance\_score

Do not randomly mix:

94. outlet\_id  
95. outletId  
    OutletID  
    ---

    # **17\. Null Values**

Define how missing values are represented.

Use:

96. {  
97.   "benchmark": null  
    }

when the value genuinely does not exist.

Do not randomly alternate between:

98. null  
99. ""  
100. 0  
     "N/A"

for the same semantic condition.

---

# **18\. Missing Data**

Missing data must not be silently converted into zero.

For example:

Missing revenue

is not necessarily:

Revenue \= 0

Preserve the semantic difference.

---

# **19\. Boolean Values**

Use actual JSON booleans:

101. {  
102.   "is\_active": true  
     }

not:

103. {  
104.   "is\_active": "true"  
     }  
     ---

     # **20\. Numeric Values**

Return numbers as numbers unless a deliberate serialization requirement exists.

Prefer:

105. {  
106.   "revenue": 1240000  
     }

rather than:

107. {  
108.   "revenue": "₹12.4L"  
     }

Formatting such as currency symbols should normally happen in the presentation layer.

---

# **21\. Backend vs Frontend Formatting**

Backend:

1240000

Frontend:

₹12.4L

Do not mix business data with presentation formatting unnecessarily.

---

# **22\. Currency**

Brew Buzz is designed around the intended business market.

Currency representation must be consistent.

If INR is used:

currency \= INR

Do not hardcode currency symbols into every backend response.

If internationalization is introduced later, the API should provide sufficient context.

---

# **23\. Pagination**

List endpoints should support pagination when datasets can grow.

Example:

GET /api/v1/outlets?page=1\&page\_size=25

The backend must enforce a maximum page size.

---

# **24\. Pagination Response**

Use a consistent response structure.

Example:

109. {  
110.   "items": \[\],  
111.   "page": 1,  
112.   "page\_size": 25,  
113.   "total": 120  
     }

The exact schema may evolve, but all paginated endpoints should follow the same convention.

---

# **25\. Sorting**

If sorting is supported:

?sort\_by=revenue\&sort\_order=desc

Validate allowed fields.

Never directly insert arbitrary user-provided sort expressions into SQL.

---

# **26\. Filtering**

Filters must use explicit supported fields.

Example:

?category=pizza

Do not create an API that accepts arbitrary database column names without validation.

---

# **27\. Search**

Search parameters should have defined behavior.

Example:

GET /api/v1/outlets?search=central

Define whether search is:

114. case-insensitive  
115. partial  
     exact

and keep behavior consistent.

---

# **28\. HTTP Status Codes**

Use appropriate HTTP status codes.

Examples:

116. 200 OK  
117. 201 Created  
118. 204 No Content  
119. 400 Bad Request  
120. 401 Unauthorized  
121. 403 Forbidden  
122. 404 Not Found  
123. 409 Conflict  
124. 422 Validation Error  
125. 429 Too Many Requests  
     500 Internal Server Error

Do not return `200 OK` for every failure.

---

# **29\. 401 vs 403**

Use:

401 Unauthorized

when authentication is missing or invalid.

Use:

403 Forbidden

when the user is authenticated but lacks permission.

---

# **30\. 404**

Use `404 Not Found` when an accessible resource does not exist.

Do not leak unnecessary information about protected resources.

---

# **31\. Validation Errors**

Validation errors should clearly identify invalid fields.

Example:

126. {  
127.   "error": {  
128.     "code": "VALIDATION\_ERROR",  
129.     "message": "Invalid request",  
130.     "details": \[  
131.       {  
132.         "field": "end\_date",  
133.         "message": "end\_date must be after start\_date"  
134.       }  
135.     \]  
136.   }  
     }

The exact schema should be standardized across the application.

---

# **32\. Error Response Structure**

Use a consistent error envelope.

Recommended conceptual structure:

137. {  
138.   "error": {  
139.     "code": "ERROR\_CODE",  
140.     "message": "Human-readable message",  
141.     "details": {}  
142.   }  
     }

Do not expose internal stack traces.

---

# **33\. Error Codes**

Use stable machine-readable error codes.

Examples:

143. VALIDATION\_ERROR  
144. AUTHENTICATION\_REQUIRED  
145. FORBIDDEN  
146. OUTLET\_NOT\_FOUND  
147. ANALYSIS\_FAILED  
148. RATE\_LIMITED  
     INTERNAL\_ERROR

Frontend logic should not depend on parsing human-readable messages.

---

# **34\. Request IDs**

For production debugging, APIs should support request tracing.

Conceptually:

149. Request  
150.  ↓  
151. request\_id  
152.  ↓  
153. Backend  
154.  ↓  
155. Analytics  
156.  ↓  
157. Agent  
158.  ↓  
     Logs

This makes failures easier to trace.

---

# **35\. Authentication Context**

Protected requests should establish the authenticated user context before accessing protected resources.

Conceptually:

159. Request  
160.  ↓  
161. Authentication  
162.  ↓  
163. Current User  
164.  ↓  
165. Authorization  
166.  ↓  
     Endpoint  
     ---

     # **36\. Outlet Authorization**

An endpoint such as:

GET /api/v1/outlets/101

must verify that the current user is allowed to access outlet `101`.

Do not rely on the frontend to enforce this.

---

# **37\. Analytics API**

Analytics endpoints should expose business-level operations.

Example:

GET /api/v1/performance

Possible parameters:

167. outlet\_id  
168. start\_date  
     end\_date

The API should return calculated business metrics.

---

# **38\. Analytics Response**

Example:

169. {  
170.   "outlet\_id": 101,  
171.   "period": {  
172.     "start\_date": "2026-08-01",  
173.     "end\_date": "2026-08-30"  
174.   },  
175.   "metrics": {  
176.     "revenue": 1240000,  
177.     "orders": 12450,  
178.     "average\_order\_value": 99.6  
179.   }  
     }

Keep the structure logically grouped.

---

# **39\. Trend API**

Trend data should be returned in a structure suitable for visualization.

Example:

180. {  
181.   "metric": "revenue",  
182.   "data": \[  
183.     {  
184.       "date": "2026-08-01",  
185.       "value": 42000  
186.     },  
187.     {  
188.       "date": "2026-08-02",  
189.       "value": 43500  
190.     }  
191.   \]  
     }

Do not return chart-specific rendering instructions from the backend.

---

# **40\. Benchmark API**

Benchmark data should clearly identify what is being compared.

Example:

192. {  
193.   "outlet\_value": 1240000,  
194.   "benchmark\_value": 1410000,  
195.   "difference\_percent": \-12.06  
     }

The frontend can turn this into a visual comparison.

---

# **41\. Category API**

Pizza and coffee performance may be represented using a consistent category schema.

Example:

196. {  
197.   "categories": \[  
198.     {  
199.       "category": "pizza",  
200.       "revenue": 820000,  
201.       "growth\_percent": 4.2  
202.     },  
203.     {  
204.       "category": "coffee",  
205.       "revenue": 420000,  
206.       "growth\_percent": \-11.8  
207.     }  
208.   \]  
     }  
     ---

     # **42\. Agent Analysis API**

The frontend should not communicate directly with the LLM provider.

Preferred architecture:

209. Frontend  
210.    ↓  
211. POST /api/v1/analysis  
212.    ↓  
213. FastAPI  
214.    ↓  
215. Agent Orchestrator  
216.    ↓  
217. Tools  
218.    ↓  
     LLM  
     ---

     # **43\. Analysis Request**

Example:

219. {  
220.   "outlet\_id": 101,  
221.   "start\_date": "2026-08-01",  
222.   "end\_date": "2026-08-30"  
     }

The backend must validate the request and authorization before starting the agent.

---

# **44\. Analysis Response**

The final analysis should use a structured response.

Conceptually:

223. {  
224.   "analysis\_id": "analysis\_123",  
225.   "outlet\_id": 101,  
226.   "summary": "...",  
227.   "findings": \[\],  
228.   "recommendations": \[\]  
     }

Do not return raw LLM text as the only contract.

---

# **45\. Finding Schema**

A finding should contain structured information.

Example:

229. {  
230.   "title": "Coffee revenue declined",  
231.   "description": "...",  
232.   "evidence": \[\]  
     }

The exact fields should be defined centrally.

---

# **46\. Recommendation Schema**

Example:

233. {  
234.   "title": "Investigate coffee performance",  
235.   "description": "...",  
236.   "reason": "..."  
     }

Recommendations must remain grounded in the available data.

---

# **47\. Evidence Schema**

Evidence should identify the supporting metric/data.

Example:

237. {  
238.   "metric": "coffee\_revenue",  
239.   "value": 420000,  
240.   "change\_percent": \-11.8  
     }

Do not require the frontend to parse natural-language evidence.

---

# **48\. Agent Status**

If agent execution is asynchronous, expose an explicit status.

Possible states:

241. queued  
242. running  
243. completed  
     failed

Do not invent additional states without a real backend meaning.

---

# **49\. Agent Execution ID**

Each analysis execution should have a unique identifier.

Example:

analysis\_id

This can be used for:

244. Status tracking  
245. Logging  
246. Debugging  
     History  
     ---

     # **50\. Long-Running Analysis**

If AI analysis becomes long-running, do not keep an HTTP connection open indefinitely unless the architecture explicitly requires it.

Possible architecture:

247. POST /analysis  
248.        ↓  
249. analysis\_id  
250.        ↓  
     GET /analysis/{analysis\_id}

The exact approach should be selected based on actual implementation requirements.

---

# **51\. Streaming**

Streaming should only be introduced if there is a real UX requirement.

Do not add WebSockets or Server-Sent Events merely because the application is Agentic AI.

Start with the simplest reliable architecture.

---

# **52\. Agent Progress**

If the backend exposes agent progress, it must represent actual system events.

Example:

251. queued  
252. running  
253. completed  
     failed

Optional detailed events may include:

254. Fetching performance metrics  
255. Comparing benchmarks  
256. Analyzing category trends  
     Generating recommendations

Only expose events that actually occur.

---

# **53\. Tool Calls**

Agent tool execution should remain an internal backend concern unless the product intentionally exposes high-level progress.

Do not expose internal tool arguments containing sensitive information.

---

# **54\. Agent Output Validation**

The agent's output must be validated against the expected schema before the API returns it.

Conceptually:

257. LLM  
258.  ↓  
259. Structured output  
260.  ↓  
261. Pydantic validation  
262.  ↓  
263. Business validation  
264.  ↓  
     API response  
     ---

     # **55\. API Does Not Trust the Agent**

The backend must treat agent output as untrusted generated content.

The backend should verify:

265. Required fields  
266. Data types  
267. Allowed values  
268. Referenced outlet  
     Evidence structure

before returning it.

---

# **56\. API Does Not Trust the Frontend**

The backend must independently validate:

269. User  
270. Outlet  
271. Dates  
272. Filters  
273. Pagination  
     Analysis requests

even if the frontend already validates them.

---

# **57\. API Does Not Trust Query Strings**

Never assume query parameters are safe because they are simple strings.

Validate:

274. type  
275. range  
276. allowed values  
277. length  
     format  
     ---

     # **58\. API Does Not Trust Headers**

Only trust security-sensitive headers when they are provided by trusted infrastructure or validated according to the deployment architecture.

---

# **59\. API and Database Separation**

Routes should not directly contain large amounts of SQL and business logic.

Prefer:

278. Router  
279.  ↓  
280. Service  
281.  ↓  
282. Repository / Data Access  
283.  ↓  
     Database  
     ---

     # **60\. API and Agent Separation**

Do not place the entire agent implementation inside a route handler.

Prefer:

284. API Router  
285.  ↓  
286. Analysis Service  
287.  ↓  
288. Agent Orchestrator  
289.  ↓  
     Tools  
     ---

     # **61\. API Client**

Frontend API calls should use a centralized API client.

Conceptually:

290. api/  
291. ├── client  
292. ├── outlets  
293. ├── performance  
     └── analysis

Avoid duplicating URL construction throughout React components.

---

# **62\. API Types**

Frontend types should correspond to backend schemas.

For example:

294. Outlet  
295. PerformanceMetrics  
296. TrendPoint  
297. Benchmark  
298. Analysis  
299. Finding  
     Recommendation

Keep these types centralized.

---

# **63\. Contract Changes**

When changing an API contract:

1. Identify affected consumers.  
2. Update backend schema.  
3. Update frontend types.  
4. Update API client.  
5. Update tests.  
6. Verify existing workflows.  
7. Document the change when appropriate.

Do not silently change response fields.

---

# **64\. Backward Compatibility**

Avoid breaking existing consumers unnecessarily.

If a field must change significantly, consider:

300. New field  
301. Migration  
     API version

rather than silently changing its meaning.

---

# **65\. Removing Fields**

Do not immediately remove a field that another component may depend on.

Search the codebase for consumers first.

---

# **66\. API Documentation**

FastAPI's generated OpenAPI documentation should remain accurate.

Every important endpoint should have:

302. Summary  
303. Description  
304. Request schema  
305. Response schema  
     Expected errors

where appropriate.

---

# **67\. Example Requests**

Important APIs should have realistic examples in documentation or tests.

Example:

306. {  
307.   "outlet\_id": 101,  
308.   "start\_date": "2026-08-01",  
309.   "end\_date": "2026-08-30"  
     }

Do not use misleading examples.

---

# **68\. API Testing**

Every important endpoint should have tests for:

310. Valid request  
311. Invalid request  
312. Unauthorized request  
313. Forbidden request  
314. Missing resource  
     Boundary conditions

AI endpoints should additionally test:

315. Agent failure  
316. Invalid agent output  
     Insufficient data  
     ---

     # **69\. Contract Testing**

When practical, ensure that frontend expectations match backend responses.

At minimum, shared types/schemas and integration tests should prevent accidental mismatches.

---

# **70\. No Hardcoded API URLs**

Frontend code should not scatter:

http://localhost:8000

throughout components.

Use environment-aware configuration.

---

# **71\. Development Environment**

Local development may use:

317. Frontend  
318. http://localhost:\<frontend-port\>  
319.   
320. Backend  
321. http://localhost:\<backend-port\>  
322.   
323. PostgreSQL  
     internal Docker service

The actual ports must come from the project configuration.

Do not assume fixed ports if they are already defined elsewhere.

---

# **72\. Production Environment**

Production URLs and credentials must come from deployment configuration.

Do not hardcode production endpoints into source code.

---

# **73\. CORS Coordination**

Frontend and backend origins must be explicitly configured.

If the frontend runs on one origin and backend on another, configure the backend accordingly.

Do not solve CORS problems by blindly allowing every origin.

---

# **74\. API Timeout**

Frontend requests should have sensible timeout/error behavior where appropriate.

AI analysis may legitimately take longer than normal CRUD requests.

Do not use one arbitrary timeout for every API.

---

# **75\. Retry Policy**

Retries should be used carefully.

Safe candidates may include transient GET failures.

Avoid blindly retrying expensive AI operations because this can create:

324. Duplicate analysis  
325. Higher LLM cost  
     Repeated tool calls  
     ---

     # **76\. Idempotency**

For operations that may be retried and create side effects, consider idempotency mechanisms.

Milestone 1 agent analysis should preferably remain side-effect free.

---

# **77\. Caching**

Cache only where the data freshness requirements allow it.

Do not cache AI results indefinitely if underlying business data can change.

---

# **78\. Security Boundary**

API contracts must never bypass security rules.

Every protected endpoint must perform appropriate:

326. Authentication  
327. Authorization  
     Validation

before accessing protected data.

---

# **79\. Performance Boundary**

APIs should avoid returning excessive data.

For dashboards:

Request only what the screen needs.

Do not return the entire database when the UI needs five metrics.

---

# **80\. Separation of Concerns**

The architecture should remain:

328. Frontend  
329. → presentation  
330.   
331. API  
332. → communication \+ validation  
333.   
334. Service  
335. → business logic  
336.   
337. Repository  
338. → data access  
339.   
340. Agent  
341. → reasoning/orchestration  
342.   
343. Tools  
344. → controlled capabilities  
345.   
346. Database  
     → persistence

Do not collapse all responsibilities into one layer.

---

# **81\. Milestone 1 API Scope**

Milestone 1 should focus on the minimum APIs required to establish the core workflow.

Likely areas:

347. 1\. Health  
348. 2\. Authentication foundation  
349. 3\. Outlets  
350. 4\. Outlet performance  
351. 5\. Trends  
352. 6\. Category metrics  
353. 7\. Benchmark data  
     8\. Agent analysis

Only implement endpoints required by the actual milestone.

---

# **82\. Avoid Premature APIs**

Do not create APIs for features that do not exist yet.

Avoid implementing:

354. Notifications  
355. Advanced forecasting  
356. Customer management  
357. Inventory management  
358. Agent actions  
     Payment processing

unless a milestone explicitly requires them.

---

# **83\. API Definition of Done**

An API feature is complete when:

* Endpoint purpose is clear.  
* Request schema is defined.  
* Response schema is defined.  
* Validation exists.  
* Authentication is applied where required.  
* Authorization is applied where required.  
* Appropriate HTTP status codes are used.  
* Errors follow the standard format.  
* Tests exist.  
* Frontend integration works.  
* Documentation is accurate.  
* No secrets are exposed.  
* No unnecessary data is returned.  
  ---

  # **84\. Golden Rules**

1. **Define the contract before implementing both sides.**  
2. **Use consistent schemas.**  
3. **Validate every external request.**  
4. **Never trust the frontend.**  
5. **Never trust raw LLM output.**  
6. **Never expose the LLM directly to the browser.**  
7. **Never expose arbitrary SQL through an API or agent tool.**  
8. **Keep authentication and authorization separate.**  
9. **Use stable error codes.**  
10. **Do not silently break existing contracts.**  
11. **Keep business logic outside route handlers.**  
12. **Keep database logic outside UI components.**  
13. **Do not return presentation-formatted business values unnecessarily.**  
14. **Do not create APIs for features that do not exist.**  
15. **Prefer simple reliable APIs before introducing streaming or complex real-time infrastructure.**  
16. **Every agent analysis must have a predictable structured contract.**  
17. **Agent outputs must be validated before reaching the frontend.**  
18. **Only expose the minimum data required.**  
19. **Use API versioning consistently.**  
20. **A contract is a shared agreement between every layer of Brew Buzz.**  
