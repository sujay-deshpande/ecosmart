import json
import re
import cv2
import numpy as np
import pytesseract
from io import BytesIO
from fastapi import FastAPI, File, UploadFile, HTTPException, APIRouter, Header
from pdf2image import convert_from_bytes
import google.generativeai as genai
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import jwt
from pymongo import MongoClient
from analyze.analysis import scrape_amazon_product, analyze_with_gemini 
from authentication.auth import UserRegister
from dotenv import load_dotenv
import os
load_dotenv()
api_key = os.getenv("AI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
else:
    raise ValueError("API_KEY not found in the environment variables")


SECRET_KEY = os.getenv("SECRETE_KEY") or "9aH$1p2Wz@G7tL8B*FgT!b5mXqZkP&0cA3vYjH6S#Q9wR^D4y8Kz"
ALGORITHM = "HS256"

app = FastAPI()
router_bill_extraction = APIRouter()
client = MongoClient("mongodb://localhost:27017/")
db = client["ecosmart"]
users_collection = db["users"]

def preprocess_image(image_bytes: bytes):
    """Preprocess image for better OCR accuracy."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    img = cv2.GaussianBlur(img, (3, 3), 0)
    return img

def extract_text_from_image(image_bytes: bytes):
    """Extract text using Tesseract OCR."""
    processed_img = preprocess_image(image_bytes)
    text = pytesseract.image_to_string(processed_img)
    return text.strip()

def extract_text_from_pdf(pdf_bytes: bytes):
    """Extract text from a PDF by converting it to images first."""
    images = convert_from_bytes(pdf_bytes)
    text = ""
    for img in images:
        text += pytesseract.image_to_string(img) + "\n"
    return text.strip()

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(payload)
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")



@router_bill_extraction.post("/extract-text/")
async def extract_text(
    billImage: UploadFile = File(...),
    productUrl: Optional[str] = Form(None),
    authorization: str = Header(...),  
):
    """Endpoint to handle file uploads and extract structured information."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    
    token = authorization[7:]
    token_data = decode_token(token)
    user = users_collection.find_one({"email": token_data["email"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    print(user)
    file_bytes = await billImage.read()

    if billImage.filename.endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif')):
        extracted_text = extract_text_from_image(file_bytes)
    elif billImage.filename.endswith('.pdf'):
        extracted_text = extract_text_from_pdf(file_bytes)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    if not extracted_text or len(extracted_text.split()) < 5:
        raise HTTPException(status_code=400, detail="The image or PDF is not clear")

    
    prompt = f"""
Extract the following details from the given text for ecommerce only: name, product_name, delivery_date, and is_information_correct (i.e., is it fraudulent?).

Respond **strictly** in JSON format without any explanation.

Example format:
```json
{{
    "name": "Sujay Deshpande",
    "product_name": "SuperBlender 5000",
    "delivery_date": "2024-03-22",
    "is_information_correct": true
}}
Extracted text: "{extracted_text}" and the product link from which bought the product:"{productUrl}" and user data from which you want to compare name and other: "{user}" """

    model = genai.GenerativeModel("gemini-2.0-pro-exp")
    response = model.generate_content(prompt)

    response_text = response.text.strip()
    json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
    cleaned_response = json_match.group(1).strip() if json_match else response_text
    print(cleaned_response)
    
    try:
        data = json.loads(cleaned_response)
        if data["is_information_correct"] == False:
            return {"extracted_text": data,"points":0}
        scrpedwebsite = scrape_amazon_product(productUrl)
        genresponse = analyze_with_gemini(scrpedwebsite)
        json_match = re.search(r'```json(.*?)```', genresponse, re.DOTALL)
        if json_match:
            cleaned_response = json_match.group(1).strip()
        else:
            cleaned_response = genresponse.split("\n", 1)[1].replace("\\n", "").replace("\\", "")

        data = json.loads(cleaned_response)
    
        carbonoffset = float(data["Product Analysis"]["carbon_offset"]["value"])
        ecoscore = int(data["Product Analysis"]["eco_score"]["score"])
        environmental_impact = float(data["Product Analysis"]["environmental_impact"]["waste_generation"])
        price = data["Product Analysis"]["price"]
        points=0
        if price and isinstance(price, str) and price[0].isdigit():
            price = float(price)
        elif price and isinstance(price, str) and price[1:].replace(".", "", 1).isdigit():
            price = float(price[1:])
        else:
            price = 10  

        if ecoscore > 60:
            points = ecoscore*environmental_impact//carbonoffset
            print(points)
        update_data = {
        "$set": {
            "points_collected": user.get("plastic_saved", 0.0)+points,
            "plastic_saved": user.get("plastic_saved", 0.0) + environmental_impact,
            "tree_saved": user.get("tree_saved", 0.0) + ecoscore//10,
            "carbon_offset": user.get("carbon_offset", 0.0) + carbonoffset,
        }
    }
        print(update_data)
        users_collection.update_one({"email": token_data["email"]}, update_data)
            
        print("User updated successfully")
        
        return {"carbonoffset": carbonoffset, "ecoscore": ecoscore, "environmental_impact": environmental_impact, "points": points}
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse JSON: {str(e)}")

    
