"use strict";
var logger = require("./utils/logger.js")("server");
var drive = require("./drives/driveModel.js");
var restify = require('restify');
var modbusServer = require('./mServer.js');

var DEBUG = (process.env.DEV === '1');

logger.setDebug(DEBUG);
const mPort = 1502; // could be 502 on Windows machine
const httpPort = 8080;

modbusServer(mPort);

/**
 * APIs:
 * /GET/status
 * /SET/drive/:driveType  - acs800, vacon_nx
 * 
 * /SET/debug/faster
 * /SET/debug/logger
 */
var server = restify.createServer({name:"Drive Simulator"});
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



server.listen(httpPort, function() {
  console.log('%s listening at %s', server.name, server.url);
});