from fastapi import FastAPI, Depends, HTTPException, APIRouter
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import pandas as pd
from prophet import Prophet
from datetime import datetime, timedelta
from billChecking.billTextExtraction import router_bill_extraction
from analyze.analysis import router_product
from analyze.adminAna import router_analysis  
from authentication.auth import router_auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}


app.include_router(router_auth, prefix="/auth", tags=["Authentication"])


app.include_router(router_product, prefix="/product", tags=["Product Analysis"])
app.include_router(router_bill_extraction, prefix="/product", tags=["Bill Extraction"])
app.include_router(router_analysis, prefix="/analysis", tags=["Environmental Analysis"])

@app.get("/")
def home():
    return {"message": "Welcome to the Amazon Product Analysis API!"}
