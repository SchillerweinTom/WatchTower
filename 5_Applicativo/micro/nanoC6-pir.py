import os, sys, io
import M5
from M5 import *
from unit import PIRUnit
from m5espnow import M5ESPNow

pir_0 = None
espnow_0 = None
i2c0 = None

def pir_0_active_event(pir):
  global espnow_0
  print('Person detected')
  try:
    espnow_0.send_data(1, "Person detected")
  except Exception as e:
    print("Error sending ESP-NOW message:", e)

def pir_0_negative_event(pir):
  global espnow_0
  print('Person not detected anymore')
  try:
    espnow_0.send_data(1, "Person not detected")
  except Exception as e:
    print("Error sending ESP-NOW message:", e)

def setup():
  global pir_0, espnow_0

  M5.begin()

  pir_0 = PIRUnit((1,2))
  pir_0.set_callback(pir_0_negative_event, pir_0.IRQ_NEGATIVE)
  pir_0.set_callback(pir_0_active_event, pir_0.IRQ_ACTIVE)
  pir_0.enable_irq()

  espnow_0 = M5ESPNow(1)
  espnow_0.set_add_peer('4827E266A618', 1, 0, False)

def loop():
  global pir_0, espnow_0
  M5.update()

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
