$(function () {

	$.getJSON('timelord-config.json', function (config) {

		Timelord.init($, config);

	});

});

window.Timelord = {

	_$: null,
	_config: null,
	lockNow: false,
	lockNowTime: false,
	showNews: false,
	showNewsNow: false,
	isNews: false,
	currentShowID: 0,


	/**
	 *
	 * @param {jQuery} $
	 * @param {Object} config
	 * @constructor
	 */
	init: function ($, config) {

		Timelord._$ = $;
		Timelord._config = config;

		Timelord.loop();
		Timelord.updateView();

	},

	loop: function() {
		var init = moment();
		Timelord.updateNews(init);
		var now = moment();
		var timeout = (now.seconds() - init.seconds() == 0) ?
		    1000 - now.milliseconds() : 0
		setTimeout(Timelord.loop,
			   timeout);

	},

	updateNews: function (t) {

		var second = t.seconds();
		var minute = t.minutes();
		if (Timelord.showNewsNow){
			Timelord.setNews(true);
		} else if (Timelord.showNews) {
			if (minute < 2 || (minute >= 59 && second >= 45)) {
				Timelord.setNews(true);
			} else {
				Timelord.setNews(false);
			}
		}
	},


	/**
	 * Triggers all the API calls to update the view
	 */
	updateView: function () {

		// Set the current and next shows
		Timelord.updateShowInfo();

		// Set the currently playing song
		Timelord.updateSong();
	},



	/**
	 * Calls the API currentAndNext endpoint
	 * and sets the current and next shows.
	 */
	updateShowInfo: function () {
		Timelord._config.next_show_filtering["time"] = Timelord.lockNowTime;
		Timelord.callAPI({
			url: Timelord._config.api_endpoints.currentAndNext,
			data: Timelord._config.next_show_filtering,
			success: function (data) {
				Timelord.setShows(data.payload);
			},
			complete: function () {
				setTimeout(Timelord.updateShowInfo, Timelord._config.request_timeout);
			}
		});

	},

	/**
	 * Calls for the Icecast JSON
	 * and sets the song currently being broadcast.
	 */
	updateSong: function() {

		Timelord._$.ajax({
			url: Timelord._config.icecast_json_url,
			dataType: "json",
			success: function (data) {
				sources = data["icestats"]["source"];
				song = "";
				// Just in case liquidsoap isn't quite working, it won't get permanently stuck.
				if (typeof sources !== "undefined") {
					// Look for the live-high stream. Set song to nothing if there's any error.
					for (k = 0; k < sources.length; ++k) {
						if (sources[k]["listenurl"].indexOf("live-high") == -1) {
							continue;
						}
						if (sources[k]["title"] != "  - URY") {
							song = sources[k]["title"];
						}
						break;
					}
				}
				Timelord.setSong(song);
			},
			complete: function () {
				setTimeout(Timelord.updateSong, Timelord._config.request_timeout);
			},
			error: function() {
				Timelord.setSong("");
			}
		});

	},

	/**
	 * Sets the current show name with an optional class
	 *
	 * @param {String} name
	 */
	setCurrentShowName: function (name) {
		Timelord._$('#holdingcard-screen-timelord .now')
			.html(name);
	},

	/**
	 * Sets the current show description
	 *
	 * @param {String} desc
	 */
	setCurrentShowDesc: function (desc) {
		Timelord._$('#holdingcard-screen-timelord .now-desc')
			.html(desc);
	},

	/**
	 * Sets the current show credits
	 *
	 * @param {String} credits
	 */
	setCurrentShowCredits: function (credits) {
		Timelord._$('#holdingcard-screen-timelord .now-credits')
			.html(credits);
	},

	/**
	 * Sets the current show credits
	 *
	 * @param {String} credits
	 */
	setCurrentShowThumbnail: function (url) {
		Timelord._$('#holdingcard-screen-timelord .thumbnail')
			.attr('src',url);
	},

	/**
	 * Sets the current song name
	 *
	 * @param {String} song
	 */
	setSong: function(song) {
		if (song == "") {
			Timelord._$('#holdingcard-screen-timelord .now-playing').fadeOut();
		} else {
			Timelord._$('#holdingcard-screen-timelord .now-playing .text').text(song);
			Timelord._$('#holdingcard-screen-timelord .now-playing').fadeIn();
		}

	},

	/**
	 * Sets the current now next heading.
	 *
	 * @param {String} song
	 */
	setHeading(text) {
		Timelord._$('#holdingcard-screen-timelord .heading').text(text);
	},

	/**
	 * Sets the news screen status
	 *
	 */
	setNews: function (showNews) {
		if (!Timelord.isNews && showNews) {
			Timelord.isNews = true;
			console.log("Display News");
			Timelord._$('#holdingcard-screen-news').fadeIn();
		} else if (Timelord.isNews && !showNews) {
			Timelord.isNews = false;
			console.log("Hide News");
			Timelord._$('#holdingcard-screen-news').fadeOut();
		}
	},


	/**
	 * Sets the current and next show names
	 *
	 * @param {Object} shows
	 */
	setShows: function (shows) {
		if (typeof shows.current.id == "undefined") {
			shows.current.id = 0;
		}
		if (typeof shows.next == "undefined" || typeof shows.next[0].id == "undefined") {
			shows.next = [1];
			shows.next[0].id = 0;
		}
		if (!Timelord.lockNow) {
			Timelord.setCurrentShowName(shows.current.title);
			Timelord.setCurrentShowDesc(shows.current.desc)
			if (typeof shows.current.presenters == "undefined") {
				shows.current.presenters = "";
			}
			Timelord.setCurrentShowCredits(shows.current.presenters);
			Timelord.setCurrentShowThumbnail('https://ury.org.uk' + shows.current.photo);

			Timelord.currentShowID = shows.current.id;
		}
		if (Timelord.currentShowID == shows.current.id) {
			Timelord.setHeading("You're Currently Watching...");
		} else if (Timelord.currentShowID  == shows.next[0].id) {
			Timelord.setHeading("Coming up...");
		} else {
			Timelord.setHeading("Thanks For Watching...");
		}

		//Timelord.setNextShowsInfo(shows.next);

	},

	/**
	 * Sets the next show names and times
	 *
	 * @param {Array} shows
	 */
	setNextShowsInfo: function (shows) {
		//If no next shows (Off-air off-term)
		if (!shows || shows[0] === null) {
			Timelord._$('#next-shows').addClass('hidden');
		//Else, if there are next shows
		} else {
			var numNextShows = 2;
			//If there is only one show (last show before end of term)
			if (shows[1] === null) {
				numNextShows = 1;
				Timelord._$('#next1').addClass('hidden');
			//Else, if there are two shows (normal term-time)
			} else {
				Timelord._$('#next1').removeClass('hidden');
			}
			Timelord._$('#next-shows').removeClass('hidden');

			for (var i = 0; i < numNextShows; i++) {

				var show = Timelord._$('#next' + i);

				show.find('.name').text(shows[i].title);
				show.find('.time').text(moment(shows[i].start_time * 1000).format("HH:mm"));

			}

		}

	},

	/**
	 * Calls the URY API
	 *
	 * This method abstracts away from the
	 * $.ajax method so be careful.
	 *
	 * options.url needs to be relative to the API URL.
	 *             I.E. "selector/remotestreams/" not
	 *             "https://ury.org.uk/api/v2/selector/remotestreams/".
	 *             This is so the API URL is only used in one place in the code.
	 *
	 * options.data will have 'api_key' automatically added to it so you don't need to worry about.
	 *              However if you must overwrite it, you can do so.
	 *
	 * options.error will be set to refresh the page if you don't specify a method.
	 *
	 * options.global will be set to false unless specified.
	 *
	 * @param {Object} options
	 */
	callAPI: function (options) {

		if (!options.hasOwnProperty("url")) {
			console.error("URL is required for this method");
		}

		options.url = Timelord._config.api_url + options.url;

		if (!options.hasOwnProperty("data")) {
			options.data = {};
		}

		if (!options.data.hasOwnProperty("api_key")) {
			options.data.api_key = Timelord._config.api_key;
		}

		if (!options.hasOwnProperty('error')) {
			options.error = function () {// Refresh the page
				console.error("Failed to call API");
				if(Timelord._config.refresh_on_error){
					window.location = window.location.href;
				}
			};
		}

		if (!options.hasOwnProperty("global")) {
			options.global = false;
		}

		Timelord._$.ajax(options);

	}


};
