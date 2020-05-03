const mysql = require('mysql');
const events = require('events');



class MySql {



    constructor(host, user, password, db) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.db = db;
        this.connection = null;
        this.affectedRows = 0;
        this.rows = "";

    }



    createConnection() {
        this.connection = mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.db
        });
    }

    endConnection() {
        if (this.connection != null) {
            this.connection.end();

        }
    }

    insert(insertInto, fields) {
        this.createConnection();


        this.affectedRows = 0;
        let self = this;
        let eventEmitter = new events.EventEmitter();


        this.connection.query('INSERT INTO ' + insertInto + this.generatePrepareStaement(fields),
            fields,
            (error, results, fields) => {
                if (error) {
                    throw error;
                }

                try{
                    if (results.affectedRows == 1) {
                        self.affectedRows = results.affectedRows;
                        eventEmitter.emit('finished');
                    }
                 

                }catch(err){
                    console.log(err);
                }
               


               

            });




     
            eventEmitter.on('finished', () => {

                self.endConnection();
    
            });

        // (Country, City, Description, Temperature, MinTemperature, MaxTemperature, Humidity, WindSpeed, DateAndTime, Sunrise, Sunset)



    }

    selectAll(table) {
        this.createConnection();

        this.rows = "";
        let self = this;
        let eventEmitter = new events.EventEmitter();

        try{

            this.connection.query('SELECT * FROM ' + table, (error, results, fields) => {
                if (error) {
                    throw error;
                }
    
              
    
                if (results.length > 0){
                    self.rows = results;
                    eventEmitter.emit('finished');
                }
    
              
    
            });
    
            eventEmitter.on('finished', () => {
    
                self.endConnection();
    
            });

        }catch(e){
            console.log(e.message);
        }
     
    }

    generatePrepareStaement(fields) {

        let statement = " VALUES ("
        for (let i = 0; i < fields.length; i++) {
            if (i != fields.length - 1) {
                statement += "?, "
            } else {
                statement += "?";
            }

        }
        statement += ")";

        return statement;
    }




}

module.exports = MySql;


// connection.destroy();