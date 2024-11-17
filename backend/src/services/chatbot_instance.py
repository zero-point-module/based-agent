import os
import hashlib
from pathlib import Path
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
from src.models.agent import AgentModel
from typing import List

load_dotenv()

class ChatbotInstance:
    def __init__(self, state_modifier: str, agent: AgentModel):
        self.instance_id = hashlib.md5(agent.tag.encode()).hexdigest()
        self.agent = agent
        self.wallet_data_file = os.path.join("src", "data", f"wallet_data_{self.instance_id}.txt")
        self.message_history = []
        
        # Initialize LLM
        if os.getenv("HYPERBOLIC_API_KEY"):
            HYPERBOLIC_API_KEY = os.getenv("HYPERBOLIC_API_KEY")
            self.llm = ChatOpenAI(
                model="meta-llama/Meta-Llama-3.1-405B-Instruct",              
                api_key=HYPERBOLIC_API_KEY,
                base_url="https://api.hyperbolic.xyz/v1",
                max_tokens=512,
                temperature=0.7,
                top_p=0.9
            )
        else:
            self.llm = ChatOpenAI(
                model="gpt-4o-mini",
                api_key=os.getenv("OPEN_AI_API_KEY")
            )
        
        # Load or create wallet data
        wallet_data = self._load_wallet_data()
        
        # Configure CDP Agentkit
        values = {"cdp_wallet_data": wallet_data} if wallet_data else {}
        self.agentkit = CdpAgentkitWrapper(**values, cdp_api_key_name=os.getenv("CDP_API_KEY_NAME"), cdp_api_key_private_key=os.getenv("CDP_API_KEY_PRIVATE_KEY"), network_id=os.getenv("NETWORK_ID"))
        
        # Save wallet data
        self._save_wallet_data()
        
        # Initialize toolkit and tools
        cdp_toolkit = CdpToolkit.from_cdp_agentkit_wrapper(self.agentkit)
        self.tools = cdp_toolkit.get_tools()
      
        self.agent = create_react_agent(
            self.llm,
            tools=self.tools,
            checkpointer=MemorySaver(),
            state_modifier=state_modifier
        )
    
    def _load_wallet_data(self) -> str | None:
        if Path(self.wallet_data_file).exists():
            with open(self.wallet_data_file) as f:
                return f.read()
        return None
    
    def _save_wallet_data(self):
        wallet_data = self.agentkit.export_wallet()
        with open(self.wallet_data_file, "w") as f:
            f.write(wallet_data)
    
    def stream(self, messages: List[dict]):
        """
        Stream responses for a list of messages
        Args:
            messages: List of message dictionaries with 'role' and 'content'
        """
        # Convert messages to appropriate LangChain message types
        for msg in messages:
            if msg["role"] == "user":
                self.message_history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                self.message_history.append(AIMessage(content=msg["content"]))
        
        # Ensure we have at least one message
        if not self.message_history:
            raise ValueError("No messages provided")
        
        # Create the initial state with full history
        initial_state = {"messages": self.message_history}
        
        # Create the config with required checkpointer parameters
        config = {
            "configurable": {
                "thread_id": f"Based agent thread id - {self.instance_id}",
                "checkpoint_ns": f"chat_{self.instance_id}",
                "checkpoint_id": f"checkpoint_{self.instance_id}"
            }
        }
        
        # Get response from agent
        response = self.agent.invoke(initial_state, config)
        
        # Extract the AI's response from the messages
        if isinstance(response, dict) and "messages" in response:
            messages = response["messages"]
            # Get the last AI message
            for message in reversed(messages):
                if isinstance(message, AIMessage):
                    yield message.content
                    break