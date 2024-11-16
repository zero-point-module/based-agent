import aiohttp
from typing import List, Dict, Any, Optional
from datetime import datetime
import re  # Add this at the top with other imports

class WarpcastService:
    def __init__(self):
        self.base_url = "https://api.warpcast.com/v2"
        self.headers = {
            'Accept': 'application/json',
            'User-Agent': 'BasedAgent/1.0'
        }
        self.session: Optional[aiohttp.ClientSession] = None

    async def initialize(self) -> bool:
        """Initialize the aiohttp session"""
        try:
            self.session = aiohttp.ClientSession(headers=self.headers)
            # Test the connection
            async with self.session.get(f"{self.base_url}/status") as response:
                return response.status == 200
        except Exception as e:
            print(f"Failed to initialize Warpcast service: {str(e)}")
            return False

    async def get_user_casts(self, username: str, limit: int = 1000) -> List[Dict[str, Any]]:
        """Get casts from a user"""
        if not self.session:
            return {"error": "Session not initialized"}

        try:
            # First get the user's FID
            async with self.session.get(f"{self.base_url}/user-by-username?username={username}") as response:
                if response.status != 200:
                    return {"error": f"Failed to fetch user info (status {response.status})"}
                
                user_data = await response.json()
                fid = user_data.get('result', {}).get('user', {}).get('fid')
                
                if not fid:
                    return {"error": "User not found"}

            # Now fetch their casts
            casts = []
            cursor = None
            
            while len(casts) < limit:
                url = f"{self.base_url}/casts?fid={fid}&limit=100"
                if cursor:
                    url += f"&cursor={cursor}"

                async with self.session.get(url) as response:
                    if response.status != 200:
                        return {"error": f"Failed to fetch casts (status {response.status})"}
                    
                    data = await response.json()
                    new_casts = data.get('result', {}).get('casts', [])
                    if not new_casts:  # Break if no more casts
                        break
                    
                    # Filter out reposts and casts with less than two words
                    new_casts = [
                        cast for cast in new_casts 
                        if cast.get('author', {}).get('username', '').lower() == username.lower()
                        and len(re.sub(r'http\S+|www\S+|\n', ' ', cast.get('text', '')).split()) >= 2
                    ]
                    
                    casts.extend(new_casts)
                    cursor = data.get('result', {}).get('next', {}).get('cursor')
                    if not cursor:  # Break if no more pages
                        break

            # Clean the texts when creating final output
            texts = [
                re.sub(r'http\S+|www\S+|\n', ' ', cast.get('text', '')).strip()
                for cast in casts[:limit]
            ]
            return texts if texts else {"error": "No casts found"}
        except Exception as e:
            print(f"Failed to fetch user casts: {str(e)}")
            return {"error": "Failed to fetch user casts"} 
