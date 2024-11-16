from fastapi import FastAPI, HTTPException
from src.services.warpcast_service import WarpcastService

app = FastAPI()
warpcast_service = WarpcastService()

@app.on_event("startup")
async def startup_event():
    warpcast_success = await warpcast_service.initialize()
    if not not warpcast_success:
        raise Exception("Failed to initialize services")

@app.on_event("shutdown")
async def shutdown_event():
    await warpcast_service.cleanup()

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.get("/api/warpcast/{username}")
async def get_user_casts(username: str, limit: int = 1000):
    casts = await warpcast_service.get_user_casts(username, limit)
    if "error" in casts:
        raise HTTPException(status_code=400, detail=casts["error"])
    return casts