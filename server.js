"use strict";
var logger = require("./utils/logger.js")("server");
var drive = require("./drives/driveModel.js");
var restify = require('restify');
var modbusServer = require('./mServer.js');

var DEBUG = (process.env.DEV === '1');

logger.setDebug(DEBUG);
const mPort = 1502; // could be 502 on Windows machine
const httpPort = 8080;


var simulatorType = process.argv[2];
var hostIpAddress = process.argv[3] || undefined;
console.log(hostIpAddress);
drive.setDrive(simulatorType);

modbusServer(simulatorType, mPort, hostIpAddress);

/**
 * APIs:
 * /GET/status
 * /SET/drive/:driveType  - acs800, vacon_nx
 * 
 * /SET/debug/faster
 * /SET/debug/logger
 */
var server = restify.createServer({name:simulatorType || "Drive Simulator"});
server.get('/GET/status/', function getStatus(req, res, next) {
  res.send(drive.getStatus());
  next();
});

server.get('/SET/drive/:driveType', function setDrive(req, res, next) {
  var newSetting = req.params.driveType;
  drive.setDrive(newSetting);
  logger.info("Drive type set to " + newSetting, "/SET/drive");
  res.send({done: true, setTo: newSetting});
  next();
});

server.get('/SET/faster/:value', function setFaster(req, res, next) {
  var newSetting = req.params.value === 'true';
  drive.setFaster(newSetting);
  logger.info("Is drive changing state faster? " + newSetting, "/SET/faster");
  res.send({done: true, setTo: newSetting});
  next();
});

server.get('/SET/logger/:value', function setLogger(req, res, next) {
  var newSetting = req.params.value === 'true';
  logger.setDebug(newSetting);
  if (newSetting) logger.info("Start logging", "/SET/logger");
  res.send({done: true, setTo: newSetting});
  next();
});

server.get('/SET/param/:paramId/:value', function setParValue(req, res, next) {
    var parId = parseInt(req.params.paramId);
    var value  = parseInt(req.params.value);
    if (parId && value){
        logger.info("Parameter " + parId + " set to " + value, "/SET/param/:paramId/:value");
        res.send({done: drive.setParamValue(parId, value), paramId: parId, value: value});
    }else{
        res.send({done: false});
    }
    next();
});


server.listen(httpPort, hostIpAddress, function() {
  console.log('%s listening HTTP at %s', server.name, server.url);
});