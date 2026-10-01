import json
from typing import Dict, Any, List, TypedDict, Annotated, Literal
from datetime import datetime
import operator

from sqlalchemy.orm import Session

from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool

from app.core.config import settings
from app.schemas.inventory_agent import InventoryAgentRequest, InventoryAgentResponse
from app.agents.inventory import tools as my_tools
from app.core.database import SessionLocal

# State
class InventoryAgentState(TypedDict):
    request: InventoryAgentRequest
    db_session: Any # Pass session
    messages: Annotated[List[BaseMessage], operator.add]
    tools_used: List[str]
    mock_mode: bool

def run_tool(name: str, kwargs: dict, state: InventoryAgentState) -> str:
    db = state["db_session"]
    req = state["request"]
    state["tools_used"].append(name)
    
    if name == "get_inventory_item_metrics":
        res = my_tools.get_inventory_item_metrics_tool(db, kwargs.get("inventory_item_id") or req.inventory_item_id)
    elif name == "get_inventory_consumption_trend":
        res = my_tools.get_inventory_consumption_trend_tool(db, kwargs.get("inventory_item_id") or req.inventory_item_id)
    elif name == "get_inventory_history":
        res = my_tools.get_inventory_history_tool(db, kwargs.get("inventory_item_id") or req.inventory_item_id)
    elif name == "get_reorder_recommendation":
        res = my_tools.get_reorder_recommendation_tool(db, kwargs.get("inventory_item_id") or req.inventory_item_id)
    elif name == "get_inventory_alerts":
        res = my_tools.get_inventory_alerts_tool(db)
    elif name == "get_inventory_summary":
        res = my_tools.get_inventory_summary_tool(db)
    elif name == "compare_inventory_items":
        res = my_tools.compare_inventory_items_tool(db)
    else:
        return f"Unknown tool: {name}"
    
    return json.dumps(res, default=str)

def reasoning_node(state: InventoryAgentState):
    messages = state["messages"]
    
    if state["mock_mode"]:
        # MOCKED LLM LOGIC for testing
        if not state["tools_used"]:
            if state["request"].inventory_item_id:
                tool_calls = [
                    {"id": "call_1", "name": "get_inventory_item_metrics", "args": {"inventory_item_id": state["request"].inventory_item_id}},
                    {"id": "call_2", "name": "get_reorder_recommendation", "args": {"inventory_item_id": state["request"].inventory_item_id}},
                ]
            else:
                tool_calls = [
                    {"id": "call_1", "name": "get_inventory_summary", "args": {}},
                    {"id": "call_2", "name": "get_inventory_alerts", "args": {}},
                ]
            return {"messages": [AIMessage(content="", tool_calls=tool_calls)]}
            
        # Final output
        final_response = {
            "summary": "Mocked inventory analysis completed.",
            "key_findings": ["Stock levels are being monitored.", "Mock data accessed."],
            "risks": ["Potential stockout if demand spikes."],
            "recommendations": ["Check stock levels manually.", "Reorder if necessary."],
            "confidence": "High",
            "data_sources_used": list(set(state["tools_used"]))
        }
        return {"messages": [AIMessage(content=json.dumps(final_response))]}

    # REAL LLM LOGIC
    llm_tools = [
        {
            "type": "function",
            "function": {
                "name": "get_inventory_item_metrics",
                "description": "Get core metrics and health classification for a specific inventory item.",
                "parameters": {"type": "object", "properties": {"inventory_item_id": {"type": "integer"}}}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_inventory_consumption_trend",
                "description": "Get daily consumption trend data.",
                "parameters": {"type": "object", "properties": {"inventory_item_id": {"type": "integer"}}}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_inventory_history",
                "description": "Get transaction history (purchase, consumption, wastage).",
                "parameters": {"type": "object", "properties": {"inventory_item_id": {"type": "integer"}}}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_reorder_recommendation",
                "description": "Get reorder recommendation for a specific item.",
                "parameters": {"type": "object", "properties": {"inventory_item_id": {"type": "integer"}}}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_inventory_alerts",
                "description": "Get all current inventory alerts across the system.",
                "parameters": {"type": "object", "properties": {}}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_inventory_summary",
                "description": "Get overall inventory health summary counts.",
                "parameters": {"type": "object", "properties": {}}
            }
        },
        {
            "type": "function",
            "function": {
                "name": "compare_inventory_items",
                "description": "Get critical and low stock items to compare risk.",
                "parameters": {"type": "object", "properties": {}}
            }
        }
    ]
    
    system_prompt = SystemMessage(content='''You are the Brew Buzz Inventory Intelligence Agent.
Your responsibility is to analyze inventory health and explain inventory risks using deterministic business data provided through approved tools.

Rules:
1. Never invent inventory values.
2. Never estimate quantities when deterministic data is available.
3. Use tools before making factual claims.
4. Clearly distinguish facts from recommendations.
5. Explain reasoning in business-friendly language.
6. Do not claim access to data that tools did not provide.
7. Do not modify inventory or perform write operations.
8. If data is unavailable, explicitly say so.
9. Prioritize operationally important risks.
10. Keep recommendations actionable.

When you have enough evidence, return a JSON response matching exactly this schema:
{
  "summary": "string",
  "key_findings": ["string"],
  "risks": ["string"],
  "recommendations": ["string"],
  "confidence": "string",
  "data_sources_used": ["string"]
}
Output NOTHING but the JSON when returning final findings.
''')

    llm = ChatGoogleGenerativeAI(model=settings.GEMINI_MODEL, temperature=0, google_api_key=settings.GEMINI_API_KEY or "dummy")
    llm_with_tools = llm.bind(tools=llm_tools)
    
    response = llm_with_tools.invoke([system_prompt] + messages)
    return {"messages": [response]}

