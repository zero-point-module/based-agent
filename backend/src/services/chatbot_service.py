import hashlib
from typing import Dict, List
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
            raw_responses = instance.stream(messages)
            self.instances[instance.instance_id] = instance

            # Extract only the relevant messages
            formatted_responses = []
            for response in raw_responses:
                if "agent" in response:
                    for message in response["agent"]["messages"]:
                        if hasattr(message, "content") and message.content:  # Check for non-empty content
                            formatted_responses.append({
                                "role": "assistant",
                                "content": message.content
                            })
                elif "tools" in response:
                    for message in response["tools"]["messages"]:
                        if hasattr(message, "content") and message.content:  # Check for non-empty content
                            formatted_responses.append({
                                "role": "tool",
                                "content": message.content
                            })

            return {
                "messages": formatted_responses,
                "status": "success"
            }
        except Exception as e:
            return {
                "error": str(e),
                "status": "error"
            }
    