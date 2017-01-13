"use strict";
var logger = require('../utils/logger.js')('driveInterface');
var utils = require("../utils/utils");
var bit = utils.bitUtils();

/**
 * 
 * @param {{type:string, modbusOffset:number, parameters:[], nominal:{}}} driveObject
 * @param {[]} additionalParams
 * @constructor
 */
function Drive(driveObject, additionalParams){
    additionalParams = (Array.isArray(additionalParams))? additionalParams : [];

    var parameters = driveObject.parameters.concat(additionalParams);
    
    var nom = driveObject.nominal;
    
    var faultWords = parameters.filter(function(param) {return param.fWord});
    var warnWords = parameters.filter(function(param) {return param.wWord});

    var msw = getParam("msw"),
        spd = getParam("spd"),
        cnt = getParam("cnt"),
        trq = getParam("trq"),
        pwr = getParam("pwr"),
        dc_v = getParam("dc_v"),
        out_v = getParam("out_v"),
        d_temp = getParam("d_temp"),

        wWord = getParam("w_word_1"),
        fWord = getParam("f_word_1");

    // ------------------------------------ PRIVATE ------------------------------------
    function getParam(id){
        for (var i = 0; i < parameters.length; i++){
            if (parameters[i].id === id) return parameters[i]
        }
        return null;
    }
    function getRandomBit(words){
        var wordIndex = utils.getRandomInt(0,words.length - 1);
        var word = words[wordIndex];
        logger.info(wordIndex + " " + JSON.stringify(word), "getRandomBit");

        var bitIndex = utils.getRandomInt(0,word.bits.length - 1);
        var bit = word.bits[bitIndex];
        logger.info(bitIndex + " " + bit, "getRandomBit");

        return {id:word.id, bit:bit}
    }

    // ------------------------------------ PUBLIC ------------------------------------
    function _updateValues(isRunning){

        var state = (isRunning) ? "run" : "stop";
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

    function _setRun(){
        msw.value = nom.msw.value.stop;
        msw.value = bit.set(msw.value, 2); // RUN bit in STATUS WORD

        wWord.value = 0;
        fWord.value = 0;
    }
    function _setWarning(){
        msw.value = bit.set(msw.value, 7); // WARNING bit in STATUS WORD

        var word = getRandomBit(warnWords);
        wWord = getParam(word.id);
        wWord.value = bit.set(wWord.value, word.bit);
    }
    function _setFault(){
        msw.value = nom.msw.value.stop;
        msw.value = bit.set(msw.value, 3); // FAULT bit in STATUS WORD

        var word = getRandomBit(faultWords);
        fWord = getParam(word.id);
        fWord.value = bit.set(fWord.value, word.bit);
    }
    function _setStop(){
        msw.value = nom.msw.value.stop;

        wWord.value = 0;
        fWord.value = 0;
    }

    /**
     * @param {number} parId
     * @param {number} value
     * @returns {Array}
     * @private
     */
    function _setDriveParameter(parId, value){
        var isPresent = false;
        var addParams = [];
        for (var i = 0; i < parameters.length; i++){
            if (parameters[i].parId === parId){
                parameters[i].value = value;
                isPresent = true;
            }
            if (parameters[i].ap) addParams.push(parameters[i]);
        }
        if (!isPresent){
            var obj = {
                parId: parId,
                id: "id_" + parId,
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
        updateValues : _updateValues,
        setRun: _setRun,
        setWarning: _setWarning,
        setFault: _setFault,
        setStop: _setStop,
        setDriveParameter: _setDriveParameter
    };
}

module.exports = Drive;