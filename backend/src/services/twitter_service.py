import json
from pathlib import Path
from twscrape import API, gather
from twscrape.logger import set_log_level

class TwitterService:
    def __init__(self):
        self.api = API()
        set_log_level("INFO")
    
    async def initialize(self):
        """Initialize the Twitter API connection"""
        try:
            # Load accounts from config file
            config_path = Path(__file__).parent.parent / "config" / "twitter_accounts.json"
            
            if not config_path.exists():
                raise ValueError(f"Config file not found at {config_path}")
                
            with open(config_path) as f:
                config = json.load(f)
            
            if not config.get("accounts"):
                raise ValueError("No accounts found in config file")
            
            # Add each account to the pool
            for account in config["accounts"]:
                await self.api.pool.add_account(
                    username=account["username"],
                    password=account["password"],
                    email=account["email"],
                    email_password=account["email_password"]
                )
                print(f"Added Twitter account: {account['username']}")
            
            # Login all accounts
            await self.api.pool.login_all()
            return True
            
        except Exception as e:
            print(f"Error initializing Twitter API: {e}")
            return False
    
    async def get_user_tweets(self, username: str, limit: int = 500):
        """Get tweets from a specific user"""
        try:
            # First get the user ID from username
            user = await self.api.user_by_login(username)
            if not user:
                return {"error": "User not found"}
                
            # Then get their tweets
            tweets = await gather(self.api.user_tweets(user.id, limit=limit))
            
            # Format the response
            return [{
                "id": tweet.id,
                "text": tweet.rawContent,
                "date": tweet.date.isoformat(),
                "likes": tweet.likeCount,
                "retweets": tweet.retweetCount,
                "replies": tweet.replyCount,
                "url": tweet.url
            } for tweet in tweets]
            
        except Exception as e:
            return {"error": f"Error fetching tweets: {str(e)}"}
    
    async def test_connection(self):
        """Test method to verify service is working"""
        return "Twitter Service is running!" 