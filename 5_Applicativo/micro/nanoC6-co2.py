import os, sys, io
import M5
from M5 import *
from hardware import I2C
from hardware import Pin
from unit import RGBUnit
from unit import TVOCUnit
#import umqtt.simple as mqtt

i2c0 = None
rgb_0 = None
tvoc_0 = None

WIFI_SSID = "BLACKNET-DEVICES"
WIFI_PASSWORD = "TDAauynX8BAKa)^"
MQTT_BROKER = "test.mosquitto.org"
MQTT_TOPIC = "nanoC6/tvoc_data"

def setup():
  global i2c0, rgb_0, tvoc_0

  M5.begin()
  i2c0 = I2C(0, scl=Pin(1), sda=Pin(2), freq=100000)

  devices = i2c0.scan()
  print("I2C Devices Found:", devices)

  if not devices:
    print("No I2C devices found! Check wiring.")
    return

  rgb_0 = RGBUnit((1, 2), 3)
  tvoc_0 = TVOCUnit(i2c0)

  #wifi = network.WLAN(network.STA_IF)
  #wifi.active(True)
  #wifi.connect(WIFI_SSID, WIFI_PASSWORD)
  #print("Connecting to Wi-Fi...")
  #while not wifi.isconnected():
  #  time.sleep(1)
  #print("Connected! IP Address:", wifi.ifconfig()[0])

  #client = mqtt.MQTTClient("NanoC6", MQTT_BROKER)
  #client.connect()
  #client.subscribe(MQTT_TOPIC_LED)
  #print("MQTT Connected")


def loop():
  global i2c0, rgb_0, tvoc_0
  M5.update()

  co2_value = tvoc_0.get_co2()

  data = '{"CO2": %d}' % (co2_value)
  #client.publish(MQTT_TOPIC, data)

  if co2_value > 1000:
    rgb_0.set_color(0, 0xff0000)
    rgb_0.set_color(1, 0xff0000)
    rgb_0.set_color(2, 0xff0000)
  else:
    rgb_0.set_color(0, 0x000000)
    rgb_0.set_color(1, 0x000000)
    rgb_0.set_color(2, 0x000000)

  print("Sent:", data)

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
