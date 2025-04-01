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
image_pages = None
i2c0 = None
rgb_0 = None
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
count_access = 1
exit_delay = False
badge_link = None
badge_data = None
access_detected = None
access_authorized = None
is_page_data = False
temp = 0
humidity = 0
co2 = 0
count_standby = 1
key = b'\xe6\xcb\xba- \x18\x84\x90\xa6Mmk?\xb9\xdd\xbd'

def espnow_recv_callback(espnow_obj):
  global espnow_0, espnow_mac, espnow_data, label1, label4, label5, rgb_0, wlan, server_url, token, badge_link, badge_data, access_detected, exit_delay, access_authorized, image_pages, is_page_data, temp, humidity, co2
  
  espnow_mac, espnow_data = espnow_obj.recv_data()

  if espnow_mac == b'@L\xca[\x1fp':
    try:
      data = json.loads(espnow_data.decode())
      temp = data["temperature"]
      humidity = data["humidity"]
      pressure = data["pressure"]

      if is_page_data:
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
    if not (access_authorized or access_detected):
      try:
        if exit_delay:
          exit_delay = False
        else:
          if "not" not in espnow_data: 
            print(str(espnow_data))
            M5.Lcd.setBrightness(255);
            image_pages.setImage("res/img/rfid_screen.png")
            access_detected = True
            send_access(True)
      except Exception as e:
        print("Error setting page:", e)
  elif espnow_mac == b'@L\xca[\x1f8':
    M5.Lcd.setBrightness(255);
    badge_data = espnow_data.decode()
    print("Token: ", badge_data)
    if wlan.isconnected():
      try:
        http_req = requests2.get(server_url + "badge-linked", json={'badge':badge_data}, headers={'Content-Type': 'application/json','Authorization':token})
        response_json = http_req.json()
        badge_link = response_json['linked']
        access_detected = True
        send_access(True)
        if badge_link:
          image_pages.setImage("res/img/kb_screen.png")
        else:
          image_pages.setImage("res/img/otp_screen.png")
        
        print(f"Linked status: {badge_link}")
      except Exception as e:
        print(f"Error sending get request to {server_url}badge-linked")

  elif espnow_mac == b'@L\xca[\x1f\x08':
    text_input = espnow_data.decode()
    print("Text entered: ", text_input)
    if badge_link is not None:
      if badge_link:
        motive = "Other"
        if text_input == "1":
          motive = "Maintenance"
        elif text_input == "2":
          motive = "Inspection"
        elif text_input == "3":
          motive = "Emergency"
        elif text_input == "4":
          motive = "Testing"
        
        http_req = requests2.get(server_url + "badge", json={'badge':badge_data}, headers={'Content-Type': 'application/json','Authorization':token})
        response_json = http_req.json()
        badge_user = response_json['user']

        http_req2 = requests2.post(server_url + "access", json={'name':badge_user, 'motive':motive, 'authorized':True, 'timestamp':get_timestamp()}, headers={'Content-Type': 'application/json','Authorization':token})
        access_authorized = True
        is_page_data = True
        image_pages.setImage("res/img/success_screen.png")
        time.sleep(1)
        image_pages.setImage("res/img/empty_screen.png")
        print_labels()
        print("Access registered")
      else:
        http_req = requests2.post(server_url + "badge", json={'badge':str(badge_data), 'code':str(text_input), 'timestamp':get_timestamp()}, headers={'Content-Type': 'application/json','Authorization':token})
        if http_req.json()['message'] == "Invalid OTP":
          access_authorized = False
          image_pages.setImage("res/img/failed_screen.png")
          time.sleep(1)
          image_pages.setImage("res/img/rfid_screen.png")
          print("Wrong OTP code")
        else:
          access_authorized = True
          is_page_data = True
          image_pages.setImage("res/img/success_screen.png")
          time.sleep(1)
          image_pages.setImage("res/img/empty_screen.png")
          print_labels()
          print("Badge registered")

      badge_link = None
      badge_data = None

    elif text_input == "e" and access_authorized:
      exit_delay = True
      access_detected = None
      access_authorized = None
      is_page_data = False
      send_access(False)
      print("User exits server room!")
      image_pages.setImage("res/img/rfid_screen.png")
      time.sleep(1)
      M5.Lcd.setBrightness(0);
        

