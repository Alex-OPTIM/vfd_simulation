'use strict';
const logger = require('./utils/logger.js')('mServer');
const modbus = require('modbus-tcp');
const driveAdaptor = require('./drives/driveAdaptor.js');

/**
 * @param {string} driveName
 * @param {number} mPort
 * @param {string|undefined} mHost
 */
module.exports = function(driveName, mPort, mHost) {

    const net = require('net');
    net.createServer(function(socket) {

        logger.info('New connection.');

        const mServer = new modbus.Server();
        socket.on('error', function(err) {
            console.error(err);
            socket.destroy();
        });

        mServer.writer().pipe(socket);
        socket.pipe(mServer.reader());

        mServer.on('read-holding-registers', function(from, to, reply) {
            const val = driveAdaptor.getBuffers(from, to);
            return reply(null, val);
        });

    }).on('error', function(err) {
        console.error(err);
    }).listen(mPort, mHost, function() {
        console.log('Listening Modbus TCP for ' + driveName + ' on ' + ((mHost)? mHost : 'all_interfaces' ) + ':' + mPort);
    });

    return {}
};