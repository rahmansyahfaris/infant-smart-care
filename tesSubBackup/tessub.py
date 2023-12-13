import paho.mqtt.client as mqtt
import base64
# import time
import mysql.connector as mc
import json
from datetime import datetime

#MQTT_SERVER = "192.168.150.202"
MQTT_SERVER = "broker.hivemq.com"
MQTT_PATH = "/raspi/incubator/final_project"
# MQTT_PATH2 = "/esp32camSensor"
# MQTT_PATH3 = "/pengeringMonitor"

# The callback for when the client receives a CONNACK response from the server.


# data
# id, temp. humd, emotion, time_stamp,


def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))

    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    # client.subscribe(MQTT_PATH2)
    client.subscribe(MQTT_PATH)
    # client.subscribe(MQTT_PATH3)

    # The callback for when a PUBLISH message is received from the server.

def on_message(client, userdata, msg):
    # more callbacks, etc
    # Create a file with write byte permission
    from datetime import datetime
    now = datetime.now()
    print(now)
    print(msg.payload)
    decoded_json = json.loads(msg.payload)

    temp = decoded_json["temp"]
    humd = decoded_json["humd"]
    emot = decoded_json["emot"]    

    push_db(temp, humd, emot)
    # print(base64.b64decode(msg.payload))
    # f = open('2.jpg', "wb")
    # f.write(base64.b64decode(msg.payload))
    # print("Image Received")
    # f.close()


def push_db (temp, humd, emot):
    
    conn_db = mc.connect(host="localhost", user="root", passwd="")

    cursor = conn_db.cursor()
    sql = 'CREATE DATABASE IF NOT EXISTS test_db'
    cursor.execute(sql)

    # ================================== RASPI =====================================
    # mydb = mc.connect(
    #         host="localhost",
    #         user="user",
    #         password="jafar",
    #         database="testdb",
    #         port="3306"
    #     )

    # ==================================== LAPTOP ====================================
    mydb = mc.connect(
            host="localhost",
            user="root",
            password="",
            database="testdb",
            # port="3306"
        )

    mycursor = mydb.cursor()

    table_sql = 'CREATE TABLE IF NOT EXISTS fenderdata(id int NOT NULL AUTO_INCREMENT, temp varchar(255), humd varchar(255), emotion varchar(255), date varchar(255), PRIMARY KEY(id)) ENGINE = MyISAM DEFAULT CHARSET = latin1'
    mycursor.execute(table_sql)

    now = datetime.now()

    sql = "INSERT INTO fenderdata (temp, humd, emotion, date) VALUES (%s, %s, %s, %s)"
    val = (temp, humd, emot, now)
    mycursor.execute(sql, val)

    mydb.commit()

    print(mycursor.rowcount, "record(s) inserted.")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(MQTT_SERVER, 1883, 60)

# Blocking call that processes network traffic, dispatches callbacks and
# handles reconnecting.
# Other loop*() functions are available that give a threaded interface and a
# manual interface.
client.loop_forever()