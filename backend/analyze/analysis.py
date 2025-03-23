from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel
import requests
import json
from bs4 import BeautifulSoup
import re
import google.generativeai as genai
from dotenv import load_dotenv
import os
load_dotenv()
api_key = os.getenv("AI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
else:
    raise ValueError("API_KEY not found in the environment variables")



router_product = APIRouter()

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
}

def scrape_amazon_product(url):
    response = requests.get(url, headers=HEADERS)
    soup = BeautifulSoup(response.content, "html.parser")
    
    for script in soup(["script", "style", "header"]):
        script.extract()
    
    product_data = {
        "full_parsed_data": soup.get_text(" ", strip=True)
    }
    
    return product_data

def analyze_with_gemini(product_details):
    prompt = f"""
Analyze the following product details and provide a comprehensive environmental impact assessment. 
Use industry standards and ecological benchmarks for estimations where exact data isn't available.

**Product Data Input:**
{product_details['full_parsed_data'][:3000]}

**Required Structured Output Format:**
Return ONLY a JSON response using EXACTLY this structure:

Product Analysis:
{{
    "name":"",
    "price": "", 
    "reviews": Integer (0 if unavailable),
    "rating": Float (0.0 if unavailable),
    
    "carbon_offset": {{
        "value": "X kg or tons float only number no other infomation",  // Numerical estimate based on manufacturing+shipping no other than number
        "calculation_basis": "Brief explanation of estimation methodology"
    }},
    
    "co2_footprint": {{
        "level": "[low/moderate/high]",  // Based on materials, production complexity, and logistics
        "key_factors": ["list of 3-5 primary contributors"]
    }},
    
    "environmental_impact": {{
        "resource_use": ["trees", "water", "fossil fuels"],  // Top 3 resources consumed
        "waste_generation": "X kgs/year" // only number no other infomation
    }},
    
    "eco_score": {{
        "score": "0-100",  // Weighted score considering all factors i.e. it is eco friendly or it is good for nature and naturally developed, sustainable then score high
        "breakdown": {{
            "materials": "0-25",
            "production": "0-25",
            "transport": "0-25",
            "disposal": "0-25"
        }}
    }}


Sustainability Recommendations:
{{
    "improvement_suggestions": [
        "List of 3-5 specific manufacturing/packaging improvements"
    ],
    
    "eco_alternatives": [
        {{
            "name": "Product Name",
            "description": "30-word eco-benefit summary",
            "comparison_metrics": {{
                "co2_reduction": "X%",
                "resource_savings": ["trees", "water", "plastic"],
                "waste_reduction": "X%"
            }},
            "source": "product link if available in web and give the correct web likn https://"  
        }}
    ]  // Only populate if eco_score < 80
}}


**Response Requirements:**
- Prioritize quantitative estimates over qualitative statements
- Clearly distinguish between verified data and AI estimations
- Cite sources for any referenced industry standards
- Maintain metric units throughout
- Highlight critical sustainability red flags first

}}

"""

    
    model = genai.GenerativeModel("gemini-2.0-pro-exp")
    response = model.generate_content(prompt)
    
    return response.text

class ProductRequest(BaseModel):
    url: str

@router_product.post("/analyze")


def analyze_product(request: ProductRequest):
    product_data = scrape_amazon_product(request.url)
    gemini_analysis = analyze_with_gemini(product_data)
    
    json_match = re.search(r'```json(.*?)```', gemini_analysis, re.DOTALL)
    if json_match:
        cleaned_response = json_match.group(1).strip()
    else:
        cleaned_response = gemini_analysis.split("\n", 1)[1].replace("\\n", "").replace("\\", "")
    
    data = json.loads(cleaned_response)
    
    return {
        "analysis": data,
    }