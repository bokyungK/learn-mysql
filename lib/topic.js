const template = require('./template.js');
const db = require('./db.js');
const qs = require('querystring');

exports.home = function(request, response) {
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
}

exports.page = function(request, response, queryData) {
    // 글 list 보여주기 위해서 작성한 쿼리
    db.query(`SELECT * FROM topic`, (error, topics) => {
        if(error) { // 데이터를 받아올 수 없으면 화면에 에러를 띄움
        throw error;
        }
        // title, description 가져오기 위해서 작성한 쿼리
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], (error2, topic) => {
            // 데이터를 받아올 수 없으면 화면에 에러를 띄움
        if(error2) {
            throw error2;
        }
        const title = topic[0].title;
        const description = topic[0].description;
        const list = template.list(topics);
        const html = template.HTML(title, list,
            `<h2>${title}</h2>
            ${description}
            <p>by ${topic[0].name}</p>
            `,
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

exports.create = function(request, response) {
    db.query(`SELECT * FROM topic`, (error, topics) => {
        db.query('SELECT * FROM author', (error, authors) => {
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
                ${template.authorSelect(authors)}
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
      })
}

exports.create_process = function(request, response) {
    let body = '';
      request.on('data', data => {
        body = body + data;
      });
      request.on('end', () => {
        const post = qs.parse(body);
        db.query(`
          INSERT INTO topic(title, description, created, author_id)
            VALUES(?, ?, NOW(), ?)`,
          [post.title, post.description, post.author],
          (error, result) => {
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/?id=${result.insertId}`});
            response.end();
        });
      });
}

exports.update = function(request, response, queryData) {
    db.query(`SELECT * FROM topic`, (error, topics) => {
        if (error) { // 예외 처리
          throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (error2, topic) => {
          if (error2) {
            throw error2;
          }
          db.query('SELECT * FROM author', (error, authors) => {
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
                  ${template.authorSelect(authors, topic[0].author_id)}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
            )
            response.writeHead(200);
            response.end(html);
            })
        })  
    })
}

exports.update_process = function(request, response) {
    let body = '';
    request.on('data', data => {
        body = body + data;
    });
    request.on('end', () => {
      const post = qs.parse(body);
      db.query(
        `
        UPDATE topic SET title=?, description=?, author_id=? WHERE id=?
        `,
        [post.title, post.description, post.author, post.id],
        (error, result) => {
          response.writeHead(302, {Location: `/?id=${post.id}`});
          response.end();
      })
    })
}

exports.delete_process = function(request, response) {
    let body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
      const post = qs.parse(body);
      db.query('DELETE FROM topic WHERE id=?', [post.id], (error, result) => {
        if(error) {
          throw error;
        }
        response.writeHead(302, {Location: `/`});
        response.end();
      }) 
    })
}