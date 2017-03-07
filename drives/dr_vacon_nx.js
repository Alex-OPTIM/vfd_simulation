"use strict";
module.exports = {
    type: "vacon_nx",
    parameters: [
        {"pId":2001,"id":"mcw","value":1141},
        {"pId":43,"id":"msw","value":0},
        {"pId":1601,"id":"asw","value":0},
        {"pId":15,"id":"diw","value":0},
        {"pId":17,"id":"dow","value":0},
        {"pId":2,"id":"spd","value":0},
        {"pId":3,"id":"cnt","value":0},
        {"pId":4,"id":"trq","value":0},
        {"pId":5,"id":"pwr","value":0},
        {"pId":7,"id":"dc_v","value":0},
        {"pId":6,"id":"out_v","value":0},
        {"pId":8,"id":"d_temp","value":0},
        {"pId":25,"id":"ref1","value":0},
        {"pId":18,"id":"ref2","value":0},
        {"pId":13,"id":"ai1","value":0},
        {"pId":14,"id":"ai2","value":0},
        {"pId":16,"id":"ai3","value":0},
        {"pId":1172,"id":"f_word_1","value":0,fWord:true,"bits":[0,1,2,3,4,5,6,7,8,11,12,13,14,15]},
        {"pId":1173,"id":"f_word_2","value":0,fWord:true,"bits":[2,6,9,10,14]},
        {"pId":1174,"id":"w_word_1","value":0,wWord:true,"bits":[0,1,2,3,4,9,14,15]}
    ],
    nominal: {
        msw: {value: {run: 0, stop:0}, range: 0},
        spd: {value: {run:    1492  * 1, stop: 0}, range: 2},
        cnt: {value: {run:    210   * 10, stop: 0}, range: 25},
        trq: {value: {run:    26    * 10, stop: 0}, range: 31},
        pwr: {value: {run:    11    * 10, stop: 0}, range: 2},
        dc_v: {value: {run:   592   * 1, stop: 582}, range: 2},
        out_v: {value: {run:  36    * 10, stop: 0}, range: 3},
        d_temp: {value: {run: 36.4  * 10, stop: 250}, range: 3}
    },
    modbusOffset: 1
};