from enum import Enum
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import Column, Integer, String, Text, ARRAY, Numeric, Boolean, DateTime
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
from sqlalchemy.ext.declarative import declarative_base
import re

Base = declarative_base()

class RiskApproach(str, Enum):
    CONSERVATIVE = "conservative"
    MEDIUM = "medium"
    HIGH_RISK = "high_risk"
    DEGEN = "degen"

# Pydantic model for API requests/responses
class AgentCreate(BaseModel):
    name: str = Field(..., max_length=255)
    tag: str = Field(..., max_length=100)
    description: Optional[str] = None
    risk_approach: RiskApproach
    personality_prompt: Optional[str] = None
    farcaster_personalities: List[str] = []
    exit_target_usd: Optional[float] = None
    stop_loss_usd: Optional[float] = None
    owner_address: str = Field(..., max_length=42)

    @field_validator('owner_address')
    def validate_eth_address(cls, v):
        if not re.match(r'^0x[a-fA-F0-9]{40}$', v):
            raise ValueError('Invalid Ethereum address format')
        return v

# SQLAlchemy model for database
class AgentModel(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    tag = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    risk_approach = Column(
        PG_ENUM(
            'conservative', 'medium', 'high_risk', 'degen',
            name='risk_approach',
            create_type=False  # Important: we create the type in migrations
        ),
        nullable=False
    )
    personality_prompt = Column(Text)
    farcaster_personalities = Column(ARRAY(String))
    exit_target_usd = Column(Numeric(20, 2))
    stop_loss_usd = Column(Numeric(20, 2))
    owner_address = Column(String(42), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default='now()')
    updated_at = Column(DateTime(timezone=True), server_default='now()', onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    last_active_at = Column(DateTime(timezone=True)) 