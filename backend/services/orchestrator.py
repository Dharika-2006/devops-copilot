from langgraph.graph import StateGraph, END
from backend.agents.intent_agent import intent_agent
from backend.agents.planner_agent import planner_agent
from backend.agents.safety_agent import safety_agent
from backend.agents.executor_agent import executor_agent
import uuid

async def run_intent(state):
    intent = await intent_agent.run(state['command'], state['session_id'])
    return {**state, 'intent': intent}

async def run_planner(state):
    plan = await planner_agent.run(state['session_id'], state['intent'])
    return {**state, 'plan': plan}

async def run_safety(state):
    decision = await safety_agent.run(state['session_id'], state['plan'])
    return {**state, 'safety': decision, 'approval_token': decision.token}

async def run_executor(state):
    if not state['safety'].approved:
        return {**state, 'outcome': 'rejected', 'error': str(state['safety'].violations)}
    result = await executor_agent.run(
        state['session_id'], state['plan'], state['approval_token']
    )
    return {**state, 'outcome': 'executed'}

def route_after_safety(state):
    return 'executor' if state['safety'].approved else END

graph = StateGraph(dict)
graph.add_node('intent',   run_intent)
graph.add_node('planner',  run_planner)
graph.add_node('safety',   run_safety)
graph.add_node('executor', run_executor)
graph.set_entry_point('intent')
graph.add_edge('intent',  'planner')
graph.add_edge('planner', 'safety')
graph.add_conditional_edges('safety', route_after_safety,
    {'executor': 'executor', END: END})
graph.add_edge('executor', END)
pipeline = graph.compile()

async def run_pipeline(command: str) -> dict:
    return await pipeline.ainvoke({
        'session_id': str(uuid.uuid4()),
        'command': command
    })