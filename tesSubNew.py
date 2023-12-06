import paho.mqtt.client as mqtt
import pymongo
import json
from datetime import datetime

MQTT_SERVER = "broker.hivemq.com"
MQTT_PATH = "/raspi/incubator/final_project"

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe(MQTT_PATH)

def on_message(client, userdata, msg):
    now = datetime.now()
    print(now)
    print(msg.payload)
    decoded_json = json.loads(msg.payload)

    temp = decoded_json["temp"]
    humd = decoded_json["humd"]
    emot = decoded_json["emot"]

    push_db(temp, humd, emot)

def push_db(temp, humd, emot):
    # Connect to MongoDB
    mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")  # Update the MongoDB connection string

    # Get the database object
    db = mongo_client["isc_db"]

    # Get the collection object
    collection = db["testsub_intro"]

    # Insert the data into the collection
    collection.insert_one({"temp": temp, "humd": humd, "emot": emot, "date": datetime.now()})

    # Close the MongoDB connection
    mongo_client.close()

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(MQTT_SERVER, 1883, 60)

client.loop_forever()
