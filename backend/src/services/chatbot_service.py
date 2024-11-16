import os
import sys
import time
import json

from pathlib import Path
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

# Import CDP Agentkit Langchain Extension.
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper

# Configure a file to persist the agent's CDP MPC Wallet Data.
wallet_data_file = "wallet_data.txt"
initial_state_modifier = "You are a helpful agent that can interact onchain using the Coinbase Developer Platform Agentkit. You are empowered to interact onchain using your tools. If you ever need funds, you can request them from the faucet if you are on network ID `base-sepolia`. If not, you can provide your wallet details and request funds from the user. If someone asks you to do something you can't do with your currently available tools, you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to docs.cdp.coinbase.com for more informaton. Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested."

class ChatbotService:
    agent = None
    config = None
    state_modifier = None
    
    def __init__(self):
        """ Initiate Chatbot Service with CDP Agentkit. """
        
        self.state_modifier = initial_state_modifier
        # Initialize LLM.
        llm = ChatOpenAI(model="gpt-4o-mini")

        wallet_data = None

        if os.path.exists(wallet_data_file):
            with open(wallet_data_file) as f:
                wallet_data = f.read()

        # Configure CDP Agentkit Langchain Extension.
        values = {}
        if wallet_data is not None:
            # If there is a persisted agentic wallet, load it and pass to the CDP Agentkit Wrapper.
            values = {"cdp_wallet_data": wallet_data}

        agentkit = CdpAgentkitWrapper(**values)

        # persist the agent's CDP MPC Wallet Data.
        wallet_data = agentkit.export_wallet()
        with open(wallet_data_file, "w") as f:
            f.write(wallet_data)

        # Initialize CDP Agentkit Toolkit and get tools.
        cdp_toolkit = CdpToolkit.from_cdp_agentkit_wrapper(agentkit)
        tools = cdp_toolkit.get_tools()

        # Store buffered conversation history in memory.
        memory = MemorySaver() # Use For production use cases we recommend installing langgraph-checkpoint-postgres and using PostgresSaver / AsyncPostgresSaver.

        # Create ReAct Agent using the LLM and CDP Agentkit tools.
        self.config = {"configurable": {"thread_id": "Based agent thread id"}}
        self.agent = create_react_agent(
            llm,
            tools=tools,
            checkpointer=memory,
            state_modifier=self.state_modifier,
        )
    
    def stream(self, messages):
        """ Stream messages to the agent. """
        responses = []
        for message in messages:
            response = self.agent.stream({"messages": [HumanMessage(content=message)]}, self.config)
            responses.append(response)
        return responses
    