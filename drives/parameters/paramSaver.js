'use strict';
const logger = require('../../utils/logger.js')('paramSaver');
const fs = require('fs');
const paramFolder = './drives/parameters';
const fnSuffix =  '_params.json';


// -------------------------------- PUBLIC -------------------------------- 
/**
 * @param {string} driveType
 * @param {object} parameters
 * @param {function} cb
 */
function _saveParam(driveType, parameters, cb){
    const path = paramFolder + '/' + driveType + fnSuffix;
    const paramString = JSON.stringify(parameters);

    fs.writeFile(path, paramString, cb);
}

/**
 *
 * @param {string} driveType
 * @param {function([])} cb
 * @private
 */
function _listParams(driveType, cb){
    const path = paramFolder + '/' + driveType + fnSuffix;
    fs.readFile(path, function (err, data){
        if (err) return cb([]);
        let params = [];
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