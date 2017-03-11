'use strict';
const logger = require('./utils/logger.js')('server');
const restify = require('restify');
const utils = require('./utils/utils');
const modbusServer = require('./mServer.js');
const version = require('./package.json').version;
const fs = require('fs');
const path = require('path');

const DEBUG = (process.env.DEV === '1');
logger.setDebug(DEBUG);

const mPort = 1502; // could be 502 on Windows machine
const httpPort = 8080;

const initDriveType = process.argv[2];
const hostIpAddress = process.argv[3] || undefined;

const driveAdaptor = require('./drives/driveAdaptor.js');
driveAdaptor.setDrive(initDriveType);

modbusServer(initDriveType, mPort, hostIpAddress);

const server = restify.createServer({name:initDriveType || 'Drive Simulator'});

const APIs = {
    getStatus: {
        url: '/GET/status'
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

server.get('/', function (req, res, next) {
    res.redirect('/index.html', next);
});

server.get('/GET/apis', function getStatus(req, res, next) {
    res.send(APIs);
    next();
});

server.get(APIs.getStatus.url, function getStatus(req, res, next) {
    const stat = driveAdaptor.getStatus();
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
    const newSetting = req.params.driveType;
    driveAdaptor.setDrive(newSetting);
    logger.info('Drive type set to ' + newSetting, '/SET/drive');
    res.send({done: true, setTo: newSetting});
    next();
});

server.get(APIs.setStateFaster.url, function setFaster(req, res, next) {
    const newSetting = req.params.boolean === 'true';
    driveAdaptor.setFaster(newSetting);
    logger.info('Is drive changing state faster? ' + newSetting, '/SET/faster');
    res.send({done: true, setTo: newSetting});
    next();
});

server.get(APIs.setDebugLogger.url, function setLogger(req, res, next) {
    const newSetting = req.params.boolean === 'true';
    logger.setDebug(newSetting);
    if (newSetting) logger.info('Start logging', '/SET/logger');
    res.send({done: true, setTo: newSetting});
    next();
});

server.get(APIs.setParamValue.url, function setParValue(req, res, next) {
    const parId = parseInt(req.params.paramId);
    const value  = parseInt(req.params.value);
    if (parId && value){
        logger.info('Parameter ' + parId + ' set to ' + value, APIs.setParamValue.url);
        driveAdaptor.setParamValue(parId, value, function(err, success){
            res.send({done: err || success, paramId: parId, value: value});
        });
    }else{
        res.send({done: false});
    }
    next();
});

server.get(APIs.setState.url, function setParValue(req, res, next) {
    let stateId = req.params.stateId;
    if (stateId && typeof stateId === 'string'){
        stateId = stateId.toUpperCase();
        logger.info('State ' + stateId + ' requested.', APIs.setState.url);
        res.send({done: driveAdaptor.setDriveState(stateId), newState: stateId});
    }else{
        res.send({done: false});
    }
    next();
});

// const wwwroot = path.resolve('wwwroot');

console.log(__dirname);

server.get(/\/?.*/, restify.serveStatic({
    directory: path.resolve(__dirname, './public'),
    default: 'index.html'
}));

server.listen(httpPort, hostIpAddress, function() {
  console.log('%s listening HTTP at %s', server.name, server.url);
});