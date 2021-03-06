var express = require('express');
var router = express.Router();

var formidable = require('formidable');

var pool = require('../config/dbconfig');
var orm = require('sequelize');

var models = require('../db/models');
var collections = require('../db/collections');

// Form to Login
router.get('/', function (req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;

