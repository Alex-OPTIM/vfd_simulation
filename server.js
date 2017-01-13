"use strict";
var logger = require("./utils/logger.js")("server");
var restify = require('restify');
var utils = require("./utils/utils");
var modbusServer = require('./mServer.js');
var version = require("./package.json").version;

var DEBUG = (process.env.DEV === '1');
logger.setDebug(DEBUG);

const mPort = 1502; // could be 502 on Windows machine
const httpPort = 8080;

var initDriveType = process.argv[2];
var hostIpAddress = process.argv[3] || undefined;

var driveAdaptor = require("./drives/driveAdaptor.js");
driveAdaptor.setDrive(initDriveType);

modbusServer(initDriveType, mPort, hostIpAddress);


var APIs = {
    getStatus: {
        url: '/GET/status/'
    },
    setDriveType: {
        url: '/SET/drive/:driveType',
        params: driveAdaptor.listDriveTypes()
    },
    setParamValue: {
        url: '/SET/param/:paramId/:value',
        params: ''
    },
    setState: {
        url: '/SET/state/:stateId',
        params: Object.keys(new utils.DriveState())
    },
    setStateFaster: {
        url: '/SET/faster/:boolean'
    },
    setDebugLogger: {
        url: '/SET/logger/:boolean'
    }
};


/**
 * APIs:
 * /GET/status
 * /SET/drive/:driveType  - acs800, vacon_nx
 * 
 * /SET/debug/faster
 * /SET/debug/logger
 */
var server = restify.createServer({name:initDriveType || "Drive Simulator"});
server.get('/GET/apis/', function getStatus(req, res, next) {
    res.send(APIs);
    next();
});

server.get(APIs.getStatus.url, function getStatus(req, res, next) {
    var stat = driveAdaptor.getStatus();
    stat.simVersion = version;
    stat.system = {
        nodeVersion: process.version,
        uptime_sec: process.uptime(),
        memory_B: process.memoryUsage()
    };
    res.send(stat);
    next();
});

server.get(APIs.setDriveType.url, function setDrive(req, res, next) {
    var newSetting = req.params.driveType;
    driveAdaptor.setDrive(newSetting);
    logger.info("Drive type set to " + newSetting, "/SET/drive");
    res.send({done: true, setTo: newSetting});
    next();
});

server.get(APIs.setStateFaster.url, function setFaster(req, res, next) {
    var newSetting = req.params.boolean === 'true';
    driveAdaptor.setFaster(newSetting);
    logger.info("Is drive changing state faster? " + newSetting, "/SET/faster");
    res.send({done: true, setTo: newSetting});
    next();
});

server.get(APIs.setDebugLogger.url, function setLogger(req, res, next) {
    var newSetting = req.params.boolean === 'true';
    logger.setDebug(newSetting);
    if (newSetting) logger.info("Start logging", "/SET/logger");
    res.send({done: true, setTo: newSetting});
    next();
});

server.get(APIs.setParamValue.url, function setParValue(req, res, next) {
    var parId = parseInt(req.params.paramId);
    var value  = parseInt(req.params.value);
    if (parId && value){
        logger.info("Parameter " + parId + " set to " + value, APIs.setParamValue.url);
        driveAdaptor.setParamValue(parId, value, function(err, success){
            res.send({done: err || success, paramId: parId, value: value});
        });
    }else{
        res.send({done: false});
    }
    next();
});

server.get(APIs.setState.url, function setParValue(req, res, next) {
    var stateId = req.params.stateId;
    if (stateId && typeof stateId === "string"){
        stateId = stateId.toUpperCase();
        logger.info("State " + stateId + " requested.", APIs.setState.url);
        res.send({done: driveAdaptor.setDriveState(stateId), newState: stateId});
    }else{
        res.send({done: false});
    }
    next();
});


server.listen(httpPort, hostIpAddress, function() {
  console.log('%s listening HTTP at %s', server.name, server.url);
});