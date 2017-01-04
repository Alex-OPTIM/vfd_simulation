"use strict";
var logger = require('./utils/logger.js')('mServer');
var modbus = require("modbus-tcp");
var drive = require("./drives/driveModel.js");

/**
 * @param {number} mPort
 */
module.exports = function(mPort) {

    var net = require('net');
    net.createServer(function(socket) {

        logger.info("New connection.");

        var mServer = new modbus.Server();
        socket.on("error", function(err) {
            console.error(err);
            socket.destroy();
        });

        mServer.writer().pipe(socket);
        socket.pipe(mServer.reader());

        mServer.on("read-holding-registers", function(from, to, reply) {
            var val = drive.getBuffers(from, to);
            return reply(null, val);
        });

    }).on('error', function(err) {
        console.error(err);
    }).listen(mPort, function() {
        console.log("Listening Modbus TCP on port: " + mPort);
    });

    return {}
};