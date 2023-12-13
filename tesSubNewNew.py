# python3.6

import random
from paho.mqtt import client as mqtt_client
import pymongo
import json
from datetime import datetime

# MQTT Details
broker = 'broker.hivemq.com'
port = 1883
topic = "/raspi/incubator/final_project"
# Generate a Client ID with the subscribe prefix.
client_id = f'subscribe-{random.randint(0, 100)}'
# username = 'emqx'
# password = 'public'

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
        flag = msg.payload.decode() # hasil emotion nya
        #decoded_json = json.loads(msg.payload)

        #temp = decoded_json["temp"]
        #humd = decoded_json["humd"]
        #emot = decoded_json["emot"]

        push_db(flag) # push data to MongoDB
        print(f"Received `{flag}` from `{msg.topic}` topic")

    client.subscribe(topic)
    client.on_message = on_message

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
