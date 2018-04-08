require('babel-polyfill');

import http from 'http';
import helmet from 'helmet';
import assert from 'assert';
import path, {
	join
} from 'path';
import mongoose, {
	Schema,
	connection
} from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import chalk from 'chalk';

mongoose.log = console.log.bind(console, chalk `{bold {yellow Mongoose}}: `)
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://127.0.0.1/infinity-poll');
const dbConnection = mongoose.connection;

dbConnection.on('connected', () => {
	mongoose.log('connected')
})

dbConnection.on('disconnected', () => {
	mongoose.log('disconnected')
})


const port = process.env.PORT || 3000;
const app = express();
const pollSchema = Schema({
	ip: String,
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
	},
	vote: {
		type: String,
		required: true,
		unique: false
	}
})

const PollVote = mongoose.model('PollVote', pollSchema);

app.set('view engine', 'pug');
app.set('views', join(__dirname, 'views'));

app.use(helmet());
app.use(bodyParser())
app.use(bodyParser.json())
app.use(express.static(join(__dirname, 'public')))

app.get('/', (req, res) => {
	res.render('index', {
		ip: getIP(req)
	})
})

app.get('/results', (req, res) => {
	PollVote.find({
			vote: new RegExp('18:30', 'i')
		})
		.exec((err, docs) => {
			if (err) throw err;
			let hours = {
				first: 0,
				second: 0
			}
			hours.first = docs.length;

			PollVote.find({
					vote: new RegExp('21:30', 'i')
				})
				.exec((err, docs) => {
					if (err) throw err;

					hours.second = docs.length;

					res.render('results', hours)
				})
		})
})

app.post('/vote', (req, res) => {
	const { 
		vote,
		email,
		ip
	} = req.body;

	PollVote
		.find({
			$or: [{
				email: matchText(email, { 
					exact: true
				})
			}, {
				ip: matchText(ip, {
					exact: true
				})
			}]
		})
		.exec((err, docs) => {
			if (err) throw err;
			if (docs.length) {
				res.render('error', {
					message: 'You have already voted! (IP IS REGISTERED!)'
				})
			} else {
				PollVote.create({
					vote,
					email
				}, err => {
					if (err) {
						res.send({
							message: err.message
						}).status(500);
						return;
					}

					res.redirect('/results');
				})
			}
		})
})

app.listen(port, () => {
	console.clear();
	console.log(chalk `{bold {cyan Running}}: http://localhost:${port}`)
	console.log();
});

function matchText(string, {
	exact = false
} = {}) {
	return new RegExp(exact ? `^${string}$` : string, 'i')
}