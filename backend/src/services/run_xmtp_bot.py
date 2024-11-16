import subprocess
import os
from threading import Thread

def run_new_xmtp_bot(config):
    # Runs npm command to start the bot with custom config as environment variable
    subprocess.run(["npm", "run", "start"], env=config, cwd="xmtp-message-kit")
    
def main(configs = []):
    # Load the config from environment variables
    base_config = {
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
        "TEST_ENCRYPTION_KEY": "0x9268c6b68625c46f00c1e5960b7f6b50b7a69c88d26f7c366073749adba8d5df",
    }
    
    configs = list(map(lambda config: {**base_config, **config}, configs))
    
    for config in configs:
        # Run the new XMTP bot with the config
        thread = Thread(target = run_new_xmtp_bot, args = (config,))
        thread.start()
        thread.join()