var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var nunjucks = require('nunjucks');
var nodemailer = require('nodemailer');
var uuidv1 = require('uuid/v1');
var crypto = require('crypto');
var cookieParser = require('cookie-parser');
const { response, Router } = require('express');

var secret_key = 'your secret key';


// Update the below details with your own MySQL connection details
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'nodelog'
});

var app = express();

nunjucks.configure('views', {
  	autoescape: true,
  	express   : app
});

app.use(session({
	secret: secret_key,
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));
app.use(cookieParser());





app.get('/orgin', function(request, response) {
	response.render('orgin.html');
});

app.get('/aboutus', function(request, response) {
	response.render('aboutus.html');
});
app.get('/current', function(request, response) {
	response.render('current.html');
});

app.get('/', function(request, response) {
	response.render('index.html');
});





app.post('/', function(request, response) {
	// Create variables with the post data
	var username = request.body.username;
	var password = request.body.password;
	var hashed_password = crypto.createHash('sha1').update(request.body.password).digest('hex');
	// check if the data exists and is not empty
	if (username && password) {
		// Select the account from the accounts table
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, hashed_password], function(error, results, fields) {
			if (error) {
				console.log(error);
		   }
			
			if (results.length > 0) {
				// Account exists (username and password match)
				// Create session variables
				request.session.loggedin = true;
				request.session.username = username;
				if (request.body.rememberme) {
					// Create cookie hash, will be used to check if user is logged in
					var hash = crypto.createHash('sha1').update(username + password + secret_key).digest('hex');
					// Num days until the cookie expires (user will log out)
					var days = 90;
					response.cookie('rememberme', hash, { maxAge: 1000*60*60*24*days, httpOnly: true });
					connection.query('UPDATE accounts SET rememberme = ? WHERE username = ?', [hash, username]);
				}
				// Redirect to home page
				response.send('Success');
				response.end();
			} else {
				response.send('Incorrect Username and/or Password!');
				response.end();
			}
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/register', function(request, response) {
	response.render('register.html');
});



app.post('/register', function(request, response) {
	// Create variables and set to the post data
	var username = request.body.username;
	var password = request.body.password;
	var hashed_password = crypto.createHash('sha1').update(request.body.password).digest('hex');
	var email = request.body.email;
	// Check if the post data exists and not empty
	if (username && password && email) {
		// Check if account exists already in the accounts table, checks for username but you could change this to email etc
		connection.query('SELECT * FROM accounts WHERE username = ?', [username], function(error, results, fields) {
			if (results.length > 0) {
				response.send('Account already exists with that username!');
				response.end();
			} else if (!/\S+@\S+\.\S+/.test(email)) {
				// Make sure email is valid
				response.send('Invalid email address!');
				response.end();
			} else if (!/[A-Za-z0-9]+/.test(username)) {
				// Username validation, must be numbers and characters
				response.send('Username must contain only characters and numbers!');
				response.end();
			} 
			 else {
				// Insert account with no activation code
				connection.query('INSERT INTO accounts VALUES (NULL, ?, ?, ?, "", "")', [username, hashed_password, email], function(error, results, fields) {
					response.send('You have successfully registered!');
					response.end();
				});
			}
		});
	} else {
		// Form is not complete...
		response.send('Please complete the registration form!');
		response.end();
	}
});



app.get('/home', function(request, response) {
	// Check if user is logged in
	if (request.session.loggedin) {
		// Render home page
		connection.query('SELECT * FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			// Render profile page
			if ( request.session.username == "admin")
			{
			response.render('admin.html', { account: results[0] });
			}
			else 
			{
				response.render('home.html', { account: results[0] });
			}
		});
		
	} else if (request.cookies.rememberme) {
		// if the remember me cookie exists check if an account has the same value in the database
		connection.query('SELECT * FROM accounts WHERE rememberme = ?', [request.cookies.rememberme], function(error, results, fields) {
			if (results.length > 0) {
				// remember me cookie matches, keep the user loggedin and update session variables
				request.session.loggedin = true;
				request.session.username = results[0].username;
				response.render('home.html', { account: results[0] });
			} else {
				response.redirect('/');
			}
		});
	} else {
		// Redirect to login page
		response.redirect('/');
	}
});




app.get('/admin', function(request, response) {
	// Check if user is logged in
	if (request.session.loggedin) {
		// Render admin page
		response.render('admin.html', { username: request.session.username });
	} else if (request.cookies.rememberme) {
		// if the remember me cookie exists check if an account has the same value in the database
		connection.query('SELECT * FROM accounts WHERE rememberme = ?', [request.cookies.rememberme], function(error, results, fields) {
			if (results.length > 0) {
				// remember me cookie matches, keep the user loggedin and update session variables
				request.session.loggedin = true;
				request.session.username = results[0].username;
				response.render('admin.html', { account: results[0] });
			} else {
				response.redirect('/');
			}
		});
	} else {
		// Redirect to login page
		response.redirect('/');
	}
}); 

/* GET moviedetails page. */
app.get('/moviedetails', function(request, response) {
	response.render('moviedetails.html');
});



app.get('/moviedetails', function(request, response) {
	// Check if user is logged in
	if (request.session.loggedin) {
		// Get all the users account details so we can display them on the profile page
		connection.query('SELECT * FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			// Render profile page
			response.render('moviedetails.html', { account: results[0] });
		});
	} else {
		// Redirect to login page
		response.redirect('/');
	}
});

app.get('/profile', function(request, response) {
	// Check if user is logged in
	if (request.session.loggedin) {
		// Get all the users account details so we can display them on the profile page
		connection.query('SELECT * FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			// Render profile page
			response.render('profile.html', { account: results[0] });
		});
	} else {
		// Redirect to login page
		response.redirect('/');
	}
});

app.get('/edit_profile', function(request, response) {
	// Check if user is logged in
	if (request.session.loggedin) {
		// Get all the users account details so we can display them on the profile page
		connection.query('SELECT * FROM accounts WHERE username = ?', [request.session.username], function(error, results, fields) {
			// Render profile page
			response.render('profile-edit.html', { account: results[0] });
		});
	} else {
		// Redirect to login page
		response.redirect('/');
	}
});

app.post('/edit_profile', function(request, response) {
	// Check if user is logged in
	if (request.session.loggedin) {
		// create variables for easy access
		var username = request.body.username;
		var password = request.body.password;
		var hashed_password = crypto.createHash('sha1').update(request.body.password).digest('hex');
		var email = request.body.email;
		if (username && password && email) {
			// update account with new details
			connection.query('UPDATE accounts SET username = ?, password = ?, email = ? WHERE username = ?', [username, hashed_password, email, request.session.username], function() {
				// update session with new username
				request.session.username = username;
				// get account details from database
				connection.query('SELECT * FROM accounts WHERE username = ?', [username], function(error, results, fields) {
					// Render edit profile page
					response.render('profile-edit.html', { account: results[0], msg: 'Account Updated!' });
				});
			});
		}
	} else {
		// Redirect to login page
		response.redirect('/');
	}
});

app.get('/logout', function(request, response) {
	// Destroy session data
	request.session.destroy();
	// Clear remember me cookie
	response.clearCookie('rememberme');
	// Redirect to login page
	response.redirect('/');
});





// Listen on port 3000 (http://localhost:3000/)
app.listen(3000);
