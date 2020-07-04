/*--------------------------------------------------------------------------*/
/*  EXPORT.JS								    */
/*    Routines to export tweets as a CSV file to a PHP server, then hand    */
/*    them back as a download						    */
/* 									    */
/*- Modification History: --------------------------------------------------*/
/*  When:	Who:			Comments:			    */
/* 									    */
/*  25-Jun-13	Christopher G. Healey	Initial implementation		    */
/*  15-Jan-14	Christopher G. Healey	Changed write_CSV_line to write a   */
/*					set of 10 lines, rather than 1 line */
/*--------------------------------------------------------------------------*/

//  Module global varialbes

var  CSV_ajax = 0;			// Number of active AJAX calls
var  CSV_cb = null;			// CSV callback on write completed
var  CSV_fname = "export.csv";		// CSV filename
var  CSV_line = [ ];			// CSV lines to write to file
var  CSV_line_n = 0;			// Current CSV line to write
var  update_ID = -1;			// Progress bar timeout ID


function append_CSV_line( line )

  //  This function calls a PHP module to append data to the export
  //  CSV file
  //
  //  line:  Line to append
{
  var  url;				// PHP's URL


  url = base_CSV_URL() + "?cmd=append&data=" + encode_CSV_line( line );

  $.ajax( {				// Post query to PHP server
    url: url,
    dataType: "jsonp",

  //  Parse text on successful query 

    success: function( data ) {
      if ( data.status != true ) {
        alert( data.msg );
      }
    },
    
  //  Catch and ignore timeouts, report other errors

    error: function( jqXHR, status, err ) {
      alert( "Error during append_CSV_line()\nError: " + err );
    }
  } );
}					// End function append_CSV_line


function base_CSV_URL()

  //  Return the base URL to PHP server and export module
{
  return PHP_URL() + "export.php";
}					// End function base_CSV_URL


function create_CSV_file()

  //  This function calls a PHP module to create an empty export file
{
  var  url;				// PHP's URL


  url = base_CSV_URL() + "?cmd=create&fname=" + CSV_fname;

  $.ajax( {				// Post query to PHP server
    url: url,
    dataType: "jsonp",

  //  Parse text on successful query 

    success: function( data ) {
      if ( data.status != true ) {	// Error?
        alert( data.msg );
      }
    },
    
  //  Catch and ignore timeouts, report other errors

    error: function( jqXHR, status, err ) {
      alert( "Error during create_CSV_file()\nError: " + err );
    }
  } );
}					// End function create_CSV_file


