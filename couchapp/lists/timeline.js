function(head, req) {
 start({"code": 200, "headers": {"Content-Type": "text/JSON"}});
  send('{"imagestring":" ');
  while (row = getRow()) {
    var html="";
//		html+= "<a data-milkbox=\\\"zone\\\">";
    html += "<a href=\\\""+row.id+"/medium.jpg\\\" data-milkbox=\\\"zone\\\" \\\" title=\\\""+escape(row.value.comment)+" "+row.value.created_at+" "+row.value.reporter+" \\\" />";
//   html+= "</a>";
		send(html);
  }
  send(' "}');
}
