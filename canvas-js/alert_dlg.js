/*--------------------------------------------------------------------------*/
/*  ALERT_DLG.JS							    */
/*    Dialog to display alerts to the user				    */
/* 									    */
/*- Modification History: --------------------------------------------------*/
/*  When:	Who:			Comments:			    */
/* 									    */
/*  13-May-13	Christopher G. Healey	Initial implementation		    */
/*--------------------------------------------------------------------------*/

//  Module global varialbes

var  alert_dlg;				// Alert dialog for invalid dates


function hide_alert_dlg()

  //  Hide the alert dialog
{
  alert_dlg.dialog( "close" );
}					// End function hide_alert_dlg


function init_alert_dlg()

  //  Initialize the alert dialog
{
  var  c;				// jQuery theme colour
  var  html;				// HTML to insert into dialog


  c = $(".ui-icon").css( "color" );

  html = "<div>";
  html = html + "<table>";
  html = html + "<tr style=\"vertical-align: middle;\">";
  html = html + "<td style=\"padding-left: 1em; padding-right: 1em;\">";
  //html = html + "<span class=\"ui-icon ui-icon-circle-close\"></span>";
  html = html + "<i class=\"icon-warning-sign icon-2x\" ";
  html = html + "style=\"color: " + c + ";\"></i>";
  html = html + "</td>";
  html = html + "<td style=\"font-weight: bold; font-size: 1.2em;\">";
  html = html + "<span id=\"alert-msg\"></span>";
  html = html + "</td>";
  html = html + "</tr>";
  html = html + "<tr>";
  html = html + "<td></td>";
  html = html + "<td style=\"font-weight: normal; padding-top: 1em;\">";
  html = html + "<span id=\"alert-info\"></span>";
  html = html + "</td>";
  html = html + "</tr>";
  html = html + "</table>";
  html = html + "</div>";

  alert_dlg = $("<div id=\"alert-dlg\"></div>" );
  alert_dlg.html( html );

  alert_dlg.dialog(
    {
      title: "Alert",			// Dialog title
      autoOpen: false,			// Don't open until text populated
      buttons: {			// OK button
        "OK": function() {
          $(this).dialog( "close" );
        }
      },
      dialogClass: "dialog-drop-shadow",
      resizable: false,
      width: 400,
      modal: true			// Modal so must be dismissed
    }
  );
}					// End function init_alert_dlg();


function show_alert_dlg( msg, info )

  //  Show the alert dialog
  //
  //  msg:   Main dialog message
  //  info:  Secondary informational message
{
  $("#alert-msg").html( msg );
  $("#alert-info").html( info );

  alert_dlg.dialog( "open" );
}					// End function show_alert_dlg
