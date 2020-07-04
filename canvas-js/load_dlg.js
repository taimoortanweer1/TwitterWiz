/*--------------------------------------------------------------------------*/
/*  LOAD_DLG.JS								    */
/*    Dialog to load a block of tweets with a given date range from the	    */
/*    server								    */
/* 									    */
/*- Modification History: --------------------------------------------------*/
/*  When:	Who:			Comments:			    */
/* 									    */
/*  22-Apr-13	Christopher G. Healey	Initial implementation		    */
/*--------------------------------------------------------------------------*/

//  Module global varialbes

var  cancel;				// Cancel button pressed flag
var  load_dlg;				// Load dialog
var  ok;				// Load button pressed flag
var  prev_beg;				// Previous begin date
var  prev_end;				// Previous end date
var  prev_filter;			// Previous filter value
var  prev_max;				// Previous maximum tweet value


function hide_load_dlg( ok_btn )

  //  Hide the load dialog
  //
  //  ok_btn:  Load button selected
{
  var  beg;				// Beginning date
  var  end;				// Ending date
  var  info_msg;			// Info message for alert dialog
  var  main_msg;			// Main message for alert dialog


  ok = ok_btn;				// Save button press states
  cancel = !ok_btn;

  if ( !ok_btn ) {			// If Cancel, restore previous values
    $("#date-beg").datepicker( "setDate", prev_beg );
    $("#date-end").datepicker( "setDate", prev_end );
    $("#filter-inp").val( prev_filter );
    $("#max-slider").slider( "value", prev_max );
    $("#max-tweet-val").text( prev_max );

    //  Reset datepicker date constraints if either previous date was
    //  not defined

    if ( prev_beg.length < 1 ) {
      $("#date-end").datepicker( "option", "minDate", null );
    }
    if ( prev_end.length < 1 ) {
      $("#date-beg").datepicker( "option", "maxDate", null );
    }

  } else {				// If Load, ensure valid date range
    beg = $("#date-beg").val();
    end = $("#date-end").val();

    if ( beg.length < 1 || end.length < 1 ) {
      main_msg = "Choose valid start and end dates";
      info_msg = "Please choose a start and an end date to define the ";
      info_msg = info_msg + "time range for the tweets you want to load.";

      show_alert_dlg( main_msg, info_msg );
      return false;
    }
  }

  load_dlg.dialog( "close" );
  return true;
}					// End function hide_load_dlg


