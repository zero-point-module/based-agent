import hashlib
from typing import Dict, List
from src.services.chatbot_instance import ChatbotInstance
from src.services.run_xmtp_bot import run_xmtp_bot
import logging
from src.services.agent_service import AgentService
from sqlalchemy.ext.asyncio import AsyncSession
from src.services.database import get_db

logger = logging.getLogger(__name__)

def initial_state_modifier(state):
    """Initial state modifier for the chatbot"""
    if isinstance(state, dict) and "messages" in state:
        return state["messages"]
    return state

class ChatbotService:
    def __init__(self, agent_service: AgentService):
        self.agent_service = agent_service
        self.instances: Dict[str, ChatbotInstance] = {}
        self.initialized = False

    async def initialize(self):
        """Initialize or reinitialize the chatbot service with agents"""
        if self.initialized:
            logger.info("Reinitializing chatbot service")
        try:
            logger.info("Getting all agents...")
            agents = await self.agent_service.get_all_agents()
            logger.info(f"Found {len(agents)} agents")
            
            # Store existing instances that we want to keep
            logger.info("Processing existing instances...")
            existing_instances = {}
            for agent in agents:
                instance_id = hashlib.md5(agent.tag.encode()).hexdigest()
                if instance_id in self.instances:
                    existing_instances[instance_id] = self.instances[instance_id]
            
            # Reset instances and add back existing ones
            logger.info("Resetting instances...")
            self.instances = existing_instances
            
            # Add new instances
            logger.info("Creating new instances...")
            for agent in agents:
                instance_id = hashlib.md5(agent.tag.encode()).hexdigest()
                if instance_id not in self.instances:
                    logger.info(f"Creating new instance for agent {agent.tag}")
                    self.instances[instance_id] = ChatbotInstance(
                        state_modifier=initial_state_modifier,
                        agent=agent
                    )
            
            logger.info(f"Running XMTP bots for {len(agents)} agents")
            await run_xmtp_bot(agents)
                
            self.initialized = True
            logger.info(f"Chatbot service initialized with {len(self.instances)} instances")
        except Exception as e:
            logger.error(f"Error initializing chatbot service: {str(e)}")
            raise

    async def get_instance(self, tag: str) -> ChatbotInstance:
        logger.info(f"Getting instance for tag: {tag}")
        agent = await self.agent_service.get_agent_by_tag(tag)
        instance_id = hashlib.md5(agent.tag.encode()).hexdigest()

        if instance_id not in self.instances:
            self.instances[instance_id] = ChatbotInstance(
                agent=agent,
                state_modifier=initial_state_modifier
            )
        
        return self.instances[instance_id]
    
    async def stream(self, tag: str, messages: List[dict]):
        """Stream messages to the appropriate chatbot instance"""
        if not self.initialized:
            await self.initialize()
            
        instance = await self.get_instance(tag)
        try:            
            # Get the response from the instance
            for chunk in instance.stream(messages):
                # Debug logging
                logger.info(f"Received chunk: {chunk}")
                
                if isinstance(chunk, str):
                    yield chunk
                elif isinstance(chunk, dict):
                    if "agent" in chunk and "messages" in chunk["agent"]:
                        for message in chunk["agent"]["messages"]:
                            if isinstance(message, (str, dict)):
                                content = message.get("content") if isinstance(message, dict) else message
                                if content:
                                    yield content
                            elif hasattr(message, "content") and message.content:
                                yield message.content
                            
                    elif "tools" in chunk and "messages" in chunk["tools"]:
                        for message in chunk["tools"]["messages"]:
                            if isinstance(message, (str, dict)):
                                content = message.get("content") if isinstance(message, dict) else message
                                if content:
                                    yield content
                            elif hasattr(message, "content") and message.content:
                                yield message.content

            self.instances[instance.instance_id] = instance

        except Exception as e:
            logger.error(f"Error in stream: {str(e)}")
            yield f"Error: {str(e)}"
    