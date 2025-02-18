import os, sys, io
import M5
from M5 import *
from hardware import I2C
from hardware import Pin
from unit import RGBUnit
from m5espnow import M5ESPNow

i2c0 = None
rgb_0 = None
espnow_0 = None
co2_value = 0 

def espnow_recv_callback(espnow_obj):
    global co2_value
    mac, data = espnow_obj.recv_data()
    
    try:
        decoded_data = json.loads(data.decode())
        if "CO2" in decoded_data:
            co2_value = decoded_data["CO2"]
            print(f"Received CO2 Value: {co2_value} ppm")
    except Exception as e:
        print("Error parsing ESP-NOW data:", e)

def setup():
  global rgb_0, espnow_0

  M5.begin()
  rgb_0 = RGBUnit((1, 2), 3)

  espnow_0 = M5ESPNow(1)
  espnow_0.set_irq_callback(espnow_recv_callback)


def loop():
  global i2c0, rgb_0, tvoc_0
  M5.update()

  if co2_value < 800:
    color = 0x00ff00
  elif 800 <= co2_value <= 1200:
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
