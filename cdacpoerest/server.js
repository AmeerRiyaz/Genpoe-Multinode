const port = process.env.PORT || 5000;
var log4js = require('log4js');
log4js.configure('./config/log4js.json');
var logger = log4js.getLogger('server');
const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var cors = require('cors');
var expressJWT = require('express-jwt');
const gconfig = require("./config/generalconfig");
const User = require('./models/bctuser.model');
const genPoeUser = require('./models/genpoeuser.model');
const genericUser = require('./models/genericUser.model');
const cdacUser = require('./models/training/cdacusers.model');
require('./config/config.js');
var env = require('./config/environment');
var hfc = require('fabric-client');
mongoose = require('mongoose');
const passport = require('passport');
const app = express();
var home = require('./routes/home');
const multer = require('multer');
const upload = multer({ dest: 'tmp/csv/' });
const fileupload = require('express-fileupload');
//required files
const fs = require("fs")
const mustache = require("mustache");
var path = require('path');
app.use(fileupload());
const chalk = require('chalk');
var domainConfig = require('./config/domain');
/* var responseTime = require('response-time')
app.use(responseTime((req, res, time) => {
	console.log(chalk.bgCyan(`Processed in ${time} ms :: ${req.method} :: ${req.url} route`))
	console.log()
}))
 */


// Database connect
mongoose.Promise = global.Promise;
const db = require("./config/database.js");

mongoose.connect(db.url, function (err) {
	if (err) {
		logger.error(err);
		throw err;
	}
	logger.info("Successfully connected to database");
});

//windowMs: 30 * 24 * 60 * 60 * 1000, // 30days 
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000, // 15min 
	max: 300000000, // limit each IP to 100 requests per windowMs
	skipFailedRequests: true,
	message: {
		status: "Failed",
		message: "Number requests limited to 100 for this account",
		result: ""
	},
	// allows to create custom keys (by default user IP is used)
	keyGenerator: function (req /*, res*/) {
		return req.token;
	}


});

// app.options('*', cors());
// app.use(cors());
//support parsing of application/json type post data
app.use(bodyParser.json({ limit: '500mb' }));
app.use(express.json({ limit: '500mb', extended: true }));
//app.use(express.urlencoded({limit:'50mb'}));
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
	extended: false
}));
// set secret variable
//app.set('secret', 'cdac@123hash');
//app.use('/',expressJWT({
//app.use(expressJWT({
//	secret: gconfig.secret
//}).unless({
//	//path: [ '/users/auth','/signup','/centres','/courses','/roles','/org/signup','/org/signin','/poe/transaction']
//	path: [ '/','/users/auth','/usersbct','/signup','/org/signin','/insertuserdetails','/poe/bct/transaction','/poe/transaction','/poe/verifier/records','/poe/lastcommits']
//}));
app.use(bearerToken());
app.use(passport.initialize());
app.use(passport.session());
// To set functioning of mustachejs view engine
app.engine('html', function (filePath, options, callback) {
	fs.readFile(filePath, function (err, content) {
		if (err)
			return callback(err)
		console.log(content);
		var rendered = mustache.to_html(content.toString(), options);
		console.log(rendered)
		return callback(null, rendered)
	});
});

// Setting mustachejs as view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');


/*passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(function (userId, done) {
	User.findById(userId, (err, user) => done(err, user));
});

// Passport Local
const LocalStrategy = require("passport-local").Strategy;
const local = new LocalStrategy((username, password, done) => {
	User.findOne({
			username
		})
		.then(user => {
			if (!user || !user.validPassword(password)) {
				done(null, false, {
					message: "Invalid username/password"
				});
			} else {
				done(null, user);
			}
		})
		.catch(e => done(e));
});



passport.use("local", local);*/
//An error handling middleware
/* captcha*/
app.use(express.json());


// var whitelist = ['cdacchain.in', 'cdacchain.in/ACTS', 'http://www.cdacchain.in', 'http://www.cdacchain.in/ACTS', /\.cdacchain\.in$/]
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors(corsOptions));

