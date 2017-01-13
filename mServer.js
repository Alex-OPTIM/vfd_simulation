"use strict";
var logger = require('./utils/logger.js')('mServer');
var modbus = require("modbus-tcp");
var driveAdaptor = require("./drives/driveAdaptor.js");

/**
 * @param {string} driveName
 * @param {number} mPort
 * @param {string|undefined} mHost
 */
module.exports = function(driveName, mPort, mHost) {

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
            var val = driveAdaptor.getBuffers(from, to);
            return reply(null, val);
        });

    }).on('error', function(err) {
        console.error(err);
    }).listen(mPort, mHost, function() {
        console.log("Listening Modbus TCP for " + driveName + " on " + ((mHost)? mHost : "all_interfaces" ) + ":" + mPort);
    });

    return {}
};