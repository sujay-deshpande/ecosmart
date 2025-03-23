from fastapi import FastAPI, Depends, HTTPException, APIRouter, Header
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from bson import ObjectId
from passlib.context import CryptContext
from typing import List, Optional
import jwt
import os
from dotenv import load_dotenv
import datetime
load_dotenv()
app = FastAPI()
client = MongoClient("mongodb://localhost:27017/")
db = client["ecosmart"]
users_collection = db["users"]

SECRET_KEY = os.getenv("SECRETE_KEY") or "9aH$1p2Wz@G7tL8B*FgT!b5mXqZkP&0cA3vYjH6S#Q9wR^D4y8Kz"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(email: str, password: str) -> str:
    payload = {
        "email": email,
        "password": password,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

router_auth = APIRouter()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router_auth.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user.email, db_user["password"])
    return {"token": token}

class Reward(BaseModel):
    title: str
    points: int
    desc: str


class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str
    points_collected: int = 0
    plastic_saved: float = 0.0
    tree_saved: float = 0.0
    carbon_offset: float = 0.0
    rewards: List[Reward] = []
    
@router_auth.post("/register")
def register(user: UserRegister):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["password"] = hash_password(user.password)
    users_collection.insert_one(user_dict)
    return {"message": "User registered successfully"}

@router_auth.get("/getProfile")
def get_profile(authorization: Optional[str] = Header(None)):
    print(authorization)
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token required")
    print(authorization)
    d1 = authorization.split(' ')
    authorization = d1[1]
    token_data = decode_token(authorization)
    print(token_data)
    user = users_collection.find_one({"email": token_data["email"]}, {"_id": 0, "password": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

app.include_router(router_auth)



