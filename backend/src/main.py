from fastapi import FastAPI, HTTPException
from src.services.twitter_service import TwitterService
import os

app = FastAPI()
twitter_service = TwitterService()

@app.on_event("startup")
async def startup_event():
    success = await twitter_service.initialize()
    if not success:
        raise Exception("Failed to initialize Twitter service")

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.get("/api/tweets/{username}")
async def get_user_tweets(username: str):
    tweets = await twitter_service.get_user_tweets(username)
    if "error" in tweets:
        raise HTTPException(status_code=400, detail=tweets["error"])
    return tweets 
    try:
        proxy_url = f"socks5://{os.getenv('PROXY_HOST', 'warp')}:{os.getenv('PROXY_PORT', '1080')}"
        print(f"Attempting to connect using proxy: {proxy_url}")  # Debug log
        
        transport = httpx.AsyncHTTPTransport(
            proxy=httpx.Proxy(url=proxy_url),
            retries=3
        )
        
        async with httpx.AsyncClient(
            transport=transport, 
            timeout=30.0,
            follow_redirects=True
        ) as client:
            # First test if WARP is working
            response = await client.get("https://cloudflare.com/cdn-cgi/trace")
            trace_info = response.text
            
            # Get IP info for verification
            ip_response = await client.get("https://api.ipify.org?format=json")
            ip_info = ip_response.json()
            
            return {
                "status": "ok",
                "warp_info": trace_info,
                "ip": ip_info,
                "proxy_used": proxy_url
            }
            
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error in test_warp: {error_trace}")  # Debug log
        raise HTTPException(
            status_code=500, 
            detail=f"WARP test failed: {str(e)}\nTrace: {error_trace}"
        )