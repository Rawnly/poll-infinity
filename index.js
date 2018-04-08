'use strict';

var _templateObject = _taggedTemplateLiteral(['{bold {yellow Mongoose}}: '], ['{bold {yellow Mongoose}}: ']),
    _templateObject2 = _taggedTemplateLiteral(['{bold {cyan Running}}: http://localhost:', ''], ['{bold {cyan Running}}: http://localhost:', '']);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

require('babel-polyfill');

_mongoose2.default.log = console.log.bind(console, (0, _chalk2.default)(_templateObject));
_mongoose2.default.Promise = global.Promise;

_mongoose2.default.connect('mongodb://127.0.0.1/local');
var dbConnection = _mongoose2.default.connection;

dbConnection.on('connected', function () {
	_mongoose2.default.log('connected');
});

dbConnection.on('disconnected', function () {
	_mongoose2.default.log('disconnected');
});

var port = process.env.PORT || 3000;
var app = (0, _express2.default)();
var pollSchema = (0, _mongoose.Schema)({
	ip: String,
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true
	},
	vote: {
		type: String,
		required: true,
		unique: false
	}
});

var PollVote = _mongoose2.default.model('PollVote', pollSchema);

app.set('view engine', 'pug');
app.set('views', (0, _path.join)(__dirname, 'views'));

app.use((0, _helmet2.default)());
app.use((0, _bodyParser2.default)());
app.use(_bodyParser2.default.json());
app.use(_express2.default.static((0, _path.join)(__dirname, 'public')));

app.get('/', function (req, res) {
	res.render('index', {
		ip: getIP(req)
	});
});

app.get('/results', function (req, res) {
	PollVote.find({
		vote: new RegExp('18:30', 'i')
	}).exec(function (err, docs) {
		if (err) throw err;
		var hours = {
			first: 0,
			second: 0
		};
		hours.first = docs.length;

		PollVote.find({
			vote: new RegExp('21:30', 'i')
		}).exec(function (err, docs) {
			if (err) throw err;

			hours.second = docs.length;

			res.render('results', hours);
		});
	});
});

app.post('/vote', function (req, res) {
	var _req$body = req.body,
	    vote = _req$body.vote,
	    email = _req$body.email,
	    ip = _req$body.ip;


	PollVote.find({
		$or: [{
			email: matchText(email, {
				exact: true
			})
		}, {
			ip: matchText(ip, {
				exact: true
			})
		}]
	}).exec(function (err, docs) {
		if (err) throw err;
		if (docs.length) {
			res.render('error', {
				message: 'You have already voted! (IP IS REGISTERED!)'
			});
		} else {
			PollVote.create({
				vote: vote,
				email: email
			}, function (err) {
				if (err) {
					res.send({
						message: err.message
					}).status(500);
					return;
				}

				res.redirect('/results');
			});
		}
	});
});

app.listen(port, function () {
	console.clear();
	console.log((0, _chalk2.default)(_templateObject2, port));
	console.log();
});

function getIP(req) {
	return req.headers['x-forwarded-for'] || req.connection.remoteAddress || false;
}

function matchText(string) {
	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$exact = _ref.exact,
	    exact = _ref$exact === undefined ? false : _ref$exact;

	return new RegExp(exact ? '^' + string + '$' : string, 'i');
}