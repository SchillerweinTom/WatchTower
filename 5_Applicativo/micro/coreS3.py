import os, sys, io
import M5
from M5 import *
from hardware import I2C
from hardware import Pin
from unit import ENVUnit
from unit import RGBUnit
import time
#import umqtt.simple as mqtt
import json

WIFI_SSID = "BLACKNET-DEVICES"
WIFI_PASSWORD = "TDAauynX8BAKa)^"

MQTT_BROKER = "test.mosquitto.org"
MQTT_TOPIC = "nanoC6/env_data"


label0 = None
label1 = None
title0 = None
label2 = None
label3 = None
label4 = None
label5 = None
i2c0 = None
rgb_0 = None
hub_0 = None

def connect_wifi():
    wifi = network.WLAN(network.STA_IF)
    wifi.active(True)
    wifi.connect(WIFI_SSID, WIFI_PASSWORD)
    print("Connecting to Wi-Fi...")
    while not wifi.isconnected():
        time.sleep(1)
    print("Connected! IP:", wifi.ifconfig()[0])

# MQTT Callback (Triggered when new data arrives)
def mqtt_callback(topic, msg):
    global label1, label4, label5, rgb_0
    try:
        data = json.loads(msg.decode())
        temp = data["temperature"]
        humidity = data["humidity"]
        pressure = data["pressure"]

        # Update UI
        label1.setText(str(temp))
        label4.setText(str(humidity))
        label5.setText(str(pressure))

        # Control RGB LED based on temperature
        if temp > 25:
            rgb_0.set_color(0, 0xff0000)
            rgb_0.set_color(1, 0xff0000)
            rgb_0.set_color(2, 0xff0000)
            time.sleep(0.5)
            rgb_0.set_color(0, 0x000000)
            rgb_0.set_color(1, 0x000000)
            rgb_0.set_color(2, 0x000000)
            time.sleep(0.5)
    except Exception as e:
        print("Error parsing MQTT message:", e)




def setup():
  global label0, label1, title0, label2, label3, label4, label5, i2c0, rgb_0, hub_0

  M5.begin()
  Widgets.fillScreen(0x222222)
  label0 = Widgets.Label("Temperature: ", 37, 51, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label1 = Widgets.Label("", 174, 52, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  title0 = Widgets.Title("Enviroment data", 3, 0xffffff, 0x008fff, Widgets.FONTS.DejaVu18)
  label2 = Widgets.Label("Humidity:", 39, 80, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label3 = Widgets.Label("Pressure:", 39, 109, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label4 = Widgets.Label("", 140, 79, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label5 = Widgets.Label("", 142, 108, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)

  #connect_wifi()

  i2c0 = I2C(0, scl=Pin(1), sda=Pin(2), freq=100000)
  rgb_0 = RGBUnit((8, 9), 3)

  #client = mqtt.MQTTClient("CoreS3", MQTT_BROKER)
  #client.set_callback(mqtt_callback)
  #client.connect()
  #client.subscribe(MQTT_TOPIC)
  #print("Subscribed to:", MQTT_TOPIC)

  #return client


def loop(): #client
  M5.update()
  #client.check_msg()  # Check for new MQTT messages
  time.sleep(0.1)


if __name__ == '__main__':
  try:
    setup()
    while True:
      loop()
  except (Exception, KeyboardInterrupt) as e:
    try:
      from utility import print_error_msg
      print_error_msg(e)
    except ImportError:
      print("please update to latest firmware")
