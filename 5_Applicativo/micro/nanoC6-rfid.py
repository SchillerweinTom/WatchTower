import os, sys, io
import M5
from M5 import *
from hardware import I2C
from hardware import Pin
from unit import RFIDUnit
from m5espnow import M5ESPNow
import time


i2c0 = None
espnow_0 = None
rfid_0 = None
data = None


def setup():
  global i2c0, espnow_0, rfid_0

  M5.begin()
  i2c0 = I2C(0, scl=Pin(1), sda=Pin(2), freq=100000)
  rfid_0 = RFIDUnit(i2c0)
  espnow_0 = M5ESPNow(1)
  espnow_0.set_add_peer('4827E266A618', 1, 0, False)


def loop():
  global i2c0, espnow_0, rfid_0, data
  M5.update()
  if rfid_0.is_new_card_present():
    data = rfid_0.read_card_uid()
    if data:
      data = data.hex()
      espnow_0.send_data(1, data)

      print("Sent:", data)
      time.sleep(30)


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
