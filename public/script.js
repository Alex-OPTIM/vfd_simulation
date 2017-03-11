var $DEBUG = false;
(function () {
    var app = angular.module('simulationApp', []);
    app.controller('GeneralCtrl',['$scope', '$http', function (sim, $http) {
        var interval = setInterval(getStatus, 10000);

        function init() {
            $http.get('/GET/apis').then(function successCallback(response) {
                if ($DEBUG) console.log(response.data);
                sim.driveTypes = response.data.setDriveType.params;
                sim.driveStates = response.data.setState.params;
                getStatus();
            }, handleHttpError);
        }

        function getStatus() {
            $http.get('/GET/status').then(function(response) {
                if ($DEBUG) console.log(response.data);
                sim.status = response.data;
                sim.title = 'Drive ' + sim.status.type;

                sim.nextStateOn = new Date(sim.status.nextState);
                sim.stateChangedOn = new Date(sim.status.stateChangedOn);

                sim.parameters = sim.status.params.filter(function(item) {return (!item.fWord || !item.wWord)});

                var faultWords = sim.status.params.filter(function(item) {return (item.fWord)});
                var warnWords = sim.status.params.filter(function(item) {return (item.wWord)});

                sim.alarmWords = [{name:'Faults', array:faultWords}, {name:'Warnings', array:warnWords}];

            }, handleHttpError);
        }

        sim.refreshStatus = function () {
            getStatus();
        };

        sim.dec2Bin16 = function(dec){
            var bin=(dec>>>0).toString(2);if(bin.length<16){return'0000000000000000'.slice(bin.length)+bin}else{return bin}
        };

        sim.$on('$destroy', function () {
            clearInterval(interval);
        });

        sim.fromNow = function(d){
            return fromNow(d)
        };

        sim.greaterThan = function(prop, val){
            return function(item){
                return item[prop] > val;
            }
        };

        function fromNow(date) {
            if (!date) return completeFormatting(true, 0, 'seconds');

            var delta = Date.now() - date.getTime();
            var seconds = Math.floor(Math.abs(delta) / 1000);
            var interval = Math.floor(seconds / 31536000);

            if (interval > 1)  return completeFormatting(delta>0, interval, 'years');

            interval = Math.floor(seconds / 2592000);
            if (interval > 1) return completeFormatting(delta>0, interval, 'months');

            interval = Math.floor(seconds / 86400);
            if (interval > 1) return completeFormatting(delta>0, interval, 'days');

            interval = Math.floor(seconds / 3600);
            if (interval > 1) return completeFormatting(delta>0, interval, 'hours');

            interval = Math.floor(seconds / 60);
            if (interval > 1) return completeFormatting(delta>0, interval, 'minutes');

            return completeFormatting(delta>0, seconds, 'seconds');

            function completeFormatting(isAgo, number, units) {
                return ((!isAgo)? 'in ':'' ) + number + ' ' + units + ((isAgo)? ' ago':'');
            }
        }



        sim.setDriveType = function (driveType) {
            $http.get('/SET/drive/' + driveType).then(function successCallback(response) {
                if ($DEBUG) console.log(response.data);
                getStatus();
            }, handleHttpError);
        };

        sim.setFaster = function(isFaster){
            $http.get('/SET/faster/' + ((isFaster)? 'true': 'false')).then(function(response) {
                if ($DEBUG) console.log(response.data);
                getStatus();
            }, handleHttpError);
        };

        sim.setParamValue = function(paramId, value) {
            var _paramId = parseInt(paramId);
            var _value = parseInt(value);
            if (_paramId >= 0 && _value >= 0) {
                $http.get('/SET/param/' + _paramId + '/' + _value).then(function(response) {
                    if ($DEBUG) console.log(response.data);
                    getStatus();
                }, handleHttpError);
            } else {
                console.error('Must be an Integer number > 0');
            }
        };
        sim.setDriveState = function(stateId) {
            $http.get('/SET/state/' + stateId).then(function(response) {
                if ($DEBUG) console.log(response.data);
                getStatus();
            }, handleHttpError);
        };

        function handleHttpError(err) {
            if ($DEBUG) console.error(err.status, err.statusText);
        }

        init();
    }])
})();