const axios = require('axios');
const logger = require('../db/logger.js');

module.exports = function (app, devices) {

    app.get('/wateringEvent', (req, res) => {
        console.log("recievedWatering");      
        var arrayWateringData = logger.getDbData("MyDB", "watering", req.query.maxData);
        arrayWateringData.then(function (result) {
            res.send({
                result: result,
            })
        })
    })

    app.get('/tooMuchWater', (req, res) => {
        console.log("recievedTooMuchWater");      
        var arrayTooMuchWaterData = logger.getDbData("MyDB", "tooMuchWater", req.query.maxData);
        arrayTooMuchWaterData.then(function (result) {
            res.send({
                result: result,
            })
        })
    })

    app.get('/notEnoughWater', (req, res) => {
        console.log("recievednotEnoughWater");   
        var arrayNotEnoughWaterData = logger.getDbData("MyDB", "notEnoughWater", req.query.maxData);
        arrayNotEnoughWaterData.then(function (result) {
            res.send({
                result: result,
            })
        })
    })

    app.get('/sensorData', (req, res) => {
        console.log("recievedSensorData");
        console.log(req.query.maxData);        
        var arraySensorData = logger.getDbData("MyDB", "sensorData", req.query.maxData);
        arraySensorData.then(function (result) {
            res.send({
                result: result,
            })
        })
    })

    app.get('/api/device/:id/variable/:name', (req, res) => {
        var id = req.params.id;
        var variableName = req.params.name;

        if (id >= devices.length) {
            res.status(500).send({ error: "invalid device id" });
        }
        else {
            var device = devices[id];
            var url = 'https://api.particle.io/v1/devices/' + device.device_id + '/' + variableName + '?access_token=' + device.access_token;
            axios.get(url)
                .then(response => {
                    res.send({
                        timeStamp: response.data.coreInfo.last_heard,
                        result: response.data.result,
                    });
                })
                .catch(error => {
                    res.status(500).send({ error: "could not read current value" });
                });
        }
    })

    app.post('/api/device/:id/function/:name', (req, res) => {
        var id = req.params.id;
        var functionName = req.params.name;

        if (id >= devices.length) {
            res.status(500).send({ error: "invalid device id" });
        }
        else {
            var device = devices[id];
            var data = { arg: req.body.arg };

            var url = 'https://api.particle.io/v1/devices/' + device.device_id + '/' + functionName + '?access_token=' + device.access_token;

            axios.post(url, data)
                .then(response => {
                    res.send({ result: response.data.return_value })
                })
                .catch(error => {
                    res.status(500).send({ error: "could not execute function " + functionName })
                });
        }
    })
}