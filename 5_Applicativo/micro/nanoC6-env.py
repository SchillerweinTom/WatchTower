import os, sys, io
import M5
from M5 import *
import network
from m5espnow import M5ESPNow
from hardware import I2C
from hardware import Pin
from unit import ENVUnit
import time

i2c0 = None
env3_0 = None
client = None
espnow_0 = None
key = b'\xe6\xcb\xba- \x18\x84\x90\xa6Mmk?\xb9\xdd\xbd'

def setup():
    global i2c0, env3_0, client, espnow_0, key

    M5.begin()

    i2c0 = I2C(0, scl=Pin(1), sda=Pin(2), freq=100000)

    devices = i2c0.scan()
    print("I2C Devices Found:", devices)

    if not devices:
        print("No I2C devices found! Check wiring.")
        return

    env3_0 = ENVUnit(i2c=i2c0, type=3)

    espnow_0 = M5ESPNow(1)
    espnow_0.set_pmk_encrypt(key)
    espnow_0.set_add_peer('4827E266A618', 1, 0, True, key)


def loop():
    global env3_0, client, espnow_0

    if env3_0 is None:
        print("ENV sensor not initialized! Skipping loop.")
        time.sleep(2)
        return

    M5.update()

    temp = env3_0.read_temperature()
    humidity = env3_0.read_humidity()
    pressure = env3_0.read_pressure()

    data = '{"temperature": %.2f, "humidity": %.2f, "pressure": %.2f}' % (temp, humidity, pressure)
    espnow_0.send_data(1, data)

    print("Sent:", data)

    time.sleep(300)

if __name__ == '__main__':
    try:
        setup()
        while True:
            loop()
    except (Exception, KeyboardInterrupt) as e:
        print("Error:", e)
