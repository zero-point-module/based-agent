from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.agent import AgentModel, AgentCreate
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class AgentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_agent(self, agent: AgentCreate) -> AgentModel:
        try:
            # Convert the enum value to lowercase to match DB enum
            risk_approach_value = agent.risk_approach.value.lower()
            
            db_agent = AgentModel(
                name=agent.name,
                tag=agent.tag,
                description=agent.description,
                risk_approach=risk_approach_value,  # Use the string value
                personality_prompt=agent.personality_prompt,
                farcaster_personalities=agent.farcaster_personalities,
                exit_target_usd=agent.exit_target_usd,
                stop_loss_usd=agent.stop_loss_usd,
                owner_address=agent.owner_address
            )
            self.db.add(db_agent)
            await self.db.commit()
            await self.db.refresh(db_agent)
            return db_agent
        except Exception as e:
            logger.error(f"Error in create_agent: {str(e)}")
            raise

    async def get_agent_by_tag(self, tag: str) -> Optional[AgentModel]:
        try:
            query = select(AgentModel).where(AgentModel.tag == tag)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error in get_agent_by_tag: {str(e)}")
            raise

    async def get_agents_by_owner(self, owner_address: str) -> List[AgentModel]:
        try:
            query = select(AgentModel).where(AgentModel.owner_address == owner_address)
            result = await self.db.execute(query)
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error in get_agents_by_owner: {str(e)}")
            raise 
  
    async def get_all_agents(self) -> List[AgentModel]:
        try:
            query = select(AgentModel)
            result = await self.db.execute(query)
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error in get_all_agents: {str(e)}")
            raise 