# python3.6

import random
from paho.mqtt import client as mqtt_client
import pymongo
import json
import requests
from datetime import datetime

api_url = "http://192.168.28.22:3000/baby/baby0000001/history"

# Define the headers
headers = {
    "Content-Type": "application/json"
}

# Define the payload (body) as a dictionary
payload = {
    "temperature": 100,
    "humidity": 100,
    "emotion_id": "emotion_1"
}



# Function to push data to MongoDB
def push_db(flag):
    # Connect to MongoDB
    mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")  # Update the MongoDB connection string

    # Get the database object
    db = mongo_client["isc_db"]

    # Get the collection object
    collection = db["testsub_intro"]

    # Insert the data into the collection
    collection.insert_one({"emotion": flag, "date": datetime.now()})

    # Close the MongoDB connection
    mongo_client.close()

# Using the API request
def API_push_history(payload):
    # Convert the payload to JSON
    json_payload = json.dumps(payload)

    # Make the POST request
    response = requests.post(api_url, headers=headers, data=json_payload)

    # Check the response
    if response.status_code == 200 or 201:
        print("Request successful!")
        print("Response:", response.text)
    else:
        print(f"Request failed with status code {response.status_code}")
        print("Response:", response.text)

if __name__ == '__main__':
    API_push_history(payload)
    print('push attempt ended.')