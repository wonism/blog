var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : 'localhost',
    user     : 'root',
    password : 'secret',
    database : 'blog',
    charset  : 'utf8'
  }
});

module.exports = knex;

