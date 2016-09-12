var utils = {};

// min and max inclusive
utils.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * @param {number} base
 * @param {number} range - +/- value
 * */
utils.getRandomBase = function(base, range) {
    return base - range + utils.getRandomInt(1, 2 * range);
};

utils.toSInt16 = function(x){
    if (x<=65535){return(x>32767)?(x-65536):x}
    return x
};

/**
 * @param {Function|null} everySecondTask
 * @param {Function|null} everyMinuteTask
 * @param {Function|null} everyHourTask
 * */
utils.startPeriodicTasks = function(everySecondTask, everyMinuteTask, everyHourTask){
    var prSec = 0, prMin = 0, prHour = 0;
    setInterval(periodicTask,100);
    function periodicTask(){
        var now_ms = new Date().getTime();
        var nowSec = Math.round(now_ms/1000);
        // Tasks repeated every second
        if (nowSec > prSec){prSec = nowSec; if (everySecondTask) everySecondTask(nowSec)}
        // Tasks repeated every minute
        if (nowSec >= (prMin + 60)){prMin = nowSec; if (everyMinuteTask) everyMinuteTask(nowSec)}
        // Tasks repeated every hour
        if (nowSec >= (prHour + 3600)){prHour = nowSec; if (everyHourTask) everyHourTask(nowSec)}
    }
};
utils.bitUtils = function(){
    function _test(num,bit){
        return ((num>>bit) % 2 != 0)
    }

    function _set(num,bit){
        return num | 1<<bit;
    }

    function _clear(num,bit){
        return num & ~(1<<bit);
    }

    function _toggle(num,bit){
        return _test(num,bit)?_clear(num,bit):_set(num,bit);
    }
    return {
        itOn:_test,
        set:_set,
        clear:_clear,
        toggle:_toggle
    }
};

utils.int16ToBytes = function(number) {
    // we want to represent the input as a 8-bytes array
    var buf = new Buffer([0, 0]);
    if (number >= 0){
        if (number <= 65535) buf.writeUInt16BE(number, 0);
    }else{
        if (number >= -32768) buf.writeUInt16BE((65536 + number), 0);
    }
    return buf
};

module.exports = utils;