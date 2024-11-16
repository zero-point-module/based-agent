import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
from typing import List

load_dotenv()

class ChatbotInstance:
    def __init__(self, instance_id: str, state_modifier: str):
        self.instance_id = instance_id
        self.wallet_data_file = os.path.join("src", "data", f"wallet_data_{instance_id}.txt")
        
        # Initialize LLM
        self.llm = ChatOpenAI(model="gpt-4o-mini", api_key=os.getenv("OPENAI_API_KEY"))
        
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
    
    def stream(self, messages: List[str]):
        """
        Stream responses for a list of messages
        Args:
            messages: List of message strings
        """
        # Convert the message string to a HumanMessage object
        human_messages = [HumanMessage(content=msg) for msg in messages]
        
        # Create the initial state
        initial_state = {"messages": human_messages}
        
        # Create the config with required checkpointer parameters
        config = {
            "configurable": {
                "thread_id": f"Based agent thread id - {self.instance_id}",
                "checkpoint_ns": f"chat_{self.instance_id}",
                "checkpoint_id": f"checkpoint_{self.instance_id}"
            }
        }
        
        # Stream the response using the agent
        response = self.agent.stream(initial_state, config)
        return response 