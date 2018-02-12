var app = angular.module('cgApp', ['ngAnimate', 'socket-io']);

app.controller('themeCtrl', ['$scope', 'socket',
function($scope, socket){

    socket.on("theme", function (state) {
        $scope.state = state;
    });

    $scope.$watch('theme', function() {
        if (!$scope.theme) {
            getThemeData();
        }
    }, true);

    socket.on("theme", function (msg) {
        $scope.theme = msg;
    });

    function getThemeData() {
        socket.emit("theme:get");
    };
}
]);

app.controller('holdingCardCtrl', ['$scope', 'socket',
function($scope, socket){
    holdingCardVideo = document.getElementById("holdingCardVideo");
    socket.on("holdingCard", function (msg) {
        $scope.holdingCard = msg;
            if ($scope.holdingCard.play) {
                holdingCardVideo.play();
            } else {
                holdingCardVideo.pause();
            }
    });

    $scope.$watch('holdingCard', function() {
        if ($scope.holdingCard) {
            socket.emit("holdingCard", $scope.holdingCard);
        } else {
            getHoldingCardData();
        }
    }, true);

    $scope.getHoldingcardVideoSrc = function (theme) {
        return '/themes/' + theme + '/' + $scope.holdingCard.video;
    };

    function getHoldingCardData() {
        socket.emit("holdingCard:get");
    };


    socket.on("timelord", function (msg) {
        $scope.timelord = msg;
        Timelord.lockNow = msg.lockNow;
        Timelord.lockNowTime = msg.lockNowTime;
        Timelord.showNews = msg.showNews;
        Timelord.showNewsNow = msg.showNewsNow;
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
    };
}
]);


app.controller('lowerThirdsCtrl', ['$scope', 'socket',
    function($scope, socket){
        $scope.showLeft = false;

        socket.on("lowerthird:hideall", function (msg) {
            $scope.showLeft = false;
            $scope.showRight = false;
            $scope.showFull = false;
        });

        socket.on("lowerthird:hidefull", function (msg) {
            $scope.showFull = false;
        });

        socket.on("lowerthird:hideleft", function (msg) {
            $scope.showLeft = false;
        });

        socket.on("lowerthird:hideright", function (msg) {
            $scope.showRight = false;
        });

        socket.on("lowerthird:left", function (msg) {
            if($scope.showLeft) {
                $scope.showLeft = false;
            }
            $scope.left = msg;
            $scope.showLeft = true;
        });

        socket.on("lowerthird:right", function (msg) {
            if($scope.showRight) {
                $scope.showRight = false;
            }
            $scope.right = msg;
            $scope.showRight = true;
        });

        socket.on("lowerthird:full", function (msg) {
            if($scope.showFull) {
                $scope.showFull = false;
            }
            $scope.full = msg;
            $scope.showFull = true;
        });
    }
]);

app.controller('archeryCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("archery", function (msg) {
            $scope.archery = msg;
        });
    }
]);

app.controller('boxingCtrl', ['$scope', 'socket',
    function($scope, socket){

        socket.on("boxing", function (msg) {
            $scope.boxing = msg;
        });

        socket.on("clock:tick", function (msg) {
            $scope.clock = msg.slice(0, msg.indexOf("."));
        });

        $scope.$watch('boxing', function() {
            if (!$scope.boxing) {
                getBoxingData();
            }
        }, true);

        function getBoxingData() {
            socket.emit("boxing:get");
            socket.emit("clock:get");
        }
    }
]);

app.controller('bugCtrl', ['$scope', '$timeout', 'socket',
    function($scope, $timeout, socket){
        $scope.tickInterval = 1000; //ms

        socket.on("bug", function (state) {
            $scope.state = state;
        });

        $scope.$watch('bug', function() {
            if (!$scope.bug) {
                getBugData();
            }
        }, true);

		socket.on("bug", function (msg) {
            $scope.bug = msg;
        });

        function getBugData() {
            socket.emit("bug:get");
        };

        var tick = function () {
            $scope.clock = Date.now(); // get the current time
            $timeout(tick, $scope.tickInterval); // reset the timer
        };

        // Start the timer
        $timeout(tick, $scope.tickInterval);
    }
]);