function init_load_dlg()

  //  Initialize the load dialog's Start and End datepickers
{
  var  html;				// HTML to insert into dialog


  html = "<div style=\"margin: 5px 10px 5px 10px\">";

  html = html + "<div>"
  html = html + "<table style=\"width: 100%\; border-spacing: 0;\">"
  html = html + "<tr>";
  html = html + "<th style=\"text-align: left\; width: 40%\;\">";
  html = html + "<span id=\"date-lbl-beg\">Start:<br></span>";
  html = html + "<input type=\"text\" id=\"date-beg\" ";
  html = html + "style=\"width: 100%;\" onfocus=\"this.blur()\" />";
  html = html + "</th>";
  html = html + "<th style=\"width: 10%;\">";
  html = html + "<th style=\"text-align: left\; width: 40%\;\">";
  html = html + "<span id=\"date-lbl-end\">End:<br></span>";
  html = html + "<input type=\"text\" id=\"date-end\" ";
  html = html + "style=\"width: 100%;\" onfocus=\"this.blur()\" />";
  html = html + "</th>";
  html = html + "</tr></table>";
  html = html + "</div>";

  html = html + "<div style=\"text-align: left; margin-top: 0.5em;\">";
  html = html + "Choose the date range for the tweets you want to load";
  html = html + "</div>";

  html = html + "<div style=\"margin-top: 1.5em;\">";
  html = html + "<span id=\"filter-lbl\">";
  html = html + "Filter Terms:<br>";
  html = html + "</span>";

  //  Note: autofocus is required on this input field to focus jQuery
  //  dialog to put focus here, and not on first datepicker

  html = html + "<input type=\"text\" id=\"filter-inp\" ";
  html = html + "style=\"width: 100%;\" autofocus />";
  html = html + "</div>";

  html = html + "<div style=\"text-align: left; margin-top: 0.5em;\">";
  html = html + "Enter a comma-separated list of terms that must be included ";
  html = html + "in each tweet. Use a \"-\" sign in front of terms that must ";
  html = html + "not be included in any tweet";
  html = html + "</div>";

  html = html + "<div style=\"margin-top: 1.5em;\">";
  html = html + "<div style=\"margin-bottom: 0.6em;\">";
  html = html + "<span id=\"max-lbl\">";
  html = html + "Maximum Tweets to Load:&nbsp;&nbsp;";
  html = html + "</span>";
  html = html + "<label id=\"max-tweet-val\"></label>";
  html = html + "</div>";
  html = html +
    "<div id=\"max-slider\" style=\"margin-left: 2.5%; width: 95%;\"></div>";
  html = html + "</div>";
  html = html + "</div>";

  //  Build information dialog w/div, label, buttons

  load_dlg = $( "<div id=\"load-dlg\"></div>" );
  load_dlg.html( html );

  load_dlg.dialog(			// Display dialog
    {
      title: "Load Tweets",		// Dialog title
      autoOpen: false,			// Don't open until text populated
      buttons: {			// Dialog buttons
        "Cancel": function() {
          hide_load_dlg( false );
        },
        "Load": function() {
          if ( hide_load_dlg( true ) ) {
            load_tweets();
          }
        },
      },
      close: function() {		// Cancel dialog on close button
        if ( !ok && !cancel ) {		// Neither button, assume close button
          hide_load_dlg( false );
        }
      },
      dialogClass: "dialog-drop-shadow",
      resizable: false,
      width: 350			// Width for valence/arousal details
    }
  );

  style_txt( "#max-lbl" );
  style_txt( "#filter-lbl" );
  style_txt( "#date-lbl-beg" );
  style_txt( "#date-lbl-end" );

  $.datepicker.setDefaults( {		// Set datepicker defaults
    changeMonth: true,			//  Show month menu on calendar
    changeYear: true			//  Show year menu on calendar
  } );

  //  Don't allow keypresses in either input field, together with
  //  onfocus="this.blur()" in the HTML to hide the cursor

  $("#date-beg").keydown( function( e ) {
    e.preventDefault();
  } );
  $("#date-end").keydown( function( e ) {
    e.preventDefault();
  } );

  //  When one datepicker sets a value, constrain the other datepicker
  //  based on this value

  $("#date-beg").datepicker( {		// Start datepicker
    dateFormat: "M d, yy",		//  Display date as Nov 9, 1999
    onClose: function( dt ) {		//  Processing on new date
      $("#date-end").datepicker( "option", "minDate", dt );
    }
  } );

  $("#date-end").datepicker( {		// End datepicker
    dateFormat: "M d, yy",		//  Display date as Nov 9, 1999
    onClose: function( dt ) {		//  Processing on new date
      $("#date-beg").datepicker( "option", "maxDate", dt );
    }
  } );

  $("#max-slider").slider( {		// Create maximum tweet slider
    range: "min",			//  Anchor slider at left endpoint
    min: 500,
    max: 1500,
    step: 25,
    value: 500,
    slide: function( e, ui ) {
      $("#max-tweet-val").text( ui.value );
    }
  } );
  $("#max-tweet-val").text( $("#max-slider").slider( "value" ) );

  //  Set the filter input field to trigger on Return

  $("#filter-inp").keydown( function( e ) {
    if ( e.keyCode == 13 ) {
      if ( hide_load_dlg( true ) ) {
        load_tweets();

      }
      e.stopPropagation();		// Don't propagate keypress up
      return false;			// Stop IE event bubbling
    }
  } );
}					// End function init_load_dlg


function load_tweets()

  //  Load a block of tweets from an index tweet file
{
  var  filter;				// Filter term list
  var  i;				// Loop counter
  var  time_e;				// End time, secs since epoch
  var  time_s;				// Start time, secs since epoch
  var  url;				// URL query string


  tw.length = 0;			// Clear existing tweets

  query_term = $("#filter-inp").val();
  if ( query_term.length == 0 ) {
    query_term = "(no filter terms)";
  }

  query_dlg().dialog( "open" );		// Init, show progress dialog
  query_dlg_title( "Load Tweets" );
  query_dlg_msg( "Loading tweets..." );

  $( "#prog-bar" ).progressbar( "value", 0 );

  //  Convert start and end time into seconds since epoch (divide by
  //  1000 to ignore msec)

  time_s = new Date( $("#date-beg").datepicker( "getDate" ) ).getTime();
  time_s = Math.floor( time_s / 1000 );

  time_e = new Date( $("#date-end").datepicker( "getDate" ) ).getTime();
  time_e = Math.floor( time_e / 1000 );

  //  Replace + with %2B to make filter term valid

  filter = $("#filter-inp").val();
  filter = filter.replace( /\+/g, "%2B" );

  //  Call chunk.php to grab a time-delimited chunk of tweets

  url = uniq_load_URL( time_s, time_e, filter );

  $.ajax( {				// Post query to PHP server
    url: url,
    dataType: "jsonp",

  //  Parse text on successful query 

    success: function( data ) {
      process_tweets( data.tw );
      setTimeout( "update_load()", 100 );
    },
    
  //  Catch and ignore timeouts, report other errors

    error: function( jqXHR, status, err ) {
      query_dlg().dialog( "close" );	// Hide progress dialog
      alert( "Error during load_tweets()\nError: " + err );
    }
  } );
}					// End function load_tweets()


