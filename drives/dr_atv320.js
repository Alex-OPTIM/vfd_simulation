'use strict';
module.exports = {
    type: 'atv320',
    parameters: [
        {pId:8601,  id:'mcw',     value:1141},
        {pId:8603,  id:'msw',     value:0},
        {pId:3206,  id:'asw',     value:0},
        {pId:5202,  id:'diw',     value:0},
        {pId:5212,  id:'dow',     value:0},
        {pId:8604,  id:'spd',     value:0},
        {pId:3204,  id:'cnt',     value:0},
        {pId:3205,  id:'trq',     value:0},
        {pId:3211,  id:'pwr',     value:0},
        {pId:3207,  id:'dc_v',    value:0},
        {pId:3208,  id:'out_v',   value:0},
        {pId:3209,  id:'d_temp',  value:0},
        {pId:8602,  id:'ref1',    value:0},
        {pId:8505,  id:'ref2',    value:0},
        {pId:5242,  id:'ai1',     value:0},
        {pId:5243,  id:'ai2',     value:0},
        {pId:5244,  id:'ai3',     value:0},
        {pId: 7121, id:'f_word_1', value:0,  fWord:true, bits:[0,1,2,3,4]},
        // fake one
        {pId: 7777, id:'w_word_1', value:0,  wWord:true, bits:[0,1,2,3,4,9,14,15]},
    ],
    nominal: {
        msw: {value: {run: 0, stop:0}, range: 0},
        spd: {value: {run:    2780  * 1, stop: 0}, range: 4},
        cnt: {value: {run:    110   * 10, stop: 0}, range: 30},
        trq: {value: {run:    26    * 1, stop: 0}, range: 4.1},
        pwr: {value: {run:    22    * 1, stop: 0}, range: 3},
        dc_v: {value: {run:   577   * 10, stop: 592}, range: 25},
        out_v: {value: {run:  360    * 1, stop: 0}, range: 3},
        d_temp: {value: {run: 39.4  * 1, stop: 260}, range: 4}
    },
    modbusOffset: 1
};