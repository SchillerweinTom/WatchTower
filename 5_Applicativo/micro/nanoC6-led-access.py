import os, sys, io
import M5
from M5 import *
from hardware import I2C
from hardware import Pin
from unit import RGBUnit
from m5espnow import M5ESPNow
import time

i2c0 = None
rgb_0 = None
espnow_0 = None
access = False
key = b'\xe6\xcb\xba- \x18\x84\x90\xa6Mmk?\xb9\xdd\xbd'

def espnow_recv_callback(espnow_obj):
  global access
  mac, data = espnow_obj.recv_data()
    
  try:
    decoded_data = data.decode()
    if decoded_data == "in":
      access = True
    elif decoded_data == "out":
      access = False
  except Exception as e:
    print("Error parsing ESP-NOW data:", e)

def setup():
  global rgb_0, espnow_0, key

  M5.begin()
  rgb_0 = RGBUnit((1, 2), 3)
  rgb_0.set_brightness(50)

  espnow_0 = M5ESPNow(1)
  espnow_0.set_pmk_encrypt(key)
  espnow_0.set_irq_callback(espnow_recv_callback)
  espnow_0.set_add_peer('4827E266A618', 1, 0, True, key)


def loop():
  global access, rgb_0, espnow_0
  M5.update()

  if access:
    color = 0xff0000
  else:
    color = 0x00ff00

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
