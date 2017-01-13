"use strict";
var logger = require('../utils/logger.js')('driveAdaptor');
var utils = require("../utils/utils");
const parSaver = require("./parameters/paramSaver");
const Drive = require("./driveModel");
var acs800 = require("./dr_acs800.js");
var vacon_nx = require("./dr_vacon_nx.js");

const driveObjects = [acs800, vacon_nx];
const driveTypes = driveObjects.map(function(drive){return drive.type});
var drive;

var isFast = false;

var driveState = new utils.DriveState();
var state = driveState.STOPPED; // 0 stopped; 1 running; 2 warning; 3 faulted
var minuteCount = 0,
    changeState_min = 5, // 5 minute
    nextState = Date.now() + changeState_min * 60 * 1000; // initial change state in 5 minutes

// state changes randomly within the low limit (LL) and high limit (HL) period
const RANDOM_STATE_CHANGE_LL_min = 12 * 60;
const RANDOM_STATE_CHANGE_HL_min = 24 * 60;

utils.startPeriodicTasks(everySecond, everyMinute, null);

function everySecond(){
    if (!drive) return;
    
    if (isFast) checkForStateChange();
    if (state === driveState.RUNNING || state === driveState.WARNING){
        drive.updateValues(true);
    }else{
        drive.updateValues(false);
    }
}

function everyMinute(){
    if (drive && !isFast) checkForStateChange();
}

function checkForStateChange(){
    if (minuteCount >= changeState_min){
        minuteCount = 0;
        changeState_min = utils.getRandomInt(RANDOM_STATE_CHANGE_LL_min, RANDOM_STATE_CHANGE_HL_min);
        nextState = Date.now() + changeState_min * 60 * 1000;

        logger.info("Next change state will occur in " + changeState_min + ((isFast)? " seconds" : " minutes"), "everySecond");

        if (state === driveState.STOPPED) runDrive();
        else if (state === driveState.RUNNING) warnDrive();
        else if (state === driveState.WARNING) faultDrive();
        else if (state === driveState.FAULTED) stopDrive();
    }
    minuteCount++;
}

function runDrive(){
    logger.info("Starting drive", "runDrive");
    state = driveState.RUNNING;
    drive.setRun();
}

function warnDrive(){
    logger.info("Drive Warning", "warnDrive");
    state = driveState.WARNING;
    drive.setWarning();
}

function faultDrive(){
    logger.info("Drive Fault", "faultDrive");
    state = driveState.FAULTED;
    drive.setFault();
}

function stopDrive(){
    logger.info("Stopping drive", "stopDrive");
    state = driveState.STOPPED;
    drive.setStop();
}

/**
 * 
 * @param modbusAddress
 * @returns {*}
 */
function getValue(modbusAddress){
    if (!drive) return 0;
    for (var i = 0; i < drive.parameters.length; i++){
        // if (address === 117) return new Date().getMinutes() * utils.getRandomInt(1, 3);
        if ((modbusAddress + drive.modbusOffset) === drive.parameters[i].parId){
            return drive.parameters[i].value;
        }
    }
    return 0;
}

function setDrive(driveObject){
    parSaver.listParams(driveObject.type, function(initParams){
        drive = new Drive(driveObject, initParams);
    });
}

// ----------------------------------------- PUBLIC -----------------------------------------
// ---- GETTERS
function _getBuffers(from, to){
    var bufArr = [];
    for (var i = from; i <= to; i++){
        bufArr.push(utils.int16ToBytes(getValue(i)));
    }
    return bufArr;
}
function _getStatus(){
    if (!drive) return {};
    return {
        type: drive.type,
        state: driveState.getString(state),
        nextState: new Date(nextState),
        next_min: changeState_min - minuteCount,
        params: drive.parameters
    }
}
function _listDriveTypes(){
    return driveTypes;
}

// ---- SETTERS
function _setFaster(_isFaster){
    isFast = _isFaster;
}
/**
 * @param {string} driveType
 * @private
 */
function _setDrive(driveType){
    for (var i = 0; i < driveObjects.length; i++){
        if (driveType === driveObjects[i].type){
            return setDrive(driveObjects[i]);
        }
    }
    setDrive(driveObjects[0]);
}

/**
 * @param {number} paramId
 * @param {number} value
 * @param {function(Error, boolean|null)} cb
 * @private
 */
function _setParamValue(paramId, value, cb){
    if (!drive) return cb(new Error("No drive set"), null);
    
    var pId = parseInt(paramId, 10);
    var val = parseInt(value, 10);
    if (pId > 0 && utils.isShort(val)){
        var addParams = drive.setDriveParameter(paramId, utils.toUnsignedShort(val));
        parSaver.saveParam(drive.type, addParams, function(err){
            if (err) return cb(err, null);
            cb(null, true)
        });
    }else{
        return cb(new Error("ParamId and Value mast be numbers"), null);
    }
}

/**
 *
 * @param {string} _stateId
 * @returns {boolean}
 * @private
 */
function _setState(_stateId){
    var _state = driveState[_stateId];
    switch (_state){
        case driveState.STOPPED:
            stopDrive();
            break;
        case driveState.RUNNING:
            runDrive();
            break;
        case driveState.WARNING:
            warnDrive();
            break;
        case driveState.FAULTED:
            faultDrive();
            break;
        default:
            logger.info("Wrong state " + _state, "_setState");
            return false;
    }

    minuteCount = 0;
    changeState_min = utils.getRandomInt(RANDOM_STATE_CHANGE_LL_min, RANDOM_STATE_CHANGE_HL_min);
    nextState = Date.now() + changeState_min * 60 * 1000;

    return true;
}

module.exports = {
    getBuffers: _getBuffers,
    getStatus: _getStatus,
    listDriveTypes: _listDriveTypes,

    setFaster:_setFaster,
    setDrive: _setDrive,
    setParamValue: _setParamValue,
    setDriveState: _setState
};