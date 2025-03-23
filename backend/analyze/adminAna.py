from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from datetime import datetime, timedelta
from typing import List
import pandas as pd
from prophet import Prophet

router_analysis = APIRouter()
client = MongoClient("mongodb://localhost:27017/")
db = client["ecosmart"]

def get_environmental_data():
    result = db["users"].aggregate([
        {"$group": {
            "_id": None,
            "total_co2": {"$sum": "$carbon_offset"},
            "total_plastic": {"$sum": "$plastic_saved"},
            "total_trees": {"$sum": "$tree_saved"},
            "avg_points": {"$avg": "$points_collected"},
            "user_count": {"$sum": 1}
        }}
    ])
    return next(result, None)

@router_analysis.get("/environment/stats")
async def get_environment_stats():
    data = get_environmental_data()
    if not data:
        raise HTTPException(status_code=404, detail="No environmental data found")
    
    return {
        "total_co2_tons": data.get('total_co2', 0),
        "total_plastic_kg": data.get('total_plastic', 0),
        "total_trees_saved": data.get('total_trees', 0),
        "average_points": data.get('avg_points', 0),
        "total_users": data.get('user_count', 0)
    }

@router_analysis.get("/environment/trends")
async def get_environmental_trends():
    pipeline = [
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m", "date": "$created_at"}},
            "co2": {"$sum": "$carbon_offset"},
            "plastic": {"$sum": "$plastic_saved"},
            "trees": {"$sum": "$tree_saved"}
        }},
        {"$sort": {"_id": 1}}
    ]
    return list(db["users"].aggregate(pipeline))

@router_analysis.get("/environment/forecast")
async def get_co2_forecast():
    history = list(db["users"].find(
        {"created_at": {"$exists": True}}, 
        {"carbon_offset": 1, "created_at": 1}
    ))
    
    if not history:
        return []
    
    df = pd.DataFrame([{
        "ds": x["created_at"],
        "y": x["carbon_offset"]
    } for x in history])
    
    try:
        model = Prophet()
        model.fit(df)
        future = model.make_future_dataframe(periods=365)
        forecast = model.predict(future)
        return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(365).to_dict("records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router_analysis.get("/environment/leaderboard")
async def get_environmental_leaderboard():
    return list(db["users"].aggregate([
        {"$sort": {"carbon_offset": -1}},
        {"$limit": 10},
        {"$project": {
            "_id": 0,
            "name": 1,
            "carbon_offset": 1,
            "plastic_saved": 1,
            "tree_saved": 1
        }}
    ]))