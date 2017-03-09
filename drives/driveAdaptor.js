'use strict';
const logger = require('../utils/logger.js')('driveAdaptor');
const utils = require('../utils/utils');
const parSaver = require('./parameters/paramSaver');
const Drive = require('./driveModel');
const acs800 = require('./dr_acs800.js');
const vacon_nx = require('./dr_vacon_nx.js');
const atv320 = require('./dr_atv320');

const driveObjects = [acs800, vacon_nx, atv320];
const driveTypes = driveObjects.map((drive) => drive.type);
let drive;

let isFast = false;

const driveState = new utils.DriveState();
let state = driveState.STOPPED; // 0 stopped; 1 running; 2 warning; 3 faulted
let minuteCount = 0,
    changeState_min = 5; // 5 minute
let stateChangeTimestamp = new Date().getTime();

// state changes randomly within the low limit (LL) and high limit (HL) period
const RANDOM_STATE_CHANGE_LL_min = 12 * 60;
const RANDOM_STATE_CHANGE_HL_min = 24 * 60;

utils.startPeriodicTasks(everySecond, everyMinute, null);

function everySecond(){
    if (!drive) return;
    
    if (isFast && drive) checkForStateChange();
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
        stateChangeTimestamp = new Date().getTime();

        logger.info('Next change state will occur in ' + changeState_min + ((isFast)? ' seconds' : ' minutes'), 'everySecond');

        if (state === driveState.STOPPED) runDrive();
        else if (state === driveState.RUNNING) warnDrive();
        else if (state === driveState.WARNING) faultDrive();
        else if (state === driveState.FAULTED) stopDrive();
    }
    minuteCount++;
}

function runDrive(){
    logger.info('Starting drive', 'runDrive');
    state = driveState.RUNNING;
    drive.setRun();
}

function warnDrive(){
    logger.info('Drive Warning', 'warnDrive');
    state = driveState.WARNING;
    drive.setWarning();
}

function faultDrive(){
    logger.info('Drive Fault', 'faultDrive');
    state = driveState.FAULTED;
    drive.setFault();
}

function stopDrive(){
    logger.info('Stopping drive', 'stopDrive');
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
    for (let i = 0; i < drive.parameters.length; i++){
        // if (address === 117) return new Date().getMinutes() * utils.getRandomInt(1, 3);
        if ((modbusAddress + drive.modbusOffset) === drive.parameters[i].pId){
            return drive.parameters[i].value;
        }
    }
    return 0;
}

function setDrive(driveObject){
    parSaver.listParams(driveObject.type, function(initParams){
        drive = new Drive(driveObject, initParams);
        state = driveState.STOPPED;
    });
}

// ----------------------------------------- PUBLIC -----------------------------------------
// ---- GETTERS
function _getBuffers(from, to){
    const bufArr = [];
    for (let i = from; i <= to; i++){
        bufArr.push(utils.int16ToBytes(getValue(i)));
    }
    return bufArr;
}
function _getStatus(){
    if (!drive) return {};
    return {
        type: drive.type,
        state: driveState.getString(state),
        nextState: stateChangeTimestamp + (changeState_min * 1000 * ((isFast)? 1 : 60)),
        stateChangedOn: stateChangeTimestamp,
        next_min: changeState_min - minuteCount,
        params: drive.parameters,
        isFast: isFast
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
    for (let i = 0; i < driveObjects.length; i++){
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
    if (!drive) return cb(new Error('No drive set'), null);
    
    const pId = parseInt(paramId, 10);
    const val = parseInt(value, 10);
    if (pId > 0 && utils.isShort(val)){
        const addParams = drive.setDriveParameter(paramId, utils.toUnsignedShort(val));
        parSaver.saveParam(drive.type, addParams, function(err){
            if (err) return cb(err, null);
            cb(null, true)
        });
    }else{
        return cb(new Error('ParamId and Value mast be numbers'), null);
    }
}

/**
 *
 * @param {string} _stateId
 * @returns {boolean}
 * @private
 */
function _setState(_stateId){
    const _state = driveState[_stateId];
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
            logger.info('Wrong state ' + _state, '_setState');
            return false;
    }

    minuteCount = 0;
    changeState_min = utils.getRandomInt(RANDOM_STATE_CHANGE_LL_min, RANDOM_STATE_CHANGE_HL_min);

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