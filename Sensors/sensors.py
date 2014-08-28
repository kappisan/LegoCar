import sys
import spidev
import time
import os

# Open SPI bus
spi = spidev.SpiDev()
spi.open(0,0)

# Function to read SPI data from MCP3008 chip
# Channel must be an integer 0-7
def ReadChannel(channel):
  adc = spi.xfer2([1,(8+channel)<<4,0])
  data = ((adc[1]&3) << 8) + adc[2]
  return data

# Function to convert data to voltage level,
# rounded to specified number of decimal places. 
def ConvertVolts(data,places):
  volts = (data * 3.3) / float(1023)
  volts = round(volts,places)  
  return volts
  
# Function to calculate temperature from
# TMP36 data, rounded to specified
# number of decimal places.
def ConvertTemp(data,places):

  temp = ((data * 330)/float(1023))-50

  temp = temp + 10

  temp = round(temp,places)
  return temp


def ConvertVoltToTemp(volts):

  temp = 0
  if volts > 0.7:
    temp = (700 * volts) - 437
  else: 
    temp = (575 * volts) - 347
  temp = round(temp,2)
  return temp + 123
 
def reading(sensor):
  import time
  import RPi.GPIO as GPIO

  GPIO.setwarnings(False)
  
  GPIO.setmode(GPIO.BCM)
  
  if sensor == 0:
    
    GPIO.setup(17,GPIO.OUT)
    GPIO.setup(27,GPIO.IN)
    GPIO.output(17, GPIO.LOW)

    time.sleep(0.3)

    GPIO.output(17, True)

    time.sleep(0.00001)
    
    GPIO.output(17, False)

    while GPIO.input(27) == 0:
      signaloff = time.time()
    
    while GPIO.input(27) == 1:
      signalon = time.time()
    
    timepassed = signalon - signaloff
    
    distance = timepassed * 17000

    GPIO.cleanup()
    
    return distance
    
    GPIO.cleanup()

  else:
    print "Incorrect usonic() function varible."

def Sonar():
  return 6

# Define sensor channels
temp_channel  = 1
light_channel = 0

# Define delay between readings
delay = 2

# Read the temperature sensor data
temp_level = ReadChannel(temp_channel)
temp_volts = ConvertVolts(temp_level,3)
temp       = ConvertVoltToTemp(temp_volts)

light_level = ReadChannel(light_channel)
light_volts = ConvertVolts(light_level,3)

sonar_level = reading(0)

print("{} {} {}".format(temp_volts,light_volts,sonar_level))
