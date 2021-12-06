var rootUrl = window.location.origin;

function initSSE() {
    if (typeof (EventSource) !== "undefined") {
        var url = rootUrl + "/api/events";
        var source = new EventSource(url);
        source.onmessage = (event) => {
            updateVariables(JSON.parse(event.data));
        };
    } else {
        alert("Your browser does not support server-sent events.");
    }
}
initSSE();

const rangeSlider1 = document.getElementById("customRange1");
const valueRange1 = document.getElementById("rangeValue1");
valueRange1.textContent = rangeSlider1.value;

const rangeSlider2 = document.getElementById("customRange2");
const valueRange2 = document.getElementById("rangeValue2");
valueRange2.textContent = rangeSlider2.value;

const calculatetTime = document.getElementById("calculatetTime");

rangeSlider1.oninput = function () {
    valueRange1.textContent = this.value;
}

rangeSlider1.onchange = function () {
    console.log("Change delay :" + valueRange1.textContent);
    axios.post(rootUrl + "/api/device/0/function/setDelay", { "arg": parseInt(valueRange1.textContent, 10) }).then(function (response) {
        console.log(response);
    })
        .catch(function (error) {
            console.log(error);
        });
}

rangeSlider2.oninput = function () {
    valueRange2.textContent = this.value;
}

rangeSlider2.onchange = function () {
    console.log("Change delay :" + valueRange2.textContent);
    loadDataFromDb();

}

var luxValue = 0;
var maxLevel = 1500;

