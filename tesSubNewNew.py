# python3.6

import random
from paho.mqtt import client as mqtt_client
import pymongo
import json
from datetime import datetime
import requests

# MQTT Details
broker = 'broker.hivemq.com'
port = 1883
topic = "/raspi/incubator/final_project"
# Generate a Client ID with the subscribe prefix.
client_id = f'subscribe-{random.randint(0, 100)}'
# username = 'emqx'
# password = 'public'

# URL of the API
api_url = "http://localhost:3000/baby/baby0000001/history"
# Define the headers
headers = {
    "Content-Type": "application/json",
    "Api-Key": "NegusApex123Protel"
}

# Connect to MQTT Broker
def connect_mqtt() -> mqtt_client:
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print("Failed to connect, return code %d\n", rc)

    client = mqtt_client.Client(client_id) # Create MQTT instance
    # client.username_pw_set(username, password)
    client.on_connect = on_connect # Set callback function for connection event
    client.connect(broker, port) # Connect to MQTT broker
    return client

# Subscribe to a specific topic
def subscribe(client: mqtt_client):
    # Callback function when message is received
    def on_message(client, userdata, msg):
        now = datetime.now()
        print(now)
        print(msg.payload)
        #flag = msg.payload.decode() # hasil emotion nya
        decoded_json = json.loads(msg.payload)

        temperature_incubator = decoded_json["temperature_incubator"]
        temperature_baby = decoded_json["temperature_baby"]
        humidity = decoded_json["humidity"]
        heart_rate = decoded_json["heart_rate"]
        spo2 = decoded_json["spo2"]
        emotion_id = decoded_json["emotion_id"]
        
        # reassemble to a collection
        payload_collection = {
            "temperature_incubator": temperature_incubator,
            "temperature_baby": temperature_baby,
            "humidity": humidity,
            "heart_rate": heart_rate,
            "spo2": spo2,
            "emotion_id": emotion_id
        }

        API_push_history(payload_collection)

        print(f"Received from `{msg.topic}` topic")

    client.subscribe(topic)
    client.on_message = on_message

def API_push_history(payload):
    # Convert the payload to JSON
    json_payload = json.dumps(payload)

    # Make the POST request
    response = requests.post(api_url, headers=headers, data=json_payload)

    # Check the response
    if response.status_code == 200 or 201:
        print("Request successful!")
        #print("Response:", response.text)
    else:
        print(f"Request failed with status code {response.status_code}")
        #print("Response:", response.text)

# Function to push data to MongoDB
def push_db(flag):
    # Connect to MongoDB
    mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")  # Update the MongoDB connection string

    # Get the database object
    db = mongo_client["isc_db"]

    # Get the collection object
    collection = db["testsub_intro"]

    # Insert the data into the collection
    collection.insert_one({"emotion": flag,"date": datetime.now()})

    # Close the MongoDB connection
    mongo_client.close()

# main function
def run():
    client = connect_mqtt()
    subscribe(client)
    client.loop_forever()


if __name__ == '__main__':
    run()
