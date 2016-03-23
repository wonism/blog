var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 3,
  host: 'localhost',
  user: 'root',
  password: 's3cret',
  database: 'blog'
});

module.exports = pool;