async function loadDataFromDb() {
    data = new google.visualization.DataTable();
    data.addColumn('date', 'Datum');
    data.addColumn('number', 'Capacitance');
    data.addColumn('number', 'Lux');
    data.addColumn('number', 'Temperature');
    data.addColumn('number', 'Humidity');
    data.addColumn('number', 'PressureHpa');

    dataWatering = new google.visualization.DataTable();
    dataWatering.addColumn('date', 'Datum');
    dataWatering.addColumn('number', 'Watering');
    dataWatering.addColumn('number', 'Too Much Water');
    dataWatering.addColumn('number', 'Not Enough Water');


    var dateArray = [];
    var chartArray = [];


    var lastCapacitanceValue = 0;
    var averageDryingValue = 0;
    var lastCapacitance = 0;
    var meassuringHours = 5;
    var thresholdWatering = 350;

    var responseServer = await axios.get(rootUrl + "/sensorData" + "?maxData=" + valueRange2.textContent);
    for (let index = 0; index < responseServer.data.result.length; ++index) {
        const element = responseServer.data.result[index];
        const obj = JSON.parse(element.eventData);
        var dateTime = new Date(element.timestamp);
        luxValue = obj.Lux;
        if (obj.Capacitance != 0) {
            lastCapacitanceValue = obj.Capacitance;
        }      
        addData(dateTime, obj.Capacitance, obj.Lux, obj.Temperature, obj.Humidity, obj.PressureHpa);
        var roundDate = roundMinutes(new Date(dateTime.getTime()));
        if (dateArray.indexOf(roundDate.getTime()) === -1) {

            if (meassuringHours = 5) {
                meassuringHours = 0;
                if (lastCapacitance > obj.Capacitance) {
                    if (averageDryingValue == 0) {
                        averageDryingValue = lastCapacitance - obj.Capacitance;
                    }
                    else {
                        averageDryingValue = (averageDryingValue * 4 / 5) + (lastCapacitance - obj.Capacitance) / 5;
                    }
                }
                lastCapacitance = obj.Capacitance;
            }
            meassuringHours++;

            dateArray.push(roundDate.getTime());
            chartArray.push([roundDate, null, null, null]);
        }
    }

    var materialOptions = {
        chart: {
            title: 'Übersicht Sensordaten'
        },
        width: 900,
        height: 500,
        series: {
            2: { axis: 'Temperature' },
            3: { axis: 'Humidity' }
        },
        axes: {
            y: {
                Temperature: {
                    label: 'Temperature (Celsius)', range: {
                        max: 60,
                        min: 0
                    }
                },
                Humidity: {
                    label: 'Humidity (%)', range: {
                        max: 100,
                        min: 0
                    }
                }
            }
        }
    };

    new google.charts.Line(document.getElementById('luxlevel-chart')).
        draw(data, materialOptions);

    var responseServerNotEnough = await axios.get(rootUrl + "/notEnoughWater" + "?maxData=" + valueRange2.textContent);
    for (let index = 0; index < responseServerNotEnough.data.result.length; ++index) {
        const elementNotEnough = responseServerNotEnough.data.result[index];
        var dateTimeNotEnough = new Date(elementNotEnough.timestamp);
        var dateTimeNotEnough = roundMinutes(dateTimeNotEnough);
        var indexOfDate = dateArray.indexOf(dateTimeNotEnough.getTime())
        if (indexOfDate > -1) {
            chartArray[indexOfDate] = [dateTimeNotEnough, null, null, parseInt(elementNotEnough.eventData, 10)];
        } else {
            dateArray.push(dateTimeNotEnough.getTime());
            chartArray.push([dateTimeNotEnough, null, null, parseInt(elementNotEnough.eventData, 10)]);
        }
    }

    var responseServerWatering = await axios.get(rootUrl + "/wateringEvent" + "?maxData=" + valueRange2.textContent);
    for (let index = 0; index < responseServerWatering.data.result.length; ++index) {
        const elementWatering = responseServerWatering.data.result[index];
        var dateTimeWatering = new Date(elementWatering.timestamp);
        var dateTimeWatering = roundMinutes(dateTimeWatering);
        var indexOfDate = dateArray.indexOf(dateTimeWatering.getTime())
        if (indexOfDate > -1) {
            chartArray[indexOfDate] = [dateTimeWatering, parseInt(elementWatering.eventData, 10), null, null];
        } else {
            dateArray.push(dateTimeWatering.getTime());
            chartArray.push([dateTimeWatering, parseInt(elementWatering.eventData, 10), null, null]);
        }
    }

    var responseServerTooMuch = await axios.get(rootUrl + "/tooMuchWater" + "?maxData=" + valueRange2.textContent);
    for (let index = 0; index < responseServerTooMuch.data.result.length; ++index) {
        const elementTooMuch = responseServerTooMuch.data.result[index];
        var dateTimeTooMuch = new Date(elementTooMuch.timestamp);
        var dateTimeTooMuch = roundMinutes(dateTimeTooMuch);
        var indexOfDate = dateArray.indexOf(dateTimeTooMuch.getTime())
        if (indexOfDate > -1) {
            chartArray[indexOfDate] = [dateTimeTooMuch, null, parseInt(elementTooMuch.eventData, 10), null];
        } else {
            dateArray.push(dateTimeTooMuch.getTime());
            chartArray.push([dateTimeTooMuch, null, parseInt(elementTooMuch.eventData, 10), null]);
        }
    }

    for (let i = 0; i < chartArray.length; ++i) {
        dataWatering.addRow(chartArray[i]);
    }

    if (lastCapacitanceValue != 0) {
        var timeToWatering = ((lastCapacitanceValue - thresholdWatering) * meassuringHours / averageDryingValue) / 24;
        if (timeToWatering > 0 && timeToWatering < 100) {
            calculatetTime.innerText = "Berechnete Zeit bis zur nächsten Bewässerung: " + Math.round(timeToWatering * 10) / 10+" Tage";
        }
    }

    var materialOptionsWatering = {
        chart: {
            title: 'Bewässerungsmenge pro Zeit'
        },
        width: 820,
        height: 500,
    };

    new google.charts.Bar(document.getElementById('watering-chart')).
        draw(dataWatering, materialOptionsWatering);
}


function updateVariables(data) {
    if (data.eventName === "sensorData") {

        loadDataFromDb();
        var level = luxValue * (100 / maxLevel);

        if (level < 50) {
            color = "Blue";
        } else {
            color = "Orange";
        }

        var colorStyle = "background-color: " + color + " !important;";
        var widthStyle = "width: " + level + "%;"
        document.getElementById("luxlevel-bar").style = colorStyle + widthStyle;
        document.getElementById("luxlevel-text").innerHTML = luxValue + " Lux"

    }
}

var chartData, chartOptions, chart;
var data;
var dataWatering;

google.charts.load('current', { 'packages': ['line', 'corechart', 'bar'] });

function addData(date, capacitance, lux, temperature, humidity, pressureHpa) {
    data.addRow(
        [date, capacitance, lux, temperature, humidity, pressureHpa]);
}

function roundMinutes(date) {
    date.setHours(date.getHours() + Math.round(date.getMinutes() / 60));
    date.setMinutes(0, 0, 0);
    return date;
}