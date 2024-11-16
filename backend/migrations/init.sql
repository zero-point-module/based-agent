-- Drop existing objects
DROP TYPE IF EXISTS risk_approach CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS agent_checkpoints CASCADE;

-- Create enum for risk approach
CREATE TYPE risk_approach AS ENUM (
    'conservative',
    'medium',
    'high_risk',
    'degen'
);

-- Create agent_checkpoints table
CREATE TABLE agent_checkpoints (
    id SERIAL PRIMARY KEY,
    namespace VARCHAR(255) NOT NULL,
    checkpoint_id VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(namespace, checkpoint_id)
);

-- Create agents table
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    tag VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    risk_approach risk_approach NOT NULL,
    personality_prompt TEXT,
    farcaster_personalities TEXT[],
    exit_target_usd DECIMAL(20,2),
    stop_loss_usd DECIMAL(20,2),
    owner_address VARCHAR(42) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_namespace_checkpoint ON agent_checkpoints(namespace, checkpoint_id);
CREATE INDEX idx_agents_risk_approach ON agents(risk_approach);
CREATE INDEX idx_agents_is_active ON agents(is_active);
CREATE INDEX idx_agents_owner ON agents(owner_address);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some example agents
INSERT INTO agents (
    name,
    tag,
    description,
    risk_approach,
    personality_prompt,
    farcaster_personalities,
    exit_target_usd,
    stop_loss_usd,
    owner_address
) VALUES (
    'Vitalik Conservative Bot',
    'vitalik-conservative',
    'A conservative trading bot that mimics Vitalik''s analytical approach while maintaining low risk',
    'conservative',
    'You are a conservative trader who focuses on fundamentals and long-term value, similar to Vitalik Buterin. You prioritize thorough analysis and avoid speculative positions.',
    ARRAY['vitalik.eth'],
    50000.00,
    40000.00,
    '0x2e61875030C7e8115D95419BCF92634192197882'
),
(
    'Degen Yield Hunter',
    'yield-degen',
    'High-risk yield farming bot focusing on new DeFi protocols',
    'degen',
    'You are an aggressive yield farmer always looking for the highest APY opportunities. You understand and accept the high risks involved in new protocols.',
    ARRAY['croissant'],
    100000.00,
    10000.00,
    '0x2e61875030C7e8115D95419BCF92634192197882'
);

-- Comments for the agents table
COMMENT ON TABLE agents IS 'Stores trading agent configurations and personalities';
COMMENT ON COLUMN agents.risk_approach IS 'Trading risk level: conservative, medium, high_risk, or degen';
COMMENT ON COLUMN agents.personality_prompt IS 'Base prompt defining the agent''s trading personality';
COMMENT ON COLUMN agents.farcaster_personalities IS 'Array of Farcaster handles to learn trading behavior from';
COMMENT ON COLUMN agents.exit_target_usd IS 'Optional USD value at which the agent should exit all positions';
COMMENT ON COLUMN agents.stop_loss_usd IS 'Optional USD value at which the agent should cut losses';