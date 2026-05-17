import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClientRequest(BaseModel):
    clientPrompt: str

@app.post("/api/ask-gemini")
async def ask_gemini(request: ClientRequest):
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=request.clientPrompt,
        )
        return {"answer": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
