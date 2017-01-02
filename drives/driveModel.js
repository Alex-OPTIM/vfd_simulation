"use strict";
var logger = require('../utils/logger.js')('driveModel');
var utils = require("../utils/utils");
var acs800 = require("./dr_acs800.js");
var vacon_nx = require("./dr_vacon_nx.js");

var drive = acs800;

var isFast = false;

var state = 0; // 0 stopped; 1 running; 2 warning; 3 faulted
var minuteCount = 0,
    changeState_min = 5, // 5 minute
    nextState = Date.now() + changeState_min * 60 * 1000; // initial change state in 5 minutes

// state changes randomly within the low limit (LL) and high limit (HL) period
const RANDOM_STATE_CHANGE_LL_min = 12 * 60;
const RANDOM_STATE_CHANGE_HL_min = 24 * 60;

utils.startPeriodicTasks(everySecond, everyMinute, null);

function everySecond(){
    if (isFast) checkForStateChange();
    if (state === 1 || state === 2){
        drive.updateValues(true);
    }else{
        drive.updateValues(false);
    }
}

function everyMinute(){
    if (!isFast) checkForStateChange();
}

function checkForStateChange(){
    if (minuteCount >= changeState_min){
        minuteCount = 0;
        changeState_min = utils.getRandomInt(RANDOM_STATE_CHANGE_LL_min, RANDOM_STATE_CHANGE_HL_min);
        nextState = Date.now() + changeState_min * 60 * 1000;

        logger.info("Next change state will occur in " + changeState_min + ((isFast)? " seconds" : " minutes"), "everySecond");

        if (state === 0) runDrive();
        else if (state === 1) warnDrive();
        else if (state === 2) faultDrive();
        else if (state === 3) stopDrive();
    }
    minuteCount++;
}

function runDrive(){
    logger.info("Starting drive", "runDrive");
    state = 1;
    drive.setRun();
}

function warnDrive(){
    logger.info("Drive Warning", "warnDrive");
    state = 2;
    drive.setWarning();
}

function faultDrive(){
    logger.info("Drive Fault", "faultDrive");
    state = 3;
    drive.setFault();
}

function stopDrive(){
    logger.info("Stopping drive", "stopDrive");
    state = 0;
    drive.setStop();
}

function getValue(address){
    for (var i = 0; i < drive.parameters.length; i++){
        // if (address === 117) return new Date().getMinutes() * utils.getRandomInt(1, 3);
        if (address === drive.parameters[i].add){
            return drive.parameters[i].value;
        }
    }
    return 0;
}

function setDriveParameter(parId, value){
    for (var i = 0; i < drive.parameters.length; i++){
        if (drive.parameters[i].add === parId){
            drive.parameters[i].value = value;
            break
        } else if (i >= drive.parameters.length - 1){
            var obj = {
                add: parId,
                id: "id_" + parId,
                value: value
            };
            drive.parameters.push((obj))
        }
    }
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
    return {
        name: drive.name,
        state: state,
        nextState: new Date(nextState),
        next_min: changeState_min - minuteCount,
        params:drive.parameters
    }
}

// ---- SETTERS
function _setFaster(_isFaster){
    isFast = _isFaster;
}
function _setDrive(driveType){
    switch(driveType) {
        case "acs800":
            drive = acs800;
            break;
        case "vacon_nx":
            drive = vacon_nx;
            break;
        default:
            drive = acs800;
    }
}

/**
 * @param {number} paramId
 * @param {number} value
 * @returns {boolean}
 * @private
 */
function _setParamValue(paramId, value){
    var pId = parseInt(paramId, 10);
    var val = parseInt(value, 10);
    if (pId > 0 && utils.isShort(val)){
        setDriveParameter(paramId, utils.toUnsignedShort(val));
        return true;
    }
    return false;
}

module.exports = {
    getBuffers: _getBuffers,
    getStatus: _getStatus,

    setFaster:_setFaster,
    setDrive: _setDrive,
    setParamValue: _setParamValue
};