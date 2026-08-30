# **`frontend/SKILL.md`**

1. \---  
2. name: brew-buzz-frontend  
3. description: Defines the frontend development standards for Brew Buzz, including React architecture, TypeScript, component structure, dashboard design, API integration, agent-result rendering, state management, loading/error states, responsive behavior, and frontend-backend boundaries. Use this skill whenever implementing, modifying, or reviewing the Brew Buzz frontend.  
4. \---  
5.   
6. \# Brew Buzz — Frontend Development Skill  
7.   
8. \#\# 1\. Purpose  
9.   
10. The Brew Buzz frontend is the user-facing business intelligence interface.  
11.   
12. It must allow franchise managers to:  
13.   
14. \- Select an outlet  
15. \- Select an analysis period  
16. \- View outlet performance  
17. \- View important metrics  
18. \- Compare outlet performance against benchmarks  
19. \- View trends  
20. \- View findings  
21. \- View AI-generated recommendations  
22. \- Understand why the agent reached its conclusions  
23. \- Distinguish factual metrics from AI interpretation  
24.   
25. The frontend must present complex business intelligence clearly and professionally.  
26.   
27. \---  
28.   
29. \# 2\. Frontend Technology  
30.   
31. Preferred stack:  
32.   
33. \`\`\`text  
34. React  
35. TypeScript  
36. Vite  
    Tailwind CSS

Use the project's approved component/UI library if one has already been established.

Do not introduce multiple competing UI frameworks.

---

# **3\. Frontend Architecture**

Use a layered frontend structure.

Conceptually:

37. Pages  
38.   ↓  
39. Feature Components  
40.   ↓  
41. Reusable UI Components  
42.   ↓  
43. Hooks / State  
44.   ↓  
45. API Client  
46.   ↓  
    FastAPI Backend

The frontend must not directly access:

* PostgreSQL  
* SQLAlchemy  
* Python analytics  
* Agent internals  
* LLM provider APIs  
  ---

  # **4\. Recommended Structure**

Prefer a feature-oriented structure.

Example:

47. frontend/  
48. ├── src/  
49. │   ├── app/  
50. │   ├── components/  
51. │   │   ├── ui/  
52. │   │   └── layout/  
53. │   ├── features/  
54. │   │   ├── outlets/  
55. │   │   ├── performance/  
56. │   │   └── agent/  
57. │   ├── hooks/  
58. │   ├── lib/  
59. │   ├── services/  
60. │   ├── types/  
    │   └── pages/

Adapt the exact structure to the existing project.

Do not reorganize the entire application unnecessarily once implementation has started.

---

# **5\. TypeScript**

Use TypeScript throughout the frontend.

Avoid:

any

unless there is a documented reason.

Prefer explicit interfaces/types for:

* API responses  
* Metrics  
* Findings  
* Recommendations  
* Agent responses  
* Outlet information  
* Chart data  
* Loading/error states  
  ---

  # **6\. Backend Contract**

The frontend must consume the backend API contract rather than inventing its own data model.

Conceptually:

61. FastAPI Response  
62.        ↓  
63. API Client  
64.        ↓  
65. Typed Response  
66.        ↓  
    Frontend Components

If the backend schema changes, update the frontend types and integration accordingly.

Do not silently transform incompatible API responses inside random components.

---

# **7\. API Client**

Centralize API communication.

Prefer:

67. services/  
68. └── api/  
69.     ├── client.ts  
70.     ├── outlets.ts  
71.     ├── performance.ts  
        └── agent.ts

rather than placing `fetch()` calls throughout UI components.

Bad:

72. Dashboard.tsx  
73.   → fetch()  
74.   
75. PerformanceCard.tsx  
76.   → fetch()  
77.   
78. TrendChart.tsx  
      → fetch()

Prefer:

79. API Service  
80.     ↓  
81. Hook  
82.     ↓  
    Component  
    ---

    # **8\. Environment Configuration**

Frontend configuration should use environment variables where appropriate.

Example:

VITE\_API\_BASE\_URL

Do not hardcode environment-specific backend URLs throughout the application.

---

# **9\. Secrets**

Never place secret API keys in frontend code.

Anything exposed through a `VITE_*` environment variable should be considered publicly visible to users of the application.

LLM provider keys and other secrets belong on the backend.

---

# **10\. Outlet Selection**

The frontend should provide a clear way to select an outlet.

Possible UI:

83. Outlet Selector  
84.     ↓  
85. Outlet Name  
86. Location  
    Status

The selected outlet becomes the context for performance analysis.

Do not require users to manually type internal database IDs when a human-readable selector can be provided.

---

# **11\. Date Range**

The user should be able to define the analysis period.

Possible controls:

87. Start Date  
    End Date

or predefined ranges where appropriate:

88. Last 7 Days  
89. Last 30 Days  
90. This Month  
    Previous Month

Predefined ranges must map to explicit backend date ranges.

---

# **12\. Dashboard Structure**

The Milestone 1 dashboard should prioritize decision-making.

Recommended conceptual hierarchy:

91. Outlet \+ Period  
92.         ↓  
93. Overall Performance  
94.         ↓  
95. Key Metrics  
96.         ↓  
97. Trend  
98.         ↓  
99. Benchmark  
100.         ↓  
101. Key Findings  
102.         ↓  
     AI Recommendations

Do not overwhelm the user with every available metric.

---

# **13\. Performance Summary**

The top section should answer:

How is this outlet performing?

It may contain:

103. Performance Score  
104. Performance Status  
105. Revenue  
106. Growth  
107. AOV  
     Orders

The user should understand the outlet's current state quickly.

---

# **14\. Metric Cards**

Metric cards should clearly display:

108. Metric Name  
109. Current Value  
110. Comparison  
     Direction

Example:

111. Revenue  
112.   
113. ₹12.5L  
114.   
115. ↓ 12.4%  
     vs previous period

Do not rely solely on color to communicate direction.

Use:

* Text  
* Icons  
* Labels  
* Numbers

along with visual styling.

---

# **15\. Currency Formatting**

The frontend should format numeric revenue values for users.

Example:

1250000

may be displayed as:

₹12.5L

or:

₹1,250,000

depending on the approved UI design.

Keep the underlying API value numeric.

Do not send formatted strings back to the backend for calculations.

---

# **16\. Growth Display**

Growth should clearly indicate:

116. Positive  
117. Negative  
     No meaningful comparison

Example:

118. \+8.4%  
119. \-12.4%  
     N/A

Do not display:

0%

when the real reason is that no comparison period exists.

---

# **17\. Trend Visualization**

Use charts when they improve understanding.

Useful charts include:

120. Revenue Trend  
121. Order Trend  
122. AOV Trend  
     Category Performance

Charts should answer a business question.

Do not add charts merely because the dashboard has empty space.

---

# **18\. Chart Principles**

Charts must:

* Have clear labels  
* Show units  
* Show time period  
* Have useful tooltips  
* Be readable on different screen sizes  
* Avoid unnecessary decoration

Do not force users to interpret unexplained axes.

---

# **19\. Benchmark Visualization**

Benchmark comparisons should be visually understandable.

Possible representation:

123. Outlet Revenue  
124. ██████████████████  
125.   
126. Peer Average  
     ███████████████

or a suitable chart.

The benchmark label must clearly identify the comparison population.

Do not display an unexplained number called:

Benchmark

without context.

---

# **20\. Performance Score**

If the backend provides a performance score:

0–100

the frontend may display it prominently.

Possible UI:

127.       72  
        Performance

The score should also have contextual information.

For example:

128. 72 / 100  
     Needs Attention

The exact status labels must come from approved business rules.

---

# **21\. Score Explanation**

The UI should allow users to understand what influenced the score.

Example:

129. Performance Score: 72  
130.   
131. Positive Factors  
132. • Revenue remains above peer benchmark  
133.   
134. Areas of Concern  
135. • Growth declined  
     • AOV below benchmark

Do not present the score as an unexplained AI judgment.

---

# **22\. Findings Section**

Findings should be presented separately from recommendations.

Example:

136. Key Findings  
137.   
138. Revenue declined 12.4%.  
139. Orders declined 3%.  
140. AOV declined 9.7%.  
     Coffee-category sales declined 18%.

This makes the evidence visible before the recommendation.

---

# **23\. Recommendation Section**

Recommendations should appear after findings.

Example:

141. AI Recommendations  
142.   
143. 1\. Investigate coffee-category performance.  
144. 2\. Review product mix and availability.  
     3\. Monitor AOV over the next period.

Recommendations should display their priority where available.

---

# **24\. AI Transparency**

The UI should make it clear which information comes from:

Business Data

and which information is:

AI Interpretation

For example:

145. Observed  
146. Revenue declined 12.4%.  
147.   
148. AI Interpretation  
149. The decline appears more associated with lower AOV  
     than order volume.

This improves user trust.

---

# **25\. Evidence Display**

Where the backend provides evidence, allow users to see it.

Example:

150. Recommendation  
151. Investigate coffee-category performance.  
152.   
153. Why?  
154. Coffee revenue declined 18%.  
     Overall outlet revenue declined 12.4%.

Do not hide supporting evidence behind unexplained AI prose.

---

# **26\. Confidence**

If the agent provides confidence:

155. High  
156. Medium  
     Low

the UI should display it appropriately.

Example:

Confidence: Medium

Confidence should never be represented as an exact probability unless the backend explicitly provides a statistically meaningful probability.

Do not display:

AI Confidence: 97%

simply because the model produced a number.

---

# **27\. Limitations**

If the agent reports limitations, display them.

Example:

157. Analysis Limitation  
158.   
159. Product-level data was unavailable for 3 days.  
     Category-level conclusions may therefore be incomplete.

Do not hide important data-quality warnings.

---

# **28\. Loading States**

Every asynchronous operation needs a useful loading state.

Examples:

160. Loading outlet data...  
161. Analyzing performance...  
     Generating recommendations...

Avoid leaving the user staring at an empty dashboard.

---

# **29\. Agent Loading State**

Agent analysis may take longer than ordinary API requests.

The UI should communicate that analysis is occurring.

Example:

162. Analyzing Outlet 12...  
163.   
164. Reviewing:  
165. ✓ Sales performance  
166. ✓ Peer benchmark  
167. ✓ Revenue trend  
168. ○ Product performance  
     ○ Recommendations

Only display actual workflow progress if the backend provides reliable progress information.

Do not fake progress.

---

# **30\. Error States**

Errors should be understandable.

Bad:

500 Internal Server Error

Better:

169. We couldn't complete the outlet analysis.  
     Please try again.

Developer details may be logged separately.

---

# **31\. Partial Results**

If the backend returns valid partial analysis:

170. Metrics ✓  
171. Benchmark ✓  
172. Trend ✓  
     AI Recommendations ✗

the UI should preserve the valid information.

Do not replace the entire dashboard with an error message.

---

# **32\. Empty States**

Handle cases such as:

173. No outlets available  
174. No sales data  
175. No historical comparison  
176. No benchmark data  
     No recommendations

Each should have a meaningful explanation.

Avoid blank panels.

---

# **33\. Responsive Design**

The dashboard must work across:

177. Desktop  
178. Laptop  
179. Tablet  
     Mobile

The primary target may be desktop because franchise management dashboards are likely to be used on larger screens, but smaller screens must remain usable.

---

# **34\. Visual Hierarchy**

Prioritize:

180. 1\. Overall performance  
181. 2\. Important changes  
182. 3\. Evidence  
183. 4\. Recommendations  
     5\. Supporting details

Avoid giving equal visual weight to every metric.

---

# **35\. Design Language**

The Brew Buzz interface should feel:

184. Modern  
185. Premium  
186. Professional  
187. Data-driven  
188. Trustworthy  
     Clean

It should visually connect the:

189. Pizza  
190. \+  
191. Coffee  
192. \+  
193. AI  
194. \+  
     Business Intelligence

identity of Brew Buzz.

Do not turn the dashboard into a generic admin template.

---

# **36\. Branding vs Dashboard**

The extraordinary video landing page is a separate future UI task.

Do not let landing-page requirements distort the Milestone 1 dashboard architecture.

Milestone 1 should prioritize:

195. Functional Dashboard  
196. \+  
197. Clear Business Intelligence  
198. \+  
     Agentic AI Experience

The high-impact marketing/landing experience can be developed later.

---

# **37\. Component Reusability**

Create reusable components for repeated UI patterns.

Examples:

199. MetricCard  
200. StatusBadge  
201. TrendChart  
202. BenchmarkCard  
203. FindingCard  
204. RecommendationCard  
205. LoadingState  
206. ErrorState  
     EmptyState

Do not duplicate nearly identical components across pages.

---

# **38\. Avoid Over-Abstraction**

Do not create a component for every `<div>`.

Abstraction should improve:

* Reusability  
* Readability  
* Maintainability  
* Consistency

not merely increase the number of files.

---

# **39\. State Management**

Use the simplest state-management approach that satisfies the requirement.

Local component state is appropriate for:

207. Selected outlet  
208. Date picker  
209. UI toggles  
     Modal state

Shared/server state should use the project's approved data-fetching/state solution.

Do not introduce Redux or another large state-management framework without a clear requirement.

---

# **40\. Server Data vs UI State**

Keep these concepts separate.

### **Server state**

210. Outlet data  
211. Metrics  
212. Benchmarks  
     Agent results

     ### **UI state**

213. Selected tab  
214. Open modal  
215. Expanded finding  
     Chart filter

Do not mix server responses into unrelated UI state.

---

# **41\. Caching**

If a data-fetching library is used, configure caching deliberately.

Potentially cache:

216. Outlet list  
217. Stable reference data  
     Repeated performance queries

Do not cache rapidly changing agent responses indefinitely.

---

# **42\. API Errors**

The frontend should distinguish between:

218. Network error  
219. Authentication error  
220. Validation error  
221. Backend error  
222. Agent error  
     No data

when the backend provides enough information to do so.

---

# **43\. Form Validation**

Validate user inputs before making API requests.

Examples:

223. Outlet must be selected.  
224. Start date must be valid.  
     End date must not precede start date.

Do not rely exclusively on frontend validation; the backend must validate as well.

---

# **44\. URL State**

Where useful, important dashboard context may be reflected in the URL.

Example:

/dashboard/outlets/12

or equivalent.

This can make dashboard views shareable and navigable.

Do not force every UI state into the URL.

---

# **45\. Accessibility**

The frontend should follow accessible UI practices.

At minimum:

* Semantic HTML  
* Keyboard navigation  
* Accessible labels  
* Sufficient contrast  
* Visible focus states  
* Meaningful button names  
* Accessible chart summaries where practical

Do not communicate critical information using color alone.

---

# **46\. Icons**

Icons should support meaning rather than decoration.

Example:

225. ↑ Growth  
226. ↓ Decline  
227. ⚠ Warning  
     ✓ Healthy

Use the project's approved icon library consistently.

---

# **47\. Animations**

Use animation to improve feedback and polish.

Good uses:

228. Card entrance  
229. Chart transitions  
230. Loading indicators  
     Panel expansion

Avoid excessive animations that slow down business workflows.

---

# **48\. Performance**

Avoid unnecessary rendering.

Pay attention to:

* Large tables  
* Charts  
* Repeated API requests  
* Expensive calculations in components  
* Unnecessary global state updates

The frontend should not perform business analytics that belong to the backend.

---

# **49\. Frontend Security**

Never trust frontend input as authorization.

The frontend may hide unavailable features, but backend permissions must enforce access.

Never place:

231. LLM API keys  
232. Database credentials  
     Private tokens

in the frontend.

---

# **50\. Mock Data**

Mock data may be used temporarily during UI development.

However:

Mock data ≠ production data

Clearly isolate mock data from real API services.

Do not leave fake business numbers in production accidentally.

---

# **51\. Agent Result Rendering**

The frontend should consume structured agent output.

Example:

233. {  
234.   "summary": "...",  
235.   "performance\_score": 72,  
236.   "metrics": {},  
237.   "findings": \[\],  
238.   "recommendations": \[\],  
239.   "limitations": \[\]  
     }

Do not parse free-form AI text using string manipulation to extract metrics.

---

# **52\. Chat Interface**

If a conversational interface is added, it must still connect to the structured agent backend.

Preferred:

240. User Message  
241.      ↓  
242. FastAPI  
243.      ↓  
244. Agent  
245.      ↓  
246. Structured Result  
247.      ↓  
     Chat \+ Dashboard

Do not call the LLM directly from the browser.

---

# **53\. Chat and Dashboard Consistency**

If both dashboard and chat expose the same business information, they must use the same backend source of truth.

Do not allow:

248. Dashboard → Analytics Service  
     Chat → Separate LLM calculation

Prefer:

249. Dashboard ─┐  
250.            ├→ Backend / Analytics / Agent  
     Chat ──────┘  
     ---

     # **54\. Testing**

Frontend tests should cover:

### **Components**

* Rendering  
* Props  
* User interactions

  ### **API integration**

* Success  
* Loading  
* Error  
* Empty states

  ### **Agent UI**

* Findings  
* Recommendations  
* Confidence  
* Limitations

  ### **Forms**

* Invalid dates  
* Missing outlet  
* Valid submission  
  ---

  # **55\. Type Safety Testing**

API response types should match backend schemas.

If practical, generate or share schemas from the backend rather than manually maintaining incompatible duplicated definitions.

The source of truth for API contracts should remain clear.

---

# **56\. Visual Validation**

After implementing significant UI work, verify:

251. Desktop layout  
252. Responsive layout  
253. Loading state  
254. Error state  
255. Empty state  
256. Long text  
257. Large numbers  
258. Negative values  
     Missing values

Do not consider a UI complete merely because it compiles.

---

# **57\. Development Order**

For Milestone 1, implement frontend features approximately in this order:

259. 1\. Application shell  
260. 2\. Outlet selection  
261. 3\. Date range selection  
262. 4\. Performance dashboard  
263. 5\. Metric cards  
264. 6\. Trend visualization  
265. 7\. Benchmark visualization  
266. 8\. Findings  
267. 9\. Recommendations  
268. 10\. Agent analysis interaction  
269. 11\. Loading/error/empty states  
270. 12\. Responsive refinement  
     13\. Visual polish

Do not start with the landing page.

---

# **58\. Backend-First Contract**

If a frontend screen depends on an API that does not yet exist:

Do not permanently hardcode fake behavior.

Instead:

271. Define/confirm API contract  
272.         ↓  
273. Create temporary mock adapter if necessary  
274.         ↓  
275. Build UI  
276.         ↓  
     Replace adapter with real API

Keep the transition clear.

---

# **59\. No Business Logic Duplication**

Do not duplicate backend business rules in React.

Bad:

277. Backend:  
278. Performance score \= formula A  
279.   
280. Frontend:  
     Performance score \= formula B

Good:

281. Backend:  
282. Performance score \= formula A  
283.   
284. Frontend:  
     Display backend score  
     ---

     # **60\. Milestone 1 Definition of Done**

The Brew Buzz frontend is ready for Milestone 1 when:

* Outlet selection works.  
* Date range selection works.  
* Performance metrics are displayed.  
* Revenue is displayed correctly.  
* Orders are displayed correctly.  
* AOV is displayed correctly.  
* Growth is displayed correctly.  
* Benchmark comparison is visible.  
* Trend visualization works.  
* Findings are displayed clearly.  
* Recommendations are displayed clearly.  
* Agent results are rendered from structured data.  
* Loading states work.  
* Error states work.  
* Empty states work.  
* Important data-quality limitations are visible.  
* No frontend secrets are exposed.  
* No business calculations are duplicated in the frontend.  
* The interface is responsive.  
* The dashboard provides a coherent management experience.  
  ---

  # **61\. Golden Rules**

1. **Frontend displays business intelligence; it does not calculate authoritative business metrics.**  
2. **Never connect the browser directly to PostgreSQL.**  
3. **Never expose LLM provider secrets in frontend code.**  
4. **Use TypeScript.**  
5. **Centralize API communication.**  
6. **Use structured backend responses.**  
7. **Do not parse AI prose to recover numerical data.**  
8. **Separate server state from UI state.**  
9. **Always handle loading, error, and empty states.**  
10. **Do not fake agent progress.**  
11. **Do not hide important data-quality warnings.**  
12. **Make AI recommendations traceable to findings.**  
13. **Do not duplicate backend business logic.**  
14. **Do not introduce unnecessary state-management complexity.**  
15. **Build reusable components where reuse is meaningful.**  
16. **Prioritize decision-making over visual decoration.**  
17. **The Milestone 1 dashboard comes before the future video landing page.**  
18. **Keep the interface premium without sacrificing usability.**  
19. **Accessibility is part of implementation, not a final afterthought.**  
20. **The frontend must remain compatible with the Brew Buzz backend and Agentic AI architecture.**  
    