function encode_CSV_line( line )

  //  This function encodes a raw line's # (needed for proper
  //  interpretation by PHP server) and " (because CSV files use
  //  quotes to define immutable strings)
  //
  //  line:  Line to encode
{
  var  data;				// Encoded line


  data = line;

  //  Remove smart quotes, smart apostrophes, en, em, and horizontal
  //  dashes, and ellipses

  data = data.replace( /[\u201c\u201d]/g, '"' );
  data = data.replace( /[\u2018\u2019]/g, "'" );
  data = data.replace( /[\u2013\u2014\u2015]/g, "-" );
  data = data.replace( /\u2026/g, "..." );

  //  Remove double quotes and newlines because those don't play well
  //  in CSV files

  data = data.replace( /\"/g, "'" ).replace( /\n/g, " " );

  return encodeURIComponent( data );
}					// End function encode_CSV_line


function export_tweets_CSV()

  //  This function exports the current tweet set as a CSV file in the
  //  format:
  //    -  date,user,body,valence,arousal,longitude,latitude
{
  var  body;				// Tweet's body, w/o comma, newline
  var  csv_line = [ ];			// Array of CSV lines to write
  var  dt;				// Tweet's date
  var  i;				// Loop counter
  var  line;				// Current CSV line
  var  tw_date;				// Formatted date/time


  query_dlg().dialog( "open" );		// Open query dialog
  query_dlg_title( "Export Tweets" );
  query_dlg_msg( "Export tweets to CSV file..." );

  $( "#prog-bar" ).progressbar( "value", 0 );
  update_ID = setTimeout( update_CSV_prog_bar, 3000 );

  set_CSV_cb( export_tweets_CSV_cb );	// Callback when writes are done

  dt = new Date();
  tw_date = ("00" + ( dt.getMonth() + 1 )).slice( -2 );
  tw_date = tw_date + "-";
  tw_date = tw_date + ("00" + dt.getDate()).slice( -2 );
  tw_date = tw_date + "-";
  tw_date = tw_date + dt.getFullYear().toString().slice( -2 );
  tw_date = tw_date + ".";
  tw_date = tw_date + ("00" + dt.getHours()).slice( -2 );
  tw_date = tw_date + "-" + ("00" + dt.getMinutes()).slice( -2 );
  tw_date = tw_date + "-" + ("00" + dt.getSeconds()).slice( -2 );

  set_CSV_name( "tweet." + tw_date + ".csv" );
  create_CSV_file();

  csv_line = [ ];			// Initialize CSV line array
  csv_line.push( "Date,User,Body,Valence,Arousal,Longitude,Latitude" );

  for( i = 0; i < tw.length; i++ ) {
    dt = new Date( tw[ i ].time );	// Format date to short form
    tw_date = ("00" + ( dt.getMonth() + 1 )).slice( -2 );
    tw_date = tw_date + "-";
    tw_date = tw_date + ("00" + dt.getDate()).slice( -2 );
    tw_date = tw_date + "-";
    tw_date = tw_date + dt.getFullYear().toString().slice( -2 );
    tw_date = tw_date + " ";
    tw_date = tw_date + ("00" + dt.getHours()).slice( -2 );
    tw_date = tw_date + ":" + ("00" + dt.getMinutes()).slice( -2 );
    tw_date = tw_date + ":" + ("00" + dt.getSeconds()).slice( -2 );

    line = tw_date + ",";
    line = line + tw[ i ].name + ",";

  //  Add raw body, minus commas and newlines

    body = tw[ i ].raw;
    body = body.replace( /,/g, ";" );
    body = body.replace( /\n/g, " " ).replace( /\cM/g, " " );

    line = line + body + ",";

  //  Add valence and arousal averages

    line = line + tw[ i ].avg[ VAL ].toFixed( 2 ) + ",";
    line = line + tw[ i ].avg[ ARO ].toFixed( 2 ) + ",";

  //  Add longitude,latitude if they exist, otherwise blanks

    if ( typeof tw[ i ].geo != "undefined" && tw[ i ].geo != null &&
         tw[ i ].geo.lon != 0 && tw[ i ].geo.lat != 0 ) {
      line = line + tw[ i ].geo.lon + "," + tw[ i ].geo.lat;
    } else {
      line = line + ",";
    }

    csv_line.push( line );		// Push current tweet's CSV line
  }

  CSV_ajax = 0;
  write_CSV_file( csv_line );		// Write CSV lines to tweet.csv
}					// End function export_tweets_CSV


function export_tweets_CSV_cb()

  //  Callback for exporting tweets, this function is called when writing
  //  CSV lines is finished, indicated it's safe to load tweet.csv
{
  //if ( $.active != 0 ) {		// Wait for AJAX calls to complete
  if ( CSV_ajax != 0 ) {		// Wait for AJAX calls to complete
    console.log( "export_tweets_CSV_cb(), waiting for AJAX to finish" );
    setTimeout( export_tweets_CSV_cb, 1000 );
    return;
  }

  query_dlg().dialog( "close" );	// Close progress dialog

  clearTimeout( update_ID );		// Terminate progress bar updates
  update_ID = -1;

  location.href = PHP_URL() + "load_csv.php?fname=" + CSV_fname;
//location.href = "http://pomegranate.csc.ncsu.edu/~healey/wildfire/tweet.csv";
}					// End function export_tweets_cb


function reset_CSV_cb()

  //  Reset end-of-write callback
{
  CSV_cb = null;
}					// End function reset_CSV_cb


function set_CSV_cb( cb )

  //  Set a callback, executed when writing of the CSV file completes
  //
  //  cb:  Reference to callback function
{
  if ( typeof cb == "undefined" ) {	// Trying to reset the callback?
    reset_CSV_cb();
  } else {
    CSV_cb = cb;
  }
}					// End function set_CSV_cb


function set_CSV_name( nm )

  //  Set the CSV export filename
  //
  //  nm:  Export filename
{
  CSV_fname = nm;
}					// End function set_CSV_name


function update_CSV_prog_bar()

  //  Update the CSV export progres bar
{
  var  pct;				// Percentage of tweets written to CSV


  if ( CSV_line.length > 0 ) {
    pct = Math.floor( CSV_line_n / CSV_line.length * 100.0 );
  } else {
    pct = 100;
  }
  $( "#prog-bar" ).progressbar( "value", pct );

  console.log( "update_CSV_prog_bar(), " + pct + "% done" );
  update_ID = setTimeout( update_CSV_prog_bar, 3000 );
}					// End function update_CSV_prog_bar


function write_CSV_file( lines )

  //  This function calls a PHP module to append data in the CSV_line
  //  array, recursively to ensure correct line ordering in file
  //
  //  lines:  Array of CSV lines (optional, normally only specified
  //          on first call to setup a reference to the line array)
{
  var  data = [ ];		// Lines w/special chars escaped
  var  i;				// Loop counter
  var  url;				// PHP's URL


  if ( typeof lines != "undefined" ) {	// Setup new CSV line array?
    CSV_line_n = 0;
    CSV_line = lines;
  }

  //  Terminate recursion when all lines have been written, executing
  //  callback if it's been defined

  if ( CSV_line_n >= CSV_line.length ) {
    if ( CSV_cb != null ) {
      CSV_cb();
    }
    return;
  }

  for( i = 0; CSV_line_n < CSV_line.length && i < 10; i++ ) {
    data.push( encode_CSV_line( CSV_line[ CSV_line_n ] ) );
    CSV_line_n++;
  }

  url = base_CSV_URL() +
    "?cmd=append&fname=" + CSV_fname + "&data=" + data.join( "%0A" );
  CSV_ajax++;

  $.ajax( {				// Post query to PHP server
    url: url,
    dataType: "jsonp",

  //  Parse text on successful query 

    success: function( data ) {
      CSV_ajax--;

      if ( data.status != true ) {
        alert( data.msg );
      } else {
        write_CSV_file();		// Write next line to file
      }
    },
    
  //  Catch and ignore timeouts, report other errors

    error: function( jqXHR, status, err ) {
      CSV_ajax--;
      console.log( "Error during write_CSV_file()\nError: " + err );
    }
  } );
}					// End function write_CSV_file
