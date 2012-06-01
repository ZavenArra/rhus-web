function(head, req) {
 start({"code": 200, "headers": {"Content-Type": "text/JSON"}});
  send('{"imagestring":" ');
  while (row = getRow()) {
    var html="";
//		html+= "<a data-milkbox=\\\"zone\\\">";
   html += "<a href=\\\"_show/medium/"+row.id+"\\\"data-milkbox=\\\"zone\\\" \\\" title=\\\""+row.comment+"\\\" />";
//   html+= "</a>";
		send(html);
  }
  send(' "}');
}
