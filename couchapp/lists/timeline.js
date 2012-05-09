function(head, req) {
 start({"code": 200, "headers": {"Content-Type": "text/html"}});
  send("<html><body><ul>");
  while (row = getRow()) {
    var html="";
    html += "<li>";
    html += "<img src=\"_show/thumb/"+row.id+"\"/>";
    html += "</li>";
    send(html);
  }
  send("</ul></html></body>");
}
