"use strict";
var logger = require('../../utils/logger.js')('paramSaver');
var fs = require("fs");
const paramFolder = "./drives/parameters";
const fnSuffix =  "_params.json";


// -------------------------------- PUBLIC -------------------------------- 
/**
 * @param {string} driveType
 * @param {object} parameters
 * @param {function} cb
 */
function _saveParam(driveType, parameters, cb){
    var path = paramFolder + "/" + driveType + fnSuffix;
    var paramString = JSON.stringify(parameters);

    fs.writeFile(path, paramString, cb);
}

/**
 *
 * @param {string} driveType
 * @param {function([])} cb
 * @private
 */
function _listParams(driveType, cb){
    var path = paramFolder + "/" + driveType + fnSuffix;
    fs.readFile(path, function (err, data){
        if (err) return cb([]);
        var params = [];
        try {
            params = JSON.parse(data);
        } catch (e) {
            
        }
        cb(params);
    })
}

module.exports = {
    saveParam: _saveParam,
    listParams: _listParams
};