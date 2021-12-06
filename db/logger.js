const { MongoClient } = require('mongodb');
var constants = {}
try {
    constants = require('../config/constants')
} catch (error) {
    console.log("Module 'constants' not found, trying Heroku config vars.")
}
const mongo_url = process.env.MONGO_URL || constants.mongo_url;
var useDb = false;
var client;
if (mongo_url) {
    client = new MongoClient(mongo_url, { useNewUrlParser: true, useUnifiedTopology: true });
    useDb = true;
}

exports.logOne = async function (dbName, collectionName, data) {
    if (!useDb) return;
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        await collection.insertOne(data);
    } catch (error) {
        console.log(error);
    } finally {
        client.close();
    }
}

exports.logMany = async function (dbName, collectionName, data) {
    if (!useDb) return;
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        await collection.insertMany(data);
    } catch (error) {
        console.log(error);
    } finally {
        client.close();
    }
}

exports.getDbData = async function (dbName, collectionName, maxData) {
    if (!useDb) return;    
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        console.log('Connected successfully to server');

        return await collection.find({
            "timestamp": {
                $gte: new Date(new Date().getTime() - 3600 * 24 * parseFloat(maxData, 10) * 1000).toISOString()
            }
        }).sort({_id:-1}).project({ eventData: 1, timestamp: 1, _id: 0 }).limit(500).toArray()

    } catch (error) {
        console.log('DB connection error');
        console.log(error);
    } finally {
        console.log('Closing');
        client.close();
    }      
}
