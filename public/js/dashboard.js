var app = angular.module('StarterApp', ['ngRoute', 'LocalStorageModule', 'angularify.semantic', 'socket-io']);


app.controller('AppCtrl', ['$scope', '$location', 'socket',
    function($scope, $location, socket){

        socket.on("theme", function (msg) {
            $scope.theme = msg;
        });

        $scope.menu = [];

        $scope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };

        $scope.menu.push({
            name: 'General',
            url: '/general',
            type: 'link',
            icon: 'settings',
        });

        $scope.menu.push({
            name: 'Holding Card',
            url: '/holding',
            type: 'link',
            icon: 'settings',
        });

        $scope.menu.push({
            name: 'Lower Thirds',
            url: '/lowerThirds',
            type: 'link',
            icon: 'violet list layout'
        });

        $scope.menu.push({
            name: 'Grid',
            url: '/grid',
            type: 'link',
            icon: 'teal grid layout',
        });

    	$scope.menu.push({
            name: 'Social Media',
            url: '/social-media',
            type: 'link',
            icon: 'blue twitter',
        });

    }
]);

/*
 *  Configure the app routes
 */
app.config(['$routeProvider', 'localStorageServiceProvider',
    function($routeProvider, localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('cg');

        $routeProvider
            .when("/general", {
                templateUrl: '/admin/templates/general.tmpl.html',
                controller: 'generalCGController'
            })
            .when("/holding", {
                templateUrl: '/admin/templates/holdingCard.tmpl.html',
                controller: 'holdingCardCGController'
            })
            .when("/lowerThirds", {
                templateUrl: '/admin/templates/lowerThirds.tmpl.html',
                controller: 'lowerThirdsCGController'
            })
            .when("/social-media", {
                templateUrl: '/admin/templates/social-media.tmpl.html',
                controller: 'socialmediaCGController'
            })
            .when("/grid", {
                templateUrl: '/admin/templates/grid.tmpl.html',
                controller: 'gridCGController'
            })
            .otherwise({redirectTo: '/general'});
    }
]);

app.controller('generalCGController', ['$scope', 'socket',
    function($scope, socket){

        socket.on("theme", function (msg) {
            if (!$scope.theme) {
                $scope.theme = msg;
            }
        });

        $scope.$watch('theme', function() {
            if ($scope.theme) {
                socket.emit("theme", $scope.theme);
            } else {
                getThemeData();
            }
        }, true);

        function getThemeData() {
            socket.emit("theme:get");
        }


        socket.on("bug", function (msg) {
            if (!$scope.general) {
                $scope.general = msg;
            }
        });

        $scope.$watch('general', function() {
            if ($scope.general) {
                socket.emit("bug", $scope.general);
            } else {
                getBugData();
            }
        }, true);

        socket.on("bug", function (msg) {
            $scope.bug = msg;
        });

        function getBugData() {
            socket.emit("bug:get");
        }
    }
]);

app.controller('holdingCardCGController', ['$scope', 'socket',
    function($scope, socket){
        socket.on("holdingCard", function (msg) {
            if (!$scope.holdingCard) {
                $scope.holdingCard = msg;
            }
        });

        $scope.$watch('holdingCard', function() {
            if ($scope.holdingCard) {
                socket.emit("holdingCard", $scope.holdingCard);
            } else {
                getHoldingCardData();
            }
        }, true);

        function getHoldingCardData() {
            socket.emit("holdingCard:get");
        }

        socket.on("timelord", function (msg) {
            if (!$scope.timelord) {
                $scope.timelord = msg;
            }
        });

        $scope.$watch('timelord', function() {
            if ($scope.timelord) {
                socket.emit("timelord", $scope.timelord);
            } else {
                getTimelordData();
            }
        }, true);

        function getTimelordData() {
            socket.emit("timelord:get");
        }

    }
]);

app.controller('lowerThirdsCGController', ['$scope', 'localStorageService', 'socket',
    function($scope, localStorageService, socket){

        var stored = localStorageService.get('lower_thirds');

        if(stored === null) {
            $scope.queuedThirds = [];
        } else {
            $scope.queuedThirds = stored;
        }

        $scope.add = function(item) {
            $scope.queuedThirds.push(item);

            $scope.lowerThirdsForm.$setPristine();
            $scope.lowerThird = {};
        };

        $scope.remove = function(index){
            $scope.queuedThirds.splice(index, 1);
        };

        $scope.show = function(side, item) {
            socket.emit("lowerthird:" + side, item);
        };

        $scope.hideall = function() {
            socket.emit("lowerthird:hideall");
        };

        $scope.hidefull = function() {
            socket.emit("lowerthird:hidefull");
        };

		$scope.hideleft = function() {
            socket.emit("lowerthird:hideleft");
        };

		$scope.hideright = function() {
            socket.emit("lowerthird:hideright");
        };

        $scope.$on("$destroy", function() {
            localStorageService.set('lower_thirds', $scope.queuedThirds);
        });
    }
]);

app.controller('gridCGController', ['$scope', '$log', 'localStorageService', 'socket',
    function($scope, $log, localStorageService, socket){

        var stored = localStorageService.get('grid');

        if(stored === null) {
            $scope.grid = {};
            $scope.grid.rows = [];
        } else {
            $scope.grid = stored;
        }

        $scope.add = function() {
            $scope.grid.rows.push({left:'', right:''});
        };

        $scope.remove = function(index){
            $scope.grid.rows.splice(index, 1);
        };

        $scope.show = function() {
            socket.emit('grid', $scope.grid);
            $log.info("grid.show()");
            $log.info($scope.grid);
        };

        $scope.hide = function() {
            socket.emit('grid', 'hide');
            $log.info("grid.hide()");
        };

        $scope.$on("$destroy", function() {
            localStorageService.set('grid', $scope.grid);
        });
}]);

app.controller('socialmediaCGController', ['$scope', 'socket',
    function($scope, socket) {
        socket.on("socialmedia", function (msg) {
            $scope.socialmedia = msg;
        });

        $scope.$watch('socialmedia', function() {
            if ($scope.socialmedia) {
                socket.emit("socialmedia", $scope.socialmedia);
            } else {
                getSocialMediaData();
            }
        }, true);

        function getSocialMediaData() {
            socket.emit("socialmedia:get");
        }

    }
]);
