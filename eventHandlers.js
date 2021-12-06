const logger = require('./db/logger.js');

exports.sendEvent = null;

exports.registerEventHandlers = function (source) {
    source.addEventListener('watering', wateringEvent);
    source.addEventListener('tooMuchWater', tooMuchWaterEvent);
    source.addEventListener('notEnoughWater', notEnoughWaterEvent);
    source.addEventListener('sensorData', sensorData);
}

function sensorData(event) {
    var data = {
        eventName: event.type,
        eventData: JSON.parse(event.data).data,
        deviceId: JSON.parse(event.data).coreid,
        timestamp: JSON.parse(event.data).published_at
    };

    try {
        data.myMessage = "sensorData";
        logger.logOne("MyDB", "sensorData", data);
        exports.sendEvent(data);
    } catch (error) {
        console.log("Could not handle event: " + JSON.stringify(event) + "\n");
        console.log(error)
    }
}

function wateringEvent(event) {
    var data = {
        eventName: event.type,
        eventData: JSON.parse(event.data).data,
        deviceId: JSON.parse(event.data).coreid,
        timestamp: JSON.parse(event.data).published_at
    };

    try {
        data.myMessage = "Watering";
        logger.logOne("MyDB", "watering", data);
        exports.sendEvent(data);
    } catch (error) {
        console.log("Could not handle event: " + JSON.stringify(event) + "\n");
        console.log(error)
    }
}

function tooMuchWaterEvent(event) {
    var data = {
        eventName: event.type,
        eventData: JSON.parse(event.data).data,
        deviceId: JSON.parse(event.data).coreid,
        timestamp: JSON.parse(event.data).published_at
    };
    try {
        data.myMessage = "tooMuchWaterEvent";
        logger.logOne("MyDB", "tooMuchWater", data);
        exports.sendEvent(data);
    } catch (error) {
        console.log("Could not handle event: " + JSON.stringify(event) + "\n");
        console.log(error)
    }
}

function notEnoughWaterEvent(event) {
    var data = {
        eventName: event.type,
        eventData: JSON.parse(event.data).data,
        deviceId: JSON.parse(event.data).coreid,
        timestamp: JSON.parse(event.data).published_at
    };
    try {
        data.myMessage = "notEnoughWaterEvent";
        logger.logOne("MyDB", "notEnoughWater", data);
        exports.sendEvent(data);
    } catch (error) {
        console.log("Could not handle event: " + JSON.stringify(event) + "\n");
        console.log(error)
    }
}

