function(head, req) {
 start({"code": 200, "headers": {"Content-Type": "text/JSON"}});
  send('{"imagestring":" ');
  while (row = getRow()) {
    var html="";
		html+= "<a data-milkbox=\\\"zone\\\">";
   html += "<img src=\\\"_show/medium/"+row.id+"\\\" />";
   html+= "</a";
		send(html);
  }
  send(' "}');
}
