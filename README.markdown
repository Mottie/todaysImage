**Usage** (default settings shown)

    $(document).ready(function(){
     $('#todaysImage').todaysImage({
      data         : '', // dataObject contains the date, image and comment names as seen in the data (names if JSON, numbers [0,1,2] in an array)
      dataObject   : ['dates','image','comment'],
      comment      : '.imageComment', // class or id where the current image comment will be added; if it doesn't exist, no comment will be shown
      noImageTitle : false,           // if true, the script will not add the comment to the image's title attribute
 
      /* language options */
      dayEndings : 'st|nd|rd|th',  // 1st, 2nd, 3rd, 4th, etc. (e.g. 1stMon & 3rdThu)
      dayLast    : 'last',         // last weekday/weekend of the month
      dayWeek    : ['sun','mon','tue','wed','thu','fri','sat'], // days of the week (case insensitive)
 
      /* debugging options */
      locked          : false,// prevent debug mode onscreen output if true (debug setting from browser URL only).
      debug           : false,// set debug mode.
      debugId         : 'imagedebug', // id of the debug output div - all info and show all images will be added here.
      debugElement    : 'body',       // Location where debug id is added (where debugId div is appended)
      defaultDate     : '1/1/2010',   // date used if setting debug mode but no default date.
      inRangeColor    : '#080',       // color highlight (green) for signifying the date is in range.
      notInRangeColor : '#f00'// color highlight (red) for dates not in range.
     })
    })

**Data Sources**
Obtain data from HTML tags/attributes, array or JSON (inline or remote).
Please refer to my blog for more detailed information on data source setup and targeting with the script

**Methods**

Get & Set

     // Get current image data
     var current = $(image).data('todaysImage').currentImage(); // returns array ['dates','image url','comment']
 
     // Get/Set current image
     var current = $(image).data('todaysImage').currentImage(#); // returns array ['dates','image url','comment']

Other

     // Get Current number of images within date range
     var  currentNumber = $(image).data('todaysImage').currentNumber(); // returns a number
 
     // Next Random Image
     var current = $(image).data('todaysImage').randomImage(); // displays a random image in the date range & returns array
 
     // Show all images, requires debug element to be added (if not in debug mode)
     $(image).data('todaysImage').showAll();

For more details, see [my blog][1] entry and view [the demo][2] source.

  [1]: http://wowmotty.blogspot.com/2010/07/todaysimage-v10.html
  [2]: http://mottie.github.com/todaysImage/index.html