function process_tweets( tw_list )

  //  This function processes tweets loaded from the tweet datafile
  //
  //  tw_list:  List of tweets to process
{
  var  dt;				// Tweet date object
  var  dt_beg;				// First tweet loaded date
  var  dt_end;				// Last tweet loaded date
  var  info_msg;			// Info message for alert dialog
  var  link;				// User's profile link on twitter
  var  main_msg;			// Main message for alert dialog
  var  mth;				// Short month names, from datepicker
  var  tw_max;				// Maximum tweets to load
  var  tw_n = 0;			// Number of tweets loaded


  console.log( "Total tweets pre-filtered: " + tw_list.length );

  tw_max = $("#max-slider").slider( "value" );

  //  Process until end of list, or maximum allowed tweets pushed

  for( i = 0; i < tw_list.length && tw_n < tw_max; i++ ) {
    link = "http://twitter.com/" + tw_list[ i ].nm;

    tw_obj = build_tweet_obj( tw_list[ i ].body,
      tw_list[ i ].nm, tw_list[ i ].t, tw_list[ i ].geo, link, false );

    if ( typeof tw_obj !== "undefined" ) {
      tw.push( tw_obj );
      tw_n++;
    } 
  }					// End for all tweets

  $("#prog-bar" ).progressbar( "option", "value", 75 );

  //  If more tweets than maximum allowed, warn user with dialog

  if ( i < tw_list.length ) {

    //  Custom format date of first and last tweet loaded

    mth = $("#date-beg").datepicker( "option", "monthNamesShort" );

    dt = new Date( tw[ 0 ].time );
    dt_beg = ( "0" + dt.getDate() ).slice( -2 ) + "-";
    dt_beg = dt_beg + mth[ dt.getMonth() ] + "-";
    dt_beg = dt_beg + dt.getFullYear() + " ";
    dt_beg = dt_beg + ( "0" + dt.getHours() ).slice( -2 ) + ":";
    dt_beg = dt_beg + ( "0" + dt.getMinutes() ).slice( -2 ) + ":";
    dt_beg = dt_beg + ( "0" + dt.getSeconds() ).slice( -2 );

    dt = new Date( tw[ tw.length - 1 ].time );
    dt_end = ( "0" + dt.getDate() ).slice( -2 ) + "-";
    dt_end = dt_end + mth[ dt.getMonth() ] + "-";
    dt_end = dt_end + dt.getFullYear() + " ";
    dt_end = dt_end + ( "0" + dt.getHours() ).slice( -2 ) + ":";
    dt_end = dt_end + ( "0" + dt.getMinutes() ).slice( -2 ) + ":";
    dt_end = dt_end + ( "0" + dt.getSeconds() ).slice( -2 );

    main_msg = "Some tweets were ignored";

    info_msg = "Due to your limit of " + tw_n + " tweets, some tweets ";
    info_msg = info_msg + "were ignored. Only tweets from ";
    info_msg = info_msg + "<em>" + dt_beg.toLocaleString() + "</em>";
    info_msg = info_msg + " to ";
    info_msg = info_msg + "<i>" + dt_end.toLocaleString() + "</i>";
    info_msg = info_msg + " were loaded.";

    show_alert_dlg( main_msg, info_msg );
  }
}					// End function process_tweets


function show_load_dlg()

  //  Show the load dialog
{
  ok = false;				// Reset button pressed flags
  cancel = false;

  load_dlg.dialog( "open" );

  prev_beg = $("#date-beg").val();	// Grab values in case of Cancel
  prev_end = $("#date-end").val();
  prev_filter = $("#filter-inp").val();
  prev_max = $("#max-slider").slider( "value" );
}					// End function show_load_dlg
