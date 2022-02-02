const template = require('./template.js');
const db = require('./db.js');

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
            `,
            `<a href="/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
        })
    })
}