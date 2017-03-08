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
        {pId: 7121, id:'f_word_1', value:0,  fWord:true, hasFaultCodes:true, fCodes: 'F_CODES_1'},//  bits:[0,1,2,3,4]},
        // fake one
        {pId: 7777, id:'w_word_1', value:0,  wWord:true, bits:[0,1,2,3,4,9,14,15]},
    ],
    F_CODES_1: [
        {"value":1,"id":"InF_1","type":"F"},{"value":2,"id":"EEF1_2","type":"F"},{"value":3,"id":"CFF_3","type":"F"},{"value":4,"id":"CFI_4","type":"F"},{"value":5,"id":"SLF1_5","type":"F"},{"value":6,"id":"ILF_6","type":"F"},{"value":7,"id":"CnF_7","type":"F"},{"value":8,"id":"EPF1_8","type":"F"},{"value":9,"id":"OCF_9","type":"F"},{"value":10,"id":"CrF_10","type":"F"},{"value":11,"id":"SPF_11","type":"F"},{"value":12,"id":"AnF_12","type":"F"},{"value":13,"id":"LFF2_13","type":"F"},{"value":14,"id":"PtF1_14","type":"F"},{"value":15,"id":"OtF1_15","type":"F"},{"value":16,"id":"OHF_16","type":"F"},{"value":17,"id":"OLF_17","type":"F"},{"value":18,"id":"ObF_18","type":"F"},{"value":19,"id":"OSF_19","type":"F"},{"value":20,"id":"OPF1_20","type":"F"},{"value":21,"id":"PHF_21","type":"F"},{"value":22,"id":"USF_22","type":"F"},{"value":23,"id":"SCF1_23","type":"F"},{"value":24,"id":"SOF_24","type":"F"},{"value":25,"id":"tnF_25","type":"F"},{"value":26,"id":"InF1_26","type":"F"},{"value":27,"id":"InF2_27","type":"F"},{"value":28,"id":"InF3_28","type":"F"},{"value":29,"id":"InF4_29","type":"F"},{"value":30,"id":"EEF2_30","type":"F"},{"value":31,"id":"SCF2_31","type":"F"},{"value":32,"id":"SCF3_32","type":"F"},{"value":33,"id":"OPF2_33","type":"F"},{"value":34,"id":"COF_34","type":"F"},{"value":35,"id":"bLF_35","type":"F"},{"value":37,"id":"InF7_37","type":"F"},{"value":38,"id":"EPF2_38","type":"F"},{"value":39,"id":"APF_39","type":"F"},{"value":40,"id":"InF8_40","type":"F"},{"value":41,"id":"brF_41","type":"F"},{"value":42,"id":"SLF2_42","type":"F"},{"value":43,"id":"ECF_43","type":"F"},{"value":44,"id":"SSF_44","type":"F"},{"value":45,"id":"SLF3_45","type":"F"},{"value":46,"id":"PrF_46","type":"F"},{"value":47,"id":"PtF2_47","type":"F"},{"value":48,"id":"OtF2_48","type":"F"},{"value":49,"id":"PtFL_49","type":"F"},{"value":50,"id":"OtFL_50","type":"F"},{"value":51,"id":"InF9_51","type":"F"},{"value":52,"id":"InFA_52","type":"F"},{"value":53,"id":"InFb_53","type":"F"},{"value":54,"id":"tJF_54","type":"F"},{"value":55,"id":"SCF4_55","type":"F"},{"value":56,"id":"SCF5_56","type":"F"},{"value":57,"id":"SrF_57","type":"F"},{"value":58,"id":"FCF1_58","type":"F"},{"value":59,"id":"FCF2_59","type":"F"},{"value":60,"id":"InFC_60","type":"F"},{"value":61,"id":"AI2F_61","type":"F"},{"value":62,"id":"EnF_62","type":"F"},{"value":63,"id":"CrF2_63","type":"F"},{"value":64,"id":"LCF_64","type":"F"},{"value":65,"id":"bUF_65","type":"F"},{"value":66,"id":"dCF_66","type":"F"},{"value":67,"id":"HdF_67","type":"F"},{"value":68,"id":"InF6_68","type":"F"},{"value":69,"id":"InFE_69","type":"F"},{"value":70,"id":"bOF_70","type":"F"},{"value":71,"id":"LFF3_71","type":"F"},{"value":72,"id":"LFF4_72","type":"F"},{"value":73,"id":"HCF_73","type":"F"},{"value":76,"id":"dLF_76","type":"F"},{"value":99,"id":"CSF_99","type":"F"}
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