app.controller('scoringCtrl', ['$scope', '$interval', '$http', 'socket',
    function($scope, $interval, $http, socket){
        $scope.tickInterval = 5000;
        $scope.yorkScore = "";
        $scope.lancScore = "";

        var fetchScore = function () {
          var config = {headers:  {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          };

          $http.get('https://roseslive.co.uk/score.json', config)
            .success(function(data) {
              if(isNaN(data.york) || isNaN(data.lancs)){
                console.log("Roses live is giving us nonsense");
                return;
              };
              if(!$scope.manualScore){
                $scope.yorkScore = data.york;
                $scope.lancScore = data.lancs;
              };
                socket.emit('lancScore', data.lancs);
                socket.emit('yorkScore', data.york);
            }
          );
        };

        socket.on("score", function (state) {
            $scope.showScore = state.showScore;
            $scope.manualScore = state.manualScore;
            if(state.manualScore){
              $scope.yorkScore = state.yorkScore;
              $scope.lancScore = state.lancScore;
            };
        });

        $scope.$watch('score', function() {
            if (!$scope.score) {
                getScoreData();
            }
        }, true);

        function getScoreData() {
            socket.emit("score:get");
        }

        //Intial fetch
        fetchScore();
        // Start the timer
        $interval(fetchScore, $scope.tickInterval);
    }
]);

app.controller('footballCtrl', ['$scope', 'socket',
    function($scope, socket){

        socket.on("football", function (msg) {
            $scope.football = msg;
        });

        socket.on("clock:tick", function (msg) {
            $scope.clock = msg.slice(0, msg.indexOf("."));
        });

        $scope.$watch('football', function() {
            if (!$scope.football) {
                getFootballData();
            }
        }, true);

        function getFootballData() {
            socket.emit("football:get");
            socket.emit("clock:get");
        }
    }
]);

app.controller('rugbyCtrl', ['$scope', 'socket',
    function($scope, socket){

        socket.on("rugby", function (msg) {
            $scope.rugby = msg;
        });

        socket.on("clock:tick", function (msg) {
            $scope.clock = msg.slice(0, msg.indexOf("."));
        });

        $scope.$watch('rugby', function() {
            if (!$scope.rugby) {
                getRugbyData();
            }
        }, true);

        function getRugbyData() {
            socket.emit("rugby:get");
            socket.emit("clock:get");
        }
    }
]);

// Social Media Controller, as developed by Dan Leedham with help from the amazing Tom J
// Initialise with the usual plus http for grabbing data from social media sites
// SCE allows us to use Trust HTML for the data we get back from social media sites
app.controller('socialmediaCtrl', ['$scope', '$http', 'socket', '$sce',
    function($scope, $http, socket, $sce){
        var showTweet = false;
        socket.on("socialmedia", function (msg) {
            tweetUrl = msg.tweet;
            $scope.socialmedia = msg;
            showTweet = msg.show;
            if (!showTweet) {
                $scope.showTweet = false;
            }
            fetchTweetHTML(msg.tweet);
        });

// Now let's go get the html code from our provider
// tweetUrl in the function is the text entered by the user in the backend
// tweetUrl requires a full post/video url to work. References to 'tweet' usually mean post
		var fetchTweetHTML = function (tweetUrl) {
          var config = {headers:  {
              'Accept': 'application/jsonp',
              'Content-Type': 'application/jsonp',
            }
          };

// Checks the user provided url, determines which oEmbed engine to use
// For more oEmbed sites, add another else if
         if (tweetUrl.indexOf('instagram.com') >= 0) {
                  oEmbedUrl = 'http://api.instagram.com/oembed?url=';
          } else if (tweetUrl.indexOf('facebook.com') >= 0) {
                  // Facebook has two endpoints, one for post and one for video, hence the nested if
                  if     (tweetUrl.indexOf('video') >= 0) {
                  oEmbedUrl = 'https://www.facebook.com/plugins/video/oembed.json/?url=';
                  }
                  else {
                  oEmbedUrl = 'https://www.facebook.com/plugins/post/oembed.json/?url=';
                  }
          } else {
                  oEmbedUrl = 'https://api.twitter.com/1/statuses/oembed.json?url=';
          }


// $http.jsonp goes gets the data from oEmbed
          $http.jsonp(oEmbedUrl+tweetUrl+'&callback=JSON_CALLBACK', config)
            .success(function(data) {
                $scope.tweetHTML = $sce.trustAsHtml(data.html);		// trustAsHtml stops the app adding '' around the html code
                $scope.tweetAuthor = data.author_name;				// Not used yet, but could be handy
                $scope.tweetType = data.type;						// Not used yet, but could be handy for the client side
                setTimeout(function() {
                // Once a post is called, it needs to be styled correctly by initialising some cleverness
                // Each service requires its own function determined by the content of the url
                   if (tweetUrl.indexOf("instagram.com") >= 0) { instgrm.Embeds.process(); }
                   else if (tweetUrl.indexOf("facebook.com") >= 0) { window.fbAsyncInit = function() {
								FB.init({
								  xfbml      : true,
								  version    : 'v2.8'
								});
							  };
							  (function(d, s, id){
								var js, fjs = d.getElementsByTagName(s)[0];
								if (d.getElementById(id)) {return;}
								js = d.createElement(s); js.id = id;
								js.src = "//connect.facebook.net/en_US/sdk.js";
								fjs.parentNode.insertBefore(js, fjs);
							  }(document, 'script', 'facebook-jssdk')); }
                   else { twttr.widgets.load(); }
                    if (showTweet) {
                        $scope.showTweet = showTweet;
                    }
                });
             }
          );
        };

        $scope.$watch('socialmedia', function() {
            if (!$scope.socialmedia) {
                getSocialMediaData();
            }
        }, true);

        function getSocialMediaData() {
            socket.emit("socialmedia:get");
        }
    }

]);

app.controller('dartsCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("dart", function (msg) {
            $scope.darts = msg;
        });

        $scope.$watch('dart', function() {
            if (!$scope.dart) {
                getDartData();
            }
        }, true);

        function getDartData() {
            socket.emit("dart:get");
        }
    }
]);

