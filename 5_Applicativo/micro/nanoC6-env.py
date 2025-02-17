import os, sys, io
import M5
from M5 import *
import network
#import umqtt.simple as mqtt
from hardware import I2C
from hardware import Pin
from unit import ENVUnit
import time

i2c0 = None
env3_0 = None
client = None

WIFI_SSID = "BLACKNET-DEVICES"
WIFI_PASSWORD = "TDAauynX8BAKa)^"
MQTT_BROKER = "test.mosquitto.org"
MQTT_TOPIC = "nanoC6/env_data"

def setup():
    global i2c0, env3_0, client

    M5.begin()

    i2c0 = I2C(0, scl=Pin(1), sda=Pin(2), freq=100000)

    devices = i2c0.scan()
    print("I2C Devices Found:", devices)

    if not devices:
        print("No I2C devices found! Check wiring.")
        return

    env3_0 = ENVUnit(i2c=i2c0, type=3)

    #wifi = network.WLAN(network.STA_IF)
    #wifi.active(True)
    #wifi.connect(WIFI_SSID, WIFI_PASSWORD)
    
    #print("Connecting to Wi-Fi...")
    #while not wifi.isconnected():
    #    time.sleep(1)
    #print("Connected! IP Address:", wifi.ifconfig()[0])

    #client = mqtt.MQTTClient("NanoC6", MQTT_BROKER)
    #client.connect()

def loop():
    global env3_0, client

    if env3_0 is None:
        print("ENV sensor not initialized! Skipping loop.")
        time.sleep(2)
        return

    M5.update()

    temp = env3_0.read_temperature()
    humidity = env3_0.read_humidity()
    pressure = env3_0.read_pressure()

    data = '{"temperature": %.2f, "humidity": %.2f, "pressure": %.2f}' % (temp, humidity, pressure)
    #client.publish(MQTT_TOPIC, data)

    print("Sent:", data)
    time.sleep(5)

if __name__ == '__main__':
    try:
        setup()
        while True:
            loop()
    except (Exception, KeyboardInterrupt) as e:
        print("Error:", e)
