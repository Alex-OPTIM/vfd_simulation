var development = false;
console.log("------------------------------------ SIMULATION STARTED -------------------------------------------");

/**
 * @param {string} TAG
 */
module.exports = function(TAG){
    /**
     * @description The function logs a debug message to the console
     * @param {string} message
     * @param {string} method
     * */
    function _info(message, method){
        if (development) logMessage('info', "*DEBUG* " +TAG, method, message);
    }
    
    function _setDebug(_isDebug){
        development = _isDebug;
    }

    return {
        info: _info,
        setDebug: _setDebug
    }
};


function logMessage(type, TAG, method, message){
    console[type](buildTag(TAG),":", method + " >>", message);
}

function buildTag(_TAG){
    var date = new Date();
    return date.getFullYear()+"/"
        +(date.getMonth()+1)+"/"
        +date.getDate()+" "
        +(date.getHours()<10?'0':'')+date.getHours()+":"
        +(date.getMinutes()<10?'0':'')+date.getMinutes()+":"
        +(date.getSeconds()<10?'0':'')+date.getSeconds()+":"
        +(date.getMilliseconds()<10?'00':date.getMilliseconds()<100?'0':'')+date.getMilliseconds() + " "
        + _TAG;
}