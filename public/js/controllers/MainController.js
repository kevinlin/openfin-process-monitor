app.controller('MainController', ['$scope', '$interval', function($scope, $interval) {

    var startTime,
        processDataMap,
        intervalID;

    $scope.canStart = false;
    $scope.canStop = false;
    $scope.cpuChartConfig = {
        options: {
            chart: {
                animation: false,
                type: 'line',
                zoomType: 'x'
            }
        },
        title: {
            text: 'CPU Usage'
        },
        xAxis: {
            title: {
                text: 'Elasped Time (s)'
            }
        },
        yAxis: {
            title: {
                text: '%'
            },
            min: 0
        },
        series: [],
        loading: true
    };
    $scope.memoryChartConfig = {
        options: {
            chart: {
                animation: false,
                type: 'line',
                zoomType: 'x'
            }
        },
        title: {
            text: 'Memory Usage'
        },
        xAxis: {
            title: {
                text: 'Elasped Time (s)'
            }
        },
        yAxis: {
            title: {
                text: 'Bytes'
            },
            min: 0
        },
        series: [],
        loading: true
    };

    $scope.start = function() {
        console.log('Monitor started: ' + (new Date()).toUTCString());
        startTime = Date.now();
        processDataMap = {};
        $scope.cpuChartConfig.series = [];
        $scope.memoryChartConfig.series = [];

        intervalID = $interval(function() {
            fin.desktop.System.getProcessList(function(processList) {
                angular.forEach(processList, function(data, key) {
                    var processName = data.name;
                    var now = Date.now();
                    var elaspedTime = (now - startTime) / 1000;
                    if (!(processName in processDataMap)) {
                        processDataMap[processName] = {
                            'processId': data.processId,
                            'uuid': data.uuid,
                            'type': data.type,
                            'cpuUsage': [],
                            'workingSetSize': []
                        };

                        $scope.cpuChartConfig.series.push({
                            'id': data.uuid,
                            'name': processName,
                            'data': processDataMap[processName].cpuUsage
                        });
                        $scope.memoryChartConfig.series.push({
                            'id': data.uuid,
                            'name': processName,
                            'data': processDataMap[processName].workingSetSize
                        });
                    }

                    processDataMap[processName].cpuUsage.push([elaspedTime, data.cpuUsage]);
                    processDataMap[processName].workingSetSize.push([elaspedTime, data.workingSetSize]);
                });

            });
        }, 500);

        $scope.canStart = false;
        $scope.canStop = true;
        $scope.cpuChartConfig.loading = false;
        $scope.memoryChartConfig.loading = false;
    };

    $scope.stop = function() {
        console.log('Monitor stopped: ' + (new Date()).toUTCString());
        $interval.cancel(intervalID);

        $scope.canStart = true;
        $scope.canStop = false;
    };

    $scope.openLearnMoreUrl = function() {
        if (typeof fin !== "undefined") {
            fin.desktop.System.openUrlWithBrowser('http://sngmercurial.apac.ad.tullib.com/TP/projects/generic_ui/repositories/ProcessMonitor/tree/default');
        } else {
            window.open('http://sngmercurial.apac.ad.tullib.com/TP/projects/generic_ui/repositories/ProcessMonitor/tree/default');
        }
    };

    //OpenFin is ready
    if (typeof fin !== "undefined") {
        fin.desktop.main(function() {
            fin.desktop.System.getVersion(function(version) {
                $scope.openFinVersion = version;
                $scope.$apply();
            });

            $scope.statusIndicatorClass = 'online';
            $scope.canStart = true;
            $scope.canStop = false;
            $scope.$apply();
        });
    }
}]);
