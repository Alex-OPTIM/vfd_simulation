"use strict";
module.exports = {
    type: "vacon_nx",
    parameters: [
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