const http = require('http');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const db = require('./lib/db.js');
const topic = require('./lib/topic.js');

const app = http.createServer(function(request,response){
  const _url = request.url;
  const queryData = url.parse(_url, true).query;
  let pathname = url.parse(_url, true).pathname;
    
  if(pathname === '/'){
    if(queryData.id === undefined){
      topic.home(request, response);
    } else {
      topic.page(request, response, queryData);
    }
  } else if(pathname === '/create'){
    topic.create(request, response);
  } else if(pathname === '/create_process'){
    topic.create_process(request, response);
  } else if(pathname === '/update'){
    topic.update(request, response, queryData);
  } else if(pathname === '/update_process'){
    topic.update_process(request, response);
  } else if(pathname === '/delete_process'){
    topic.delete_process(request, response);
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);
