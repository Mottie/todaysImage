###**Demos**

* [HTML data](http://mottie.github.com/todaysImage/index.html)
* [Array Demo](http://mottie.github.com/todaysImage/todays-image-array.html)
* [Inline JSON](http://mottie.github.com/todaysImage/todays-image-json-inline.html)
* [Remote JSON (US)](http://mottie.github.com/todaysImage/todays-image-json-remote.html)
* [Remote JSON (EU)](http://mottie.github.com/todaysImage/todays-image-json-remote-eu.html)

###**Usage** (default settings shown)

```javascript
$(function(){
 $('#todaysImage').todaysImage({
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
  locked          : true,       // prevent debug mode onscreen output if true (debug setting from browser URL only).
  debug           : false,      // set debug mode.
  defaultDate     : '12/25/2011', // date used if setting debug mode but no default date.
 });
});
```

###**Data Sources**

Obtain data from HTML tags/attributes, array or JSON (inline or remote).
Please refer to my blog for more detailed information on data source setup and targeting with the script

###**Methods**

####Get & Set

```javascript
// Get current image data 
// (e.g. 2 = third (zero based index) image from the total number of matching images) 
var current = $(image).data('todaysImage').currentImage(); // returns array ['dates','image url','comment']

// Get/Set current image from events within the date range
var current = $(image).data('todaysImage').currentImage(#); // returns array ['dates','image url','comment']
```

####Other

```javascript
// Get the current number of the events that match the date range
var currentNumber = $(image).data('todaysImage').currentNumber();
 
// Show a random image from within the matching date range & returns array ['dates','image url','comment']
var current = $(image).data('todaysImage').randomImage();
 
// Show all images (added under current image)
$(image).data('todaysImage').showAll();
```

###**Change Log**

####Version 1.1

* Updated the plugin so it is now initialized on a container instead of the actual image.
* Updated all demo pages:
  * HTML5 baby!
  * Debug mode can now easily be enabled.
  * Random image button added. The image is selected from the images that fall within the date range.
* Added `content` option:
  * It contains the HTML and place holder strings which are replaced with the URL or comment associated with the image

    ```javascript
    content : '<img src="{url}" title="{comment}" alt="{url}"><p class="comment">{comment}</p>'
    ```

  * `{url}` place holder is replaced with the image url.
  * `{comment}` place holder is replaced with the image comment.
  * This option replaces the `comment` option and removes the need for the `noImageTitle` option.
* Added `todays-image.css` file which includes basic styling for the image container, image, comment and debugging content.
* Removed `comment` and `noImageTitle` options. Replaced by `content` option.
* Removed `debugId` and `debugElement` options as the debug content is now appended to the content.
* Removed `inRangeColor` and `notInRangeColor` options because the styling is now done using css. See the todays-image.css file.

####Version 1.0

* Initial Commit - added to Github

For more details, see [my blog](http://wowmotty.blogspot.com/2010/07/todaysimage-v10.html) entry and view [the demo](http://mottie.github.com/todaysImage/index.html) source.
