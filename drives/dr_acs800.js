"use strict";
var logger = require('../utils/logger.js')('dr_acs800');
var utils = require("../utils/utils");
var bit = utils.bitUtils();

var parameters = [
    {"add":300,"id":"mcw","value":1141},
    {"add":301,"id":"msw","value":0},
    {"add":302,"id":"asw","value":0},
    {"add":116,"id":"diw","value":0},
    {"add":120,"id":"dow","value":0},
    {"add":101,"id":"spd","value":0},
    {"add":103,"id":"cnt","value":0},
    {"add":104,"id":"trq","value":0},
    {"add":105,"id":"pwr","value":0},
    {"add":106,"id":"dc_v","value":0},
    {"add":108,"id":"out_v","value":0},
    {"add":109,"id":"d_temp","value":0},
    {"add":110,"id":"ref1","value":0},
    {"add":111,"id":"ref2","value":0},
    {"add":117,"id":"ai1","value":0},
    {"add":118,"id":"ai2","value":0},
    {"add":119,"id":"ai3","value":0},
    {"add":304,"id":"f_word_1","value":0},
    {"add":305,"id":"f_word_2","value":0},
    {"add":307,"id":"w_word_1","value":0},
    {"add":308,"id":"w_word_2","value":0},
    {"add":314,"id":"f_word_4","value":0},
    {"add":315,"id":"w_word_4","value":0},
    {"add":316,"id":"f_word_5","value":0},
    {"add":317,"id":"w_word_5","value":0},
    {"add":330,"id":"w_word_6","value":0},
    {"add":332,"id":"f_word_6","value":0},
    {"add":2000,"id":"par2001","value":0},
    {"add":2001,"id":"par2002","value":2200}
];
var faultWords = [
    {"add":304,"id":"f_word_1","bits":[0,1,2,3,4,5,6,7,8,9]},
    {"add":305,"id":"f_word_2","bits":[0,1,2,4,5,6,7,8,9,10,11,12,13,14,15]},
    {"add":314,"id":"f_word_4","bits":[0,1,2,3]},
    {"add":316,"id":"f_word_5","bits":[0,1,2,3,4,5,6,78,9,10,11,13]},
    {"add":332,"id":"f_word_6","bits":[2]}
];
var warnWords = [
    {"add":307,"id":"w_word_1","bits":[0,2,3,4,5,6,12,14]},
    {"add":308,"id":"w_word_2","bits":[1,4,7,8,9,10,13]},
    {"add":315,"id":"w_word_4","bits":[0,1,2,3,4,5,13,14]},
    {"add":317,"id":"w_word_5","bits":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,15]},
    {"add":330,"id":"w_word_6","bits":[0,3]}
];
var nom  = {
    msw: {value: {run: 0, stop:0}, range: 0},
    spd: {value: {run: 13500, stop: 0}, range: 20},
    cnt: {value: {run: 2500, stop: 0}, range: 25},
    trq: {value: {run: 3100, stop: 0}, range: 31},
    pwr: {value: {run: 180, stop: 0}, range: 2},
    dc_v: {value: {run: 592, stop: 582}, range: 2},
    out_v: {value: {run: 365, stop: 0}, range: 3},
    d_temp: {value: {run: 254, stop: 210}, range: 3}
};

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
    
module.exports = {
    name: "acs800",
    parameters: parameters,
    
    
    //setter
    updateValues : _updateValues,
    setRun: _setRun,
    setWarning: _setWarning,
    setFault: _setFault,
    setStop: _setStop
};

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