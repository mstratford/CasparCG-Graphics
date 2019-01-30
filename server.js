var express 	= require('express'),
	http 		= require('http'),
	Stopwatch 	= require('./models/stopwatch');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var theme = {selected: "ury"};
var bug = {livetext: "Live", locationtext: ''};
var holdingCard = {video: "holdingcard.mp4", autoplay:true, loop: true, showAll: true, play: true, volume: false};
var timelord = { nowNextLocation: "middle", lockNowDescription: "Automatic", lockNowDescriptionCustom: "", caption: "Join the conversation Twitter: @ury1350 Text: 07851 101 313", lockNowTime: "", showNowNext: true, showCredits:true, showDesc:false, showNowPlaying:true, showNews: true, showNewsNow: false};
var socialmedia = {tweet: "", pos: "bottom center", tweethtml: ""};
var grid = {headingcolor:"#BC204B", leftcolor: "#1f1a34", rightcolor:"#1f1a34"};

//Clock Functions
var stopwatch = new Stopwatch();

stopwatch.on('tick:stopwatch', function(time) {
	io.sockets.emit("clock:tick", time);
});

io.on('connection', function(socket) {
	console.log("Client Socket Connected");

	/*
	 * 		Clock functions
	 */
	socket.on("clock:pause", function() {
		stopwatch.pause();
	});

	socket.on("clock:reset", function() {
		stopwatch.reset();
	});

	socket.on("clock:up", function() {
		stopwatch.countUp();
	});

	socket.on("clock:down", function() {
		stopwatch.countDown();
	});

	socket.on("clock:set", function(msg) {
		stopwatch.setValue(msg);
	});

    socket.on("clock:get", function() {
        io.sockets.emit("clock:tick", stopwatch.getTime());
    });

		socket.on("grid", function(payload) {
        grid = payload;
        io.sockets.emit("grid", payload);
        console.log("Updating: grid");
    });

	/*
	 * 		General Functions
	 */
	socket.on("theme", function(msg) {
        theme = msg;
		io.sockets.emit("theme", msg);
	});

	socket.on("theme:get", function(msg) {
		io.sockets.emit("theme", theme);
	});

	socket.on("bug", function(msg) {
        bug = msg;
		io.sockets.emit("bug", msg);
	});

    socket.on("bug:get", function(msg) {
		io.sockets.emit("bug", bug);
	});

	/*
	 *		Holding Card
	 */
	socket.on("holdingCard", function(msg) {
		holdingCard = msg;
		io.sockets.emit("holdingCard", msg);
	});

	socket.on("holdingCard:get", function(msg) {
		io.sockets.emit("holdingCard", holdingCard);
	});

	/*
	 *		Timelord
	 */
	socket.on("timelord", function(msg) {
		timelord = msg;
		io.sockets.emit("timelord", msg);
	});

	socket.on("timelord:get", function(msg) {
		io.sockets.emit("timelord", timelord);
	});






	/*
	 * 		Lower Thirds
	 */
	socket.on("lowerthird:left", function(msg) {
		io.sockets.emit("lowerthird:left", msg);
	});

	socket.on("lowerthird:right", function(msg) {
		io.sockets.emit("lowerthird:right", msg);
	});

	socket.on("lowerthird:full", function(msg) {
		io.sockets.emit("lowerthird:full", msg);
	});

	socket.on("lowerthird:hidefull", function() {
		io.sockets.emit("lowerthird:hidefull");
	});

	socket.on("lowerthird:hideleft", function() {
		io.sockets.emit("lowerthird:hideleft");
	});

	socket.on("lowerthird:hideright", function() {
		io.sockets.emit("lowerthird:hideright");
	});

	socket.on("lowerthird:hideall", function() {
		io.sockets.emit("lowerthird:hideall");
	});

    /*
	 * 		Social Media
	 */
	socket.on("socialmedia", function(msg) {
        socialmedia = msg;
		io.sockets.emit("socialmedia", msg);
	});

    socket.on("socialmedia:get", function(msg) {
        io.sockets.emit("socialmedia", socialmedia);
    });

});

//Serve the puplic dir
app.use(express.static(__dirname + "/public"));

server.listen(3000);
console.log("Now listening on port 3000. Go to http://127.0.0.1:3000/admin to control")
console.log("run 'play 1-1 [html] http://127.0.0.1:3000' in CasparCG to start the graphics")
