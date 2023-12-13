import paho.mqtt.publish as publish
import json
#import base64
import random

# f = open("mqtt.png", "rb")
filecontent = ""
# base64.b64encode(filecontent)
# with open("mqtt.png", "rb") as image_file:
# filecontent = base64.b64encode(image_file.read())
# byteArr = bytearray(filecontent)
# byteArr = "haha"

i = 9

emotion = ["normal", "hungry", "burping", "tired", "dicomfort", "belly pain"]
while True:
    id_alat = i  # random.randint(i, 8)
    id_tambak = 1  # random.randint(1, 1)
    # message = {"sensor1": random.randint(20, 35), "sensor2": 10}
    string = {"temp": random.randint(25, 33), "humd": str(random.randint(80, 100)),
              "emot": str(emotion[random.randint(0, 5)])}
    data_out = json.dumps(string)

    publish.single('/raspi/incubator/final_project', data_out, qos=0,
                   hostname='broker.hivemq.com')

    # string = {"id_hardware": "P0" + str(id_alat) + "." + str(id_tambak), "salinitas": str(random.randint(1, 100)),
    #           "ph": str(random.randint(0, 14)), "suhu": str(random.randint(20, 35)), "id_kolam": str(2), "do": "0.000"}
    # data_out = json.dumps(string)

    # publish.single('/Pengabdian/dataDummy', data_out, qos=0,
    #                hostname='broker.hivemq.com')
    i += 1
    print("sedang publish")
# publish.single('/esp32camSensor', data_out, qos=0,
#                hostname='192.168.117.202')