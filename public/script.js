(function () {
    var app = angular.module('simulationApp', []);
    app.controller('GeneralCtrl',['$scope', '$http', function (sim, $http) {
        var interval = setInterval(getStatus, 10000);

        sim.driveStates = ['RUNNING', 'STOPPED', 'WARNING', 'FAULTED'];
        sim.driveTypes = ['acs800', 'vacon_nx', 'atv320'];

        getStatus();

        sim.setDriveState = function(stateId) {
            $http.get('/SET/state/' + stateId).then(function(response) {
                if (response.status !== 200) console.error(response.status);
                // response.data = {"done":true,"newState":"STOPPED"}
                getStatus();
            });
        };

        sim.refreshStatus = function () {
            getStatus();
        };

        function getStatus() {
            $http.get('/GET/status').then(function(response) {
                if (response.status !== 200) return console.error(response.status);
                sim.status = response.data;
                sim.title = 'Drive ' + sim.status.type;

                sim.nextStateOn = new Date(sim.status.nextState);
                sim.stateChangedOn = new Date(sim.status.stateChangedOn);

                sim.parameters = sim.status.params.filter(function(item) {return (!item.fWord || !item.wWord)});

                var faultWords = sim.status.params.filter(function(item) {return (item.fWord)});
                var warnWords = sim.status.params.filter(function(item) {return (item.wWord)});

                sim.alarmWords = [{name:'Faults', array:faultWords}, {name:'Warnings', array:warnWords}];

            });
        }

        sim.setDriveType = function (driveType) {
            $http.get('/SET/drive/' + driveType).then(function(response) {
                if (response.status !== 200) console.error(response.status);
                console.log(JSON.stringify(response.data));
                getStatus();
            });
        };

        sim.setFaster = function(isFaster){
            $http.get('/SET/faster/' + ((isFaster)? 'true': 'false')).then(function(response) {
                if (response.status !== 200) console.error(response.status);
                console.log(JSON.stringify(response.data));
                getStatus();
            });
        };

        sim.setParamValue = function(paramId, value) {
            var _paramId = parseInt(paramId);
            var _value = parseInt(value);
            if (_paramId >= 0 && _value >= 0) {
                $http.get('/SET/param/' + _paramId + '/' + _value).then(function(response) {
                    if (response.status !== 200) console.error(response.status);
                    console.log(JSON.stringify(response.data));
                    getStatus();
                });
            } else {
                console.error('Must be an Integer number > 0');
            }
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
    }])
})();