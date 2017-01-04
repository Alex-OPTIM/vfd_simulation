"use strict";
var logger = require('../utils/logger.js')('dr_vacon_nx');
var utils = require("../utils/utils");
var bit = utils.bitUtils();

var parameters = [
    {"parId":2001,"id":"mcw","value":1141},
    {"parId":43,"id":"msw","value":0},
    {"parId":1601,"id":"asw","value":0},
    {"parId":15,"id":"diw","value":0},
    {"parId":17,"id":"dow","value":0},
    {"parId":2,"id":"spd","value":0},
    {"parId":3,"id":"cnt","value":0},
    {"parId":4,"id":"trq","value":0},
    {"parId":5,"id":"pwr","value":0},
    {"parId":7,"id":"dc_v","value":0},
    {"parId":6,"id":"out_v","value":0},
    {"parId":8,"id":"d_temp","value":0},
    {"parId":25,"id":"ref1","value":0},
    {"parId":18,"id":"ref2","value":0},
    {"parId":13,"id":"ai1","value":0},
    {"parId":14,"id":"ai2","value":0},
    {"parId":16,"id":"ai3","value":0},
    {"parId":1172,"id":"f_word_1","value":0,fWord:true,"bits":[0,1,2,3,4,5,6,7,8,11,12,13,14,15]},
    {"parId":1173,"id":"f_word_2","value":0,fWord:true,"bits":[2,6,9,10,14]},
    {"parId":1174,"id":"w_word_1","value":0,wWord:true,"bits":[0,1,2,3,4,9,14,15]}
];

var faultWords = parameters.filter(function(param) {return param.fWord});
var warnWords = parameters.filter(function(param) {return param.wWord});

var nom  = {
    msw: {value: {run: 0, stop:0}, range: 0},
    spd: {value: {run:    1492  * 1, stop: 0}, range: 2},
    cnt: {value: {run:    210   * 10, stop: 0}, range: 25},
    trq: {value: {run:    26    * 10, stop: 0}, range: 31},
    pwr: {value: {run:    11    * 10, stop: 0}, range: 2},
    dc_v: {value: {run:   592   * 1, stop: 582}, range: 2},
    out_v: {value: {run:  36    * 10, stop: 0}, range: 3},
    d_temp: {value: {run: 36.4  * 10, stop: 250}, range: 3}
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
    name: "vacon_nx",
    parameters: parameters,
    modbusOffset: 1,
    
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