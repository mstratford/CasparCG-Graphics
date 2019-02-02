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
        Timelord.lockNowDescription = msg.lockNowDescription;
        Timelord.lockNowDescriptionCustom = msg.lockNowDescriptionCustom;
        Timelord.caption = msg.caption;
        Timelord.nowPlayingPrefix = msg.nowPlayingPrefix;
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
