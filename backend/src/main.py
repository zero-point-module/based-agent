from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel
from src.services.warpcast_service import WarpcastService
from src.services.chatbot_service import ChatbotService
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.agent import AgentCreate
from src.services.database import get_db
from src.services.agent_service import AgentService

app = FastAPI()
warpcast_service = WarpcastService()
db = Depends(get_db)
chatbot_service = ChatbotService(db)

@app.on_event("startup")
async def startup_event():
    warpcast_success = await warpcast_service.initialize()
    if not not warpcast_success:
        raise Exception("Failed to initialize services")

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.get("/api/warpcast/{username}")
async def get_user_casts(username: str, limit: int = 1000):
    casts = await warpcast_service.get_user_casts(username, limit)
    if "error" in casts:
        raise HTTPException(status_code=400, detail=casts["error"])
    return casts

class ChatDto(BaseModel):
    message: str
    
@app.post("/api/chat/{username}")
async def chat(request: Request, username: str, chat_dto: ChatDto):
    messages = [{"role": "user", "content": chat_dto.message}]
    response = await chatbot_service.stream(username, messages)
    if "error" in response:
        raise HTTPException(status_code=400, detail=response["error"])
    return response

@app.post("/api/agents", response_model=AgentCreate)
async def create_agent(
    agent: AgentCreate,
    db: AsyncSession = Depends(get_db)
):
    agent_service = AgentService(db)
    
    # Check if agent with same tag exists
    existing_agent = await agent_service.get_agent_by_tag(agent.tag)
    if existing_agent:
        raise HTTPException(status_code=400, detail="Agent with this tag already exists")
    
    try:
        created_agent = await agent_service.create_agent(agent)
        return created_agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/agents/owner/{owner_address}")
async def get_owner_agents(
    owner_address: str,
    db: AsyncSession = Depends(get_db)
):
    agent_service = AgentService(db)
    agents = await agent_service.get_agents_by_owner(owner_address)
    return agents

