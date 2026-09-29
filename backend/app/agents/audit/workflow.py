import json
from typing import Dict, Any, List, TypedDict, Annotated, Literal
from datetime import datetime
import operator

from sqlalchemy.orm import Session

from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.schemas.audit_agent import AuditAgentRequest, AuditAgentResponse
from app.agents.audit import tools as my_tools
from app.core.database import SessionLocal

# State
class AuditAgentState(TypedDict):
    request: AuditAgentRequest
    db_session: Any
    messages: Annotated[List[BaseMessage], operator.add]
    tools_used: List[str]
    mock_mode: bool
    tool_rounds: int

def parse_iso_date(date_str: str) -> datetime | None:
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except ValueError:
        return None

def run_tool(name: str, kwargs: dict, state: AuditAgentState) -> str:
    db = state["db_session"]
    req = state["request"]
    state["tools_used"].append(name)

    sd_str = kwargs.get("start_date") or (req.start_date.isoformat() if req.start_date else None)
    ed_str = kwargs.get("end_date") or (req.end_date.isoformat() if req.end_date else None)
    start_date = parse_iso_date(sd_str)
    end_date = parse_iso_date(ed_str)

    outlet_id = kwargs.get("outlet_id") or req.outlet_id

    if name == "get_franchise_health_tool":
        res = my_tools.get_franchise_health_tool(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    elif name == "get_franchise_alerts_tool":
        res = my_tools.get_franchise_alerts_tool(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    elif name == "get_cross_domain_signals_tool":
        res = my_tools.get_cross_domain_signals_tool(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    elif name == "compare_outlet_domains_tool":
        # Note: outlet_id is strictly required here if specified in the schema, but wait, compare_outlet_domains_tool requires outlet_id as int!
        if outlet_id is None:
            return json.dumps({"error": "outlet_id is required for compare_outlet_domains_tool"})
        res = my_tools.compare_outlet_domains_tool(db, outlet_id=outlet_id, start_date=start_date, end_date=end_date)
    elif name == "get_franchise_trends_tool":
        res = my_tools.get_franchise_trends_tool(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    else:
        return f"Unknown tool: {name}"

    return json.dumps(res, default=str)

def _generate_deterministic_fallback(state: AuditAgentState) -> dict:
    import json as json_lib

    tool_results = []
    for m in state["messages"]:
        if hasattr(m, "content") and getattr(m, "type", "") == "tool":
            tool_results.append(str(m.content))
        elif m.__class__.__name__ == "ToolMessage":
            tool_results.append(str(m.content))

    summary = "Generative AI reasoning is unavailable. The following summary is based on deterministic Brew Buzz audit data."
    attention_areas = []
    cross_domain_signals = []

    if not tool_results:
        attention_areas.append("No data available to display.")
    else:
        for res_str in tool_results:
            try:
                data = json_lib.loads(res_str)
                if isinstance(data, dict):
                    if "error" in data:
                        continue
                    if "alerts" in data and isinstance(data["alerts"], list):
                        for alert in data["alerts"][:3]:
                            attention_areas.append(f"Alert in {alert.get('domain', 'Unknown')}: {alert.get('description', '')} ({alert.get('severity', 'Unknown')})")
                    if "signals" in data and isinstance(data["signals"], list):
                        for signal in data["signals"][:3]:
                            cross_domain_signals.append(f"Signal: {signal.get('description', '')} (Type: {signal.get('signal_type', 'Unknown')})")
                    if "metrics" in data and "outlet_metrics" in data["metrics"]:
                        m = data["metrics"]["outlet_metrics"]
                        attention_areas.append(f"Revenue: {m.get('revenue', 0)} Orders: {m.get('orders', 0)}")
                    if "comparison" in data and "revenue" in data["comparison"]:
                        m = data["comparison"]
                        attention_areas.append(f"Outlet Comparison: {m.get('outlet_name', '')} Revenue: {m.get('revenue', 0)}")
            except Exception:
                pass

    if not attention_areas and not cross_domain_signals:
        attention_areas.append("Deterministic data retrieved but metrics could not be automatically formatted.")

    return {
        "summary": summary,
        "cross_domain_signals": cross_domain_signals,
        "attention_areas": attention_areas,
        "recommendations": [],
        "confidence": "Low",
        "data_sources_used": list(set(state["tools_used"]))
    }

def reasoning_node(state: AuditAgentState):
    messages = state["messages"]

    if state["mock_mode"]:
        if not state["tools_used"]:
            if state["request"].outlet_id:
                tool_calls = [
                    {"id": "call_1", "name": "get_franchise_health_tool", "args": {"outlet_id": state["request"].outlet_id}},
                    {"id": "call_2", "name": "compare_outlet_domains_tool", "args": {"outlet_id": state["request"].outlet_id}},
                ]
            else:
                tool_calls = [
                    {"id": "call_1", "name": "get_franchise_health_tool", "args": {}},
                    {"id": "call_2", "name": "get_franchise_alerts_tool", "args": {}},
                    {"id": "call_3", "name": "get_cross_domain_signals_tool", "args": {}},
                ]
            return {"messages": [AIMessage(content="", tool_calls=tool_calls)]}

        final_response = _generate_deterministic_fallback(state)
        import json as json_lib
        return {"messages": [AIMessage(content=json_lib.dumps(final_response))]}

    llm_tools = [
        {
            "type": "function",
            "function": {
                "name": "get_franchise_health_tool",
                "description": "Provide deterministic franchise-level operational snapshot (revenue, orders, etc).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "start_date": {"type": "string"},
                        "end_date": {"type": "string"},
                        "outlet_id": {"type": "integer"}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_franchise_alerts_tool",
                "description": "Provide consolidated alerts across Outlet, Inventory, Workforce, and Marketing domains.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "start_date": {"type": "string"},
                        "end_date": {"type": "string"},
                        "outlet_id": {"type": "integer"}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_cross_domain_signals_tool",
                "description": "Provide deterministic cross-domain operational relationships (e.g. demand mismatches, workload pressure).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "start_date": {"type": "string"},
                        "end_date": {"type": "string"},
                        "outlet_id": {"type": "integer"}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "compare_outlet_domains_tool",
                "description": "Compare operational information for a specific outlet. Requires outlet_id.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "start_date": {"type": "string"},
                        "end_date": {"type": "string"},
                        "outlet_id": {"type": "integer"}
                    },
                    "required": ["outlet_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_franchise_trends_tool",
                "description": "Provide supported deterministic franchise trends (daily revenue, orders, AOV).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "start_date": {"type": "string"},
                        "end_date": {"type": "string"},
                        "outlet_id": {"type": "integer"}
                    }
                }
            }
        }
    ]

    system_prompt = SystemMessage(content='''You are the Brew Buzz Franchise Audit Intelligence Agent.
Your role is to investigate verified operational data and explain measurable franchise conditions.

FACTUAL RULES:
1. You have access ONLY to approved read-only business intelligence tools.
2. Business facts MUST come from tool results.
3. Never invent metrics. Never estimate missing metrics.
4. Never fabricate an outlet, employee, product, inventory item, revenue number, order count, attendance number, or trend.
5. If information is unavailable, explicitly say it is unavailable. Do not use general world knowledge to fill missing Brew Buzz data.
6. You are read-only. You cannot modify business data or make automated business decisions.
7. You cannot claim causation unless deterministic evidence explicitly establishes it. Cross-domain signals represent observed operational relationships or co-occurrences. They do NOT automatically prove that one factor caused another. Use words like "co-occur", "associated conditions", "observed alongside", "requires investigation".
8. Workforce data: you MUST NOT infer personality, character, attitude, motivation, laziness, irresponsibility, intelligence, mental state, health, intent, job suitability, or termination recommendations. Use aggregate workforce information and just report elevated absence or overtime.
9. You MUST NOT fabricate or claim to analyze: customer retention, churn, CLTV, CAC, customer segmentation, campaign ROI, ROAS, promotion effectiveness, advertising spend, profitability, payroll, employee salary, customer demographics. If asked about these, state the current Brew Buzz data model does not provide sufficient data.
10. Do NOT create an overall Franchise Health Score, Audit Score, AI Score, or Risk Score. Use factual domain conditions instead.
11. A tool error is NOT business evidence. Do not convert tool errors into risks or alerts.

GROUNDED MANAGEMENT ACTION RULES:
A. Evidence Grounding: Every action MUST be supported by deterministic evidence explicitly available in the context or tool results. Do not invent KPI values, percentages, counts, or dates.
B. Supporting Evidence: The supporting_evidence array must contain only evidence actually available to you. Do not fabricate fictional evidence.
C. Causality: Do not claim that one observed business metric caused another unless explicitly proven. Use phrases like "occurred alongside", "was observed alongside", "coincided with", or "management may investigate whether".
D. Expected Operational Effect: Describe a possible operational outcome. Do not guarantee outcomes using words like "will definitely increase" or "caused".
E. Monitoring: The monitor field should identify an existing measurable signal that management can observe. Do not invent a new metric.
F. Decision Support: You provide recommendations for management consideration. You DO NOT execute actions, create tasks, assign employees, modify inventory/staffing/marketing, write to databases, or call mutation tools.

IMPORTANT: Your final response MUST be a JSON object with exactly these keys:
{
  "summary": "String summarizing findings",
  "cross_domain_signals": ["String 1", "String 2"],
  "attention_areas": ["Area 1", "Area 2"],
  "recommendations": [
    {
      "action": "What should management consider doing?",
      "rationale": "Why is that action supported by the available evidence?",
      "priority": "HIGH or MEDIUM or LOW",
      "supporting_evidence": ["Evidence 1", "Evidence 2"],
      "expected_operational_effect": "What operational effect is expected?",
      "monitor": "What existing measurable signal should be monitored?"
    }
  ],
  "confidence": "High" | "Medium" | "Low",
  "data_sources_used": ["List of tools used"]
}
''')

    try:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured.")

        llm = ChatGoogleGenerativeAI(
            model=getattr(settings, "GEMINI_MODEL", "gemini-1.5-pro"),
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0,
        ).bind_tools(llm_tools)

        response = llm.invoke([system_prompt] + messages)

        return {"messages": [response]}

    except Exception as e:
        final_response = _generate_deterministic_fallback(state)
        import json as json_lib
        return {"messages": [AIMessage(content=json_lib.dumps(final_response))]}

def tools_node(state: AuditAgentState):
    messages = state["messages"]
    last_msg = messages[-1]

    if not hasattr(last_msg, "tool_calls") or not last_msg.tool_calls:
        return {"messages": []}

    tool_responses = []
    for tc in last_msg.tool_calls:
        result = run_tool(tc["name"], tc["args"], state)
        tool_responses.append(ToolMessage(content=result, tool_call_id=tc["id"]))

    return {"messages": tool_responses, "tool_rounds": state.get("tool_rounds", 0) + 1}

def format_output_node(state: AuditAgentState):
    messages = state["messages"]
    last_msg = messages[-1]

    if isinstance(last_msg.content, list):
        content = " ".join([c["text"] for c in last_msg.content if "text" in c])
    else:
        content = str(last_msg.content).strip()

    if content.startswith("`json"):
        content = content[7:]
    if content.startswith("`"):
        content = content[3:]
    if content.endswith("`"):
        content = content[:-3]
    content = content.strip()

    import json as json_lib
    try:
        parsed = json_lib.loads(content)
        from app.schemas.audit_agent import AuditAgentResponse
        validated = AuditAgentResponse.model_validate(parsed)
        return {"messages": [AIMessage(content=validated.model_dump_json())]}
    except Exception as e:
        fallback = _generate_deterministic_fallback(state)
        fallback["summary"] = "AI response was generated but failed schema validation. " + fallback["summary"]
        return {"messages": [AIMessage(content=json_lib.dumps(fallback))]}

def route_next(state: AuditAgentState) -> Literal["tools_node", "format_output_node"]:
    last_msg = state["messages"][-1]
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        if state.get("tool_rounds", 0) < 3:
            return "tools_node"
    return "format_output_node"

def build_audit_graph():
    workflow = StateGraph(AuditAgentState)

    workflow.add_node("reasoning", reasoning_node)
    workflow.add_node("tools_node", tools_node)
    workflow.add_node("format_output_node", format_output_node)

    workflow.set_entry_point("reasoning")

    workflow.add_conditional_edges("reasoning", route_next)
    workflow.add_edge("tools_node", "reasoning")
    workflow.add_edge("format_output_node", END)

    return workflow.compile()

def run_audit_agent(db: Session, request: AuditAgentRequest, mock_mode: bool = False) -> AuditAgentResponse:
    import json as json_lib

    content = f"Objective: {request.objective}\nQuestion: {request.user_question}\n"
    if request.outlet_id:
        content += f"Context: Focus on outlet_id = {request.outlet_id}\n"
    if request.start_date and request.end_date:
        content += f"Date Range: {request.start_date.isoformat()} to {request.end_date.isoformat()}\n"

    if request.outlet_context or request.structured_evidence:
        content += "\n=== VERIFIED CONTEXT ===\n"
        content += "The following are deterministic facts already calculated by Brew Buzz. These values must be treated as facts, not hypotheses. Do not recalculate or invent these values. Existing read-only tools may be used when deeper information is required. Tool results remain authoritative for additional deterministic facts.\n\n"

        if request.outlet_context:
            content += f"[Deterministic Outlet Context]\n{request.outlet_context.model_dump_json(exclude_unset=True)}\n\n"

        if request.structured_evidence:
            content += "[Structured Evidence]\n"
            for ev in request.structured_evidence:
                content += f"- {ev.title} ({ev.domain}):\n"
                for m in ev.metrics:
                    content += f"  - {m.label}: {m.value} {m.unit or ''} {m.status or ''}\n"
            content += "\n"

    initial_msg = HumanMessage(content=content)

    state: AuditAgentState = {
        "request": request,
        "db_session": db,
        "messages": [initial_msg],
        "tools_used": [],
        "mock_mode": mock_mode,
        "tool_rounds": 0
    }

    graph = build_audit_graph()

    final_state = graph.invoke(state)

    last_msg = final_state["messages"][-1]
    content_str = str(last_msg.content)

    try:
        data = json_lib.loads(content_str)
        return AuditAgentResponse.model_validate(data)
    except Exception as e:
        fallback = _generate_deterministic_fallback(final_state)
        return AuditAgentResponse.model_validate(fallback)