def setup():
  global title0, i2c0, rgb_0, espnow_0, tvoc_0, image_pages, key

  M5.begin()
  time.timezone('GMT-2')
  Widgets.fillScreen(0x222222)
  title0 = Widgets.Title("Watch Tower", 3, 0xffffff, 0x008fff, Widgets.FONTS.DejaVu18)
  image_pages = Widgets.Image("res/img/rfid_screen.png", 30, 41, scale_x=0.57, scale_y=0.57)

  i2c0 = I2C(0, scl=Pin(1), sda=Pin(2), freq=100000)
  rgb_0 = RGBUnit((8, 9), 3)

  tvoc_0 = TVOCUnit(i2c0)

  espnow_0 = M5ESPNow(1)
  espnow_0.set_pmk_encrypt(key)
  espnow_0.set_irq_callback(espnow_recv_callback)
  espnow_0.set_add_peer('404CCA5B1EC0', 10, 0, True, key) 
  espnow_0.set_add_peer('404CCA5B1F38', 1, 0, True, key)
  espnow_0.set_add_peer('404CCA5B1F70', 1, 0, True, key)
  espnow_0.set_add_peer('404CCA5B1F08', 1, 0, True, key)
  espnow_0.set_add_peer('404CCA5B1C80', 1, 0, True, key)

  connect_wifi()
  sync_ntp()


def loop():
  global co2, tvoc_0, wlan, token, server_url, count, access_detected, access_authorized, count_access, exit_delay, image_pages, is_page_data, co2, count_standby
  M5.update()
  co2 = tvoc_0.co2eq()
  if is_page_data:
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
  temp_check = False

  if access_detected and not access_authorized:
    if count_access % 12 == 0:
      try:
        http_req = requests2.post(server_url + "access", json={'name':"", 'motive':"", 'authorized':False, 'timestamp':get_timestamp()}, headers={'Content-Type': 'application/json','Authorization':token})
        count_access = 0
        access_detected = False
        temp_check = True
        print("Unauthorized access detected!")
        image_pages.setImage("res/img/failed_screen.png")
      except Exception as e:
        print(f"Error sending post request to: {server_url}access")

    count_access += 1

  if not access_detected:
    if count_standby > 60:
      M5.Lcd.setBrightness(0)
    count_standby +=1
  else:
    count_standby = 1

  time.sleep(5)
  if temp_check:
    image_pages.setImage("res/img/rfid_screen.png")
    temp_check = False
    send_access(False)
    print("Setting screen to default!")


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

def print_labels():
  global label0, label1, title0, label2, label3, label4, label5, temp, humidity, co2
  label0 = Widgets.Label("Temperature: ", 39, 51, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label1 = Widgets.Label("0 °C", 176, 52, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label2 = Widgets.Label("Humidity:", 39, 80, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label3 = Widgets.Label("Co2:", 39, 109, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label4 = Widgets.Label("0 %", 140, 79, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label5 = Widgets.Label("0 ppm", 90, 109, 1.0, 0xffffff, 0x222222, Widgets.FONTS.DejaVu18)
  label6 = Widgets.Label("To exit press 'e' and Enter", 55, 195, 1.0, 0x008fff, 0x222222, Widgets.FONTS.DejaVu12)

  label1.setText(str(temp)) # + " °C")
  label4.setText(str(humidity)) # + " %")
  label5.setText(str(co2)) # + " ppm")


def send_access(is_in_room=False):
  global espnow_0
  try:
    if is_in_room:
      espnow_0.send_data(10, "in")
    else:
      espnow_0.send_data(10, "out")
  except Exception as e:
    print("Error: ")
    print(e)

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
