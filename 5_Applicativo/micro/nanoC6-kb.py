import os, sys, io
import M5
from M5 import *
from unit import CardKBUnit
from hardware import I2C
from hardware import Pin
from m5espnow import M5ESPNow


espnow_0 = None
i2c0 = None
cardkb_0 = None
input_buffer = ""


def cardkb_0_pressed_event(kb):
  global i2c0, cardkb_0, espnow_0, input_buffer
  key_code = cardkb_0.get_key()
    
  if key_code > 0:
    key_char = chr(key_code)

    if key_code == 13:
      if input_buffer:
        espnow_0.send_data(1, input_buffer)
        print("Sent:", input_buffer)
        input_buffer = ""
    elif key_code == 8: 
      if input_buffer:
        input_buffer = input_buffer[:-1]
    else:
      input_buffer += key_char


def setup():
  global i2c0, cardkb_0, espnow_0

  M5.begin()
  i2c0 = I2C(0, scl=Pin(1), sda=Pin(2), freq=100000)
  cardkb_0 = CardKBUnit(i2c0)
  cardkb_0.set_callback(cardkb_0_pressed_event)
  espnow_0 = M5ESPNow(1)
  espnow_0.set_add_peer('4827E266A618', 1, 0, False)


def loop():
  global i2c0, cardkb_0
  M5.update()
  cardkb_0.tick()


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
