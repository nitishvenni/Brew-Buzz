import json
from typing import Dict, Any, List, TypedDict, Annotated, Literal
from datetime import datetime
import operator

from sqlalchemy.orm import Session

from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.schemas.marketing_agent import MarketingAgentRequest, MarketingAgentResponse
from app.agents.marketing import tools as my_tools
from app.core.database import SessionLocal

# State
class MarketingAgentState(TypedDict):
    request: MarketingAgentRequest
    db_session: Any # Pass session
    messages: Annotated[List[BaseMessage], operator.add]
    tools_used: List[str]
    mock_mode: bool

def parse_iso_date(date_str: str) -> datetime | None:
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except ValueError:
        return None

def run_tool(name: str, kwargs: dict, state: MarketingAgentState) -> str:
    db = state["db_session"]
    req = state["request"]
    state["tools_used"].append(name)
    
    # Use request dates if tool kwargs omit them
    sd_str = kwargs.get("start_date") or (req.start_date.isoformat() if req.start_date else None)
    ed_str = kwargs.get("end_date") or (req.end_date.isoformat() if req.end_date else None)
    start_date = parse_iso_date(sd_str)
    end_date = parse_iso_date(ed_str)
    
    outlet_id = kwargs.get("outlet_id") or req.outlet_id
    
    if name == "get_marketing_summary_tool":
        res = my_tools.get_marketing_summary_tool(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    elif name == "get_product_demand_tool":
        res = my_tools.get_product_demand_tool(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    elif name == "get_category_mix_tool":
        res = my_tools.get_category_mix_tool(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    elif name == "compare_outlet_demand_tool":
        res = my_tools.compare_outlet_demand_tool(db, start_date=start_date, end_date=end_date)
    elif name == "get_marketing_alerts_tool":
        res = my_tools.get_marketing_alerts_tool(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    elif name == "get_marketing_trends_tool":
        res = my_tools.get_marketing_trends_tool(db, start_date=start_date, end_date=end_date, outlet_id=outlet_id)
    else:
        return f"Unknown tool: {name}"
    
    return json.dumps(res, default=str)


def _generate_deterministic_fallback(state: MarketingAgentState) -> dict:
    import json as json_lib
    
    tool_results = []
    for m in state["messages"]:
        if hasattr(m, "content") and getattr(m, "type", "") == "tool":
            tool_results.append(str(m.content))
        elif m.__class__.__name__ == "ToolMessage":
            tool_results.append(str(m.content))
            
    summary = "AI reasoning is currently unavailable. Displaying available deterministic metrics."
    key_findings = []
    
    if not tool_results:
        key_findings.append("No data available to display.")
    else:
        for res_str in tool_results:
            try:
                data = json_lib.loads(res_str)
                if isinstance(data, dict):
                    if "revenue" in data:
                        key_findings.append(f"Revenue: {data['revenue']} (Growth: {data.get('revenue_growth_pct')}%)")
                    if "orders" in data:
                        key_findings.append(f"Orders: {data['orders']} (Growth: {data.get('orders_growth_pct')}%)")
                elif isinstance(data, list):
                    if data and isinstance(data[0], dict) and "severity" in data[0]:
                        key_findings.append(f"Found {len(data)} active alerts.")
                        for alert in data[:3]:
                            key_findings.append(f"Alert: {alert.get('type')} - {alert.get('entity_name')} ({alert.get('severity')})")
                    elif data and isinstance(data[0], dict) and "product_name" in data[0]:
                        key_findings.append(f"Analyzed {len(data)} products.")
            except Exception:
                pass
                
    if not key_findings:
        key_findings.append("Deterministic data retrieved but metrics could not be automatically formatted.")
        
    return {
        "summary": summary,
        "key_findings": key_findings,
        "risks": ["Unable to reason about risks without AI."],
        "recommendations": ["Review the deterministic analytics dashboards for detailed insights."],
        "confidence": "Low",
        "data_sources_used": list(set(state["tools_used"]))
    }

def reasoning_node(state: MarketingAgentState):
    messages = state["messages"]
    
    if state["mock_mode"]:
        if not state["tools_used"]:
            if state["request"].outlet_id:
                tool_calls = [
                    {"id": "call_1", "name": "get_marketing_summary_tool", "args": {"outlet_id": state["request"].outlet_id}},
                ]
            else:
                tool_calls = [
                    {"id": "call_1", "name": "get_marketing_summary_tool", "args": {}},
                    {"id": "call_2", "name": "get_marketing_alerts_tool", "args": {}},
                ]
            return {"messages": [AIMessage(content="", tool_calls=tool_calls)]}
            
        final_response = _generate_deterministic_fallback(state)
        import json as json_lib
        return {"messages": [AIMessage(content=json_lib.dumps(final_response))]}

    # REAL LLM LOGIC
    llm_tools = [
        {
            "type": "function",
            "function": {
                "name": "get_marketing_summary_tool",
                "description": "Retrieve general marketing performance metrics (revenue, orders, AOV, growth) for a specific date range.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "start_date": {"type": "string", "description": "ISO format date"},
                        "end_date": {"type": "string", "description": "ISO format date"},
                        "outlet_id": {"type": "integer"}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_product_demand_tool",
                "description": "Retrieve product-level performance, growth, and trends to identify top/bottom products.",
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
                "name": "get_category_mix_tool",
                "description": "Retrieve category-level revenue and contribution mix.",
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
                "name": "compare_outlet_demand_tool",
                "description": "Retrieve performance across all outlets to compare revenue and order growth.",
                "parameters": {
                    "type": "object", 
                    "properties": {
                        "start_date": {"type": "string"},
                        "end_date": {"type": "string"}
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_marketing_alerts_tool",
                "description": "Retrieve automated marketing alerts (product demand surge/decline, outlet revenue drop, category changes).",
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
                "name": "get_marketing_trends_tool",
                "description": "Retrieve daily marketing trends over the requested date range.",
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
    
    system_prompt = SystemMessage(content='''You are Brew Buzz Marketing Intelligence, a factual marketing and demand intelligence assistant.
Your goal is to answer questions using deterministic tools, separating facts from reasoning.

FACTUAL RULES:
1. Use tools for marketing facts. DO NOT invent metrics.
2. The current schema DOES NOT contain: Customer data, Campaign spend, Promotion data, Coupons, Discount attribution, CAC, CLTV, Retention metrics, Churn metrics, ROAS, or Campaign ROI.
3. If asked about unsupported data (e.g., ROI, campaigns, specific customers), state clearly that the data is not available.
4. Do not convert correlation into causation (e.g., say 'Demand increased during this period', NOT 'Campaign X caused the demand increase').
5. Use phrases such as 'The data shows...', 'The available data indicates...'.
6. Do not fabricate dates. Respect the provided dates or fall back to tool defaults.
7. Output MUST be valid JSON matching the MarketingAgentResponse schema exactly. No markdown code blocks around the JSON in the final answer if possible, just the raw JSON.
8. If tools return empty or errors, gracefully say data is unavailable.

IMPORTANT: Your final response MUST be a JSON object with exactly these keys:
{
  "summary": "String summarizing findings",
  "key_findings": ["List of strings", "Fact 2"],
  "risks": ["Risk 1", "Risk 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "confidence": "High | Medium | Low",
  "data_sources_used": ["List of tools used"]
}
''')

    try:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured.")
        
        # We need to enforce JSON output matching our Pydantic schema
        llm = ChatGoogleGenerativeAI(
            model=getattr(settings, "GEMINI_MODEL", "gemini-1.5-pro"), 
            google_api_key=settings.GEMINI_API_KEY, 
            temperature=0,
        ).bind_tools(llm_tools)
        
        response = llm.invoke([system_prompt] + messages)
        
        return {"messages": [response]}
        
    except Exception as e:
        # FALLBACK: deterministic raw data
        final_response = _generate_deterministic_fallback(state)
        import json as json_lib
        return {"messages": [AIMessage(content=json_lib.dumps(final_response))]}

def tools_node(state: MarketingAgentState):
    messages = state["messages"]
    last_msg = messages[-1]
    
    if not hasattr(last_msg, "tool_calls") or not last_msg.tool_calls:
        return {"messages": []}
        
    tool_responses = []
    for tc in last_msg.tool_calls:
        result = run_tool(tc["name"], tc["args"], state)
        tool_responses.append(ToolMessage(content=result, tool_call_id=tc["id"]))
        
    return {"messages": tool_responses}

def format_output_node(state: MarketingAgentState):
    # Enforce formatting in case the LLM returned loose text or markdown
    messages = state["messages"]
    last_msg = messages[-1]
    
    if isinstance(last_msg.content, list):
        content = " ".join([c["text"] for c in last_msg.content if "text" in c])
    else:
        content = str(last_msg.content).strip()
    
    # Remove markdown code blocks if the LLM added them
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()
    
    import json as json_lib
    try:
        parsed = json_lib.loads(content)
        # Strict validation
        from app.schemas.marketing_agent import MarketingAgentResponse
        validated = MarketingAgentResponse.model_validate(parsed)
        return {"messages": [AIMessage(content=validated.model_dump_json())]}
    except Exception as e:
        fallback = _generate_deterministic_fallback(state)
        fallback["summary"] = "AI response was generated but failed schema validation. " + fallback["summary"]
        return {"messages": [AIMessage(content=json_lib.dumps(fallback))]}

def route_next(state: MarketingAgentState) -> Literal["tools_node", "format_output_node"]:
    last_msg = state["messages"][-1]
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        return "tools_node"
    return "format_output_node"

def build_marketing_graph():
    workflow = StateGraph(MarketingAgentState)
    
    workflow.add_node("reasoning", reasoning_node)
    workflow.add_node("tools_node", tools_node)
    workflow.add_node("format_output_node", format_output_node)
    
    workflow.set_entry_point("reasoning")
    
    workflow.add_conditional_edges("reasoning", route_next)
    workflow.add_edge("tools_node", "reasoning")
    workflow.add_edge("format_output_node", END)
    
    return workflow.compile()

def run_marketing_agent(db: Session, request: MarketingAgentRequest, mock_mode: bool = False) -> MarketingAgentResponse:
    import json as json_lib
    
    # Build initial message
    content = f"Objective: {request.objective}\nQuestion: {request.user_question}\n"
    if request.outlet_id:
        content += f"Context: Focus on outlet_id = {request.outlet_id}\n"
    if request.start_date and request.end_date:
        content += f"Date Range: {request.start_date.isoformat()} to {request.end_date.isoformat()}\n"
        
    initial_msg = HumanMessage(content=content)
    
    state: MarketingAgentState = {
        "request": request,
        "db_session": db,
        "messages": [initial_msg],
        "tools_used": [],
        "mock_mode": mock_mode
    }
    
    graph = build_marketing_graph()
    
    final_state = graph.invoke(state)
    
    last_msg = final_state["messages"][-1]
    content_str = str(last_msg.content)
    
    try:
        data = json_lib.loads(content_str)
        return MarketingAgentResponse(**data)
    except Exception as e:
        # Final safety net
        return MarketingAgentResponse(
            summary=f"Error parsing AI response: {str(e)}. Raw content: {content_str[:100]}...",
            confidence="Low"
        )
