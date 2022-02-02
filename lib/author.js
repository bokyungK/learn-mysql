const template = require('./template.js');
const db = require('./db.js');
const qs = require('querystring');
const sanitizeHtml = require('sanitize-html');

exports.home = function(request, response) {
    db.query(`SELECT * FROM topic`, (error, topics) => {
        db.query(`SELECT * FROM author`, (error2, authors) => {
            const title = 'Author';
            const list = template.list(topics);
            const html = template.HTML(title, list,
            `
            <style>
                table {
                    border-collapse: collapse;
                }
                td {
                    border: 1px solid black;
                }
            </style>
            <table>
                ${template.authorTable(authors)}
            </table>
            <form action="/author/create_process" method="post">
                <p>
                    <input type="text" name="name" placeholder="Write author name!"></input>
                </p>
                <p>
                    <textarea name="profile" placeholder="Write author profile!"></textarea>
                </p>
                <p>
                    <input type="submit" value="추가"></input>
                </p>
            </form>
            `,
            ``
            )
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
        INSERT INTO author(name, profile)
          VALUES(?, ?)`,
        [post.name, post.profile],
        // ?와 []로 쿼리에 사용되는 데이터들을 치환처리하면 SQL Injection 공격을 차단할 수 있다.
        (error, result) => {
          if(error){
            throw error;
          }
          response.writeHead(302, {Location: `/author`});
          response.end();
      })
    })
  }

exports.update = function(request, response, queryData) {
    db.query(`SELECT * FROM topic`, (error, topics) => {
        db.query(`SELECT * FROM author`, (error2, authors) => {
            db.query(`SELECT * FROM author WHERE id=?`, [queryData.id], (error3, author) => {
                const title = 'Update';
                const list = template.list(topics);
                const html = template.HTML(title, list,
                `
                <style>
                    table {
                        border-collapse: collapse;
                    }
                    td {
                        border: 1px solid black;
                    }
                </style>
                <table>
                    ${template.authorTable(authors)}
                </table>
                <form action="/author/update_process" method="post">
                    <p>
                        <input type="hidden" name="id" value="${queryData.id}">
                    </p>
                    <p>
                        <input type="text" name="name" value="${sanitizeHtml(author[0].name)}">
                    </p>
                    <p>
                        <textarea name="profile">${sanitizeHtml(author[0].profile)}</textarea>
                    </p>
                    <p>
                        <input type="submit" value="수정">
                    </p>
                </form>
                `,
                ``
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
      db.query(`
        UPDATE author SET name=?, profile=? WHERE id=?`,
        [post.name, post.profile, post.id],
        (error, result) => {
          if(error){
            throw error;
          }
          response.writeHead(302, {Location: `/author`});
          response.end();
      })
    })
}

exports.delete_process = function(request, response) {
    let body = '';
    request.on('data', data => {
      body = body + data;
    });
    request.on('end', () => {
      const post = qs.parse(body);
      db.query(`DELETE FROM topic WHERE author_id=?`, [post.id], (error, result) => {
          if(error) {
            throw error;
          }
        db.query(`DELETE FROM author WHERE id=?`, [post.id], (error2, result2) => {
          if(error2) {
            throw error2;
          }
          response.writeHead(302, {Location: `/author`});
          response.end();
        })
      })
    })
}