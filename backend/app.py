from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from scraper import WebAnalyzer
import re

app = FastAPI(title="WebScope", description="Website Intelligence Analyzer")

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    url: str

class AIRequest(BaseModel):
    prompt: str

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.post("/api/analyze")
async def analyze(data: AnalyzeRequest):
    url = data.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    if not re.match(r'^https?://[a-zA-Z0-9]', url):
        return JSONResponse({"success": False, "error": "Invalid URL format"}, status_code=400)
    try:
        analyzer = WebAnalyzer(url)
        result = analyzer.analyze()
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({"success": False, "error": str(e)}, status_code=500)

@app.post("/api/ai")
async def ai_endpoint(data: AIRequest):
    try:
        import requests
        res = requests.post("https://text.pollinations.ai/", json={"messages": [{"role": "user", "content": data.prompt}]}, timeout=30)
        return {"success": True, "text": res.text}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
