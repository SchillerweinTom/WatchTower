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
server_url = "http://10.4.0.21:3333/api/"
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkNvcmVTMyBDb250cm9sbGVyIn0.baPpMzEDgthJw_dVWoTuqGVz_gZ_kzIm26r8rw7Q70g"
count = 0

def espnow_recv_callback(espnow_obj):
  global espnow_0, espnow_mac, espnow_data, label1, label4, label5, rgb_0, rect0, wlan, server_url
  
  espnow_mac, espnow_data = espnow_obj.recv_data()

  if espnow_mac == b'@L\xca[\x1fp':
    try:
      data = json.loads(espnow_data.decode())
      temp = data["temperature"]
      humidity = data["humidity"]
      pressure = data["pressure"]

      label1.setText(str(temp))
      label4.setText(str(humidity))

      if wlan.isconnected():
        try:
          http_req1 = requests2.post(server_url + "temperature", json={'value':temp,'timestamp':get_timestamp()}, headers={'Content-Type': 'application/json','Authorization':token})
          http_req2 = requests2.post(server_url + "humidity", json={'value':humidity,'timestamp':get_timestamp()}, headers={'Content-Type': 'application/json','Authorization':token})
          print("Humidity and temperature request succefull!")
        except Exception as e:
          print(f"Error sending post request to: {server_url}temperature or {server_url}humidity")

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
  elif espnow_mac == b'@L\xca[\x1f8':
    print("Token: ", espnow_data.decode())
    #do action with it ?


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
  global co2, tvoc_0, wlan, token, server_url, count
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
 
  if wlan.isconnected() and count % 60 == 0:
    try:
      http_req = requests2.post(server_url + "co2", json={'value':co2,'timestamp':get_timestamp()}, headers={'Content-Type': 'application/json','Authorization':token})
      count = 0
      print("Co2 request succefull!")
    except Exception as e:
      print(f"Error sending post request to: {server_url}co2")

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

def get_timestamp():
  tm = time.localtime()
  timestamp = "{}-{:02d}-{:02d}T{:02d}:{:02d}:{:02d}Z".format(
    tm[0], tm[1], tm[2], tm[3], tm[4], tm[5]
  )
  return timestamp

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
