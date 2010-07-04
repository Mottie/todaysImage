/*
* todaysImage allows you to set up a list of images with a date range, it will then randomly choose an image
* from the list that falls within today's date and display it.
*
* todaysImage is currently available for use in all personal or commercial
* projects under both MIT and GPL licenses.
*
* <http://wowmotty.blogspot.com>
* @v1.0     - 07-04-2010 (major overhaul of code & renaming of plugin)
* @v0.9beta - 12-01-2009
* @author      Rob G <wowmotty@gmail.com>
*/

(function($){
    $.todaysImage = function(el, options){
        // using 'base' instead of 'this' to avoid scope issues
        var base = this;

        // abort if image tag is not targeted
        if (el.tagName != "IMG") { return; }

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("todaysImage", base);

        /* Initialize
         ***************************/
        base.init = function(){

            base.options = $.extend({},$.todaysImage.defaultOptions, options);

            // initialization code
            var tmp,
                currentImages = [], // will contain images that match the date range
                defaultImages = [], // images with no dates, these will show if currentImages is empty
                date = (base.options.debug) ? new Date(base.options.defaultDate) : new Date(), // debug date or today
                thisdate = {
                 m: date.getMonth() + 1,
                 d: date.getDate(),
                 y: date.getFullYear()
                };

            // Check browser url for debug mode request: add #debug:1/1/2009 (month/day/year) to the end of the URL
            var whash = window.location.hash;
            // Don't enable debug mode if script is locked
            if ( whash.match('#debug') && !base.options.locked ) {
             base.options.debug = true;
             if (base.options.monthFirst){
              // extract date US format: mm/dd/yyyy
              tmp = whash.match(/^#debug:(0?[\d]|1[0,1,2])[\- \/.]([0-9]|[0,1,2][0-9]|3[0,1])[\- \/.]((19|20)[0-9][0-9])$/);
              if (tmp){ thisdate = { m: tmp[1], d: tmp[2], y: tmp[3] }; }
             } else {
              // extract date European format: dd/mm/yyyy
              tmp = whash.match(/^#debug:([0-9]|[0,1,2][0-9]|3[0,1])[\- \/.](0?[\d]|1[0,1,2])[\- \/.]((19|20)[0-9][0-9])$/);
              if (tmp){ thisdate = { d: tmp[1], m: tmp[2], y: tmp[3] }; }
             }
            }
            if ( base.options.debug ){
             // add debug element if not present
             if (!$('#' + base.options.debugId).length) { $(base.options.debugElement).append('<div id="' + base.options.debugId + '"></div>'); }
             tmp = (base.options.monthFirst) ? thisdate.m + '/' + thisdate.d : thisdate.d + '/' + thisdate.m;
             $('#' + base.options.debugId).html('Date used: ' + tmp + '/' + thisdate.y + '<br>');
            }
            var endsNextYear = false,
                bodo = base.options.dataObject;

            // Check if data is a jQuery object
            // <selector rel="date" title="image-url">comment</selector>
            // data = $(selector), dataObject = ['rel', 'title', 'text']; -- the dataObject order is important
            if ($.fn.isPrototypeOf(base.options.data)) {
             var data = [];
             base.options.data.map(function(){
              // get dataObjects from attrib, unless it is labeled as text or html
              var dat = (bodo[0] == 'text' || bodo[0] == 'html') ? $(this)[bodo[0]]() : $(this).attr(bodo[0]),
                  url = (bodo[1] == 'text' || bodo[1] == 'html') ? $(this)[bodo[1]]() : $(this).attr(bodo[1]),
                  cmt = (bodo[2] == 'text' || bodo[2] == 'html') ? $(this)[bodo[2]]() : $(this).attr(bodo[2]);
              data.push([ dat, url, cmt ]);
             });
             base.options.data = data; // replace jQuery object with data array
             base.options.dataObject = [0,1,2]; // this is why the order is important
            }

            // Cycle through all dates to find the ones in the date range
            $.each(base.options.data, function(j){
             var datestr = (base.options.data[j][base.options.dataObject[0]]).replace(/\s/,'');
             // us vs eu date format
             var m = (base.options.monthFirst) ? 0 : 1;
             var d = (base.options.monthFirst) ? 1 : 0;
             /* example datestr = "1/1-1/10" or "9/1stMon-9/1stWed" for US date format */
             var dates = datestr.split('-');
             var tMonthStartStr = parseInt(dates[0].split('/')[m],10);
             var tMonthEndStr = (typeof(dates[1])=="undefined") ? tMonthStartStr : parseInt(dates[1].split('/')[m],10);
             /* if the date range crosses months or years, figure out if we are in range, then just set the month to now */
             if ( (tMonthStartStr > tMonthEndStr) && (thisdate.m >= tMonthStartStr || thisdate.m <= tMonthEndStr) ) {
              tMonthStartStr = (tMonthStartStr == thisdate.m) ? thisdate.m : thisdate.m - 1;
              tMonthEndStr = (tMonthEndStr == thisdate.m) ? thisdate.m : thisdate.m + 1;
              endsNextYear = true;
             } else {
              endsNextYear = false;
             }
             if ( tMonthStartStr <= thisdate.m && tMonthEndStr >= thisdate.m ) {
              var beg = base.extractDay( (dates[0]).split('/')[d], thisdate );
              /* if end date is undefined, set it to beginning date */
              thisdate.y = (endsNextYear) ? thisdate.y + 1 : thisdate.y;
              var end = (typeof(dates[1])=="undefined") ? beg : base.extractDay( (dates[1]).split('/')[d], thisdate );
              /* set day for 1st of this month, if start date was prior to this month */
              if ( tMonthStartStr < thisdate.m ) { beg = 1; }
              /* set day for end of this month, if end date is after this month (using 31 - it needs to be > the last day of the month for calculation) */
              if ( tMonthEndStr > thisdate.m ) { end = 31; }
              if (base.options.debug) {
               tmp = (base.options.monthFirst) ? thisdate.m + "/" + beg + "-" + thisdate.m + "/"  + end : beg + "/" + thisdate.m + "-" + end + "/" + thisdate.m;
               $('#' + base.options.debugId).append("(" + base.options.data[j][base.options.dataObject[0]] + "), derived range: " + tmp + " ");
              }
              if ( thisdate.d >= beg && thisdate.d <= end ) {
               if (base.options.debug) {
                $('#' + base.options.debugId).append('<span style="color:' + base.options.inRangeColor + '">is in range</span>; image = ' +
                 base.options.data[j][base.options.dataObject[1]] + '<br>');
               }
               currentImages.push( j );
              } else {
               if (base.options.debug) {
                $('#' + base.options.debugId).append('is <span style="color:' + base.options.notInRangeColor +
                 '">NOT in range</span>; image = ' + base.options.data[j][base.options.dataObject[1]] + '<br>');
               }
              }
             }
             /* Save default images if no special matches are found */
             if ( parseInt( (base.options.data[j][base.options.dataObject[0]]).split('/')[0],10) === 0 ) {
              defaultImages.push( j );
             }
            });
            if (currentImages.length === 0) {
             currentImages = defaultImages;
             if (base.options.debug) {
              $('#' + base.options.debugId).append('<br><span style="color:' + base.options.inRangeColor +
               '">No matches found for date range, using default Images!</span>');
             }
            }
            // show all images button
            if (base.options.debug) {
             $('#' + base.options.debugId).append('<br><button>Show All Images</button><br><div></div>'); // div added for replacable content
             $('#' + base.options.debugId + ' button').click(function(){
              base.showAll();
             });
            }
            // save images in range
            base.options.imagesInRange = currentImages;
            base.showImage(Math.floor( Math.random() * currentImages.length ));
           };

           /* show image
            ***************************/
           base.showImage = function(inc){
            var currentImages = base.options.imagesInRange;
            inc = inc % (currentImages.length); // make sure inc is in range

            if (base.options.debug) {
             $('#' + base.options.debugId + ' div').html('<br># of currentImages = ' + currentImages.length + '<br>current random image = ' +
              base.options.data[currentImages[inc]][base.options.dataObject[1]]);
            }
            // current image data array (for get function)
            var cur = [
             base.options.data[currentImages[inc]][base.options.dataObject[0]], // date
             base.options.data[currentImages[inc]][base.options.dataObject[1]], // url
             base.options.data[currentImages[inc]][base.options.dataObject[2]].replace(/\"/g,'&quot;')  // comment
            ];
            // display current image
            base.$el.attr({ 'src': cur[1], 'title' : (base.options.noImageTitle) ? '' : cur[2] });
            $(base.options.comment).html( cur[2] );
            // save currently displayed image data
            base.$el.data('currentImage', cur );
          };

          /* Calculate date from text
           ***************************/
          base.extractDay = function(tDayStr,thisdate){
           /* input: target day ("1stMon" or "10"), output: day of month */
           if (!tDayStr.match(base.options.dayEndings + base.options.dayLast)) {
            return parseInt(tDayStr,10);
           }
           var checkMonth = false;
           if (tDayStr.match(base.options.dayLast)) {
            /* set "last" to "4th" weekday of the month, then try to add a week later */
            tDayStr = '4  ' + tDayStr.substring(4,tDayStr.length);
           checkMonth = true;
           }
           /* extract out weekday text (e.g. Mon) */
           var tWeekdayStr = tDayStr.substring(3,6).toLowerCase();
           /* extract out N from date (e.g. 1 from 1st, or 2 from 2nd) */
           var tNthDay = parseInt(tDayStr.substring(0,1),10);
           var tWeekday = 0;
           for (k=0;k<base.options.dayWeek.length;k++) {
            if (base.options.dayWeek[k].toLowerCase()==tWeekdayStr) { tWeekday = k; }
           }
           /* get day of the week at the beginning of the month (e.g. 9/1/2009 = Tue) */
           var oWeekday = (new Date (thisdate.y,thisdate.m-1,1)).getDay();
            /* calculate the offset (don't mess with this part, it took forever!) */
           var tOffset = (tWeekday < oWeekday) ? tWeekday + (7 - oWeekday) : tWeekday + (7 - oWeekday) - 7;
           var tDate = (tNthDay - 1) * 7 + tOffset + 1;
           /* if "last" was used, try to add another week (setup for 30 day months
            since May is the only month with a floating U.S. holiday that uses last, I think) */
           if (checkMonth && (tDate + 7) <= 30) { tDate = tDate + 7; }
           return tDate;
          };

          /* Display all images */
          base.showAll = function(){
           var tn = '<br><br>Showing ' + base.options.data.length + ' images<br><br><div id="thumbnails">';
           $.each(base.options.data, function(j){
            tn += ' <img src="' + base.options.data[j][base.options.dataObject[1]] + '" alt="' + base.options.data[j][base.options.dataObject[1]] +
             '" title="' + base.options.data[j][base.options.dataObject[2]].replace(/\"/g,'&quot;') + '" />';
           });
           $(base.options.debugElement).append(tn);
          };

          /* get: $(image).data('todaysImage').currentImage();  // returns array [ dates, url, comment ]
           * set: $(image).data('todaysImage').currentImage(#); // shows image # of images in date range and returns array
           */
          base.currentImage = function(val){
           if (typeof(val) !== 'undefined') {
            base.showImage(val);
           }
           return base.$el.data('currentImage');
          };

          /* $(image).data('todaysImage').randomImage(); // displays random image within the date range & returns array */
          base.randomImage = function(){
           base.showImage( Math.floor( Math.random() * base.options.imagesInRange.length ) );
           return base.$el.data('currentImage');
          };

          // $(image).data('todaysImage').currentNumber(); // returns total # of images within date range
          base.currentNumber = function(){
           return base.options.imagesInRange.length;
          };

        // Run initializer
        base.init();
    };

    $.todaysImage.defaultOptions = {
        /* Data */
        // data object: array, json or jquery object array
        data        : '',
        // dataObject contains the date, image and comment names as seen in the data (names if JSON, numbers [0,1,2] in an array)
        dataObject  : ['dates','image','comment'],
        comment     : '.imageComment',   // class or id where the current image comment will be added; if it doesn't exist, no comment will be shown
        noImageTitle: false,             // if true, the script will not add the comment to the image's title attribute

        /* language options */
        dayEndings : 'st|nd|rd|th',                               // 1st, 2nd, 3rd, 4th, etc. (e.g. 1stMon & 3rdThu)
        dayLast    : 'last',                                      // last weekday/weekend of the month
        dayWeek    : ['sun','mon','tue','wed','thu','fri','sat'], // days of the week (case insensitive)
        monthFirst : true,                                        // true: U.S. date format mm/dd/yy, if false: dd/mm/yy format applied

        /* debugging options */
        locked          : false,        // prevent debug mode onscreen output if true (debug setting from browser URL only).
        debug           : false,        // set debug mode.
        debugId         : 'imagedebug', // id of the debug output div - all info and show all images will be added here.
        debugElement    : 'body',       // Location where debug id is added (where debugId div is appended)
        defaultDate     : '1/1/2010',   // date used if setting debug mode but no default date.
        inRangeColor    : '#080',       // color highlight (green) for signifying the date is in range.
        notInRangeColor : '#f00'        // color highlight (red) for dates not in range.
    };

    $.fn.todaysImage = function(options){
        return this.each(function(){
            (new $.todaysImage(this, options));
        });
    };

    // This function breaks the chain, but returns
    // the todaysImage if it has been attached to the object.
    $.fn.gettodaysImage = function(){
        this.data("todaysImage");
    };

})(jQuery);
