const unirest = require('unirest');
const MySql = require('./mysql');
const events = require('events');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');


const port = new SerialPort('/dev/COM3', { baudRate: 115200 });

const eventEmitter = new events.EventEmitter();

port.on('error', function (err) {
    console.log('Error: ', err.message)
});

function requestAPI() {

    let apiResponse;
    unirest
        .get('http://api.openweathermap.org/data/2.5/weather?id=2148955&APPID=e75a093cd83c2af54c0fe6cb4ca1fdd0&units=metric')
        .headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
        .then((response) => {



            if (response.body) {

                apiResponse = {
                    country: response.body.sys.country,
                    city: response.body.name,
                    description: response.body.weather[0].description,
                    temperature: response.body.main.temp,
                    minTemperature: response.body.main.temp_min,
                    maxTemperature: response.body.main.temp_max,
                    humidity: response.body.main.humidity,
                    windSpeed: response.body.wind.speed,
                    dateAndTime: new Date(),
                    sunrise: response.body.sys.sunrise,
                    sunset: response.body.sys.sunset,
                }

                if (isResponseValid(apiResponse)) {

                    //Sql driver
                    let sql = new MySql('127.0.0.1', 'root', '', 'iot');
                    //Sql query
                    let insertInto = " weatherapi (Country, City, Description, Temperature,"
                        + "MinTemperature, MaxTemperature, Humidity, WindSpeed, DateAndTime, Sunrise, Sunset) ";
                    //ApiResponse
                    let fields = [apiResponse.country, apiResponse.city, apiResponse.description, apiResponse.temperature,
                    apiResponse.minTemperature, apiResponse.maxTemperature, apiResponse.humidity, apiResponse.windSpeed,
                    apiResponse.dateAndTime,
                    apiResponse.sunrise, apiResponse.sunset];

                    //asycn insert
                    sql.insert(insertInto, fields);

                    // wait 3 sec until async operation is done
                    setTimeout(() => {
                        if (sql.affectedRows == 1) {
                            console.log("Getting weather from api: " + apiResponse.temperature + " humidity: "
                                + apiResponse.humidity + " description: " + apiResponse.description);
                            console.log("requestAPI: sql affected rows: " + sql.affectedRows);
                            //Write temperature and humidity to Arduino
                            port.write(apiResponse.temperature + "," + apiResponse.humidity, function (err) {
                                if (err) {
                                    return console.log('Error on write: ', err.message)
                                }


                            });


                        }

                    }, 3000)

                }
            }
        }).catch((err) => console.log(err));


}


function listenToArduino() {
    //Serial port parser
    const parser = new Readline();
    port.pipe(parser);

    //If data is sent over the serial port, then do below
    parser.on('data', (data) => {

        console.log(data)

        //Split data as it is the fortmat 15,50,Hot Weather
        let response = data.split(",");

        //Sql driver
        let sql = new MySql('127.0.0.1', 'root', '', 'iot');
        //Sql query
        let insertInto = " weatherhome (Country, City, Description, Temperature, Humidity, DateAndTime)";
        let description = response[2];
        let temperature = response[0];
        let humidity = response[1];
        //Date
        let dateAndTime = new Date();
        let fields = ["AU", "Melbourne", description, temperature, humidity, dateAndTime];

        console.log("Getting weather from arduino: " + temperature + " humidity: "
            + humidity + " description: " + description);

        //asycn insert

        if (description != null && typeof description != 'undefined' &&
            description != null && typeof description != 'undefined' &&
            description != null && typeof description != 'undefined') {
            sql.insert(insertInto, fields);

            // wait 3 sec until async operation is done
            setTimeout(() => {
                if (sql.affectedRows == 1) {
                    //Emit requestAPI so the
                    eventEmitter.emit('requestAPI');
                    console.log("listenToEdge: sql affected rows: " + sql.affectedRows);
                }

            }, 3000);
        } else {
            console.log("ERROR: fields are empty");
        }
    });
}



function isResponseValid(response) {
    if (typeof response.country != 'undefined' && typeof response.city != 'undefined' && typeof response.description != 'undefined'
        && typeof response.temperature != 'undefined' && typeof response.minTemperature != 'undefined' && response.maxTemperature &&
        typeof response.humidity != 'undefined' && typeof response.windSpeed != 'undefined' &&
        typeof response.dateAndTime != 'undefined' && typeof response.sunrise != 'undefined' &&
        typeof response.sunset != 'undefined') {
        return true;

    }

    return false;
}

eventEmitter.on('requestAPI', () => {

    requestAPI();

});


listenToArduino();