// //app.use(cors());
app.use(cors({ credentials: true, origin: true }))
app.use(session({
	// genid: function(req) {
	//     return genuuid() // use UUIDs for session IDs
	//   },
	secret: 'nosecretekey',
	saveUninitialized: false,
	resave: true,
	proxy: true,
	cookie: {
		path: '/',
		expires: 30000,
		maxAge: 30000,
		secure: false,
	}
}))
/* captcha */
app.use(function (err, req, res, next) {
	res.status(500);
	res.send("Oops, something went wrong.")
});

app.use(function (req, res, next) {
	//	 if (err) {
	// 	console.log('Invalid Request data')
	// 	res.json({status:"Failed",message:err});
	//	 	res.render('error',{data:'Invalid Request'})
	//	 	return;
	//	 }
	//	console.log(req.originalUrl);
	//res.header("Access-Control-Allow-Origin", "10.244.1.137");
	// 	//res.render('error',{data:'Invalid Request'})
	// 	return;
	// }
	//	console.log(req);
	res.header("Access-Control-Allow-Origin", "*");
	//res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	//res.header("Access-Control-Allow-Headers", "Origin, X-XSS-Protection, X-Content-Type-Options,X-Requested-With, Content-Type, Accept");
	// res.header("Access-Control-Allow-Credentials","true");
	res.header("X-Content-Type-Options", "nosniff");
	res.header("X-Request-With", "XMLHttpRequest");
	res.header("X-XSS_Protection", "1;mode=block");
	res.header("Access-Control-Allow-Methods", "GET, POST");
	/*if (req.originalUrl.indexOf('/users') >= 0) {
		return next();
	}*/




	if (

		req.originalUrl === '/' ||
		req.originalUrl.indexOf('/roles') >= 0 ||
		req.originalUrl === '/poe/verifier/records' ||
		req.originalUrl === '/poe/pos' ||
		req.originalUrl.indexOf('/poe/pos') >= 0 ||
		req.originalUrl === '/poepos' || //generalpoe
		req.originalUrl.indexOf('/poepos') >= 0 || //generalpoe
		//req.originalUrl.indexOf('/org/signup') >= 0 || 
		req.originalUrl === '/org/signin' ||
		//	req.originalUrl.indexOf('/centres') >= 0 ||
		//	req.originalUrl.indexOf('/courses') >= 0 ||
		req.originalUrl === '/signup' ||
		req.originalUrl === '/users/auth' || //Authntication for bct users
		req.originalUrl === '/usersbct' ||
		req.originalUrl === '/poe/lastcommits' ||
		req.originalUrl === '/users/registered' ||
		req.originalUrl === '/users/students' ||
		req.originalUrl === '/users/enabledusers' ||
		req.originalUrl === '/captcha' ||
		req.originalUrl === '/captchaVeri' ||
		req.originalUrl === '/getcallback' || 
		req.originalUrl === '/user/verify' || 
		req.originalUrl === '/user/forgotpwd' ||
		req.originalUrl === '/user/forgotpwdchange') {
		console.log(req.originalUrl);
		return next();
	}
	if (req.method == "GET" && (req.originalUrl === '/channel/info')) {
		req.username = domainConfig.ACTSPoeUser;
		//req.username = "saigopal1";
		console.log(req.username);
		req.orgname = "ActsOrg";
		return next()
	}
	if (req.method == "GET" && (req.originalUrl === '/poe/query' ||
		req.originalUrl === '/poe/transaction' ||
		req.originalUrl === '/poe/bct/transaction' ||
		req.originalUrl === '/poe/pos' ||
		req.originalUrl === '/poe/pos?hash=' ||
		req.originalUrl.indexOf('/poe/pos') >= 0 ||
		req.originalUrl === '/poe/bct/transaction?txId='
		|| req.originalUrl.indexOf('/poe/transaction') >= 0) ||
		req.originalUrl.indexOf('/poe/query') >= 0) {
		//req.username = "saigopal1";
		req.username = domainConfig.ACTSPoeUser;
		//req.username = "vishnu";
		//req.username = conf.username;
		console.log(req.originalUrl);
		req.orgname = "ActsOrg";
		return next();
	}

	if (req.method == "POST" && req.originalUrl === '/poe/transactions/fileHash' ||
		req.originalUrl === '/poe/transactions/TxId' || req.originalUrl.indexOf('/poe/verifier/transactions') >= 0 ||
		req.originalUrl === '/poe/transactions/rollNo' ||
		req.originalUrl === '/poe/verifier/rollNo') {
		//req.username = "training1";
		//req.orgname = "CdachOrg";
		//req.username = "saigopal1";
		console.log(req.originalUrl);
		req.username = domainConfig.ACTSPoeUser;
		req.orgname = "ActsOrg";
		return next();
	}

	/******************************* GENERAL POE Related ********************************************** */

	//GET requests for General POE
	if (req.method == "GET" && (req.originalUrl === '/poe/bct/transaction' ||
		req.originalUrl === '/poe/bct/transaction?txId=' ||
		req.originalUrl === '/genpoechannel/info'
		|| req.originalUrl.indexOf('/poe/bct/transaction') >= 0)) {
		console.log(req.originalUrl);
		//req.username = "training1";
		//req.username = conf.username;
		//req.username = "ravikishore1";
		req.username = domainConfig.GenPoeUser;
		req.orgname = "CdachOrg";
		return next();
	}


	//POST requests for General POE
	if (req.method == "POST" && req.originalUrl === '/genpoe/userreg' ||
		req.originalUrl === '/genpoe/userregNC' ||
		req.originalUrl === '/users/genpoeauth' ||		
		req.originalUrl === '/users/genpoeauthNC' ||
		req.originalUrl === '/poe/bct/transactions/TxId' ||
		req.originalUrl === '/user/forgotpwdNC' ||
		req.originalUrl === '/poe/bct/generic/transactions' ||
		req.originalUrl === '/poe/bct/generic/transactions/fileHash' ||
		req.originalUrl === '/generic/orgReg' ||
		req.originalUrl === '/generic/orgRegNC' ||
		req.originalUrl === '/generic/orgUserAuthenticate' ||
		req.originalUrl === '/generic/orgUserAuthenticateNC' ||
		req.originalUrl === '/generic/forgotpwdchange' ||		
		//req.originalUrl === '/generic/orgDetails' ||
		req.originalUrl === '/org/verify' ||
		req.originalUrl === '/generic/forgotpwd' || 	
		req.originalUrl === '/poe/bct/generic/transactions/TxId')  {
		//req.username = "training1";
		//req.orgname = "CdachOrg";
		console.log(req.originalUrl);
		//req.username = "ravikishore1";
		req.username = domainConfig.GenPoeUser;
		req.orgname = "CdachOrg";
		return next();
	}
	/*if (req.originalUrl.indexOf('/usersbct') >= 0) {
		return next();
	}
	if (req.originalUrl.indexOf('/usersbct/status') >= 0) {
		return next();
	}
	if (req.originalUrl.indexOf('/poe/lastcommits') >= 0) {
		return next();
	}
	if (req.originalUrl.indexOf('/property') >= 0) {
		return next();
	}
	if (req.originalUrl.indexOf('/property/search') >= 0) {
		return next();
	}*/

	//console.log('token= ', req.token);
	console.log(req.originalUrl);
	var token = req.token;
	jwt.verify(token, gconfig.secret, function (err, decoded) {
		if (err) {
			res.send({
				status: "Failed",
				message: 'Failed to authenticate token. Make sure to include the ' +
					'token in the authorization header as a Bearer token'
			});
			//res.render('error',{data:'Failed to authenticate token'})

		} else {
			//console.log('jwt decoded username ', decoded.username);

			//if (req.originalUrl.indexOf('/users') >= 0 || req.originalUrl.indexOf('/usersbct') >= 0 
			//	|| req.originalUrl.indexOf('/usersbct/status') >= 0 ) {
			if (req.originalUrl === '/users' || req.originalUrl === '/usersbct' ||
				req.originalUrl === '/usersbct/status') {
				//console.log("in 1st if")
				User.findOne({
					username: decoded.username
				}, function (err, user1) {
					if (user1.role == "admin") {
						return next();
					}
					else {
						res.send({
							status: "Failed",
							message: 'Dont have privileges to access this resource'
						});
						return;
					}
				})
			} else if (req.originalUrl === '/org/signup' ||
				req.originalUrl === '/courses' ||
				//req.originalUrl.indexOf('/insertuserdetails') >= 0 ||
				req.originalUrl === '/roles'
				|| req.originalUrl === '/usersbct') {
				cdacUser.findOne({
					username: decoded.username
				}, function (err, user1) {
					if (user1.role == "admin") {
						return next();
					}
					else {
						res.send({
							status: "Failed",
							message: 'Dont have privileges to access this resource'
						});
						return;
					}
				})
			}
			// else if(req.originalUrl.indexOf('/poe/transaction?txId=')){
			// 	req.username = "guest",
			// 	req.orgname = "DemoOrg"
			// 	return next();
			// }
			else if (req.originalUrl === '/user/changepwd') {
				cdacUser.findOne({
					username: decoded.username
				}, function (err, user1) {
					//console.log(user1)
					if (user1 && user1.enable === true) {
						console.log("user enabled")
						req.username = decoded.username;
						//req.orgname = "CdachOrg";
						//req.orgname = decoded.orgName;
						req.orgname = "ActsOrg";
						//console.log(req.username);
						//console.log(req.orgname)
						//req.username = "vikas";

						return next();
					}
				})
			}
			else if (req.originalUrl === '/poe/users/certs' ||
				req.originalUrl === '/poe/transactions' ||
				req.originalUrl === '/poe/transactions/fileHash' ||
				req.originalUrl === '/poe/transactions/TxId') {
				cdacUser.findOne({
					username: decoded.username
				}, function (err, user1) {
					console.log(user1)
					if (user1 && user1.enable === true) {
						//console.log("user enabled")
						req.username = decoded.username;
						//req.orgname = "CdachOrg";
						//req.orgname = decoded.orgName;
						req.orgname = "ActsOrg";
						//console.log(req.username);
						//console.log(req.orgname)
						//req.username = "vikas";

						return next();
					}
				})

			}

			//TODO Check it in bct users for general poe
			else if (req.originalUrl.indexOf('/channels') >= 0 ||
				req.originalUrl.indexOf('/chaincodes') >= 0) {
				User.findOne({
					//genPoeUser.findOne({
					username: decoded.username
				}, function (err, user1) {
					//add the code for admin pages

					if (user1 && user1.enable === true) {
						req.username = decoded.username;
						req.orgname = decoded.orgName;
						//console.log(req.username);
						//console.log(req.orgname);
						req.issuedTo = decoded.username; // added to test gen poe invoke without issuedTO field
						//logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
						return next();
					} else if (user1 && user1.enable === false) {
						res.send({
							status: "Failed",
							message: 'User is disabled'
						});
						return;
					} else if (user1 === null || err) {
						res.send({
							status: "Failed",
							message: 'Not a valid User'
						});
						return;
					}
				})

			}


			//Removed and kept in above case
			//req.originalUrl.indexOf('/channels')>= 0 || req.originalUrl.indexOf('/chaincodes')>= 0 ||
			else if (req.originalUrl === '/poe/bct/transactions' ||
				req.originalUrl === '/poe/bct/transactions/fileHash' ||
				//req.originalUrl === '/poe/bct/transactions/TxId' ||
				req.originalUrl === '/genpoe/user/docs' ||
				req.originalUrl === '/genpoe/user/changepwd' ||
				req.originalUrl === '/getpdfreceipt' || 				
				req.originalUrl === '/poepos/file' ||
				req.originalUrl === '/genpoe/getUserInfo'
				
				) {
				//User.findOne({
				console.log(chalk.bgCyan('in server ',decoded.username));
				genPoeUser.findOne({
					username: decoded.username/* ,
					email: decoded.usernam */
				}, function (err, user1) {
					//add the code for admin pages

					if (user1 && user1.enable === true) {
						req.username = decoded.username;
						req.orgname = decoded.orgName;
						//console.log(req.username);
						//console.log(req.orgname);
						req.issuedTo = decoded.username; // added to test gen poe invoke without issuedTO field
						//logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
						return next();
					} else if (user1 && user1.enable === false) {
						res.send({
							status: "Failed",
							message: 'User is disabled'
						});
						return;
					} else if (user1 === null || err) {
						res.send({
							status: "Failed",
							message: 'Not a valid User'
						});
						return;
					}
				})

			}
			else if (req.originalUrl === '/generic/orgUserReg' ||
			req.originalUrl === '/generic/orgUserRegNC' ||
			req.originalUrl === '/generic/orgDetails' ||
			req.originalUrl === '/generic/userDetails' ||
			req.originalUrl === '/generic/userUpdate' ||
			req.originalUrl === '/genericinvoke' ||
			req.originalUrl === '/generic/fetchDocs' ||
			req.originalUrl === '/generic/org/uploadLogo' || 
			req.originalUrl === '/generic/addCategories' ||
			req.originalUrl === '/generic/remCategories' ||
			req.originalUrl === '/generic/listCategories' || 
			req.originalUrl === '/generic/changepwd' || 								
			req.originalUrl === '/generic/org/getLogo'
			 
			) {
				//console.log()
				//User.findOne({
				console.log(chalk.bgCyan('in server ',decoded.userOrgemail));
				console.log(decoded);
				genericUser.findOne({
					userOrgemail: decoded.userOrgemail
				}, function (err, user1) {
					//add the code for admin pages

					if (user1 && user1.enable === true) {
						//req.username = decoded.username;
						req.username = domainConfig.GenPoeUser;
						req.orgname = decoded.orgname;
						req.role = decoded.role;
						req.userOrgID = decoded.userOrgID;
						req.userOrgName = decoded.userOrgName;
						req.userOrgemail = decoded.userOrgemail;
						req.userOrgAdminemail = decoded.userOrgAdminemail;
						req.userOrgUserName = decoded.fullname;
						//console.log(req.username);
						console.log('inside server' + req.orgname);
						//req.issuedTo = decoded.username; // added to test gen poe invoke without issuedTO field
						//logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
						return next();
					} else if (user1 && user1.enable === false) {
						res.send({
							status: "Failed",
							message: 'User is disabled'
						});
						return;
					} else if (user1 === null || err) {
						res.send({
							status: "Failed",
							message: 'Not a valid User'
						});
						return;
					}
				})

			}
			else {
				// add the decoded user name and org name to the request object
				// for the downstream code to use
				console.log(req.originalUrl);
				console.log(decoded.username)
				cdacUser.findOne({
					username: decoded.username
				}, function (err, user1) {
					console.log(user1)
					if (err) {
						console.log(err)
					}
					//add the code for admin pages
					console.log("in cdacusers" + user1)


					/*if(req.originalUrl.indexOf('/insertuserdetails') >= 0 ){
						if(user1.role === "Training Coordinator"){
						req.username = decoded.username;
						//req.orgname = decoded.orgName;
						req.orgname = "CdachOrg";
							return next();
						}
					}*/
					if (user1 && user1.enable === true) {
						console.log("user enabled")
						req.username = decoded.username;
						//req.orgname = decoded.orgName;
						req.orgname = "CdachOrg";

						//logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
						//					app.use(limiter);
						//if(req.username === "demouser")
						//					{
						//app.use('/poe/channels/:channelName/transactions',limiter);
						//app.use('/poe/channels/:channelName/transactions/fileHash',limiter);
						//	app.use('/poe/channels/:channelName/transactions/TxId',limiter);
						//	app.use('/poe',limiter);
						//	app.use('/poe/lastcommits',limiter);
						//					}
						return next();
					} else if (user1 && user1.enable === false) {
						res.send({
							status: "Failed",
							message: 'User is disabled'
						});
						return;
					} else if (user1 === null || err) {
						res.send({
							status: "Failed",
							message: 'Not a valid user'
						});
						return;
					}
				})
			}
		}
	});
});
//rendering example for response
// app.get('/',(req,res)=>{        
//     res.render('index',{data:'Sample Data'});
// });
app.use('/', home);
app.use('/poe/bct/transactions', limiter);
app.use('/poe/bct/transactions/fileHash', limiter);
app.use('/poe/bct/transactions/TxId', limiter);
app.use('/poe', limiter);
app.use('/poe/lastcommits', limiter);
app.use('/insertuserdetails', upload.single('file'));
//app.use(limiter);


require('./routes/usersbct.js')(app);
require('./routes/channel.js')(app);
require('./routes/chaincode.js')(app);
require('./routes/poe.js')(app);
require('./routes/poeusers.js')(app);
require('./routes/training/poe.js')(app);
require('./routes/training/poeusers.js')(app);
require('./routes/networkconfig.js')(app);
require('./routes/training/captcha')(app);
app.listen(port, () => {
	logger.info("CDACPoE: REST server started at port: " + port);
});
