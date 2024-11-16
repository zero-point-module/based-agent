import hashlib
from typing import Dict, List
from langgraph.checkpoint.memory import MemorySaver
from src.services.chatbot_instance import ChatbotInstance

def initial_state_modifier(state):
    """Initial state modifier for the chatbot"""
    if isinstance(state, dict) and "messages" in state:
        return state["messages"]
    return state

class ChatbotService:
    def __init__(self):
        self.instances: Dict[str, ChatbotInstance] = {}
        self.state_modifier = initial_state_modifier
    
    def get_instance(self, username: str) -> ChatbotInstance:
        print(f"Getting instance for username: {username}")
        print(f"Instances: {self.instances}")
        instance_id = hashlib.md5(username.encode()).hexdigest()
        
        if instance_id not in self.instances:
            self.instances[instance_id] = ChatbotInstance(
                instance_id=instance_id,
                state_modifier=self.state_modifier
            )
        
        return self.instances[instance_id]
    
    async def stream(self, username: str, messages: List[dict]):
        """Stream messages to the appropriate chatbot instance"""
        instance = self.get_instance(username)
        try:
            # Extract just the content from the messages
            message_contents = [msg["content"] for msg in messages]
            responses = instance.stream(message_contents)
            
            return {
                "response": responses,
                "status": "success"
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "error"
            }
    