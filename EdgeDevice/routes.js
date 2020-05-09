const express = require("express");
const MySql = require("./mysql");
const arduino = require("./app");
const events = require('events');


let eventEmitter = new events.EventEmitter();
const app = express();
const port = 2000;
const dirname = __dirname;

let started = false;


app.use("/static", express.static("public"));

app.get("/", (req, res) => {
    res.sendFile("./index.html", {root: dirname});
});


app.get("/arduino", (req, res) => {
    res.sendFile("./arduino.html", {root: dirname});
});


app.get("/weatherapi", (req, res) => {

   let sql = new MySql('127.0.0.1', 'root', '', 'iot');
   
    sql.selectAll("weatherapi", (err, rows)=>{
       
        if (err){
            console.log(err);
        } 

        if (rows){
            res.json(rows);
        }else {
            res.send(null);
        }
     
    });

});


app.get("/weatherhome", (req, res) => {

    let sql = new MySql('127.0.0.1', 'root', '', 'iot');
    
     sql.selectAll("weatherhome", (err, rows)=>{
        if (err){
            console.log(err);
        } 

        if (rows){
            res.json(rows);
        }else {
            res.send(null);
        }
     
     });
 
 });


 app.get("/requestapi", (req, res) => {

    started = true;
    eventEmitter.emit("requested");
    res.json("yes");
 
 });


 app.get("/stop", (req, res) => {

    started = false;
    eventEmitter.emit("requested");
    res.json("yes");
 
 });

 let interval = null;
 

 eventEmitter.on("requested", ()=>{


    if (started){

        interval = setInterval(()=>{
    
            console.log("started");
            arduino.listenToArduino();
            arduino.requestAPI();
        }, 60000);
     } else{
         console.log("stopped");
         if (interval){
            clearInterval(interval);
         }
       
     }
    

 });



 

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))