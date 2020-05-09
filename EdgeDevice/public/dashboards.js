


function request(route) {

  return new Promise((resolve, reject) => {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        // callback(JSON.parse(this.responseText));
        resolve(JSON.parse(this.responseText));
      }
    };
    xhttp.open("GET", route, true);
    xhttp.send();


  });

}


function drawStackedLineChart(chartId, labels, colors, colorOne, colorTwo, labelOne, labelTwo, dataSetOne, dataSetTwo) {
  let ctx = document.getElementById(chartId).getContext("2d");;

  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: labelOne,
        fill: true,
        backgroundColor: colors[colorOne].fill,
        pointBackgroundColor: colors[colorOne].stroke,
        borderColor: colors[colorOne].stroke,
        pointHighlightStroke: colors[colorOne].stroke,
        borderCapStyle: 'butt',
        data: dataSetOne,
      }, {
        label: labelTwo,
        fill: true,
        backgroundColor: colors[colorTwo].fill,
        pointBackgroundColor: colors[colorTwo].stroke,
        borderColor: colors[colorTwo].stroke,
        pointHighlightStroke: colors[colorTwo].stroke,
        data: dataSetTwo,
      }]
    },
    options: {
      responsive: true,
      // Can't just just `stacked: true` like the docs say
      scales: {
        yAxes: [{
          stacked: true,
        }]
      },
      animation: {
        duration: 750,
      },
    }
  });


}

function drawLineChart(chartId, labels, label, dataSet, colors, color){
  let ctx = document.getElementById(chartId).getContext("2d");;

  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        fill: true,
        backgroundColor: colors[color].fill,
        pointBackgroundColor: colors[color].stroke,
        borderColor: colors[color].stroke,
        pointHighlightStroke: colors[color].stroke,
        borderCapStyle: 'butt',
        data: dataSet,
      }]
    },
    options: {
      responsive: true,
      // Can't just just `stacked: true` like the docs say
      animation: {
        duration: 750,
      },
    }
  });
}


function dtgen(rows, column) {


  return new Promise((resolve, reject) => {


    let dataSet = [];


    for (let i = 0; i < rows.length; i++) {

      dataSet[i] = rows[i][column];
    }

    resolve(dataSet);
  });



}




async function drawDashboards() {
  let weatherhome = await request("weatherhome");
  let weatherapi = await request("weatherapi");

  let tempHome = await dtgen(weatherhome, "Temperature");
  let tempAPI = await dtgen(weatherapi, "Temperature");


  let humiHome = await dtgen(weatherhome, "Humidity");
  let humiAPI = await dtgen(weatherapi, "Humidity");

  let wind = await dtgen(weatherapi, "WindSpeed");

  let minTemp = await dtgen(weatherapi, "MinTemperature");
  let maxTemp = await dtgen(weatherapi, "MaxTemperature");



  let labels = await dtgen(weatherapi, "WeatherId");


  const colors = {
    blue: {
      fill: '#d8f9ff',
      stroke: '#00d8ff',
    },
    purple: {
      fill: '#8fa8c8',
      stroke: '#75539e',
    },
    green: {
      fill: '#bafcec',
      stroke: '#0ad3a1',
    },
    red: {
      fill: '#ffc9c9',
      stroke: '#ff2d2d',
    },
    orange: {
      fill: '#fce7b3',
      stroke: '#f4af00',
    },
  };


  //Temperature Line Chart
  drawLineChart("tempHomeLine", labels, "Home", tempHome, colors, "purple");
  drawLineChart("tempOutsideLine", labels, "Outdoors", tempAPI, colors, "blue");

  //Humidity Line Chart
  drawLineChart("humiHomeLine", labels, "Home", humiHome, colors, "purple");
  drawLineChart("humiOutsideLine", labels, "Outdoors", humiAPI, colors, "blue");

  //Wind Line Chart
  drawLineChart("windOutsideLine", labels, "Outdoors", wind, colors, "green");


  // //Max temperature Line Chart
  // drawLineChart("maxTempOutsideLine", labels, "Outdoors", maxTemp, colors, "orange");

  
  // //Min temperature Line Chart
  // drawLineChart("minTempOutsideLine", labels, "Outdoors", minTemp, colors, "LightGreen");





  drawStackedLineChart("tempStacked", labels, colors, "purple", "blue", "Temperature home", "Temperature outside", tempHome, tempAPI);
  drawStackedLineChart("humiStacked", labels, colors, "purple", "blue" , "Humidity home", "Humidity outside", humiHome, humiAPI);


  drawStackedLineChart("minmaxTempStacked", labels, colors, "orange", "red" , "Min Temp", "Max Temp", minTemp, maxTemp);
  
  

}


drawDashboards();