app.controller('gridCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("grid", function (payload) {
            if (payload === "hide") {
                //We first remove every element with a delay
                setTimeout(function(){$scope.grid = {};}, 1000);
                $scope.show = false;
            } else {
                $scope.show = true;
                $scope.grid = payload;
            }
        });
    }
]);

app.controller('swimmingCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("swimming", function (msg) {
            $scope.swimming = msg;
        });

        $scope.clockMin = "0";
        $scope.clockSec = "00";
        $scope.clockDec = "0";

        socket.on("clock:tick", function (msg) {
            $scope.clockMin = msg.slice(0,msg.indexOf(":")).replace(/^0/, '');
            $scope.clockSec = msg.slice(msg.indexOf(":")+1,msg.indexOf("."));
            $scope.clockDec = msg.slice(msg.indexOf(".")+1);
        });

        $scope.$watch('swimming', function() {
            if (!$scope.swimming) {
                getSwimmingData();
            }
        }, true);

        function getSwimmingData() {
            socket.emit("swimming:get");
            socket.emit("clock:get");
        }
    }
]);

app.controller('basketballCtrl', ['$scope', 'socket',
    function($scope, socket){

        socket.on("basketball", function (msg) {
            $scope.basketball = msg;
        });

        socket.on("clock:tick", function (msg) {
            $scope.clock = msg.slice(0, msg.indexOf("."));
        });

        $scope.$watch('basketball', function() {
            if (!$scope.basketball) {
                getBasketballData();
            }
        }, true);

        function getBasketballData() {
            socket.emit("basketball:get");
            socket.emit("clock:get");
        }
    }
]);

app.controller('badmintonCtrl', ['$scope', 'socket',
    function($scope, socket){
        socket.on("badminton", function (msg) {
            $scope.badminton = msg;
        });

        $scope.$watch('badminton', function() {
            if (!$scope.badminton) {
                getBadmintonData();
            }
        }, true);

        function getBadmintonData() {
            socket.emit("badminton:get");
        }
    }
]);
