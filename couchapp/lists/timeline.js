function(head, req) {
  send("<ul>");
  while (row = getRow()) {
    var html=null;
    html += "<li>";
    html += "<img src=\"_show/medium/"+row.id+"\"/>";
    html += "</li>";
    send(html);
  }
  send("</ul>");
}
