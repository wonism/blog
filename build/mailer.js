'use strict';

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _nodemailerSmtpPool = require('nodemailer-smtp-pool');

var _nodemailerSmtpPool2 = _interopRequireDefault(_nodemailerSmtpPool);

var _config = require('../config/config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var transporter = _nodemailer2.default.createTransport((0, _nodemailerSmtpPool2.default)({
  service: _config2.default.mailer.service,
  host: _config2.default.mailer.host,
  port: _config2.default.mailer.port,
  auth: {
    user: _config2.default.mailer.user,
    pass: _config2.default.mailer.password
  },
  tls: {
    rejectUnauthorize: false
  },
  maxConnections: 5,
  maxMessages: 10
}));

module.export = transporter;