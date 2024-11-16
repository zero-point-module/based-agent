from src.services.chatbot_service import ChatbotService

chatbot_service = ChatbotService()


responses = chatbot_service.stream([
    "Hello, how are you?",
    "What tools do you have available?",
    "Can you help me with something?",
    "What was the last thing I said?",
])

for response in responses:
    for chunk in response:
        if "agent" in chunk:
            print(chunk["agent"]["messages"][0].content)
        elif "tools" in chunk:
            print(chunk["tools"]["messages"][0].content)
        print("-------------------")