def tools_node(state: InventoryAgentState):
    messages = state["messages"]
    last_message = messages[-1]
    
    tool_msgs = []
    if hasattr(last_message, "tool_calls"):
        for call in last_message.tool_calls:
            try:
                res_str = run_tool(call["name"], call["args"], state)
            except Exception as e:
                res_str = f"Error: {str(e)}"
            tool_msgs.append(ToolMessage(content=res_str, tool_call_id=call["id"], name=call["name"]))
    
    return {"messages": tool_msgs}

def should_continue(state: InventoryAgentState) -> Literal["tools_node", "__end__"]:
    messages = state["messages"]
    last_message = messages[-1]
    
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools_node"
    
    return "__end__"

# Graph setup
workflow = StateGraph(InventoryAgentState)
workflow.add_node("reasoning_node", reasoning_node)
workflow.add_node("tools_node", tools_node)

workflow.set_entry_point("reasoning_node")
workflow.add_conditional_edges("reasoning_node", should_continue)
workflow.add_edge("tools_node", "reasoning_node")

agent_executor = workflow.compile()

def run_agent(request: InventoryAgentRequest, db: Session, mock_mode: bool = False) -> InventoryAgentResponse:
    if not mock_mode and not getattr(settings, "GEMINI_API_KEY", None):
        mock_mode = True
        
    context = f"Analyze inventory item {request.inventory_item_id}." if request.inventory_item_id else "Analyze overall inventory."
    initial_msg = HumanMessage(content=f"{context} Objective: {request.objective}. Question: {request.user_question}")
    
    state = {
        "request": request,
        "db_session": db,
        "messages": [initial_msg],
        "tools_used": [],
        "mock_mode": mock_mode
    }
    
    config = {"recursion_limit": 10}
    try:
        final_state = agent_executor.invoke(state, config=config)
    except Exception as e:
        return InventoryAgentResponse(
            summary=f"Agent execution failed: {str(e)}",
            confidence="None"
        )
        
    messages = final_state["messages"]
    last_msg = messages[-1].content
    
    try:
        msg_str = last_msg
        if isinstance(last_msg, list):
            if len(last_msg) > 0 and isinstance(last_msg[0], dict) and "text" in last_msg[0]:
                msg_str = last_msg[0]["text"]
            else:
                msg_str = str(last_msg)
        
        cleaned_msg = str(msg_str).strip()
        if cleaned_msg.startswith("```json"):
            cleaned_msg = cleaned_msg[7:]
        elif cleaned_msg.startswith("```"):
            cleaned_msg = cleaned_msg[3:]
            
        if cleaned_msg.endswith("```"):
            cleaned_msg = cleaned_msg[:-3]
            
        data = json.loads(cleaned_msg.strip())
        response = InventoryAgentResponse(**data)
        
        # Deduplicate tools_used and add them to data_sources_used
        tools = list(set(final_state.get("tools_used", [])))
        if not response.data_sources_used:
            response.data_sources_used = tools
            
        return response
    except Exception:
        return InventoryAgentResponse(
            summary="Agent finished but returned invalid format.",
            confidence="Low",
            data_sources_used=list(set(final_state.get("tools_used", [])))
        )
