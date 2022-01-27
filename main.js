const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const path = require('path');
// db에 접속하기 위한 클라이언트 설정
const mysql = require('mysql');
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'nodejs',
  password : '111111',
  database : 'opentutorials'
});
db.connect();

const app = http.createServer(function(request,response){
  const _url = request.url;
  const queryData = url.parse(_url, true).query;
  let pathname = url.parse(_url, true).pathname;
    
  if(pathname === '/'){
    if(queryData.id === undefined){
      db.query(`SELECT * FROM topic`, (error, topics) => {
        const title = 'Welcome';
        const description = 'Hello, Node.js';
        const list = template.list(topics);
        const html = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      })
    } else {
      // 글 list 보여주기 위해서 작성한 쿼리
      db.query(`SELECT * FROM topic`, (error, topics) => {
        // 데이터를 받아올 수 없으면 화면에 에러를 띄움
        if(error) {
          throw error;
        }
        // title, description 가져오기 위해서 작성한 쿼리
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (error2, topic) => {
            // 데이터를 받아올 수 없으면 화면에 에러를 띄움
          if(error2) {
            throw error2;
          }
          const title = topic[0].title;
          const description = topic[0].description;
          const list = template.list(topics);
          const html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>
             <a href="/update?id=${queryData.id}">update</a>
             <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" value="delete">
             </form>`
          )
          response.writeHead(200);
          response.end(html);
        })
      })
    }
  } else if(pathname === '/create'){
      db.query(`SELECT * FROM topic`, (error, topics) => {
        const title = 'Create';
        const list = template.list(topics);
        const html = template.HTML(title, list,
          `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="create title!"></p>
            <p>
              <textarea name="description" placeholder="create description!"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `,
        `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      })
    } else if(pathname === '/create_process'){
      let body = '';
      request.on('data', data => {
        body = body + data;
      });
      request.on('end', () => {
        const post = qs.parse(body);
        db.query(`
          INSERT INTO topic(title, description, created, author_id)
            VALUES(?, ?, NOW(), ?)`,
          [post.title, post.description, 1],
          (error, result) => {
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/?id=${result.insertId}`});
            response.end();
        });
      });
    } else if(pathname === '/update'){
      db.query(`SELECT * FROM topic`, (error, topics) => {
        if (error) { // 예외 처리
          throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (error2, topic) => {
          if (error2) {
            throw error2;
          }
          const title = `Update ${topic[0].title}`;
          const list = template.list(topics);
          const html = template.HTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="update title!" value="${topic[0].title}"></p>
              <p>
                <textarea name="description" placeholder="update description!">${topic[0].description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
          );

          response.writeHead(200);
          response.end(html);
        })
      })
    } else if(pathname === '/update_process'){
      let body = '';
      request.on('data', data => {
          body = body + data;
      });
      request.on('end', () => {
        const post = qs.parse(body);
        db.query(
          `
          UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?
          `,
          [post.title, post.description, post.id],
          (error, topic) => {
            response.writeHead(302, {Location: `/?id=${post.id}`});
            response.end();
        })
      })
    } else if(pathname === '/delete_process'){
      let body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
        const post = qs.parse(body);
        const id = post.id;
        const filteredId = path.parse(id).base;
          fs.unlink(`data/${filteredId}`, function(error){
            response.writeHead(302, {Location: `/`});
            response.end();
          })
      });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);
