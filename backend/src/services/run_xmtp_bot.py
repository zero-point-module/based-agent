import subprocess
import os
import json
from threading import Thread
from src.models.agent import AgentModel
import hashlib
from typing import List
import logging
from eth_keys import keys

logger = logging.getLogger(__name__)

def run_new_xmtp_bot(config):
    # Runs npm command to start the bot with custom config as environment variable
    logger.info(f"Running XMTP bot with config: {config}")
    subprocess.Popen(["npm", "run", "start"], env=config, cwd="/app/xmtp-app")
    
async def run_xmtp_bot(agents: List[AgentModel]):
    # Load the config from environment variables
    base_config = {
        "OPEN_AI_API_KEY": os.getenv("OPENAI_API_KEY"),
        "TEST_ENCRYPTION_KEY": "0x9268c6b68625c46f00c1e5960b7f6b50b7a69c88d26f7c366073749adba8d5df",
    }
    
    for agent in agents:
        instance_id = hashlib.md5(agent.tag.encode()).hexdigest()
        wallet_data_file = os.path.join("src", "data", f"wallet_data_{instance_id}.txt")
        with open(wallet_data_file, "r") as file:
            wallet_data = file.read()
            wallet_data = json.loads(wallet_data)
        # Create private key from seed (using first 32 bytes)
        seed_hex = wallet_data["seed"][:64]  # Take first 64 hex chars (32 bytes)
        private_key = keys.PrivateKey(bytes.fromhex(seed_hex))
        seed = private_key.to_hex()

        config = {**base_config, "KEY": seed, "AGENT_NAME": agent.name, "AGENT_TAG": agent.tag, "AGENT_DESCRIPTION": agent.description, "AGENT_OWNER": agent.owner_address}

        # Run the new XMTP bot with the config
        thread = Thread(target = run_new_xmtp_bot, args = (config,))
        thread.start()
        thread.join()


__all__ = ['run_xmtp_bot']