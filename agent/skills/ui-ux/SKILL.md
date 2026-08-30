## **`ui-ux/SKILL.md`**

1. \---  
2. name: brew-buzz-ui-ux  
3. description: Defines the UI/UX system for the Brew Buzz franchise analytics and Agentic AI application, including dashboard structure, navigation, outlet selection, analytics views, performance metrics, charts, agent analysis, findings, recommendations, loading states, error states, responsive behavior, accessibility, visual hierarchy, and interaction patterns. Use this skill whenever implementing, modifying, or reviewing the Brew Buzz product interface.  
4. \---  
5.   
6. \# Brew Buzz — UI/UX Skill  
7.   
8. \#\# 1\. Purpose  
9.   
10. This skill defines how the Brew Buzz application should look, behave, and communicate information to users.  
11.   
12. The interface must make complex franchise analytics understandable without requiring the user to interpret raw database data or AI reasoning.  
13.   
14. The primary goal is:  
15.   
16. \`\`\`text  
17. Complex franchise data  
18.         ↓  
19. Clear visual information  
20.         ↓  
21. AI-assisted analysis  
22.         ↓  
    Actionable business insight  
    ---

    # **2\. Product UI vs Landing Page**

Brew Buzz has two separate visual experiences.

## **Product Application**

This skill governs:

23. Dashboard  
24. Outlet selection  
25. Analytics  
26. Performance  
27. AI analysis  
28. Findings  
    Recommendations

    ## **Marketing Landing Page**

The extraordinary video-based marketing landing page is a separate future task.

Do not implement the marketing landing page while building the core application unless explicitly instructed.

---

# **3\. Design Philosophy**

Brew Buzz should feel like a modern:

Franchise Intelligence Platform

not a generic:

Admin Dashboard

The interface should communicate:

* Intelligence  
* Clarity  
* Trust  
* Speed  
* Business usefulness  
* Premium quality

Avoid unnecessary visual complexity.

---

# **4\. Primary User**

Assume the main user is a franchise/business operator who wants to answer questions such as:

29. How is my outlet performing?  
30.   
31. Why is it underperforming?  
32.   
33. What changed?  
34.   
35. How does it compare with other outlets?  
36.   
37. What should I investigate?  
38.   
    What should I do next?

The UI should help answer these questions quickly.

---

# **5\. Information Hierarchy**

The interface should prioritize information in this order:

39. 1\. Overall performance  
40. 2\. Important changes  
41. 3\. Evidence  
42. 4\. Comparisons  
43. 5\. AI findings  
44. 6\. Recommendations  
    7\. Supporting details

Do not bury the most important business information below decorative elements.

---

# **6\. Application Structure**

The core application should conceptually follow:

45. Brew Buzz  
46. │  
47. ├── Dashboard  
48. │  
49. ├── Outlets  
50. │  
51. ├── Performance  
52. │  
53. ├── AI Analysis  
54. │  
    └── Settings

The exact routes may differ based on the architecture.

Do not create unnecessary pages.

---

# **7\. Global Navigation**

Navigation should make major application areas immediately understandable.

Possible structure:

55. Brew Buzz  
56. ────────────────  
57. Dashboard  
58. Outlets  
59. Performance  
60. AI Analysis  
61. ────────────────  
    Settings

Keep navigation consistent across screens.

---

# **8\. Dashboard**

The dashboard should answer:

"What is happening across the franchise?"

It should provide a high-level overview.

Possible sections:

62. Overall Metrics  
63. ↓  
64. Performance Overview  
65. ↓  
66. Outlet Comparison  
67. ↓  
68. Trend  
69. ↓  
    AI Insights  
    ---

    # **9\. Outlet Selection**

Outlet selection is a core interaction.

The user should be able to select:

70. Outlet  
71. \+  
    Time Period

before requesting outlet-specific analysis.

Use clear controls.

Example:

72. Outlet  
73. \[ Bengaluru Central ▼ \]  
74.   
75. Period  
76. \[ Last 30 Days ▼ \]  
77.   
    \[ Analyze \]  
    ---

    # **10\. Outlet Context**

Once an outlet is selected, the current context should remain visible.

Example:

78. Bengaluru Central  
    Last 30 Days

Do not make users repeatedly remember which outlet they are viewing.

---

# **11\. Performance Overview**

The main performance screen should provide the most important metrics first.

Possible metrics:

79. Revenue  
80. Orders  
81. Average Order Value  
82. Growth  
    Performance Score

Use metric cards when appropriate.

---

# **12\. Metric Cards**

A metric card should communicate:

83. Metric name  
84. Current value  
85. Comparison  
    Direction

Example:

86. Revenue  
87.   
88. ₹12.4L  
89.   
90. ↓ 8.2%  
    vs previous period

Avoid displaying numbers without context.

---

# **13\. Metric Formatting**

Use human-readable formatting.

Examples:

91. ₹1,250  
92. ₹1.25L  
    ₹12.4L

depending on the scale.

Percentages should be clearly labeled.

Avoid excessive decimal places.

Prefer:

₹104.17

over:

₹104.1666666667

---

# **14\. Positive and Negative Trends**

The interface should clearly communicate direction.

Examples:

93. Revenue ↑  
94. Revenue ↓  
95. Orders ↑  
96. Orders ↓  
97. AOV ↑  
    AOV ↓

Do not rely exclusively on color.

Use:

98. Arrow  
99. Text  
    Percentage

along with any color treatment.

---

# **15\. Color Semantics**

Use a consistent semantic system.

Conceptually:

100. Positive  
101. → healthy / improving  
102.   
103. Warning  
104. → requires attention  
105.   
106. Critical  
107. → significant issue  
108.   
109. Neutral  
     → informational

Do not use colors merely for decoration.

---

# **16\. Accessibility**

Color must never be the only way to communicate meaning.

Bad:

110. Green \= good  
     Red \= bad

without any other indicator.

Better:

111. ↑ 12.4% — Improving  
     ↓ 8.1% — Declining  
     ---

     # **17\. Performance Score**

If Brew Buzz uses a performance score, make it visually prominent but not misleading.

Example:

112. Performance Score  
113.   
114. 78 / 100  
115.   
     Healthy

The user should be able to understand what the score represents.

If the score is composite, provide access to its supporting factors.

---

# **18\. Trend Visualization**

Use charts when trends are easier to understand visually.

Appropriate charts may include:

116. Line chart  
117. Bar chart  
     Comparison chart

Use charts for patterns rather than decoration.

---

# **19\. Revenue Trend**

A revenue trend should show:

118. Time  
     Revenue

Example:

119. Revenue  
120.  ₹  
121.  │        ╭──╮  
122.  │    ╭───╯  ╰──╮  
123.  │────╯         ╰──  
124.  └──────────────────  
           Time →

The actual implementation should use the selected charting library.

---

# **20\. Chart Design**

Charts should include:

125. Title  
126. Axis/context  
127. Tooltip  
     Relevant labels

Avoid charts with unnecessary visual elements.

---

# **21\. Chart Tooltips**

Hover/tap interactions should expose exact values when useful.

Example:

128. June 12  
129.   
130. Revenue: ₹42,500  
131. Orders: 412  
     AOV: ₹103.16  
     ---

     # **22\. Benchmark Visualization**

Benchmark comparisons should be easy to understand.

Example:

132. Your Outlet  
133. ₹12.4L  
134.   
135. Peer Average  
136. ₹14.1L  
137.   
138. Difference  
     \-12.1%

The user should immediately understand whether the outlet is above or below peers.

---

# **23\. Benchmark Context**

Never show:

₹12.4L

alone if the important business question is comparative performance.

Context matters:

139. ₹12.4L  
     ↓ 12.1% vs peer average  
     ---

     # **24\. Category Performance**

Brew Buzz focuses on the combined:

Pizza \+ Coffee

business model.

Category analytics may therefore show:

140. Pizza  
     Coffee

with their contribution and trends.

---

# **25\. Category Cards**

Example:

141. Pizza  
142.   
143. Revenue  
144. ₹8.2L  
145.   
146. Contribution  
147. 66%  
148.   
149. Growth  
     \+4.2%

and:

150. Coffee  
151.   
152. Revenue  
153. ₹4.2L  
154.   
155. Contribution  
156. 34%  
157.   
158. Growth  
     \-11.8%

Use the actual calculated values.

---

# **26\. Avoid False Precision**

Do not make the UI appear more precise than the underlying data.

If the source data supports:

\~12%

do not display:

12.384729%

unless exact precision is genuinely useful.

---

# **27\. AI Analysis Entry Point**

AI analysis should be easy to discover.

Example:

\[ Analyze with Brew Buzz AI \]

or an equivalent product-specific action.

The action should clearly communicate what will happen.

---

# **28\. AI Analysis Context**

Before analysis, the user should know what is being analyzed.

Example:

159. Analyze  
160.   
161. Outlet:  
162. Bengaluru Central  
163.   
164. Period:  
165. Last 30 Days  
166.   
     \[ Start Analysis \]  
     ---

     # **29\. AI Loading State**

Agentic analysis may take longer than ordinary API requests.

Do not show a generic:

Loading...

only.

Show meaningful progress.

Example:

167. Brew Buzz AI is analyzing Bengaluru Central  
168.   
169. ✓ Reviewing outlet performance  
170. ✓ Comparing peer benchmarks  
171. ● Investigating category trends  
     ○ Preparing recommendations

The exact implementation depends on actual agent execution events.

Do not fake progress that the backend does not provide.

---

# **30\. AI Analysis Result**

The analysis result should have a clear structure.

Recommended hierarchy:

172. AI Analysis  
173.     ↓  
174. Executive Summary  
175.     ↓  
176. Key Findings  
177.     ↓  
178. Evidence  
179.     ↓  
180. Recommendations  
181.     ↓  
     Limitations  
     ---

     # **31\. Executive Summary**

The first AI section should answer:

"What is the main story?"

Keep it concise.

Example:

182. Revenue declined primarily because coffee sales  
     fell faster than the outlet's overall order volume.

Only display claims supported by the agent's evidence.

---

# **32\. Findings**

Findings should be presented individually.

Example:

183. Finding 01  
184.   
185. Coffee revenue declined 18%  
186. over the selected period.  
187.   
188. Evidence  
189. Revenue trend  
190. Category performance  
     Peer comparison  
     ---

     # **33\. Finding Structure**

Each finding should ideally contain:

191. Finding  
192. Evidence  
193. Impact  
     Confidence / qualification where applicable

Do not expose raw chain-of-thought.

The UI should show concise evidence, not hidden model reasoning.

---

# **34\. Recommendations**

Recommendations should be visually separated from findings.

Example:

194. Recommended Action  
195.   
196. Investigate the decline in coffee-category  
197. sales and review product mix and availability.  
198.   
199. Why  
     Coffee revenue declined faster than total revenue.  
     ---

     # **35\. Recommendation Grounding**

Recommendations must connect to evidence.

Avoid presenting unsupported generic advice such as:

200. Improve marketing.  
201. Increase sales.  
     Work harder.  
     ---

     # **36\. AI Confidence**

If the system implements confidence indicators, they must represent a defined methodology.

Do not display arbitrary:

92% confidence

simply because the LLM generated it.

If confidence cannot be meaningfully calculated, omit it.

---

# **37\. Evidence**

Users should be able to understand why an AI conclusion was reached.

Evidence can include:

202. Revenue trend  
203. Order trend  
204. AOV  
205. Category data  
     Peer benchmark

Where appropriate, make evidence clickable or expandable.

---

# **38\. AI Limitations**

If data is incomplete, communicate that clearly.

Example:

206. Data limitation  
207.   
208. Customer feedback was not available,  
     so customer sentiment could not be evaluated.

This increases trust.

---

# **39\. Do Not Expose Chain-of-Thought**

Never create UI that exposes hidden model reasoning or internal chain-of-thought.

Instead show:

209. Conclusion  
210. \+  
211. Supporting evidence  
212. \+  
     Relevant tool/data sources  
     ---

     # **40\. Agent Activity**

If displaying agent activity, keep it high level.

Good:

213. Reviewing outlet metrics  
214. Checking benchmark  
     Analyzing category trends

Avoid exposing internal hidden reasoning.

---

# **41\. Error State**

If AI analysis fails:

215. Analysis unavailable  
216.   
217. We couldn't complete the analysis.  
     Please try again.

Provide:

\[ Retry \]

Do not show raw stack traces.

---

# **42\. Empty State**

If an outlet has insufficient data:

218. Not enough data  
219.   
220. There isn't enough historical data  
     to generate a reliable performance analysis.

Do not manufacture an insight.

---

# **43\. Partial Data**

If some metrics are available but others are missing:

221. Revenue  
222. Available  
223.   
224. Benchmark  
225. Unavailable  
226.   
227. Customer feedback  
     Unavailable

Do not hide missing information.

---

# **44\. Loading States**

Every data-dependent screen should handle:

228. Loading  
229. Success  
230. Empty  
     Error

Avoid layouts that jump dramatically when data loads.

---

# **45\. Skeleton Loading**

Skeletons may be used for predictable dashboard content.

Use them where they improve perceived performance.

Do not animate every element unnecessarily.

---

# **46\. Error Recovery**

Errors should provide useful recovery actions.

Examples:

231. \[ Retry \]  
232.   
233. \[ Choose another outlet \]  
234.   
     \[ Return to Dashboard \]

depending on the failure.

---

# **47\. Responsive Design**

The application must work across:

235. Desktop  
236. Laptop  
237. Tablet  
     Mobile

Prioritize desktop if the primary user workflow is business analytics, but do not create unusable mobile layouts.

---

# **48\. Dashboard Responsiveness**

On smaller screens:

238. Desktop  
239. Metric cards → horizontal layout  
240.   
241. Mobile  
     Metric cards → stacked layout

Charts should remain readable.

---

# **49\. Tables**

Use tables when users need to compare many outlets or values.

Example:

242. Outlet        Revenue    Growth    Score  
243. ────────────────────────────────────────  
244. Central       ₹12.4L     \-8.2%     78  
245. North         ₹14.1L     \+4.1%     86  
     East          ₹10.8L     \-2.3%     74

Do not replace every table with cards.

---

# **50\. Sorting and Filtering**

For outlet lists, useful controls may include:

246. Search  
247. Sort  
     Filter

Examples:

248. Sort by:  
249. Revenue  
250. Growth  
     Performance Score

Only implement controls supported by actual product requirements.

---

# **51\. Empty Search Results**

If filtering returns nothing:

251. No outlets found  
252.   
     Try changing your search or filters.

Do not show a broken/blank screen.

---

# **52\. Forms**

Forms should have:

253. Clear labels  
254. Validation  
255. Helpful errors  
256. Accessible controls  
     Logical grouping

Do not depend solely on placeholder text as labels.

---

# **53\. Buttons**

Buttons should clearly communicate actions.

Prefer:

257. Analyze Outlet  
258. View Performance  
259. Compare Outlets  
     Retry Analysis

over ambiguous:

260. Go  
261. Run  
     Continue  
     ---

     # **54\. Destructive Actions**

If destructive functionality is added later, require clear confirmation.

Milestone 1 should avoid destructive agent actions.

---

# **55\. Toasts**

Use toast notifications for lightweight events.

Examples:

262. Analysis started  
263. Preferences saved  
     Data refreshed

Do not use toasts for critical information that users must be able to review later.

---

# **56\. Modals**

Use modals sparingly.

Do not place entire primary workflows inside modal dialogs.

---

# **57\. Typography**

Use a clear hierarchy.

Conceptually:

264. Page title  
265. Section title  
266. Metric  
267. Supporting text  
     Metadata

Avoid excessive font sizes or decorative typography in the core dashboard.

---

# **58\. Spacing**

Use a consistent spacing system.

Do not manually invent arbitrary spacing values for every component.

Use the UI framework/design system spacing scale where available.

---

# **59\. Component Reuse**

Create reusable components for repeated patterns.

Examples:

268. MetricCard  
269. SectionHeader  
270. TrendChart  
271. BenchmarkCard  
272. FindingCard  
273. RecommendationCard  
274. StatusBadge  
275. LoadingState  
276. EmptyState  
     ErrorState

Do not duplicate identical markup across pages.

---

# **60\. Design System**

Establish reusable:

277. Colors  
278. Typography  
279. Spacing  
280. Borders  
281. Radius  
282. Shadows  
283. Buttons  
284. Inputs  
285. Cards  
     Charts

before building many screens.

---

# **61\. Visual Consistency**

The following should look consistent:

286. All metric cards  
287. All buttons  
288. All form controls  
289. All alerts  
290. All charts  
     All AI findings

Do not allow every page to invent its own visual language.

---

# **62\. Premium Visual Quality**

Brew Buzz should feel polished.

Use:

291. Strong hierarchy  
292. Clean spacing  
293. Subtle depth  
294. Purposeful motion  
295. Clear typography  
     High-quality charts

Avoid:

296. Excessive gradients  
297. Random animations  
298. Overloaded dashboards  
     Decorative elements without purpose  
     ---

     # **63\. Motion**

Animation should communicate state changes.

Good examples:

299. Chart transitions  
300. Panel expansion  
301. Loading states  
     Navigation transitions

Avoid excessive animation that slows down business workflows.

---

# **64\. Accessibility**

The interface should support:

302. Keyboard navigation  
303. Readable contrast  
304. Semantic HTML  
305. Accessible labels  
306. Focus states  
     Screen-reader-friendly controls

Do not remove visible focus indicators without providing an accessible replacement.

---

# **65\. Keyboard Navigation**

Interactive controls should be reachable using the keyboard.

Ensure:

307. Tab  
308. Enter  
309. Space  
     Escape

behave appropriately where applicable.

---

# **66\. Chart Accessibility**

Charts should have accessible summaries or supporting text.

Do not make critical business information available only through visual chart interpretation.

Example:

Revenue declined 8.2% over the selected period.

can accompany a chart.

---

# **67\. Data Freshness**

If data can become stale, communicate its context.

Example:

Updated 5 minutes ago

Only display freshness information when it reflects actual system data.

Never fabricate timestamps.

---

# **68\. Refresh**

If manual refresh exists:

\[ Refresh Data \]

the interface should indicate:

Refreshing...

and return to the correct state afterward.

---

# **69\. User Trust**

The UI must clearly distinguish:

310. Observed data  
311. Calculated metric  
312. AI interpretation  
     AI recommendation

Do not make AI-generated content look indistinguishable from database facts.

---

# **70\. AI Visual Distinction**

AI-generated insights should have a consistent visual identity.

Example:

313. Brew Buzz AI  
314.   
315. Key Finding  
316. ...  
317.   
318. Recommended Action  
     ...

The visual treatment should communicate that this is an AI interpretation.

---

# **71\. Evidence vs Interpretation**

Use labels where useful:

319. Data  
320. AI Finding  
     Recommendation

This prevents users from confusing raw metrics with AI conclusions.

---

# **72\. No Fake Data**

During development, mock data may be used temporarily.

When mock data is displayed, it must not be presented as real production data.

Once backend integration exists, replace mocks with real API data.

---

# **73\. No Fake AI Progress**

Do not create a fake sequence such as:

321. Analyzing...  
322. Checking competitors...  
     Predicting demand...

unless the backend actually performs those operations.

UI progress must correspond to real agent events or clearly be generic.

---

# **74\. API Integration**

Frontend components should consume backend APIs through a clear data-access layer.

Avoid scattering raw API calls throughout UI components.

Prefer:

323. Component  
324.  ↓  
325. Hook / Query Layer  
326.  ↓  
327. API Client  
328.  ↓  
     Backend  
     ---

     # **75\. Frontend State Management**

Use the project's selected state-management approach.

Do not introduce a global state library for every piece of state.

Local component state is appropriate for local UI concerns.

Server state should use the chosen data-fetching strategy.

---

# **76\. URL State**

Where appropriate, important filters may be represented in the URL.

For example:

/outlets/12?period=30d

This can make views shareable and navigable.

Only implement this where it benefits the product.

---

# **77\. Route Protection**

Protected application routes should not expose authenticated content to unauthenticated users.

Do not rely only on hiding navigation items.

The backend must still enforce authorization.

---

# **78\. Performance**

Avoid unnecessary:

329. Re-renders  
330. API requests  
331. Large bundles  
     Repeated calculations

Charts and large datasets should be handled efficiently.

Do not optimize prematurely.

---

# **79\. Mobile Performance**

Avoid loading extremely large datasets merely because the desktop screen can display them.

Request only the data necessary for the current view.

---

# **80\. Component Architecture**

Prefer a component hierarchy such as:

332. Dashboard  
333. ├── Header  
334. ├── OutletSelector  
335. ├── MetricGrid  
336. │   ├── MetricCard  
337. │   ├── MetricCard  
338. │   └── MetricCard  
339. ├── TrendSection  
340. │   └── TrendChart  
341. ├── BenchmarkSection  
342. │   └── BenchmarkCard  
343. └── AIInsights  
344.     ├── FindingCard  
         └── RecommendationCard

The exact hierarchy may change as the product evolves.

---

# **81\. Avoid Monolithic Components**

Do not create one giant component containing:

345. Data fetching  
346. Business calculations  
347. Chart logic  
348. Agent UI  
349. Routing  
     Authentication

Separate responsibilities.

---

# **82\. Business Logic**

Do not duplicate backend business calculations in the frontend.

For example, if backend defines:

Performance Score

the frontend should consume the calculated value.

Do not independently recreate the scoring algorithm in React.

---

# **83\. Formatting vs Calculation**

Frontend may format values:

350. 1240000  
     → ₹12.4L

but should not independently recalculate authoritative business metrics.

---

# **84\. Error Boundaries**

Use appropriate error boundaries for unexpected frontend failures.

A component failure should not necessarily destroy the entire application.

---

# **85\. Authentication UI**

Authentication screens should be simple and trustworthy.

Include:

351. Email / username  
352. Password  
353. Sign in  
     Error message

according to the selected authentication design.

Do not expose technical authentication errors.

---

# **86\. Logout**

Provide a clear logout mechanism.

After logout:

354. Protected data  
     → inaccessible  
     ---

     # **87\. Session Expiration**

If a session expires:

355. Session expired  
356.   
     Please sign in again.

Do not leave the user staring at broken API errors.

---

# **88\. Product Language**

Use consistent terminology throughout Brew Buzz.

Prefer:

357. Outlet  
358. Revenue  
359. Orders  
360. Average Order Value  
361. Performance  
362. Benchmark  
363. Finding  
364. Recommendation  
     Analysis

Do not randomly alternate between:

365. Store  
366. Branch  
367. Outlet  
     Location

unless these terms have intentionally different meanings.

---

# **89\. Pizza \+ Coffee Context**

The product should visually support the combined business model.

Use category terminology such as:

368. Pizza  
369. Coffee  
     Overall

without turning every screen into a food-themed interface.

Brew Buzz is a business intelligence product, not a restaurant ordering app.

---

# **90\. Avoid Restaurant-App Patterns**

Do not accidentally design Brew Buzz like:

370. Food delivery app  
371. Restaurant ordering system  
372. Menu browsing app  
     Customer loyalty app

The primary product is:

Franchise Analytics \+ Agentic AI

---

# **91\. Dashboard Density**

Business dashboards require enough information to be useful.

However:

More cards ≠ Better dashboard

Prioritize the metrics that answer the user's immediate question.

---

# **92\. Progressive Disclosure**

Show high-level information first.

Allow users to expand into:

373. Details  
374. Evidence  
375. Breakdowns  
     Historical data

when necessary.

---

# **93\. AI Insight Progressive Disclosure**

Example:

376. Key Finding  
377.     ↓  
378. Why?  
379.     ↓  
380. Evidence  
381.     ↓  
     Detailed metrics

Do not overwhelm users with every underlying data point immediately.

---

# **94\. Refresh vs Re-analysis**

Distinguish:

Refresh Data

from:

Run AI Analysis

Refreshing data should not necessarily trigger an expensive AI analysis.

---

# **95\. Analysis History**

If analysis history is implemented later, show:

382. Outlet  
383. Analysis date  
384. Period analyzed  
     Summary

Do not add this feature during Milestone 1 unless required.

---

# **96\. Notifications**

Do not add a complex notification center unless the product requires it.

Use simple feedback mechanisms first.

---

# **97\. Settings**

Settings should contain only configuration relevant to the product.

Avoid creating a large settings area before there are actual settings to configure.

---

# **98\. Responsive Navigation**

On mobile, the navigation may collapse into an appropriate mobile navigation pattern.

Do not simply shrink desktop navigation until it becomes unusable.

---

# **99\. Visual QA**

Before considering a UI feature complete, verify:

385. Spacing  
386. Alignment  
387. Typography  
388. Responsiveness  
389. Loading state  
390. Error state  
391. Empty state  
392. Accessibility  
     Data formatting  
     ---

     # **100\. UI Definition of Done**

A Brew Buzz UI feature is complete when:

* The user understands what the screen is for.  
* Important information is visually prioritized.  
* Real backend data is displayed correctly.  
* Loading state exists.  
* Error state exists.  
* Empty state exists where applicable.  
* Responsive behavior works.  
* Keyboard interaction works where applicable.  
* Components are reusable.  
* Business calculations are not duplicated unnecessarily.  
* AI content is clearly distinguished from raw data.  
* Findings have supporting evidence.  
* Recommendations are clearly separated.  
* No fake AI behavior is presented as real.  
* No fake data is presented as real.  
* The interface is visually consistent with the Brew Buzz design system.  
  ---

  # **101\. Golden Rules**

1. **Design for franchise intelligence, not food ordering.**  
2. **Show the most important business information first.**  
3. **Context is as important as the number itself.**  
4. **Do not duplicate authoritative business calculations in the frontend.**  
5. **Never present AI interpretation as raw fact.**  
6. **Show evidence for important AI findings.**  
7. **Never expose hidden chain-of-thought.**  
8. **Never fake agent progress.**  
9. **Never fabricate data or timestamps.**  
10. **Every data-dependent screen needs loading, error, and empty handling.**  
11. **Do not rely on color alone to communicate meaning.**  
12. **Keep the application responsive.**  
13. **Reuse components and design patterns.**  
14. **Avoid unnecessary global state.**  
15. **Avoid unnecessary pages and infrastructure.**  
16. **Use charts to communicate patterns, not decoration.**  
17. **Make recommendations visually distinct from findings.**  
18. **Communicate uncertainty when data is insufficient.**  
19. **Keep terminology consistent across the product.**  
20. **The UI should make Brew Buzz's intelligence understandable, not hide it behind visual complexity.**

