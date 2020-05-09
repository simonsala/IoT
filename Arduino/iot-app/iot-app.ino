//
//    FILE: dht11_test.ino
//  AUTHOR: Rob Tillaart
// VERSION: 0.1.01
// PURPOSE: DHT library test sketch for DHT11 && Arduino
//     URL:
//
// Released to the public domain
//

#include <dht.h>
//
dht DHT;

#define DHT11_PIN 12
//
int FAN_PIN = 11;
int BUZZER = 13;
int LED_YELLOW = 9;
int LED_GREEN = 10;
bool wait = true;

void setup()
{
  Serial.begin(115200);

  pinMode(FAN_PIN, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);

}

void loop()
{
  //Wait is false in first iteration
  //Wait until data analytics on weather API is finished
  if (!wait) {
    //Delay 30 secs
    delay(30000);
    int chk = DHT.read11(DHT11_PIN);
    //Perform data analytics on locally
    //turn off/on actuators, Green led indicates it is based on local sensor
    actOnWeather(DHT.temperature, DHT.humidity, FAN_PIN, BUZZER, LED_GREEN, true);
    wait = true;
  }

  //Get data from remote weather API
  if (Serial.available() > 0) {
    //Split data into temperature and humidity
    String data = Serial.readString();
    String temp = "";
    String humi = "";
    int count = 0;

    for (auto x : data)
    {
      if (x != ',' && count <= 0) {
        temp += String(x);
      } else {
        count += 1;
      }
      if (count > 1) {
        humi += String(x);
      }
    }
    //Perform data analytics on remote weather API 
    //turn off/on actuators, Yellow led indicates it is on remote request to the API
    actOnWeather(temp.toFloat(), humi.toFloat(), FAN_PIN, BUZZER, LED_YELLOW, false);

    //Now let program to perform local data analytics
    wait = false;
  }











}


void buzz(int buzzer, int delayTime) {
  digitalWrite(buzzer, HIGH);
  delay(delayTime);
  digitalWrite(buzzer, LOW);
  delay(delayTime);
  digitalWrite(buzzer, LOW);
}


void turnLED(int led, int delayTime ) {
  digitalWrite(led, HIGH);
  delay(delayTime);
  digitalWrite(led, LOW);
  delay(delayTime);
}

void turnfan(int fan, int fanSpeed, int delayTime) {
  analogWrite(fan, fanSpeed);
  delay(delayTime);
  analogWrite(fan, fanSpeed);
  delay(delayTime);
}


//Data analytics
void actOnWeather(float temp, float humi, int fan, int buzzer, int led, bool sendData) {

  //To indicate if it is on (Green LED) local data or (Yellow LED) remote data
  turnLED(led, 1000);
  delay(1000);
  
  String description = "";

  //Change speed of fan based on temperature
  if (temp >= 0 && temp <= 15) {
    turnfan(fan, 50, 2000);
    turnfan(fan, 0, 0);
    description = "Cold Weather";
  } else if (temp > 15 && temp <= 25) {
    turnfan(fan, 100, 2000);
    turnfan(fan, 0, 0);
    description = "Mild Weather";
  } else {
    turnfan(fan, 200, 2000);
    turnfan(fan, 0, 0);
    description = "Hot Weather";
  }

 //Buzz if humidity is greater than 50
  if (humi > 50) {
    buzz(buzzer, 500);
    description += " And Humid";
  }

  //Send data if required, only for local temperature/humidity sensor
  if (sendData){
    //Send data to apps who are listening to the serial port
     sendWeatherToListeners(temp, humi, description);
  }
 
}

 //Send data to apps who are listening to the serial port
void sendWeatherToListeners(float temp, float humi, String description) {
  Serial.print(String(temp) + "," + String(humi) + "," + description + "\n");
}
