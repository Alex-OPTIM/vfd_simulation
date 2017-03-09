'use strict';
const logger = require('../utils/logger.js')('driveInterface');
const utils = require('../utils/utils');
const bit = utils.bitUtils();

/**
 * 
 * @param {{type:string, modbusOffset:number, parameters:[], nominal:{}}} driveObject
 * @param {[]} additionalParams
 * @constructor
 */
function Drive(driveObject, additionalParams){
    additionalParams = (Array.isArray(additionalParams))? additionalParams : [];

    const parameters = driveObject.parameters.concat(additionalParams);
    
    const nom = driveObject.nominal;
    
    const faultWords = parameters.filter(function(param) {return param.fWord});
    const warnWords = parameters.filter(function(param) {return param.wWord});

    const msw = getParam('msw'),
        spd = getParam('spd'),
        cnt = getParam('cnt'),
        trq = getParam('trq'),
        pwr = getParam('pwr'),
        dc_v = getParam('dc_v'),
        out_v = getParam('out_v'),
        d_temp = getParam('d_temp');

    // ------------------------------------ PRIVATE ------------------------------------
    function getParam(id){
        for (let i = 0; i < parameters.length; i++){
            if (parameters[i].id === id) return parameters[i]
        }
        return null;
    }
    function getRandomBit(words){
        const wordIndex = utils.getRandomInt(0,words.length - 1);
        const word = words[wordIndex];
        logger.info(wordIndex + ' ' + JSON.stringify(word), 'getRandomBit');

        const bitIndex = utils.getRandomInt(0,word.bits.length - 1);
        const bit = word.bits[bitIndex];
        logger.info(bitIndex + ' ' + bit, 'getRandomBit');

        return {id:word.id, bit:bit}
    }

    /**
     * @param {[]} words
     * @returns {{pId: number, id:string, value:number,  fWord:boolean, hasFaultCodes:boolean, bits:[], fCodes: string}}
     * @private
     */
    function _getRandomWord(words){
        const wordIndex = utils.getRandomInt(0,words.length - 1);
        logger.info(wordIndex, 'getRandomBit');
        return words[wordIndex];
    }

    /**
     * @param {{pId: number, id:string, value:number,  fWord:boolean, hasFaultCodes:boolean, bits:[]}} word
     * @returns {number}
     * @private
     */
    function _setRandomBitToWord(word) {
        const bitIndex = utils.getRandomInt(0,word.bits.length - 1);
        logger.info(bitIndex + ' ' + bit, 'getRandomBit');
        const randomBit =  word.bits[bitIndex];
        word.value = bit.set(word.value, randomBit);
        return word.value
    }
    /**
     * @param {{pId: number, id:string, value:number,  fWord:boolean, hasFaultCodes:boolean, fCodes: string}} word
     * @return {number} the random value
     * @private
     */
    function _setRandomValueToWord(word) {
        const faultCodes = driveObject[word.fCodes];
        const faultCodeIndex = utils.getRandomInt(0,faultCodes.length - 1);
        word.value = faultCodes[faultCodeIndex].value;
        return word.value
    }

    function _clearAllFaultsAndWarnings() {
        _clearAllFaults();
        _clearAllWarning();
    }

    function _clearAllFaults() {
        faultWords.forEach((faultWord) => {faultWord.value = 0});
    }

    function _clearAllWarning() {
        warnWords.forEach((warnWord) => {warnWord.value = 0});
    }

    // ------------------------------------ PUBLIC ------------------------------------
    function updateValues(isRunning){

        const state = (isRunning) ? 'run' : 'stop';
        if (isRunning){
            spd.value = utils.getRandomBase(nom.spd.value[state], nom.spd.range);
            cnt.value = utils.getRandomBase(nom.cnt.value[state], nom.cnt.range);
            trq.value = utils.getRandomBase(nom.trq.value[state], nom.trq.range);
            pwr.value = utils.getRandomBase(nom.pwr.value[state], nom.pwr.range);
            dc_v.value = utils.getRandomBase(nom.dc_v.value[state], nom.dc_v.range);
            out_v.value = utils.getRandomBase(nom.out_v.value[state], nom.out_v.range);
            d_temp.value = utils.getRandomBase(nom.d_temp.value[state], nom.d_temp.range);
        }else{
            spd.value = nom.spd.value[state];
            cnt.value = nom.cnt.value[state];
            trq.value = nom.trq.value[state];
            pwr.value = nom.pwr.value[state];
            dc_v.value = nom.dc_v.value[state];
            out_v.value = nom.out_v.value[state];
            d_temp.value = nom.d_temp.value[state];
        }
    }

    function setRun(){
        msw.value = nom.msw.value.stop;
        msw.value = bit.set(msw.value, 2); // RUN bit in STATUS WORD

        _clearAllFaultsAndWarnings();
    }
    function setWarning(){
        msw.value = nom.msw.value.stop;
        msw.value = bit.set(msw.value, 2); // RUN bit in STATUS WORD - as in this simulation it WARNs when drive's running
        msw.value = bit.set(msw.value, 7); // WARNING bit in STATUS WORD

        _clearAllFaults();
        const word = _getRandomWord(warnWords);
        if (word.hasFaultCodes) return _setRandomValueToWord(word);
        _setRandomBitToWord(word);
    }
    function setFault(){
        msw.value = nom.msw.value.stop;
        msw.value = bit.set(msw.value, 3); // FAULT bit in STATUS WORD

        const word = _getRandomWord(faultWords);
        if (word.hasFaultCodes) return _setRandomValueToWord(word);
        _setRandomBitToWord(word);
    }
    function setStop(){
        msw.value = nom.msw.value.stop;

        _clearAllFaultsAndWarnings();
    }

    /**
     * @param {number} paramId
     * @param {number} value
     * @returns {Array}
     * @private
     */
    function setDriveParameter(paramId, value){
        let isPresent = false;
        const addParams = [];
        for (let i = 0; i < parameters.length; i++){
            if (parameters[i].pId === paramId){
                parameters[i].value = value;
                isPresent = true;
            }
            if (parameters[i].ap) addParams.push(parameters[i]);
        }
        if (!isPresent){
            const obj = {
                pId: paramId,
                id: 'id_' + paramId,
                value: value,
                ap: 1 // additional parameter
            };
            parameters.push(obj);
            addParams.push(obj);
        }
        return addParams;
    }

    return {
        type: driveObject.type,
        parameters: parameters,
        modbusOffset: driveObject.modbusOffset || 0,

        //setter
        updateValues : updateValues,
        setRun: setRun,
        setWarning: setWarning,
        setFault: setFault,
        setStop: setStop,
        setDriveParameter: setDriveParameter
    };
}

module.exports = Drive;