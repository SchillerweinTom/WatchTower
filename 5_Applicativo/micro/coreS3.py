import os, sys, io
import M5
from M5 import *
from hardware import I2C
from hardware import Pin
from unit import ENVUnit
from unit import RGBUnit
import time
from m5espnow import M5ESPNow
import json


label0 = None
label1 = None
title0 = None
label2 = None
label3 = None
label4 = None
label5 = None
rect0 = None
i2c0 = None
rgb_0 = None
hub_0 = None
espnow_0 = None
espnow_mac = None
espnow_data = None
co2 = 0

def espnow_recv_callback(espnow_obj):
  global espnow_0, espnow_mac, espnow_data, label1, label4, label5, rgb_0, rect0
  
  espnow_mac, espnow_data = espnow_obj.recv_data()

  if espnow_mac == b'@L\xca[\x1fp':
    try:
      data = json.loads(espnow_data.decode())
      temp = data["temperature"]
      humidity = data["humidity"]
      pressure = data["pressure"]

      label1.setText(str(temp))
      label4.setText(str(humidity))

    except Exception as e:
      print("Error reading evn data:", e)
  elif espnow_mac == b'@L\xca[\x1c\x80':
    try:
      if "not" not in espnow_data: 
        rect0.setColor(color=0x00ff00, fill_c=0x00ff00)
      else:
        rect0.setColor(color=0xff0000, fill_c=0xff0000)
    except Exception as e:
      print("Error setting color:", e)


def setup():
  global label0, label1, title0, label2, label3, label4, label5, i2c0, rgb_0, hub_0, espnow_0, rect0

  M5.begin()
  Widgets.fillScreen(0x222222)
  label0 = Widgets.Label("Temperature: ", 39, 51, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label1 = Widgets.Label("", 176, 52, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  title0 = Widgets.Title("Enviroment data", 3, 0xffffff, 0x008fff, Widgets.FONTS.DejaVu18)
  label2 = Widgets.Label("Humidity:", 39, 80, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label3 = Widgets.Label("Co2:", 39, 109, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label4 = Widgets.Label("", 140, 79, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label5 = Widgets.Label("", 142, 108, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label6 = Widgets.Label("Person detected:", 39, 172, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  rect0 = Widgets.Rectangle(210, 167, 30, 30, 0xff0000, 0xff0000)

  i2c0 = I2C(0, scl=Pin(1), sda=Pin(2), freq=100000)
  rgb_0 = RGBUnit((8, 9), 3)

  espnow_0 = M5ESPNow(1)
  espnow_0.set_irq_callback(espnow_recv_callback)


def loop():
  global co2
  M5.update()

  label5.setText(str(co2))

  if co2 < 800:
    color = 0x00ff00
  elif 800 <= co2 <= 1200:
    color = 0xffff00
  else:
    color = 0xff0000

  rgb_0.set_color(0, color)
  rgb_0.set_color(1, color)
  rgb_0.set_color(2, color)

  time.sleep(5)


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
