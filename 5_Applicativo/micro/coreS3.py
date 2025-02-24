import os, sys, io
import M5
from M5 import *
from hardware import I2C
from hardware import Pin
from unit import ENVUnit
from unit import RGBUnit
from unit import TVOCUnit
import time
from m5espnow import M5ESPNow
import json
import network
import ntptime
import requests2


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
tvoc_0 = None
wlan = None
co2 = 0
ssid = "BLACKNET-DEVICES"
wifi_password="TDAauynX8BAKa)^"
server_url = "http://192.168.56.10:3000/api/co2"
http_req = None
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNpc3RlbWlzdGExIiwicm9sZSI6InNpc3RlbWlzdGEiLCJpYXQiOjE3NDAzODM5NDAsImV4cCI6MTc0MDQwNTU0MH0.HatNK3eT3I1mtsoyUz27QfPcBgYwwE3G5QoGEwZJDtg"
count = 0

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
  global label0, label1, title0, label2, label3, label4, label5, i2c0, rgb_0, hub_0, espnow_0, rect0, tvoc_0

  M5.begin()
  time.timezone('GMT-1')
  Widgets.fillScreen(0x222222)
  label0 = Widgets.Label("Temperature: ", 39, 51, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label1 = Widgets.Label("0", 176, 52, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  title0 = Widgets.Title("Enviroment data", 3, 0xffffff, 0x008fff, Widgets.FONTS.DejaVu18)
  label2 = Widgets.Label("Humidity:", 39, 80, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label3 = Widgets.Label("Co2:", 39, 109, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label4 = Widgets.Label("0", 140, 79, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label5 = Widgets.Label("0", 90, 109, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label6 = Widgets.Label("Person detected:", 39, 172, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  rect0 = Widgets.Rectangle(210, 167, 30, 30, 0xff0000, 0xff0000)

  i2c0 = I2C(0, scl=Pin(1), sda=Pin(2), freq=100000)
  rgb_0 = RGBUnit((8, 9), 3)

  tvoc_0 = TVOCUnit(i2c0)

  espnow_0 = M5ESPNow(1)
  espnow_0.set_irq_callback(espnow_recv_callback)

  connect_wifi()
  sync_ntp()


def loop():
  global co2, tvoc_0, wlan, http_req, token, server_url, count
  M5.update()
  co2 = tvoc_0.co2eq()
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
 
  if wlan.isconnected() and count % 6 == 0:
    try:
      http_req = requests2.post(server_url, json={'value':co2,'timestamp':time.localtime()}, headers={'Content-Type': 'application/json','Authorization':token})
    except Exception:
      print("Error POST /api/co2")

  count += 1
  time.sleep(5)


def connect_wifi():
  global ssid, wifi_password, wlan
  wlan = network.WLAN(network.STA_IF)
  wlan.active(True)
  wlan.connect(ssid, wifi_password)

  while not wlan.isconnected():
    time.sleep(1)
    print("Connecting to Wi-Fi...")

  print("Connected to Wi-Fi: ", ssid)

def sync_ntp(max_retries=5, delay=2):
    ntptime.host = "pool.ntp.org"
    for attempt in range(max_retries):
        try:
            print(f"Attempt {attempt + 1} to sync NTP...")
            ntptime.settime()
            print("NTP time synced", time.localtime())
            return
        except OSError as e:
            print(f"NTP sync failed: {e}, retrying in {delay} sec...")
            time.sleep(delay)
    
    print("NTP sync failed after multiple attempts.")


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
