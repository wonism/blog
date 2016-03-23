var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 3,
  host: 'localhost',
  user: 'root',
  password: 'secret',
  database: 'blog'
});

module.exports = pool;

