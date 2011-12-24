/*
	todaysImage v1.1.1 (https://github.com/Mottie/todaysImage)
	By Rob Garrison (aka Mottie & Fudgey)
	Licensed under the MIT license.

	This plugin allows you to set up a list of images with a date range, it will then
	randomly choose an image from the list that falls within today's date and display it.
*/

(function($){
	$.todaysImage = function(el, options){
		var base = this, o;

		base.el = el;
		base.$el = $(el);
		base.$el.data("todaysImage", base);

		base.init = function(){
			base.options = o = $.extend({}, $.todaysImage.defaultOptions, options);

			var tmp, t,
				date = (o.debug) ? new Date(o.defaultDate) : new Date(); // debug date or today
			base.today = {
				m: date.getMonth() + 1,
				d: date.getDate(),
				y: date.getFullYear()
			};
			base.currentImages = []; // will contain images that match the date range
			base.defaultImages = []; // images with no dates, these will show if currentImages is empty

			// Check browser url for debug mode request: add #debug:1/1/2009 (month/day/year) to the end of the URL
			t = window.location.hash;
			// Don't enable debug mode if script is locked
			if (t.match('#debug') && !o.locked){
				o.debug = true;

				// extract date European format: dd/mm/yyyy
				tmp = t.match(/^#debug:(0?[1-9]|[0][1-9]|[1,2][0-9]|3[0,1])[\-\/.](0?[1-9]|1[0,1,2])[\-\/.]([1|2]\d{3})$/);
				if (tmp){ base.today = { m: tmp[2], d: tmp[1], y: tmp[3] }; }

				// extract date US format: mm/dd/yyyy
				tmp = t.match(/^#debug:(0?[1-9]|1[0,1,2])[\-\/.]([1-9]|[0][1-9]|[1,2][0-9]|3[0,1])[\-\/.]([1|2]\d{3})$/);
				if (tmp && o.monthFirst){ base.today = { m: tmp[1], d: tmp[2], y: tmp[3] }; }

				// extract date input format yyyy-mm-dd
				tmp = t.match(/^#debug:(0?[1|2]\d{3})[\-\/.](0?[1-9]|1[0,1,2])[\-\/.]([1-9]|[0][1-9]|[1,2][0-9]|3[0,1])$/);
				if (tmp){ base.today = { m: tmp[2], d: tmp[3], y: tmp[1] }; }

				// this fixes a bug in the last version 
				base.today.d = parseInt(base.today.d, 10);
				base.today.m = parseInt(base.today.m, 10);
				base.today.y = parseInt(base.today.y, 10);
			}

			if (o.debug){
				// add debug element if not present
				if (!base.debug) {
					base.debug = $('<div id="todaysimage-debug"></div>');
				}
				tmp = (o.monthFirst) ? base.today.m + '/' + base.today.d : base.today.d + '/' + base.today.m;
				base.debug.html('Date used: ' + tmp + '/' + base.today.y + '<br>');
			}
			base.endsNextYear = false;

			// Check if data is a jQuery object
			// <selector rel="date" title="image-url">comment</selector>
			// data = $(selector), dataObject = ['rel', 'title', 'text']; -- the dataObject order is important
			t = o.dataObject;
			if ($.fn.isPrototypeOf(o.data)) {
				tmp = [];
				o.data.each(function(){
					// get dataObjects from attrib, unless it is labeled as text or html
					var dat = (t[0] === 'text' || t[0] === 'html') ? $(this)[t[0]]() : $(this).attr(t[0]),
					url = (t[1] === 'text' || t[1] === 'html') ? $(this)[t[1]]() : $(this).attr(t[1]),
					cmt = (t[2] === 'text' || t[2] === 'html') ? $(this)[t[2]]() : $(this).attr(t[2]);
					tmp.push([ dat, url, cmt ]);
				});
				o.data = tmp; // replace jQuery object with data array
				o.dataObject = [0,1,2]; // this is why the order is important
			}

			// Cycle through all dates to find the ones in the date range
			$.each(o.data, function(j){
				var beg, end, yr,
					datestr = (o.data[j][o.dataObject[0]]).replace(/\s/,''),
					// us vs eu date format
					m = (o.monthFirst) ? 0 : 1,
					d = (o.monthFirst) ? 1 : 0,
					// example datestr = "1/1-1/10" or "9/1stMon-9/1stWed" for US date format
					dates = datestr.split('-'),
					d1 = dates[0].split('/'),
					tMonthStartStr = parseInt(d1[m],10),
					tMonthEndStr = (typeof(dates[1])=== "undefined") ? tMonthStartStr : parseInt(dates[1].split('/')[m],10),
					tYearStr = parseInt(d1[2],10) || base.today.y;
					if (tYearStr < 100) { tYearStr += 2000; } // assume two digit year should have 2000 added
					// if the date range crosses months or years, figure out if we are in range, then just set the month to now
				if ( (tMonthStartStr > tMonthEndStr) && (base.today.m >= tMonthStartStr || base.today.m <= tMonthEndStr) ) {
					tMonthStartStr = (tMonthStartStr === base.today.m) ? base.today.m : base.today.m - 1;
					tMonthEndStr = (tMonthEndStr === base.today.m) ? base.today.m : base.today.m + 1;
					base.endsNextYear = true;
				} else {
					base.endsNextYear = false;
				}
				if ( tMonthStartStr <= base.today.m && tMonthEndStr >= base.today.m ) {
					beg = base.extractDay( (dates[0]).split('/')[d] );
					// if end date is undefined, set it to beginning date
					yr = (base.endsNextYear) ? base.today.y + 1 : base.today.y;
					end = (typeof(dates[1]) === "undefined") ? beg : base.extractDay( (dates[1]).split('/')[d] );
					// set day for 1st of this month, if start date was prior to this month
					if ( tMonthStartStr < base.today.m ) { beg = 1; }
					// set day for end of this month, if end date is after this month (using 31 - it needs to be > the last day of the month for calculation)
					if ( tMonthEndStr > base.today.m ) { end = 31; }
					if (o.debug) {
						tmp = (o.monthFirst) ? base.today.m + "/" + beg + "-" + base.today.m + "/"  + end : beg + "/" + base.today.m + "-" + end + "/" + base.today.m;
						base.debug.append("(" + o.data[j][o.dataObject[0]] + "), derived range: " + tmp + " ");
					}
					if ( tYearStr === yr && base.today.d >= beg && base.today.d <= end ) {
						if (o.debug) {
							base.debug.append('<span class="inRange">is in range</span>; image = ' + o.data[j][o.dataObject[1]] + '<br>');
						}
						base.currentImages.push( j );
					} else {
						if (o.debug) {
							base.debug.append('is <span class="notInRange">NOT in range</span>; image = ' + o.data[j][o.dataObject[1]] + '<br>');
						}
					}
				}
				// Save default images if no special matches are found
				if ( parseInt( (o.data[j][o.dataObject[0]]).split('/')[0],10) === 0 ) {
					base.defaultImages.push( j );
				}
			});
			if (base.currentImages.length === 0) {
				base.currentImages = base.defaultImages;
				if (o.debug) {
					base.debug.append('<br><span class="notInRange">No matches found for date range, <strong>using default Images</strong>!</span><br>');
				}
			}
			// show all images button
			if (o.debug) {
				base.debug
					.append('<br><button>Show All Images</button>')
					.find('button').click(function(){
						return base.showAll();
					});
			}
			// save images in range
			o.imagesInRange = base.currentImages;
			base.showImage(Math.floor( Math.random() * base.currentImages.length ));
		};

		// Show image
		base.showImage = function(inc){
			base.currentImages = o.imagesInRange;
			inc = inc % (base.currentImages.length); // make sure inc is in range

			// current image data array (for get function)
			var cur = [
				o.data[base.currentImages[inc]][o.dataObject[0]], // date
				o.data[base.currentImages[inc]][o.dataObject[1]], // url
				o.data[base.currentImages[inc]][o.dataObject[2]]  // comment
			];

			// replace variables and add content
			base.$el.html( o.content.replace(/\{url\}/g, cur[1]).replace(/\{comment\}/g,cur[2]) );

			// save currently displayed image data
			$.data(base.el, 'currentImage', cur );

			if (o.debug) {
				base.debug
					.find('div').html('<br># of currentImages = ' + base.currentImages.length + '<br>current random image = ' + o.data[base.currentImages[inc]][o.dataObject[1]])
					.end().appendTo( base.$el );
			}

		};

		// Calculate date from text
		// *************************
		base.extractDay = function(tDayStr){
			// input: target day ("1stMon" or "10"), output: day of month
			if (!tDayStr.match(o.dayEndings + '|' + o.dayLast)) {
				return parseInt(tDayStr,10);
			}
			var k, tWeekdayStr, tNthDay, tWeekday, oWeekday, tOffset, tDate,
				checkMonth = false;
			if (tDayStr.match(o.dayLast)) {
				// set "last" to "4th" weekday of the month, then try to add a week later
				tDayStr = '4  ' + tDayStr.substring(4, tDayStr.length);
				checkMonth = true;
			}
			// extract out weekday text (e.g. Mon)
			tWeekdayStr = tDayStr.substring(3,6).toLowerCase();
			// extract out N from date (e.g. 1 from 1st, or 2 from 2nd)
			tNthDay = parseInt(tDayStr.substring(0,1),10);
			tWeekday = 0;
			for (k=0; k < o.dayWeek.length; k++) {
				if (o.dayWeek[k].toLowerCase() === tWeekdayStr) { tWeekday = k; }
			}
			// get day of the week at the beginning of the month (e.g. 9/1/2009 = Tue)
			oWeekday = (new Date (base.today.y,base.today.m-1,1)).getDay();
			// calculate the offset (don't mess with this part, it took forever!)
			tOffset = (tWeekday < oWeekday) ? tWeekday + (7 - oWeekday) : tWeekday + (7 - oWeekday) - 7;
			tDate = (tNthDay - 1) * 7 + tOffset + 1;
			// if "last" was used, try to add another week (setup for 30 day months
			// since May is the only month with a floating U.S. holiday that uses last, I think)
			if (checkMonth && (tDate + 7) <= 30) { tDate += 7; }
			return tDate;
		};

		// Display all images
		base.showAll = function(){
			// add debug element if not present
			if (!base.debug) {
				base.debug = $('<div id="todaysimage-debug"></div>').appendTo( base.$el );
			}
			var t = '<br><br>Showing ' + o.data.length + ' images<br><br><div id="todays-image-debug-thumbnails">';
			$.each(o.data, function(j){
				t += ' <img src="' + o.data[j][o.dataObject[1]] + '" alt="' + o.data[j][o.dataObject[1]] +
				'" title="' + o.data[j][o.dataObject[2]].replace(/\"/g,'&quot;') + '" />';
			});
			base.debug.append(t);
			return false;
		};

		// get: $(image).data('todaysImage').currentImage();  - returns array [ dates, url, comment ]
		// set: $(image).data('todaysImage').currentImage(#); - shows image # of images in date range and returns array
		base.currentImage = function(val){
			if (typeof(val) !== 'undefined') {
				base.showImage(val);
			}
			return $.data(base.el, 'currentImage');
		};

		// $(image).data('todaysImage').randomImage(); - displays random image within the date range & returns array
		base.randomImage = function(){
			base.showImage( Math.floor( Math.random() * o.imagesInRange.length ) );
			return $.data(base.el, 'currentImage');
		};

		// $(image).data('todaysImage').currentNumber(); - returns total # of images within date range
		base.currentNumber = function(){
			return o.imagesInRange.length;
		};

		// Run initializer
		base.init();
	};

	$.todaysImage.defaultOptions = {
		// Data
		data         : '', // data object: array, json or jquery object array

		// dataObject contains the date, image and comment names as seen in the data
		// (key names in JSON, or if the object is an array, use the index [0,1,2])
		// The data object order must always be: 'dates', 'image url' and 'comment'
		dataObject   : ['dates','image','comment'],

		// content added to the target element
		content      : '<img src="{url}" title="{comment}" alt="{url}"><p class="comment">{comment}</p>',

		// language options
		dayEndings : 'st|nd|rd|th',                               // 1st, 2nd, 3rd, 4th, etc. (e.g. 1stMon & 3rdThu)
		dayLast    : 'last',                                      // last weekday/weekend of the month
		dayWeek    : ['sun','mon','tue','wed','thu','fri','sat'], // days of the week (case insensitive)
		monthFirst : true,                                        // true: U.S. date format mm/dd/yy, if false: dd/mm/yy format applied

		// debugging options
		locked          : true,      // prevent debug mode onscreen output if true (debug setting from browser URL only).
		debug           : false,     // set debug mode.
		defaultDate     : '12/25/2011' // date used if setting debug mode but no default date.
	};

	$.fn.todaysImage = function(options){
		return this.each(function(){
			(new $.todaysImage(this, options));
		});
	};

	$.fn.gettodaysImage = function(){
		return this.data("todaysImage");
	};

})(jQuery);
