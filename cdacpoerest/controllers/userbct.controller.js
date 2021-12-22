const User = require('../models/bctuser.model');
const genPoeUser = require('../models/genpoeuser.model');
const genericUser = require('../models/genericUser.model');
const gconfig = require("../config/generalconfig");
var log4js = require('log4js');
var logger = log4js.getLogger('usersbct.controller');
var jwt = require('jsonwebtoken');
require('../config/config.js');
var helper = require('../hyperledger/helper.js');
var common = require('../common/common.js');
var rtconfig = require('../config/rtconfig');
const io = require('socket.io-client');
var rtelib0 = require('../rtelib/rte-lib');
const dateFormat = require('dateformat')
const socket = io(rtconfig.rteserverIP + '/blockchain-nsp');
var rtelib = new rtelib0(socket);
const bcrypt = require('bcrypt');
var validator = require('validator');
const chalk = require('chalk');
const poeEnv = require('../config/environmentPoe');
const emailConfig = require('../config/email');
const recaptcha = require('../config/recaptcha');
const request = require('request');
const validate = require('./validations');
const proofofex = require('../models/poe.model');
const genericpoedata = require('../models/genericpoedata.model');
const registerUser=require('./registerUser')
function getErrorMessage(field) {
	var response = {
		status: "Failed",
		message: field,
		result: ""
	};
	rtelib.raiseEvent('blockchain', 'poeSearch', {
		ts: cts(),
		msg: 'Query failed due to ' + field
	});
	logger.debug(chalk.bgRed(response.status + ' : ' + response.message));
	return response;
}

/********************** START ******* GENERIC POE ORGANIZATION RELATED **********************/
//For Registering Generic PoE Organizations
exports.registerOrganization = async (req, res) => {
	/************************************* req needs **********
						userOrgName
						userOrgID
						userOrgAdminpassword
						userOrgAdminconfpass
						userOrgAdminemail
						orgName // for BCT level
						//attr = genpoeuser
	***********************************************************/
	//var attr1;
	console.log("req.body is ", req.body);
	var userOrgName = req.body.userOrgName;
	var userOrgID = req.body.userOrgID;
	var userOrgAdminpassword = req.body.userOrgAdminpassword;
	var userOrgAdminconfpass = req.body.userOrgAdminconfpass;
	var userOrgAdminemail = req.body.userOrgAdminemail;
	var fullName = req.body.fullName
	//var attr = req.body.attr;
	//var orgName = req.body.orgName;
	var orgname = req.orgname;
	var shouldReturnFromFuntion = false;
	//console.log('inside genpoe register ', orgName, attr)
	console.log('inside generic Org register ', orgname)
	logger.info('End point : /genericpoe/orgreg');


	await validate.validateUserName(userOrgName).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgName valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgName Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;


	await validate.validateOrgID(userOrgID).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgID valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgID Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;

	await validate.validateUserName(fullName).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('fullName valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('fullName Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;

	await validate.validatePassword(userOrgAdminpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgAdminpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgAdminpassword Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;

	//Handle if passwords not match
	if (userOrgAdminpassword != userOrgAdminconfpass) {
		//shouldReturnFromFuntion = true;
		let eRes = {
			status: "Failed",
			message: "Password and ConfPasswd does not matched",
			result: "Password and ConfPasswd does not matched"
		};
		res.json(eRes);
		return;
	}

	userOrgAdminemail = userOrgAdminemail.toString();
	await validate.validateEmail(userOrgAdminemail).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgAdminemail valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgAdminemail Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;

	if (!orgname) {
		res.send(common.getErrorMessage('\'orgname\''));
		return;
	}


	//	attr1 = "writer";


	var capToken = req.body.recaptcha;
	console.log('recaptcha is ', capToken);

	request({
		url: recaptcha.googleUrl,
		method: "POST",
		json: true,   // <--Very important!!!
		qs: {
			secret: recaptcha.secret,
			response: capToken
		}
	}, async function (error, response) {
		if (response) {
			//console.log(response.body);
			if (response.body.success === true) {
				console.log("captcha valid");
				message = "valid";
				var regdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
				//var regdate = Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime);
				//Admin User Registration
				//if (attr === "admin") {
				//Checking for the existence of the organization account
				genericUser.findOne({
					$or:
						[{ userOrgName: userOrgName },
						{ userOrgID: userOrgID },
						{ userOrgemail: userOrgAdminemail }]
				}, function (err, user1) {
					if (user1) {
						shouldReturnFromFuntion = true;
						console.log(chalk.bgRed("Organization already exists: "));
						logger.debug("Organization already exists: ");
						res.json({
							status: "Failed",
							message: "Organization already exists: "
						});
					} else {
						console.log(chalk.bgGreen("Organization not exists already... Creating Now"));


						console.log("regdate" + regdate);
						var token = jwt.sign({
							//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
							//exp: Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime),
							//exp: regdate,
							userOrgName: userOrgName,
							userOrgID: userOrgID,
							userOrgemail: userOrgAdminemail,
							fullName: "Administrator",
							role: "admin",
							orgname: orgname
						}, gconfig.secret);

						let categories = [];
						categories.push("Document");
						//encrypt the password with bcrypt
						let saltRounds = 10;
						bcrypt.hash(userOrgAdminpassword, saltRounds, function (err, hashedpwd) {
							userOrgAdminpassword = hashedpwd;

							let user = new genericUser({
								userOrgName: userOrgName,
								userOrgID: userOrgID,
								password: userOrgAdminpassword,
								fullName: "Administrator",
								userOrgemail: userOrgAdminemail,
								orgname: orgname,
								role: "admin",
								token: token,
								regDate: regdate,
								enable: false,
								reset: false,
								orgCategories: categories
							});
							user.save((err, newUser) => {
								if (err) {
									res.json({
										status: "Failed",
										message: "Error creating Admin user: " + err.message
									});
								} else {
									console.log(newUser + " saved in db successfully");
									sendConfirmationMail_Org(userOrgID, userOrgAdminemail, userOrgName, "", "").then((res) => {
										//helper.sendConfirmationMail(email, fullname).then((res) => {
										console.log(res)
									}).catch((err) => {
										console.log(err)
									})
									res.json({
										status: "Success",
										message: "Organization Account Created Successfully"
									});

									//TODO 3 Respond as user registered please verify by mail
								}
							});
						});
					}
					if (shouldReturnFromFuntion) return;
				});
				//}

			}
		} else {
			console.log("captcha invalid");

		}
	});
};

exports.registerOrganizationNC = async (req, res) => {
	/************************************* req needs **********
						userOrgName
						userOrgID
						userOrgAdminpassword
						userOrgAdminconfpass
						userOrgAdminemail
						orgName // for BCT level
						//attr = genpoeuser
	***********************************************************/
	//var attr1;
	console.log(req.body);
	var userOrgName = req.body.userOrgName;
	var userOrgID = req.body.userOrgID;
	var userOrgAdminpassword = req.body.userOrgAdminpassword;
	var userOrgAdminconfpass = req.body.userOrgAdminconfpass;
	var userOrgAdminemail = req.body.userOrgAdminemail;
	var fullName = req.body.fullName
	//var attr = req.body.attr;
	//var orgName = req.body.orgName;
	var orgname = req.orgname;
	var shouldReturnFromFuntion = false;
	//console.log('inside genpoe register ', orgName, attr)
	console.log('inside genpoe register ', orgname)
	logger.info('End point : /genericpoe/orgreg');


	await validate.validateUserName(userOrgName).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgName valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgName Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;


	await validate.validateOrgID(userOrgID).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgID valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgID Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;

	await validate.validatePassword(userOrgAdminpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgAdminpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgAdminpassword Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;


	userOrgAdminemail = userOrgAdminemail.toString();
	await validate.validateEmail(userOrgAdminemail).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgemail valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgemail Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;

	//Handle if passwords not match
	if (userOrgAdminpassword != userOrgAdminconfpass) {
		//shouldReturnFromFuntion = true;
		let eRes = {
			status: "Failed",
			message: "Password and ConfPasswd does not matched",
			result: "Password and ConfPasswd does not matched"
		};
		res.json(eRes);
		return;
	}



	if (!orgname) {
		res.send(common.getErrorMessage('\'orgname\''));
		return;
	}


	//attr1 = "writer";




	var regdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

	//Checking for the existence of the organization account
	genericUser.findOne({
		$or:
			[{ userOrgName: userOrgName },
			{ userOrgID: userOrgID },
			{ userOrgemail: userOrgAdminemail }]
	}, function (err, user1) {
		if (user1) {
			shouldReturnFromFuntion = true;
			console.log(chalk.bgRed("Organization already exists: "));
			logger.debug("Organization already exists: ");
			res.json({
				status: "Failed",
				message: "Organization already exists: "
			});
		} else {
			console.log(chalk.bgGreen("Organization not exists already... Creating Now"));




			console.log("regdate" + regdate);
			var token = jwt.sign({
				//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
				//exp: Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime),
				//exp: regdate,
				userOrgName: userOrgName,
				userOrgID: userOrgID,
				userOrgemail: userOrgAdminemail,
				//fullname : "Administrator",
				fullName: "Administrator",
				role: "admin",
				orgname: orgname
			}, gconfig.secret);

			let categories = [];
			categories.push("Document");

			//encrypt the password with bcrypt
			let saltRounds = 10;
			bcrypt.hash(userOrgAdminpassword, saltRounds, function (err, hashedpwd) {
				userOrgAdminpassword = hashedpwd;

				let user = new genericUser({
					userOrgName: userOrgName,
					userOrgID: userOrgID,
					password: userOrgAdminpassword,
					fullName: "Administrator",
					userOrgemail: userOrgAdminemail,
					orgname: orgname,
					role: "admin",
					token: token,
					regDate: regdate,
					enable: false,
					reset: false,
					orgCategories: categories

				});
				user.save((err, newUser) => {
					if (err) {
						res.json({
							status: "Failed",
							message: "Error creating Admin user: " + err.message
						});
					} else {
						console.log(newUser + " saved in db successfully");
						//sendConfirmationMail(userOrgAdminemail, "Administrator").then((res) => {
						sendConfirmationMail_Org(userOrgID, userOrgAdminemail, userOrgName, "", "").then((res) => {
							//helper.sendConfirmationMail(email, fullname).then((res) => {
							console.log(res)
						}).catch((err) => {
							console.log(err)
						})
						//	res.statusCode = 200;
						//	res.message = "User registered successfully";
						res.json({
							status: "Success",
							message: "Organization Account Created Successfully"
						});

						//TODO 3 Respond as user registered please verify by mail
					}
				});
			});
			//}
		}
	});


};


exports.addCategories = async (req, res) => {
	console.log("Inside add categories function");
	let userOrgName = req.userOrgName;
	let userOrgID = req.userOrgID;
	let userOrgAdminemail = req.userOrgAdminemail;
	let categories = req.body.categories;
	console.log("Received categories are ", categories);
	genericUser.findOne({
		$and:
			[{ userOrgName: userOrgName },
			{ userOrgID: userOrgID },
			{ userOrgemail: userOrgAdminemail }]
	}, function (err, user1) {
		if (user1) { //Add the category in Database
			console.log("Before pushing ", user1.orgCategories);
			user1.orgCategories.push(categories);
			console.log("After pushing ", user1.orgCategories);
			/* res.json({
				status: "Success",
				message: "Category/ies added Successfully for the Organization : " + userOrgName,
				result: user1.orgCategories
			}); */
			genericUser.update({
				$and:
					[{ userOrgName: userOrgName },
					{ userOrgID: userOrgID },
					{ userOrgemail: userOrgAdminemail }]
			}, {
				$set: {
					"orgCategories": user1.orgCategories
				}
			}, function (err, rowsUpdated) {
				if (err) {
					console.log("Add Category failed")
					res.json({
						status: "Failed",
						message: "Add Category Failed"
					});
					return
				} else {
					console.log("Add Category Success")
					res.json({
						status: "Success",
						message: "Category/ies added Successfully for the Organization : " + userOrgName,
						result: user1.orgCategories
					});
				}
			})

		} else {
			console.log("user Not found");
			res.json({
				status: "Failed",
				message: "User / Organization not found: " + err.message
			});
		}
	})
}

exports.remCategories = async (req, res) => {
	console.log("Inside remove categories function");
	let userOrgName = req.userOrgName;
	let userOrgID = req.userOrgID;
	let userOrgAdminemail = req.userOrgAdminemail;
	let categories = req.body.categories;
	console.log("Received categories for deletion are ", categories);
	genericUser.findOne({
		$and:
			[{ userOrgName: userOrgName },
			{ userOrgID: userOrgID },
			{ userOrgemail: userOrgAdminemail }]
	}, function (err, user1) {
		if (user1) { //Add the category in Database
			console.log("Before pushing ", user1.orgCategories);
			user1.orgCategories.pop(categories);
			console.log("After pushing ", user1.orgCategories);
			/* res.json({
				status: "Success",
				message: "Category/ies removed Successfully for the Organization : " + userOrgName,
				result: user1.orgCategories
			}); */
			genericUser.update({
				$and:
					[{ userOrgName: userOrgName },
					{ userOrgID: userOrgID },
					{ userOrgemail: userOrgAdminemail }]
			}, {
				$set: {
					"orgCategories": user1.orgCategories
				}
			}, function (err, rowsUpdated) {
				if (err) {
					console.log("Remove Category failed")
					res.json({
						status: "Failed",
						message: "Remove Category Failed"
					});
					return
				} else {
					console.log("Remove Category Success")
					res.json({
						status: "Success",
						message: "Category/ies removed Successfully for the Organization : " + userOrgName,
						result: user1.orgCategories
					});
				}
			})
		} else {
			console.log("user Not found");
			res.json({
				status: "Failed",
				message: "User / Organization not found: " + err.message
			});
		}
	})
}

exports.listCategories = async (req, res) => {
	console.log("Inside add categories function");
	let userOrgName = req.userOrgName;
	let userOrgID = req.userOrgID;
	let userOrgAdminemail = req.userOrgAdminemail;
	//let categories = req.body.categories;
	//console.log("Received categories are ", categories);
	genericUser.findOne({
		$and:
			[{ userOrgName: userOrgName },
			{ userOrgID: userOrgID },
			{ userOrgemail: userOrgAdminemail }]
	}, function (err, user1) {
		if (user1) { //Add the category in Database
			console.log("Before pushing ", user1.orgCategories);
			//user1.orgCategories.push(categories);
			console.log("After pushing ", user1.orgCategories);
			res.json({
				status: "Success",
				message: "",
				result: user1.orgCategories
			});
		} else {
			console.log("user Not found");
			res.json({
				status: "Failed",
				message: "User / Organization not found: " + err.message
			});
		}
	})
}

//For Registering Organization Users for Generic POE
exports.registerOrgUser = async (req, res) => {
	/************************************* req needs **********
						userOrgName
						userOrgID						
						userOrgAdminemail
						fullname
						userEmail
						password  = random pass
						orgName
						//attr = genpoeuser
	***********************************************************/
	//var attr1;


	/// Taken from Token Directly
	var userOrgName = req.userOrgName;
	var userOrgID = req.userOrgID;
	var userOrgAdminemail = req.userOrgemail;

	///Required fields from Admin for creating new user
	var userFullName = req.body.userFullName;
	var userPasswd = req.body.userPasswd;
	var userConfPasswd = req.body.userConfPasswd;
	// var confpass = req.body.confpass;
	var userEmail = req.body.userEmail;
	console.log(req.body);
	//var attr = req.body.attr;
	//var orgName = req.body.orgName;
	var orgname = req.orgname;
	var shouldReturnFromFuntion = false;
	console.log('inside /generic/orgUserReg ', orgname)
	logger.info('End point : /generic/orgUserReg');

	//Handle if passwords not match
	if (userPasswd != userConfPasswd) {

		//shouldReturnFromFuntion = true;
		console.log("Passwords mismatch " + userPasswd + " " + userConfPasswd);
		let eRes = {
			status: "Failed",
			message: "Password and ConfPasswd does not matched",
			result: "Password and ConfPasswd does not matched"
		};
		res.json(eRes);
		return;
	}




	await validate.validateUserName(userOrgName).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgName valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgName Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;


	await validate.validateUserName(userFullName).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userFullName valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userFullName Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;

	await validate.validateOrgID(userOrgID).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgID valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgID Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;

	userOrgAdminemail = userOrgAdminemail.toString();
	await validate.validateEmail(userOrgAdminemail).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgemail valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgemail Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;


	userEmail = userEmail.toString();
	await validate.validateEmail(userEmail).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userEmail valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userEmail Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;

	await validate.validatePassword(userPasswd).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userPasswd valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userPasswd Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;


	//if(attr !== "Admin"){
	if (!orgname) {
		res.send(common.getErrorMessage('\'orgname\''));
		return;
	}
	//}

	//attr1 = "writer";


	var capToken = req.body.recaptcha;
	console.log('recaptcha is ', capToken);

	request({
		url: recaptcha.googleUrl,
		method: "POST",
		json: true,   // <--Very important!!!
		qs: {
			secret: recaptcha.secret,
			response: capToken
		}
	}, async function (error, response) {
		if (response) {
			//console.log(response.body);registerUser
			if (response.body.success === true) {
				console.log("captcha valid");
				message = "valid";
				var regdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
				//var regdate = Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime);
				//Admin User Validation
				genericUser.findOne({
					$and:
						[{ userOrgName: userOrgName },
						{ userOrgID: userOrgID },
						{ userOrgemail: userOrgAdminemail }]
				}, async function (err, org1) {
					if (err) {
						console.log(chalk.bgRed("Organization / OrgID / Adminemail Not Exists"));
						res.json({
							status: "Failed",
							message: "Organization / OrgID / Adminemail Not Exists"
						});
						return;
					} else if (org1.role != "Admin") {
						console.log(chalk.bgRed("Requestor is Not an Admin"));
						res.json({
							status: "Failed",
							message: "Requestor is Not an Admin"
						});
						return;
					} else if (org1 && org1.role == "Admin") {
						console.log(chalk.bgRed("Organization exists.. user is Admin"));
						//token exp 1800 = 30*60 = 30mins
						//token exp 30days = 30*24*60*60 = 2592000
						var token = jwt.sign({
							//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
							//exp: Math.floor(Date.now().valueOf() / 1000) + 300,
							exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
							userOrgName: userOrgName,
							userOrgID: userOrgID,
							userEmail: userEmail,
							userFullName: userFullName,
							orgname: orgname,
							role: "user"
						}, gconfig.secret);
						let response = await registerUser(userEmail, orgname, attr1, true);
						//	logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
						if (response && typeof response !== 'string') {
							//	logger.debug('Successfully registered the username %s for organization %s', username, orgName);
							rtelib.raiseEvent('blockchain', 'userRegistration', {
								ts: common.cts(),
								userEmail: userEmail,
								orgname: orgname,
								role: attr
							});


							//response.token = token;
							// storing the userdetails in database
							let saltRounds = 10;
							bcrypt.hash(userPasswd, saltRounds, function (err, hashedpwd) {
								userPasswd = hashedpwd;
								let user = new genericUser({
									userOrgName: userOrgName,
									userOrgID: userOrgID,
									password: userPasswd,
									fullName: userFullName,
									userOrgemail: userEmail,
									orgname: orgname,
									role: "user",
									token: token,
									regDate: regdate,
									enable: false,
									reset: false

								});

								//check if user exists or not
								genericUser.findOne({
									$and:			//User.findOne({
										[{ userOrgName: userOrgName },
										{ userOrgID: userOrgID },
										{ userOrgemail: userEmail }]
								}, function (err, user1) {
									if (user1) {

										console.log(user1)
										res.json({
											status: "Failed",
											message: "User already exists"
										});
									} else {
										// BCT user
										//user.save((err, newUser) => {
										user.save((err, newUser) => {
											if (err) {
												res.json({
													status: "Failed",
													message: "Error creating new user: " + err.message
												});
											} else {
												sendConfirmationMail_Org(userOrgID, userOrgAdminemail, userOrgName, userEmail, userFullName).then((res) => {
													//sendConfirmationMail(userEmail, userFullName).then((res) => {
													//helper.sendConfirmationMail(email, fullname).then((res) => {
													console.log(res)
												}).catch((err) => {
													console.log(err)
												})
												console.log(newUser + " saved in db successfully");
												//	res.statusCode = 200;
												//	res.message = "User registered successfully";
												//	res.json(newUser);
												//res.json(response);
												res.json({
													status: "Success",
													message: "User created Successfully"
													//message: "Please activate your acount by clicking on the verification link sent to your registered e-mail address"
												});
											}
										});
									}
									if (err) {
										console.log(err);
									}

								})
							});

						} else {
							logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
							res.json({
								status: "Failed",
								message: response
							});
						}
					}
				});


			}
		}
	});



};

exports.registerOrgUserNC = async (req, res) => {
	/************************************* req needs **********
						userOrgName
						userOrgID						
						userOrgAdminemail
						fullName
						userEmail
						password = random pass
						orgName
						//attr = genpoeuser
	***********************************************************/
	var attr1;

	/// Taken from Token Directly
	var userOrgName = req.userOrgName;
	var userOrgID = req.userOrgID;
	var userOrgAdminemail = req.userOrgemail;

	///Required fields from Admin for creating new user
	var userFullName = req.body.userFullName;
	var userPasswd = req.body.userPasswd;
	var userConfPasswd = req.body.userConfPasswd;

	var userEmail = req.body.userEmail;

	var orgname = req.orgname;
	var shouldReturnFromFuntion = false;
	console.log('inside /generic/orgUserRegNC ', orgname)
	logger.info('End point : /generic/orgUserReg');

	console.log(req.body);

	//Handle if passwords not match
	if (userPasswd != userConfPasswd) {
		//shouldReturnFromFuntion = true;
		let eRes = {
			status: "Failed",
			message: "Password and ConfPasswd does not matched",
			result: "Password and ConfPasswd does not matched"
		};
		res.json(eRes);
		return;
	}

	await validate.validateUserName(userOrgName).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgName valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgName Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;


	await validate.validateUserName(userFullName).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userFullName valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userFullName Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;

	await validate.validateOrgID(userOrgID).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgID valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgID Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;

	userOrgAdminemail = userOrgAdminemail.toString();
	await validate.validateEmail(userOrgAdminemail).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgemail valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgemail Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;


	userEmail = userEmail.toString();
	await validate.validateEmail(userEmail).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userEmail valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userEmail Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;

	await validate.validatePassword(userPasswd).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userPasswd valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userPasswd Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;


	//if(attr !== "Admin"){
	if (!orgname) {
		res.send(common.getErrorMessage('\'orgname\''));
		return;
	}
	//}	
	//attr1 = "writer";			
	//console.log(response.body);
	var regdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
	//var regdate = Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime);
	//Admin User Validation
	genericUser.findOne({
		$and:
			[{ userOrgName: userOrgName },
			{ userOrgID: userOrgID },
			{ userOrgemail: userOrgAdminemail }]
	}, async function (err, org1) {
		if (err) {
			console.log(chalk.bgRed("Organization / OrgID / Adminemail Not Exists"));
			res.json({
				status: "Failed",
				message: "Organization / OrgID / Adminemail Not Exists"
			});
			return;
		} else if (org1.role != "admin") {
			console.log(chalk.bgRed("Requestor is Not an Admin"));
			res.json({
				status: "Failed",
				message: "Requestor is Not an Admin"
			});
			return;
		} else if (org1 && org1.role == "admin") {
			console.log(chalk.bgRed("Organization exists.. user is Admin"));
			//token exp 1800 = 30*60 = 30mins
			//token exp 30days = 30*24*60*60 = 2592000
			var token = jwt.sign({
				//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
				//exp: Math.floor(Date.now().valueOf() / 1000) + 300,
				exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
				userOrgName: userOrgName,
				userOrgID: userOrgID,
				userEmail: userEmail,
				userFullName: userFullName,
				orgname: orgname,
				role: "user"
			}, gconfig.secret);
			let response = await registerUser(userEmail, orgname, attr1, true);
			//	logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
			if (response && typeof response !== 'string') {
				//	logger.debug('Successfully registered the username %s for organization %s', username, orgName);
				rtelib.raiseEvent('blockchain', 'userRegistration', {
					ts: common.cts(),
					userEmail: userEmail,
					orgname: orgname,
					role: "user"
				});

				// storing the userdetails in database
				let saltRounds = 10;
				bcrypt.hash(userPasswd, saltRounds, function (err, hashedpwd) {
					userPasswd = hashedpwd;
					let user = new genericUser({
						userOrgName: userOrgName,
						userOrgID: userOrgID,
						password: userPasswd,
						fullName: userFullName,
						userOrgemail: userEmail,
						orgname: orgname,
						role: "user",
						token: token,
						regDate: regdate,
						enable: false,
						reset: false

					});

					//check if user exists or not
					genericUser.findOne({
						$and:
							[{ userOrgName: userOrgName },
							{ userOrgID: userOrgID },
							{ userOrgemail: userEmail }]
					}, function (err, user1) {
						if (user1) {

							console.log(user1)
							res.json({
								status: "Failed",
								message: "User already exists"
							});
						} else {
							// BCT user
							//user.save((err, newUser) => {
							user.save((err, newUser) => {
								if (err) {
									res.json({
										status: "Failed",
										message: "Error creating new user: " + err.message
									});
								} else {

									sendConfirmationMail_Org(userOrgID, userOrgAdminemail, userOrgName, userEmail, userFullName).then((res) => {
										//sendConfirmationMail(userEmail, userFullName).then((res) => {
										//helper.sendConfirmationMail(email, fullname).then((res) => {
										console.log(res)
									}).catch((err) => {
										console.log(err)
									})
									console.log(newUser + " saved in db successfully");

									res.json({
										status: "Success",
										message: "User created Successfully"
										//message: "Please activate your acount by clicking on the verification link sent to your registered e-mail address"
									});
								}
							});
						}
						if (err) {
							console.log(err);
						}

					})
				});

			} else {
				logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
				res.json({
					status: "Failed",
					message: response
				});
			}
		}
	});
};


//For Authenticating and Login for Organization Users(both Admin and normal users) for Generic POE
exports.genericOrgAuthenticate = async (req, res) => {
	//req needs only username and password from calling entity

	console.log('genericOrgAuthenticate::: basic auth pass ', req.headers.authorization)
	let basicData = req.headers.authorization;

	let b64string = basicData.split(' ')[1];

	let buf = new Buffer.from(b64string, 'base64').toString('utf-8');
	console.log('buffer is ', buf);
	let signinData = buf.split(':');
	let userOrgID = signinData[0];
	let userOrgemail = signinData[1];
	let password = signinData[2];
	var shouldReturnFromFuntion = false;

	console.log('OrgID userOrgemail pass is ', signinData[0], signinData[1], signinData[2]);
	//console.log('user pass is ', username, password);


	await validate.validateOrgID(userOrgID).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgID valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgID Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;

	await validate.validatePassword(password).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('password valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('password Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;


	userOrgemail = userOrgemail.toString();
	await validate.validateEmail(userOrgemail).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgemail valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgemail Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;


	var adminemail = "";
	var capToken = req.body.recaptcha;
	console.log('recaptcha is ', capToken);

	request({
		url: recaptcha.googleUrl,
		method: "POST",
		json: true,   // <--Very important!!!
		qs: {
			secret: recaptcha.secret,
			response: capToken
		}
	}, function (error, response) {
		if (response) {
			//console.log(response.body);
			if (response.body.success === true) {
				console.log("captcha valid");
				message = "valid";
				genericUser.findOne({
					$and:
						[{ userOrgID: userOrgID },
						{ userOrgemail: userOrgemail }]
				}, function (err, user1) {

					if (user1 == null) {
						res.send({
							status: "Failed",
							message: 'User with provided OrgID and email is not present'
						});
						return;
					}
					console.log('db pass = ', user1.password)
					bcrypt.compare(password, user1.password, async function (err, bres) {
						console.log('inside bctuser compare ', bres);
						if (bres == true) {
							if (user1.role == "admin") {
								console.log(user1.role);
								role = "admin";
							} else if (user1.role === "user") {
								console.log(user1.role);
								role = "user";
							}

							//Query for retrieving organization admin email ID
							await genericUser.findOne({
								$and:
									[{ userOrgID: userOrgID },
									{ role: "admin" }]
							}).then(user1 => {
								adminemail = user1.userOrgemail;
								console.log("Admin email is ", adminemail);
							}).catch(err => {
								console.log("Unable to get admin user data");
							})

							// function (err, user1) {

							// 	if (user1 == null) {
							// 		console.log("Unable to get admin user data");
							// 	} else {
							// 		adminemail = user1.userOrgemail;
							// 		console.log("Admin email is ", adminemail);
							// 	}
							// });
							//token exp 300 = 5*60 = 5mins
							//token exp 1800 = 30*60 = 30mins
							//token exp 30days = 30*24*60*60 = 2592000

							var token = jwt.sign({
								//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
								// exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
								//exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
								// expiryIn: '1hr',
								exp: Math.floor(Date.now().valueOf() / 1000) + 60 * 60, //For 1 Hour. Replace 60 with Num of minutes to change it
								userOrgID: userOrgID,
								userOrgName: user1.userOrgName,
								userOrgAdminemail: adminemail,
								userOrgemail: userOrgemail,
								fullname: user1.fullName,
								orgname: user1.orgname,
								role: role,
								regDate: user1.regDate
							}, gconfig.secret);

							////If user is from Other than general POE then use this
							genericUser.update({ "userOrgID": userOrgID, "userOrgemail": userOrgemail }, { $set: { "token": token, "reset": false } }, function (err, rowsUpdated) {
								if (err) {
									logger.debug("Token Update failed for genericUser:", err);

								} else {
									console.log("Token updated for genericUser ", userOrgemail);
								}

							});


							if (user1 && user1.enable === true) {

								if (user1.role === "admin") {
									res.send({
										status: "Success",
										token: token,
										message: "Administrator logged in Successfully"
									});
								}
								else {

									res.send({
										status: "Success",
										token: token,
										message: " User Login Successful"
									});
								}


								//logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
								//return next();
							} else if (user1 && user1.enable === false) {
								res.send({
									status: "Failed",
									message: 'User is disabled'
								});
								return;
							} else if (err) {
								res.send({
									status: "Failed",
									message: err
								});
								return;
							}
						} else {
							res.send({
								status: "Failed",
								message: err
							});
							return;
						}
					});
				});
			}
		}
	});


	// var username = req.body.username;
	// var password = req.body.password;

	// console.log(username)
	// console.log(password)
	//User.findOne({

};

exports.genericOrgAuthenticateNC = async (req, res) => {
	//req needs only username and password from calling entity

	console.log('genericOrgAuthenticateNC::: basic auth pass ', req.headers.authorization)
	let basicData = req.headers.authorization;

	let b64string = basicData.split(' ')[1];

	let buf = new Buffer.from(b64string, 'base64').toString('utf-8');
	console.log('buffer is ', buf);
	let signinData = buf.split(':');
	let userOrgID = signinData[0];
	let userOrgemail = signinData[1];
	let password = signinData[2];
	var shouldReturnFromFuntion = false;

	console.log('OrgID userOrgemail pass is ', signinData[0], signinData[1], signinData[2]);
	//console.log('user pass is ', username, password);


	await validate.validateOrgID(userOrgID).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgID valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgID Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;

	await validate.validatePassword(password).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('password valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('password Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;


	userOrgemail = userOrgemail.toString();
	await validate.validateEmail(userOrgemail).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgemail valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgemail Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;






	//console.log(response.body);
	var adminemail = "";

	genericUser.findOne({
		$and:
			[{ userOrgID: userOrgID },
			{ userOrgemail: userOrgemail }]
	}, function (err, user1) {

		if (user1 == null) {
			res.send({
				status: "Failed",
				message: 'User with provided OrgID and email is not present'
			});
			return;
		}
		console.log('db pass = ', user1.password)
		bcrypt.compare(password, user1.password, async function (err, bres) {
			console.log('inside bctuser compare ', bres);
			if (bres == true) {
				if (user1.role == "admin") {
					console.log(user1.role);
					role = "admin";
				} else if (user1.role === "user") {
					console.log(user1.role);
					role = "user";
				}


				//Query for retrieving organization admin email ID
				await genericUser.findOne({
					$and:
						[{ userOrgID: userOrgID },
						{ role: "admin" }]
				}).then(user1 => {
					adminemail = user1.userOrgemail;
					console.log("Admin email is ", adminemail);
				}).catch(err => {
					console.log("Unable to get admin user data");
				})

				// function (err, user1) {

				// 	if (user1 == null) {
				// 		console.log("Unable to get admin user data");
				// 	} else {
				// 		adminemail = user1.userOrgemail;
				// 		console.log("Admin email is ", adminemail);
				// 	}
				// });

				//token exp 300 = 5*60 = 5mins
				//token exp 1800 = 30*60 = 30mins
				//token exp 30days = 30*24*60*60 = 2592000

				var token = jwt.sign({
					//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
					// exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
					//exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
					// expiryIn: '1hr',
					exp: Math.floor(Date.now().valueOf() / 1000) + 60 * 60, //For 1 Hour. Replace 60 with Num of minutes to change it
					userOrgID: userOrgID,
					userOrgName: user1.userOrgName,
					userOrgAdminemail: adminemail,
					userOrgemail: userOrgemail,
					fullname: user1.fullName,
					orgname: user1.orgname,
					role: role,
					regDate: user1.regDate
				}, gconfig.secret);

				////If user is from Other than general POE then use this
				genericUser.update({ "userOrgID": userOrgID, "userOrgemail": userOrgemail }, { $set: { "token": token, "reset": false } }, function (err, rowsUpdated) {
					if (err) {
						logger.debug("Token Update failed for genericUser:", err);

					} else {
						console.log("Token updated for genericUser ", userOrgemail);
					}

				});


				if (user1 && user1.enable === true) {

					if (user1.role === "admin") {
						res.send({
							status: "Success",
							token: token,
							message: "Administrator logged in Successfully"
						});
					}
					else {

						res.send({
							status: "Success",
							token: token,
							message: " User Login Successful"
						});
					}


					//logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
					//return next();
				} else if (user1 && user1.enable === false) {
					res.send({
						status: "Failed",
						message: 'User is disabled'
					});
					return;
				} else if (err) {
					res.send({
						status: "Failed",
						message: err
					});
					return;
				}
			} else {
				res.send({
					status: "Failed",
					message: err
				});
				return;
			}
		});
	});





	// var username = req.body.username;
	// var password = req.body.password;

	// console.log(username)
	// console.log(password)
	//User.findOne({

};

//Login and change password with salting
exports.genericOrgChangePassword = async (req, res) => { // USe this for full salting

	//var attr1;
	//var username = req.username;

	let userOrgID = req.userOrgID;
	let userOrgName = req.userOrgName;
	let userOrgemail = req.userOrgemail;
	let userOrgAdminemail = req.userOrgAdminemail;
	let userOrgUserName = req.userOrgUserName;

	let shouldReturnFromFuntion = false;

	var password = req.body.password;
	var newpassword = req.body.newpassword;
	var confirmpassword = req.body.confirmpassword;

	//Username field contains email ID. SO validating email with name username
	await validate.validateEmail(userOrgemail).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;
	validate.validatePassword(password).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('password valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('password Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;
	validate.validatePassword(newpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('newpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('newpassword Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;
	validate.validatePassword(confirmpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('confirmpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('confirmpassword Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;


	if (newpassword != confirmpassword) {
		res.send(common.getErrorMessage('\'Mismatch in NewPassword and confirm password\''));
		return;
	}
	//check if user exists or not


	genericUser.findOne({
		$and:			//User.findOne({
			[{ userOrgName: userOrgName },
			{ userOrgID: userOrgID },
			{ userOrgemail: userOrgemail }]
	}, async function (err, user1) {
		if (user1) {
			bcrypt.compare(password, user1.password, function (err, match) {
				console.log('inside compare ', match);
				if (match === true) {
					let saltRounds = 10;
					bcrypt.hash(newpassword, saltRounds, function (err, hashedpwd) {
						if (err) {
							console.log(chalk.bgRed('salting passwd failed ', err));
							return;
						} else {
							newpassword = hashedpwd;

							console.log(chalk.bgGreen('salting password success ', newpassword));
							genericUser.update({
								$and:			//User.findOne({
									[{ userOrgName: userOrgName },
									{ userOrgID: userOrgID },
									{ userOrgemail: userOrgemail }]
							}, {
								$set: {
									"password": newpassword
								}
							},
								function (err, rowsUpdated) {
									if (err) {
										//	console.log("Update failed:", err);
										res.json({
											status: "Failed",
											message: "Passwd change failed: " + err
										});
									}
									console.log(chalk.bgGreen("Password changed successfully User details updated"));
									res.json({
										status: "Success",
										message: "Password changed successfully for " + userOrgUserName
									});
								});
						}
					});
				} else if (match === false) {
					res.json({
						status: "Failed",
						message: "Old Password not matched"
					});
				}
			})
		} else {
			res.json({
				status: "Failed",
				message: "User not found for changing the password"
			});
		}
	})

};

exports.genericOrgForgotPwd = async (req, res) => {

	//let userOrgID = req.body.userOrgID;
	//let userOrgName = req.userOrgName;
	//let userOrgemail = req.body.userOrgemail;
	//let userOrgAdminemail = req.userOrgAdminemail;
	//let userOrgUserName = req.userOrgUserName;
	let email = req.body.email

	let shouldReturnFromFuntion = false
	var userfromdb
	var capToken = req.body.recaptcha;
	console.log('recaptcha is ', capToken);

	//validate userOrgID
	/* await validate.validateOrgID(userOrgID).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('userOrgID valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('userOrgID Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFuntion) return;
 */
	await validate.validateEmail(email).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
			res.json(vres);
			shouldReturnFromFuntion = true;
			return;
		}
	})
	if (shouldReturnFromFuntion) return;
	request({
		url: recaptcha.googleUrl,
		method: "POST",
		json: true,   // <--Very important!!!
		qs: {
			secret: recaptcha.secret,
			response: capToken
		}
	}, async function (error, response) {
		if (response) {
			//console.log(response.body);
			if (response.body.success === true) {
				console.log("captcha valid");
				message = "valid";
				// chek user
				await genericUser.findOne({					
					userOrgemail: email 
				}).then((user) => {

					//user does not exist
					/* if (!user) {
						shouldReturnFromFuntion = true
						res.json({
							status: "Failed",
							message: "User does not exist"
						});
						return
					} */
					if (!user || !user.isEmailVerified) {
						shouldReturnFromFuntion = true
						res.json({
							status: "Failed",
							message: "User account is not Registered / Activated. Please check your email for the activation link if already registered."
						});
						return
					}
					userfromdb = user
				})
				if (shouldReturnFromFuntion) return

				//helper.sendForgotpwdMail(email, userfromdb.fullname).then((res) => {
				sendOrgForgotpwdMail(userfromdb).then((res) => {
					console.log(res)
				}).catch((err) => {
					console.log(err)
				})
				res.json({
					status: "Success",
					message: "Link to change password is sent to your registered email ID"
					//message: "Please use the link sent to your registered e-mail address to change your password [valid for 24 hours only]"
				});
			}
		}
	});


}
//TODO
exports.genericOrgforgotpwdchange = async (req, res) => {
	console.log('genericOrgforgotpwdchange:::')

	var token = req.body.token
	var newpassword = req.body.newpassword
	var confirmpassword = req.body.confirmpassword
	var tokenValidationResponse
	var shouldReturnFromFuntion = false
	var capToken = req.body.recaptcha;

	/* var userOrgID = req.userOrgID;
	var userOrgName = req.userOrgName;
	var userOrgemail = req.userOrgemail ;
	var userOrgAdminemail = req.userOrgAdminemail ;
	var userOrgUserName = req.userOrgUserName; */

	console.log('recaptcha is ', capToken);

	validate.validatePassword(newpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('newpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('newpassword Invalid ', vres.message));
			res.json(vres);
		}
	})

	validate.validatePassword(confirmpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('confirmpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('confirmpassword Invalid ', vres.message));
			res.json(vres);
		}
	})

	request({
		url: recaptcha.googleUrl,
		method: "POST",
		json: true,   // <--Very important!!!
		qs: {
			secret: recaptcha.secret,
			response: capToken
		}
	}, async function (error, response) {
		if (response) {
			//console.log(response.body);
			if (response.body.success === true) {
				console.log("captcha valid");
				message = "valid";

				if (!newpassword) {
					res.send(common.getErrorMessage('\'password\''));
					return;
				}
				if (!confirmpassword) {
					res.send(common.getErrorMessage('\'confirm password\''));
					return;
				}
				if (newpassword != confirmpassword) {
					res.send(common.getErrorMessage('\'Mismatch in NewPassword and confirm password\''));
					return;
				}


				//await helper.verifyMailByToken(token)
				await verifyMailByToken_Org(token)
					.then((res) => {
						console.log("verifyMailByToken_Org success", res)
						tokenValidationResponse = res
					})
					.catch((err) => {
						console.log("verifyMailByToken_Org err", err)
						shouldReturnFromFuntion = true
						res.json({
							status: "Failed",
							message: " failed"
						});

					})
				if (shouldReturnFromFuntion) return

				/**
				 * Check if user exist
				 */
				if (tokenValidationResponse && tokenValidationResponse.status == "Success") {
					await genericUser.findOne({
						"userOrgemail": tokenValidationResponse.email
					}).then((user) => { }).catch((err) => {
						if (err) {
							shouldReturnFromFuntion = true
							res.json({
								status: "Failed",
								message: "User does not exist"
							});
							return
						}
					})
				}
				if (shouldReturnFromFuntion) return

				let saltRounds = 10;
				console.log('new password for '+ tokenValidationResponse.email + ' is ', newpassword);
				bcrypt.hash(newpassword, saltRounds, function (err, hashedpwd) {
					if (err) {
						console.log(chalk.bgRed('salting passwd failed ', err));
						return;
					} else {
						newpassword = hashedpwd;

						console.log(chalk.bgGreen('forgot change pwd salting password success ', newpassword));

						genericUser.update({
							"userOrgemail": tokenValidationResponse.email
						}, {
							$set: {
								"password": newpassword
							}
						},							
							function (err, rowsUpdated) {
								if (err) {
									res.json({
										status: "Failed",
										message: "Password change failed: " + err
									});
								}
								console.log(chalk.bgGreen("forgot change Password changed successfully User details updated"));
								res.json({
									status: "Success",
									message: "Password changed successfully"
								});
							}
						);
					}
				});
			}
		}
	});


}

exports.genericOrgUsersList = async (req, res) => {
	let resultLisT = [];
	/* var userOrgID = req.body.userOrgID;
	var userOrgName = req.body.userOrgName; */
	var userOrgID = req.userOrgID;
	var userOrgName = req.userOrgName;
	var role = req.role;
	var profiles;
	let iterator = 0;
	var shouldReturnFromFuntion = false;

	console.log("userOrgID ", userOrgID);
	console.log("userOrgName ", userOrgName);
	//To retrieve user details from DB
	/* await genericUser.find({
		userOrgID: userOrgID
	}, */
	if (role != "admin") {
		console.log("Only Admin can view the list of Users in the Organization");
		res.send({
			status: "Failed",
			message: "Only Admin can view the list of Users in the Organization"
		});
		shouldReturnFromFuntion = true;
	}
	if (shouldReturnFromFuntion) return;

	await genericUser.find({
		$and:
			[{ userOrgID: userOrgID },
			{ userOrgName: userOrgName }]
	},
		{
			fullName: 1,
			userOrgemail: 1,
			userOrgName: 1,
			role: 1,
			regDate: 1,
			enable: 1
		}).then(async (uprofiles) => {
			if (uprofiles) {
				profiles = uprofiles;
			} else {
				shouldReturnFromFuntion = true;
				res.send({
					status: "Failed",
					message: "No Users found for this Organization",
					result: ""
				});
			}

		});
	if (shouldReturnFromFuntion) return;
	//console.log(chalk.bgCyan(uprofiles));
	console.log(chalk.bgCyan("uprofiles length is " + profiles.length));

	profiles.forEach(async (prof) => {
		//iterator++;
		// if(prof.fullName != "Administrator") {

		// }

		//To retrieve count of documents uploaded by each user
		await genericpoedata.find({ "issuerOrgUserEmail": prof.userOrgemail }).count(function (err, count) {
			console.log(chalk.bgCyan("docs uploaded by user " + prof.userOrgemail + "are" + count));

			prof = JSON.parse(JSON.stringify(prof))

			prof.count = count;

			resultLisT.push(prof);
			//console.log("resultLisT is ", resultLisT)
			iterator++;
			if (profiles.length === iterator) {

				//Filters the response and sends only Non-Admin Users
				resultLisT = resultLisT.filter(a =>
					a.fullName != "Administrator"
				)
				//console.log("resultLisT is ", resultLisT)
				console.log("profiles iterating completed and sending Response iterator ", iterator);
				res.send({
					status: "Success",
					message: "Details of Organization users",
					result: resultLisT
				});
			}
		})

	});
}

exports.genericOrgUserProfileInfo = async (req, res) => {
	//let resultLisT = [];
	/* var userOrgID = req.body.userOrgID;
	var userOrgName = req.body.userOrgName; */
	var userOrgID = req.userOrgID;
	var userOrgName = req.userOrgName;
	var userOrgemail = req.userOrgemail;
	var role = req.role;
	var profile;
	//let iterator = 0;
	var shouldReturnFromFuntion = false;

	console.log("userOrgID ", userOrgID);
	console.log("userOrgName ", userOrgName);
	console.log("userOrgemail ", userOrgemail);
	console.log("role ", role);

	await genericUser.findOne({
		$and:
			[{ userOrgID: userOrgID },
			{ userOrgemail: userOrgemail }]
	},
		{
			fullName: 1,
			userOrgemail: 1,
			userOrgName: 1,
			role: 1,
			regDate: 1,
			enable: 1
		}).then(async (uprofile) => {
			if (uprofile) {
				profile = uprofile;
			} else {
				shouldReturnFromFuntion = true;
				res.send({
					status: "Failed",
					message: "No User found for this Organization",
					result: ""
				});
			}

		});
	if (shouldReturnFromFuntion) return;

	//To retrieve count of documents uploaded by each user
	await genericpoedata.find({ "issuerOrgUserEmail": profile.userOrgemail }).count(function (err, count) {
		console.log(chalk.bgCyan("docs uploaded by user " + profile.userOrgemail + "are" + count));

		profile = JSON.parse(JSON.stringify(profile))

		profile.count = count;

		res.send({
			status: "Success",
			message: "Details of Organization user",
			result: profile
		});

	})


}
exports.genericOrgUserProfileInfo_old = async (req, res) => {
	var resultLisT = [];
	var userOrgID = req.body.userOrgID;
	var userOrgName = req.body.userOrgName;
	var iterator = 0;
	console.log("userOrgID ", userOrgID);
	console.log("userOrgName ", userOrgName);
	//To retrieve user details from DB
	/* await genericUser.find({
		userOrgID: userOrgID
	}, */
	await genericUser.find({
		$and:
			[{ userOrgID: userOrgID },
			{ userOrgName: userOrgName }]
	},
		{
			fullName: 1,
			userOrgemail: 1,
			role: 1,
			regDate: 1,
			enable: 1
		}).then(async (uprofiles) => {
			//console.log(chalk.bgCyan(uprofiles));
			console.log(chalk.bgCyan("uprofiles length is " + uprofiles.length));
			uprofiles.forEach(async (prof) => {
				iterator++;
				//To retrieve count of documents uploaded by each user
				await genericpoedata.find({ "issuerOrgUserEmail": prof.userOrgemail }).count(function (err, count) {
					console.log(chalk.bgCyan("docs uploaded by user" + prof.userOrgemail + "are" + count));
					prof.count = count;
					resultLisT.push(prof);
				})
				if (uprofiles.length === iterator) {
					console.log("profiles iterating completed and sending Response iterator", iterator);
					res.send(resultLisT);
				}

			});

		})
}

exports.genericpoeactivateuser = async (req, res) => {
	console.log('genericpoeauth::: activate user ')

	var token = req.body.token
	var tokenValidationResponse
	var shouldReturnFromFuntion = false


	//await helper.verifyMailByToken(token)
	await verifyMailByToken_Org(token)
		.then((res) => {
			console.log("verifyMailByToken_Org success", res)
			tokenValidationResponse = res
		})
		.catch((err) => {
			console.log("verifyMailByToken_Org err", err)
			shouldReturnFromFuntion = true
			res.json({
				status: "Failed",
				message: "Verification failed"
			});

		})
	if (shouldReturnFromFuntion) return


	/**
	 * Check if user exist
	 * check if already activated
	 */
	if (tokenValidationResponse && tokenValidationResponse.status == "Success") {
		await genericUser.findOne({
			"userOrgemail": tokenValidationResponse.email
		}).then((user) => {
			if (user.enable == true) {
				shouldReturnFromFuntion = true
				res.json({
					status: "Failed",
					message: "User already activated"
				});
				return
			}

		}).catch((err) => {
			if (err) {
				shouldReturnFromFuntion = true
				res.json({
					status: "Failed",
					message: "User does not exist"
				});
				return
			}
		})
	}
	if (shouldReturnFromFuntion) return


	if (tokenValidationResponse && tokenValidationResponse.status == "Success") {
		genericUser.update({
			"userOrgemail": tokenValidationResponse.email
		}, {
			$set: {
				"enable": true,
				"isEmailVerified": true
			}
		}, function (err, rowsUpdated) {
			if (err) {
				console.log("verifyMailByToken_Org token update failed")
				res.json({
					status: "Failed",
					message: "Verification failed"
				});
				return
			}
			console.log(rowsUpdated)
			res.json({
				status: "Success",
				message: "Verification successful"
			});
		}
		)
	}
}

exports.genericpoeuserupdate = (req, res) => {

	//var token = req.body.token;
	var userOrgAdminemail = req.userOrgemail;
	var userEmail = req.body.userEmail;
	var role = req.role;
	var enable = req.body.enable;
	let shouldReturnFromFuntion = false;

	console.log(req.body.enable)

	if (role != "admin") {
		shouldReturnFromFuntion = true;
		res.send({
			status: "Failed",
			message: "Admin only can do this action"
		});
	}
	if (shouldReturnFromFuntion) return;

	genericUser.findOne({
		userOrgemail: userOrgAdminemail
	}).then((user) => {
		if (user.enable == true && user.role == "admin") {
			console.log("Requestor for user update is admin only");
		} else {
			console.log("Requestor for user update is not a valid user / not admin");
			shouldReturnFromFuntion = true
			res.json({
				status: "Failed",
				message: "Requestor for user update is not a valid user / not admin"
			});
			return
		}

	}).catch((err) => {
		if (err) {
			shouldReturnFromFuntion = true
			res.json({
				status: "Failed",
				message: "User does not exist"
			});
			return
		}
	})
	if (shouldReturnFromFuntion) return;


	genericUser.update({
		"userOrgemail": userEmail
	}, {
		$set: {
			"enable": enable
		}
	},
		function (err, rowsUpdated) {
			if (err) {
				//	console.log("Update failed:", err);
				logger.debug("Update failed:", err);
				res.json({
					status: "Failed",
					message: "User updation failed"
				});
			}
			console.log("User with email ID " + userEmail + " is updated");
		})
	if (enable === true)
		res.send({
			status: "Success",
			message: "Token enabled"
		});
	else
		res.send({
			status: "Success",
			message: "Token disabled"
		});
};

exports.genericpoeorgGetLogo = async (req, res) => {

	var logo;
	var shouldReturnFromFuntion = false;


	await genericUser.findOne({
		$and:
			[
				{ userOrgID: req.userOrgID },
				{ role: 'admin' }
			]
	},
		{
			_id : 0,
			orgLogo: 1,
		}).then(async (rlogo) => {
			console.log('Object length is ', rlogo.length);
			if (rlogo.orgLogo) {
				console.log(chalk.bgGreen('logo found with ', rlogo));
				logo = rlogo;
			} else {
				shouldReturnFromFuntion = true;
				console.log(chalk.bgRed('logo NOT found' ));
				res.send({
					status: "Failed",
					message: "Failed to get logo for this Organization",
					result: ""
				});
			}

		});
	if (shouldReturnFromFuntion) return;

	
	res.send({
		status: "Success",
		message: "Logo",
		result: logo.orgLogo
	});

}

exports.genericpoeorgUploadLogo = async (req, res) => {

	//var token = req.body.token;
	var userOrgAdminemail = req.userOrgemail;
	var role = req.role;
	let content = req.body.data
	mime = content.split(':')[1].split(';')[0];
	b64 = content.split(',')[1]
	let shouldReturnFromFuntion = false;

	console.log(userOrgAdminemail, role)
	if (role != "admin") {
		shouldReturnFromFuntion = true;
		res.send({
			status: "Failed",
			message: "Admin only can do this action"
		});
	}
	if (shouldReturnFromFuntion) return;

	isValidBase64 = false
	await validate.validateBase64(b64).then(vres => {
		if (vres.status == "Success") {
			console.log('valid logo')
			isValidBase64 = true
		} else if (vres.status == "Failed") {

			console.log(chalk.bgRed('logo base64 Invalid ', vres.message));
			shouldReturnFromFunction = true
			res.send(vres)
			shouldReturnFromFuntion = true
		}
	})
	if (shouldReturnFromFuntion) return;

	genericUser.update({
		"userOrgemail": userOrgAdminemail
	}, {
		$set: {
			"orgLogo": content
		}
	},
		function (err, rowsUpdated) {
			console.log(rowsUpdated)
			if (err) {
				//	console.log("Update failed:", err);
				logger.debug("Update failed:", err);
				res.json({
					status: "Failed",
					message: "User updation failed"
				});
			}
			console.log("Logo for User with email ID " + userOrgAdminemail + " is updated");
		})
	res.send({
		status: "Success",
		message: "Logo updated"
	});
};



/***************************END**** GENERIC POE ORGANIZATION RELATED ****************/






/********************** START ******* GENERAL POE INDIVIDUAL RELATED **********************/

//For Registering Normal Users for General POE
exports.register = async (req, res) => {
	/************************************* req needs **********
						username
						password
						confpass
						email
						orgName
						attr = genpoeuser
	***********************************************************/
	var attr1;
	var username = req.body.email;
	var fullname = req.body.fullname;
	var password = req.body.password;
	var confpass = req.body.confpass;
	var email = req.body.email;
	var attr = req.body.attr;
	//var orgName = req.body.orgName;
	var orgName = req.orgname;
	var shouldReturnFromFunction = false;
	console.log('inside genpoe register ', orgName, attr);
	logger.info('inside genpoe register ', orgName, attr);
	logger.info('End point : /genpoe/userreg');
	// logger.info('User name : ' + username);
	// logger.info('Org name  : ' + orgName);
	// if (!username) {
	// 	if(!validator.isAlphanumeric(username)) {
	// 		res.send(common.getErrorMessage('\'username\''));
	// 		return;
	// 	}
	// 	res.send(common.getErrorMessage('\'username\''));
	// 	return;
	// }

	await validate.validateUserName(fullname).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('FullName valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('FullName Invalid ', vres.message));
			logger.debug(chalk.bgRed('FullName Invalid ', vres.message));
			shouldReturnFromFunction = true
			res.json(vres);
		}
	})
	if (shouldReturnFromFunction) return;

	await validate.validatePassword(password).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('password valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('password Invalid ', vres.message));
			logger.debug(chalk.bgRed('password Invalid ', vres.message));
			shouldReturnFromFunction = true
			res.json(vres);
		}
	})
	if (shouldReturnFromFunction) return;

	//Username field contains email ID. SO validating email with name username
	await validate.validateEmail(username).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
			logger.debug(chalk.bgRed('email Invalid ', vres.message));
			shouldReturnFromFunction = true
			res.json(vres);
		}
	})
	if (shouldReturnFromFunction) return;

	await validate.validateEmail(email).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
			logger.debug(chalk.bgRed('email Invalid ', vres.message));
			shouldReturnFromFunction = true
			res.json(vres);
		}
	})
	if (shouldReturnFromFunction) return;



	if (!password) {
		res.send(common.getErrorMessage('\'password\''));
		return;
	}
	if (password != confpass) {
		res.send(common.getErrorMessage('\'confpass\''));
		return;
	}
	if (!email) {
		res.send(common.getErrorMessage('\'eMail\''));
		return;
	}
	if (!validator.isEmail(email)) {
		res.send(common.getErrorMessage('\'Invalid email\''));
		console.log(chalk.bgRed('invalid email'));
		return;
	}

	//if(attr !== "Admin"){
	if (!orgName) {
		res.send(common.getErrorMessage('\'orgName\''));
		return;
	}
	//}
	if (!attr) {
		res.send(common.getErrorMessage('\'attr\''));
		return;
	}
	if (attr === "guest" || attr === "cdacadmin" || attr === "genpoeuser") {
		attr1 = "writer";
	}

	var capToken = req.body.recaptcha;
	console.log('recaptcha is ', capToken);

	request({
		url: recaptcha.googleUrl,
		method: "POST",
		json: true,   // <--Very important!!!
		qs: {
			secret: recaptcha.secret,
			response: capToken
		}
	}, async function (error, response) {
		if (response) {
			//console.log(response.body);
			if (response.body.success === true) {
				console.log("captcha valid");
				message = "valid";
				var regdate = Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime);
				//Admin User Registration
				if (attr === "admin") {

					console.log("regdate" + regdate);
					var token = jwt.sign({
						//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
						//exp: Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime),
						//exp: regdate,
						username: username,
						orgName: "C-DAC",
						role: attr
					}, gconfig.secret);


					//encrypt the password with bcrypt
					let saltRounds = 10;
					bcrypt.hash(password, saltRounds, function (err, hashedpwd) {
						password = hashedpwd;

						let user = new genPoeUser({
							username: username,
							fullname: fullname,
							password: password,
							eMail: email,
							orgname: orgName,
							role: attr,
							token: token,
							regDate: regdate,
							enable: true,
							reset: false

						});
						user.save((err, newUser) => {
							if (err) {
								res.json({
									status: "Failed",
									message: "Error creating new user: " + err.message
								});
							} else {
								console.log(newUser + " saved in db successfully");
								logger.debug(newUser + " saved in db successfully");
								//	res.statusCode = 200;
								//	res.message = "User registered successfully";
								res.json(newUser);

								//TODO 3 Respond as user registered please verify by mail
							}
						});
					});
				}
				else { //Registering Normal Gen Poe Users
					//var regdate = new Date();
					var regdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

					//console.log("regdate" + regdate);
					//token exp 1800 = 30*60 = 30mins
					//token exp 30days = 30*24*60*60 = 2592000
					var token = jwt.sign({
						//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
						//exp: Math.floor(Date.now().valueOf() / 1000) + 300,
						exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
						username: username,
						fullname: fullname,
						orgName: orgName,
						role: attr1
					}, gconfig.secret);
					// let response = await helper.getRegisteredUser(username, orgName, attr1, true);
					let response=await registerUser.registerUser(username,orgName,attr1)
					//	logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
					if (response && typeof response !== 'string') {
						//	logger.debug('Successfully registered the username %s for organization %s', username, orgName);
						rtelib.raiseEvent('blockchain', 'userRegistration', {
							ts: common.cts(),
							userName: username,
							orgName: orgName,
							role: attr
						});
						//response.token = token;
						// storing the userdetails in database
						let saltRounds = 10;
						bcrypt.hash(password, saltRounds, function (err, hashedpwd) {
							password = hashedpwd;
							let genuser = new genPoeUser({
								username: username,
								fullname: fullname,
								password: password,
								eMail: email,
								orgname: orgName,
								role: attr,
								token: token,
								regDate: regdate,
								enable: false,
								reset: false,
								isEmailVerified: false,

							});

							//check if user exists or not
							genPoeUser.findOne({			//User.findOne({
								username: username,
								orgname: orgName
							}, function (err, user1) {
								if (user1) {
									/*User.update({
											"username": username
										}, {
											$set: {
												"token": token
											}
										},
										function (err, rowsUpdated) {
											if (err){
											//	console.log("Update failed:", err);
											res.json({
												status: "Failed",
												message: "Update failed: " + err
											});
											}
											console.log("User updated");
										})*/
									console.log(user1)
									res.json({
										status: "Failed",
										message: "User already exists"
									});
								} else {
									// BCT user
									//user.save((err, newUser) => {
									genuser.save((err, newUser) => {
										if (err) {
											res.json({
												status: "Failed",
												message: "Error creating new user: " + err.message
											});
										} else {
											sendConfirmationMail(email, fullname).then((res) => {
												//helper.sendConfirmationMail(email, fullname).then((res) => {
												console.log(res)
											}).catch((err) => {
												console.log(err)
											})
											console.log(regdate + ' ::: ' + newUser + " saved in db successfully");
											logger.debug(regdate + ' ::: ' + newUser + " saved in db successfully");
											//	res.statusCode = 200;
											//	res.message = "User registered successfully";
											//	res.json(newUser);
											//res.json(response);
											res.json({
												status: "Success",
												message: "Please activate your acount by clicking on the verification link sent to your registered e-mail address"
											});
										}
									});
								}
								if (err) {
									console.log(err);
								}

							})
						});

					} else {
						logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
						res.json({
							status: "Failed",
							message: response
						});
					}
				}
			}
		}
	});



};
//Registerering Gen Poe User without Captcha
exports.registerNC = async (req, res) => {
	/************************************* req needs **********
						username
						password
						confpass
						email
						orgName
						attr = genpoeuser
	***********************************************************/
	var attr1;
	var username = req.body.email;
	var fullname = req.body.fullname;
	var password = req.body.password;
	var confpass = req.body.confpass;
	var email = req.body.email;
	var attr = req.body.attr;
	//var orgName = req.body.orgName;
	var orgName = req.orgname;
	console.log('inside genpoe register ', orgName, attr)
	logger.info('inside genpoe register ', orgName, attr);
	logger.info('End point : /genpoe/userreg');
	// logger.info('User name : ' + username);
	// logger.info('Org name  : ' + orgName);
	// if (!username) {
	// 	if(!validator.isAlphanumeric(username)) {
	// 		res.send(common.getErrorMessage('\'username\''));
	// 		return;
	// 	}
	// 	res.send(common.getErrorMessage('\'username\''));
	// 	return;
	// }
	var shouldReturnFromFunction = false;
	await validate.validateUserName(fullname).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('FullName valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('FullName Invalid ', vres.message));
			shouldReturnFromFunction = true
			res.json(vres);
		}
	})

	if (shouldReturnFromFunction) return;

	await validate.validatePassword(password).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('password valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('password Invalid ', vres.message));
			shouldReturnFromFunction = true
			res.json(vres);
		}
	})
	if (shouldReturnFromFunction) return;

	//Username field contains email ID. SO validating email with name username
	await validate.validateEmail(username).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
			shouldReturnFromFunction = true
			res.json(vres);
		}
	})
	if (shouldReturnFromFunction) return;

	await validate.validateEmail(email).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
			shouldReturnFromFunction = true
			res.json(vres);
		}
	})
	if (shouldReturnFromFunction) return;

	if (!password) {
		res.send(common.getErrorMessage('\'password\''));
		return;
	}
	if (password != confpass) {
		res.send(common.getErrorMessage('\'confpass\''));
		return;
	}
	if (!email) {
		res.send(common.getErrorMessage('\'eMail\''));
		return;
	}
	if (!validator.isEmail(email)) {
		res.send(common.getErrorMessage('\'Invalid email\''));
		console.log(chalk.bgRed('invalid email'));
		return;
	}

	//if(attr !== "Admin"){
	if (!orgName) {
		res.send(common.getErrorMessage('\'orgName\''));
		return;
	}
	//}
	if (!attr) {
		res.send(common.getErrorMessage('\'attr\''));
		return;
	}
	if (attr === "guest" || attr === "cdacadmin" || attr === "genpoeuser") {
		attr1 = "writer";
	}

	var regdate = Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime);
	//Admin User Registration
	if (attr === "admin") {

		console.log("regdate" + regdate);
		var token = jwt.sign({
			//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
			//exp: Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime),
			//exp: regdate,
			username: username,
			orgName: "C-DAC",
			role: attr
		}, gconfig.secret);


		//encrypt the password with bcrypt
		let saltRounds = 10;
		bcrypt.hash(password, saltRounds, function (err, hashedpwd) {
			password = hashedpwd;

			let user = new genPoeUser({
				username: username,
				fullname: fullname,
				password: password,
				eMail: email,
				orgname: orgName,
				role: attr,
				token: token,
				regDate: regdate,
				enable: true,
				reset: false

			});
			user.save((err, newUser) => {
				if (err) {
					res.json({
						status: "Failed",
						message: "Error creating new user: " + err.message
					});
				} else {
					console.log(newUser + " saved in db successfully");
					logger.debug(newUser + " saved in db successfully");
					//	res.statusCode = 200;
					//	res.message = "User registered successfully";
					res.json(newUser);

					//TODO 3 Respond as user registered please verify by mail
				}
			});
		});
	}
	else { //Registering Normal Gen Poe Users
		//var regdate = new Date();
		var regdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

		console.log("regdate" + regdate);
		//token exp 1800 = 30*60 = 30mins
		//token exp 30days = 30*24*60*60 = 2592000
		var token = jwt.sign({
			//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
			//exp: Math.floor(Date.now().valueOf() / 1000) + 300,
			exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
			username: username,
			fullname: fullname,
			orgName: orgName,
			role: attr1
		}, gconfig.secret);
		let response = await helper.getRegisteredUser(username, orgName, attr1, true);
		//	logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
		if (response && typeof response !== 'string') {
			//	logger.debug('Successfully registered the username %s for organization %s', username, orgName);
			rtelib.raiseEvent('blockchain', 'userRegistration', {
				ts: common.cts(),
				userName: username,
				orgName: orgName,
				role: attr
			});
			//response.token = token;
			// storing the userdetails in database
			let saltRounds = 10;
			bcrypt.hash(password, saltRounds, function (err, hashedpwd) {
				password = hashedpwd;
				let genuser = new genPoeUser({
					username: username,
					fullname: fullname,
					password: password,
					eMail: email,
					orgname: orgName,
					role: attr,
					token: token,
					regDate: regdate,
					enable: false,
					reset: false,
					isEmailVerified: false,

				});

				//check if user exists or not
				genPoeUser.findOne({			//User.findOne({
					username: username,
					orgname: orgName
				}, function (err, user1) {
					if (user1) {
						/*User.update({
								"username": username
							}, {
								$set: {
									"token": token
								}
							},
							function (err, rowsUpdated) {
								if (err){
								//	console.log("Update failed:", err);
								res.json({
									status: "Failed",
									message: "Update failed: " + err
								});
								}
								console.log("User updated");
							})*/
						console.log(user1)
						res.json({
							status: "Failed",
							message: "User already exists"
						});
					} else {
						// BCT user
						//user.save((err, newUser) => {
						genuser.save((err, newUser) => {
							if (err) {
								res.json({
									status: "Failed",
									message: "Error creating new user: " + err.message
								});
							} else {
								sendConfirmationMail(email, fullname).then((res) => {
									//helper.sendConfirmationMail(email, fullname).then((res) => {
									console.log(res)
								}).catch((err) => {
									console.log(err)
								})
								console.log(newUser + " saved in db successfully");
								logger.debug(newUser + " saved in db successfully");
								//	res.statusCode = 200;
								//	res.message = "User registered successfully";
								//	res.json(newUser);
								//res.json(response);
								res.json({
									status: "Success",
									message: "Please activate your acount by clicking on the verification link sent to your registered e-mail address"
								});
							}
						});
					}
					if (err) {
						console.log(err);
					}

				})
			});

		} else {
			logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
			res.json({
				status: "Failed",
				message: response
			});
		}
	}
};



// Create and Save a new user
exports.create = async (req, res) => {

	var attr1;
	var username = req.body.username;
	var password = req.body.password;
	var attr = req.body.attr;
	var orgName = req.body.orgName;
	logger.info('End point : /usersbct');
	shouldReturnFromFunction = false;
	// logger.info('User name : ' + username);
	// logger.info('Org name  : ' + orgName);

	await validate.validateUserName(username).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('UserName valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('UserName Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFunction) return;

	await validate.validatePassword(password).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('password valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('password Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})

	if (shouldReturnFromFunction) return;

	if (!username) {
		res.send(common.getErrorMessage('\'username\''));
		return;
	}
	if (!password) {
		res.send(common.getErrorMessage('\'password\''));
		return;
	}
	//if(attr !== "Admin"){
	if (!orgName) {
		res.send(common.getErrorMessage('\'orgName\''));
		return;
	}
	//}
	if (!attr) {
		res.send(common.getErrorMessage('\'attr\''));
		return;
	}
	if (attr === "guest" || attr === "cdacadmin" || attr === "training") {
		attr1 = "writer";
	}

	var regdate = Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime);
	if (attr === "admin") {

		console.log("regdate" + regdate);
		var token = jwt.sign({
			//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
			//exp: Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime),
			//exp: regdate,
			username: username,
			orgName: "C-DAC",
			role: attr
		}, gconfig.secret);

		//encrypt the password with bcrypt

		let saltRounds = 10;
		bcrypt.hash(password, saltRounds, function (err, hashedpwd) {
			password = hashedpwd;
			console.log('inside create::: usersbct:::: hashed passwd of ', username, ' is ', hashedpwd);

			let user = new User({
				username: username,
				password: hashedpwd,
				orgname: orgName,
				role: attr,
				token: token,
				regDate: regdate,
				enable: true,
				reset: false

			});
			user.save((err, newUser) => {
				if (err) {
					res.json({
						status: "Failed",
						message: "Error creating new user: " + err.message
					});
				} else {
					console.log(newUser + " saved in db successfully");
					//	res.statusCode = 200;
					//	res.message = "User registered successfully";
					res.json(newUser);
				}
			});
		});

	}
	else {
		//var regdate = new Date();
		var regdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
		console.log("regdate" + regdate);
		//token exp 1800 = 30*60 = 30mins
		//token exp 30days = 30*24*60*60 = 2592000
		var token = jwt.sign({
			//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
			//exp: Math.floor(Date.now().valueOf() / 1000) + 300,
			exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
			username: username,
			orgName: orgName,
			role: attr1
		}, gconfig.secret);
		// let response = await helper.getRegisteredUser(username, orgName, attr1, true);
//todo
			let response = await registerUser.registerUser(username, orgName, attr1, true);
			console.log(response)



		//	logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
		if (response && typeof response !== 'string') {
			//	logger.debug('Successfully registered the username %s for organization %s', username, orgName);
			rtelib.raiseEvent('blockchain', 'userRegistration', {
				ts: common.cts(),
				userName: username,
				orgName: orgName,
				role: attr
			});
			//response.token = token;
			// storing the userdetails in database
			let saltRounds = 10;
			bcrypt.hash(password, saltRounds, function (err, hashedpwd) {
				password = hashedpwd;
				console.log('inside create:::11111111 usersbct:::: hashed passwd of ', username, ' is ', hashedpwd);
				let user = new User({
					username: username,
					password: hashedpwd,
					orgname: orgName,
					role: attr,
					token: token,
					regDate: regdate,
					enable: true,
					reset: false

				});

				//check if user exists or not

				User.findOne({
					username: username,
					orgname: orgName
				}, function (err, user1) {
					if (user1) {
						res.json({
							status: "Failed",
							message: "User already exists"
						});
					} else {
						// BCT user
						user.save((err, newUser) => {
							if (err) {
								res.json({
									status: "Failed",
									message: "Error creating new user: " + err.message
								});
							} else {
								console.log("create ::::: User saved in db successfully");
								//	res.statusCode = 200;
								//	res.message = "User registered successfully";
								//	res.json(newUser);
								res.json(response);
							}
						});
					}
					if (err) {
						console.log(err);
					}

				})
			});

		} else {
			logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
			res.json({
				status: "Failed",
				message: response
			});
		}
	}
};

// Retrieve and return all users from the database.
exports.findAll = (req, res) => {

	// res.send("Find All Users");
	/*User.find({}).then(eachUser => {
		
		let curdate = Math.floor(Date.now().valueOf() / 1000);
		//console.log(eachUser);
		eachUser.forEach(user => {
			//console.log("Dates: "+curdate,user.regDate);
			console.log(user.token);
			//if(curdate > jwt.exp){
			jwt.verify(user.token, gconfig.secret,function(err, decoded) {
				console.log("in verification");
				if(err) {
					//return res.status(401).send({
					//	message: 'User token is not valid'
					
					//});
					console.log("Token expired");
					User.update({
						"token": user.token
					}, {
						$set: {
							"reset": true
						}
					},
					function (err, rowsUpdated) {
						if (err) {
						//	console.log("Update failed:", err);
							logger.debug("Update failed:", err);
							/*res.json({
								status: "Failed",
								message: "User updation failed"
							});*/
	//}
	//console.log("User updated");
	//	})
	//	user.reset = true;
	//}
	/*if(user.regDate < curdate){
		user.reset = true;
	}*/

	//});


	//});
	//res.json(eachUser);
	//});
	User.find({}).then(eachUser => {
		res.json(eachUser);
	});
};

// Update a user identified by the userId in the request
exports.update = (req, res) => {

	var token = req.body.token;
	var enable = req.body.enable;
	console.log(req.body.enable)
	User.update({
		"token": token
	}, {
		$set: {
			"enable": enable
		}
	},
		function (err, rowsUpdated) {
			if (err) {
				//	console.log("Update failed:", err);
				logger.debug("Update failed:", err);
				res.json({
					status: "Failed",
					message: "User updation failed"
				});
			}
			console.log("User updated");
		})
	if (enable === true)
		res.send({
			status: "Success",
			message: "Token enabled"
		});
	else
		res.send({
			status: "Success",
			message: "Token disabled"
		});
};

exports.authenticate = (req, res) => {
	//req needs only username and password from calling entity

	// var username = req.body.username;
	// var password = req.body.password;

	console.log('basic auth pass ', req.headers.authorization)
	let basicData = req.headers.authorization;

	let b64string = basicData.split(' ')[1];

	let buf = new Buffer.from(b64string, 'base64').toString('utf-8');
	console.log('buffer is ', buf);
	let signinData = buf.split(':');
	let username = signinData[0];
	let password = signinData[1];

	/* //Username field contains email ID. SO validating email with name username
	validate.validateEmail(username).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
			res.json(vres);
		}
	})

	validate.validatePassword(password).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('password valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('password Invalid ', vres.message));
			res.json(vres);
		}
	}) */

	/* console.log('user pass is ', signinData[0], signinData[1]);
	console.log('user pass is ', username, password);
	if (!validator.isAlphanumeric(username)) {
		res.send(common.getErrorMessage('\'Invalid username\''));
		return;
	} */
	// console.log(username)
	// console.log(password)
	User.findOne({
		//genPoeUser.findOne({
		username: username
		//password: password
	}, function (err, user1) {
		if (user1 == null) {
			res.send({
				status: "Failed",
				message: 'Username or Password is incorrect'
			});
			return;
		}
		bcrypt.compare(password, user1.password, function (err, bres) {
			console.log('inside bctuser compare ', bres);
			if (bres == true) {
				if (user1.role == "admin") {
					role = "admin";
				}

				if (user1.role === "guest" || user1.role === "cdacadmin" || user1.role === "training" || user1.role === "genpoeuser") {
					console.log(user1.role);
					role = "writer";
				}
				var token = jwt.sign({
					//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
					// exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
					exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
					// expiryIn: '1hr',
					username: username,
					orgName: user1.orgname,
					role: role
				}, gconfig.secret);

				User.update({ "username": username }, { $set: { "token": token, "reset": false } }, function (err, rowsUpdated) {
					if (err) {
						logger.debug("Token Update failed:", err);
					} else {
						console.log("Token updated");
					}

				});

				if (user1 && user1.enable === true) {

					if (user1.role === "admin") {
						res.send({
							status: "Success",
							token: token,
							message: "Administrator logged in Successfully"
						});
					}
					else {

						res.send({
							status: "Success",
							token: token,
							message: " User Login Successful"
						});
					}


					//logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
					//return next();
				} else if (user1 && user1.enable === false) {
					res.send({
						status: "Failed",
						message: 'Token is disabled'
					});
					return;
				} else if (err) {
					res.send({
						status: "Failed",
						message: err
					});
					return;
				}

			} else {
				res.send({
					status: "Failed",
					message: err
				});
			}
			//console.log('user logged in success');
		});

	});

};

exports.genpoeauthenticate = async (req, res) => {
	//req needs only username and password from calling entity
	var shouldReturnFromFuntion = false;
	console.log('genpoeauth::: basic auth pass ', req.headers.authorization)
	logger.debug('genpoeauth::: basic auth pass ', req.headers.authorization)

	let basicData = req.headers.authorization;

	let b64string = basicData.split(' ')[1];

	let buf = new Buffer.from(b64string, 'base64').toString('utf-8');
	console.log('buffer is ', buf);
	let signinData = buf.split(':');
	let username = signinData[0];
	let password = signinData[1];

	//console.log('user pass is ', signinData[0], signinData[1]);
	//console.log('user pass is ', username, password);
	console.log('user login name is ', username);
	logger.debug('user login name is ', username);

	//Username field contains email ID. SO validating email with name username
	await validate.validateEmail(username).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
			logger.debug(chalk.bgRed('email Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;

	await validate.validatePassword(password).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('password valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('password Invalid ', vres.message));
			logger.debug(chalk.bgRed('password Invalid ', vres.message));
			shouldReturnFromFuntion = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;

	var capToken = req.body.recaptcha;
	console.log('recaptcha is ', capToken);

	request({
		url: recaptcha.googleUrl,
		method: "POST",
		json: true,   // <--Very important!!!
		qs: {
			secret: recaptcha.secret,
			response: capToken
		}
	}, function (error, response) {
		if (response) {
			//console.log(response.body);
			if (response.body.success === true) {
				console.log("captcha valid");
				logger.debug("captcha valid");
				message = "valid";
				genPoeUser.findOne({
					username: username
					// password: password
				}, function (err, user1) {

					if (user1 == null) {
						res.send({
							status: "Failed",
							message: 'Username or Password is incorrect'
						});
						return;
					}
					console.log('db pass = ', user1.password)
					bcrypt.compare(password, user1.password, function (err, bres) {
						console.log('inside bctuser compare ', bres);
						logger.debug('inside bctuser compare ', bres);
						if (bres == true) {
							if (user1.role == "admin") {
								role = "admin";
							}

							if (user1.role === "guest" || user1.role === "cdacadmin" || user1.role === "training" || user1.role === "genpoeuser") {
								console.log(user1.role);
								role = "writer";
							}

							//token exp 300 = 5*60 = 5mins
							//token exp 1800 = 30*60 = 30mins
							//token exp 30days = 30*24*60*60 = 2592000

							var token = jwt.sign({
								//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
								// exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
								//exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
								// expiryIn: '1hr',
								exp: Math.floor(Date.now().valueOf() / 1000) + 60 * 60, //For 1 Hour. Replace 60 with Num of minutes to change it
								username: username,
								fullname: user1.fullname,
								orgName: user1.orgname,
								role: role
							}, gconfig.secret);

							////If user is from Other than general POE then use this
							User.update({ "username": username }, { $set: { "token": token, "reset": false } }, function (err, rowsUpdated) {
								if (err) {
									logger.debug("Token Update failed:", err);
								} else {
									console.log("Token updated");
								}

							});

							//If user is from general POE then use this
							if (user1.role === "genpoeuser") {
								genPoeUser.update({ "username": username }, { $set: { "token": token, "reset": false } }, function (err, rowsUpdated) {
									if (err) {
										logger.debug("Token Update failed:", err);
									} else {
										console.log("Token updated for genPoeUser");
										logger.debug("Token updated for genPoeUser");
									}

								});
							}

							if (user1 && user1.enable === true) {

								if (user1.role === "admin") {
									res.send({
										status: "Success",
										token: token,
										message: "Administrator logged in Successfully"
									});
								}
								else {

									res.send({
										status: "Success",
										token: token,
										message: " User Login Successful"
									});
								}


								//logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
								//return next();
							} else if (user1 && user1.enable === false) {
								res.send({
									status: "Failed",
									message: 'User is disabled'
								});
								return;
							} else if (err) {
								res.send({
									status: "Failed",
									message: err
								});
								return;
							}
						} else {
							res.send({
								status: "Failed",
								message: err
							});
							return;
						}
					});
				});
			}
		}
	});


	// var username = req.body.username;
	// var password = req.body.password;

	// console.log(username)
	// console.log(password)
	//User.findOne({

};

//Gen Poe authenticate No captcha
exports.genpoeauthenticateNC = async (req, res) => {
	//req needs only username and password from calling entity
	var shouldReturnFromFunction = false;
	console.log('genpoeauth::: basic auth pass ', req.headers.authorization)
	logger.debug('genpoeauth::: basic auth pass ', req.headers.authorization);

	let basicData = req.headers.authorization;

	let b64string = basicData.split(' ')[1];

	let buf = new Buffer.from(b64string, 'base64').toString('utf-8');
	console.log('buffer is ', buf);
	let signinData = buf.split(':');
	let username = signinData[0];
	let password = signinData[1];

	//console.log('user pass is ', signinData[0], signinData[1]);
	//console.log('user pass is ', username, password);
	console.log('user login name is ', username);
	logger.debug('user login name is ', username);

	//Username field contains email ID. SO validating email with name username
	await validate.validateEmail(username).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
			logger.debug(chalk.bgRed('email Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFunction) return;

	await validate.validatePassword(password).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('password valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('password Invalid ', vres.message));
			logger.debug(chalk.bgRed('password Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFunction) return;

	// var username = req.body.username;
	// var password = req.body.password;

	// console.log(username)
	// console.log(password)
	//User.findOne({
	genPoeUser.findOne({
		username: username
		// password: password
	}, function (err, user1) {

		if (user1 == null) {
			res.send({
				status: "Failed",
				message: 'Username or Password is incorrect'
			});
			return;
		}
		console.log('db pass = ', user1.password)
		bcrypt.compare(password, user1.password, function (err, bres) {
			console.log('inside bctuser compare ', bres);
			if (bres == true) {
				if (user1.role == "admin") {
					role = "admin";
				}

				if (user1.role === "guest" || user1.role === "cdacadmin" || user1.role === "training" || user1.role === "genpoeuser") {
					console.log(user1.role);
					role = "writer";
				}

				//token exp 300 = 5*60 = 5mins
				//token exp 1800 = 30*60 = 30mins
				//token exp 30days = 30*24*60*60 = 2592000

				var token = jwt.sign({
					//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
					// exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
					exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
					// expiryIn: '1hr',
					username: username,
					fullname: user1.fullname,
					orgName: user1.orgname,
					role: role
				}, gconfig.secret);

				////If user is from Other than general POE then use this
				User.update({ "username": username }, { $set: { "token": token, "reset": false } }, function (err, rowsUpdated) {
					if (err) {
						logger.debug("Token Update failed:", err);
					} else {
						console.log("Token updated");
					}

				});

				//If user is from general POE then use this
				if (user1.role === "genpoeuser") {
					genPoeUser.update({ "username": username }, { $set: { "token": token, "reset": false } }, function (err, rowsUpdated) {
						if (err) {
							logger.debug("Token Update failed:", err);
						} else {
							console.log("Token updated for genPoeUser");
						}

					});
				}

				if (user1 && user1.enable === true) {

					if (user1.role === "admin") {
						res.send({
							status: "Success",
							token: token,
							message: "Administrator logged in Successfully"
						});
					}
					else {

						res.send({
							status: "Success",
							token: token,
							message: " User Login Successful"
						});
					}


					//logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
					//return next();
				} else if (user1 && user1.enable === false) {
					res.send({
						status: "Failed",
						message: 'User is disabled'
					});
					return;
				} else if (err) {
					res.send({
						status: "Failed",
						message: err
					});
					return;
				}
			} else {
				res.send({
					status: "Failed",
					message: err
				});
				return;
			}
		});
	});
};

//Login and change password with salting
exports.genpoechangepassword = async (req, res) => { // USe this for full salting

	var attr1;
	var username = req.username;
	console.log(username);
	var password = req.body.password;
	var newpassword = req.body.newpassword;
	var confirmpassword = req.body.confirmpassword;
	var shouldReturnFromFuntion = false

	/* validate.validateUserName(username).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('username valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('username Invalid ', vres.message));
			res.json(vres);
		}
	}) */

	//Username field contains email ID. SO validating email with name username
	await validate.validateEmail(username).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;
	validate.validatePassword(password).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('password valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('password Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;
	validate.validatePassword(newpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('newpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('newpassword Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;
	validate.validatePassword(confirmpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('confirmpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('confirmpassword Invalid ', vres.message));
			shouldReturnFromFunction = true;
			res.json(vres);
		}
	})
	if (shouldReturnFromFuntion) return;


	/* console.log('basic auth pass ',req.headers.authorization)
    let basicData = req.headers.authorization;
    
    let b64string = basicData.split(' ')[1];
    
    let buf = new Buffer.from(b64string, 'base64').toString('utf-8');
    console.log('buffer is ', buf);
    let signinData = buf.split(':');
    let username = signinData[0];
	let password = signinData[1];
	var newpassword = signinData[2];
	var confirmpassword = signinData[3];
	if(!validator.isAlphanumeric(username)) {
		res.send(common.getErrorMessage('\'username\''));
		return;
	} */

	//logger.info('End point : /changepassword');
	//logger.info('User name : ' + username);

	if (!username) {
		res.send(common.getErrorMessage('\'username\''));
		return;
	}
	if (!password) {
		res.send(common.getErrorMessage('\'password\''));
		return;
	}
	if (!newpassword) {
		res.send(common.getErrorMessage('\'password\''));
		return;
	}
	if (!confirmpassword) {
		res.send(common.getErrorMessage('\'confirm password\''));
		return;
	}

	if (newpassword != confirmpassword) {
		res.send(common.getErrorMessage('\'Mismatch in NewPassword and confirm password\''));
		return;
	}
	//check if user exists or not

	genPoeUser.findOne({
		username: username,
	}, function (err, user1) {
		if (user1) {
			//Check the old password matching with database or not
			bcrypt.compare(password, user1.password, function (err, match) {
				console.log('inside compare ', match);
				if (match === true) { //if old passwd is correct
					//Salt the new Password
					let saltRounds = 10;
					bcrypt.hash(newpassword, saltRounds, function (err, hashedpwd) {
						if (err) {
							console.log(chalk.bgRed('salting passwd failed ', err));
							return;
						} else {
							newpassword = hashedpwd;

							console.log(chalk.bgGreen('salting password success ', newpassword));
							genPoeUser.update({
								"username": username
							}, {
								$set: {
									"password": newpassword
								}
							},
								function (err, rowsUpdated) {
									if (err) {
										//	console.log("Update failed:", err);
										res.json({
											status: "Failed",
											message: "Passwd change failed: " + err
										});
									}
									console.log(chalk.bgGreen("Password changed successfully User details updated"));
									res.json({
										status: "Success",
										message: "Password changed successfully"
									});
								});
						}
					});
				} else if (match === false) {
					res.json({
						status: "Failed",
						message: "Old Password not matched"
					});
				}
			});
		} else {
			//logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
			res.json({
				status: "Failed",
				message: "User not found for changing the password"
			});
		}

	});

};

exports.genpoeactivateuser = async (req, res) => {
	console.log('genpoeauth::: activate user ')

	var token = req.body.token
	var tokenValidationResponse
	var shouldReturnFromFuntion = false


	//await helper.verifyMailByToken(token)
	await verifyMailByToken(token)
		.then((res) => {
			console.log("verifyMailByToken success", res)
			tokenValidationResponse = res
		})
		.catch((err) => {
			console.log("verifyMailByToken err", err)
			shouldReturnFromFuntion = true
			res.json({
				status: "Failed",
				message: "Verification failed"
			});

		})
	if (shouldReturnFromFuntion) return


	/**
	 * Check if user exist
	 * check if already activated
	 */
	if (tokenValidationResponse && tokenValidationResponse.status == "Success") {
		await genPoeUser.findOne({
			"username": tokenValidationResponse.email
		}).then((user) => {
			if (user.enable == true) {
				shouldReturnFromFuntion = true
				res.json({
					status: "Failed",
					message: "User already activated"
				});
				return
			}

		}).catch((err) => {
			if (err) {
				shouldReturnFromFuntion = true
				res.json({
					status: "Failed",
					message: "User does not exist"
				});
				return
			}
		})
	}
	if (shouldReturnFromFuntion) return


	if (tokenValidationResponse && tokenValidationResponse.status == "Success") {
		genPoeUser.update({
			"username": tokenValidationResponse.email
		}, {
			$set: {
				"enable": true,
				"isEmailVerified": true
			}
		}, function (err, rowsUpdated) {
			if (err) {
				console.log("verifyMailByToken token update failed")
				res.json({
					status: "Failed",
					message: "Verification failed"
				});
				return
			}
			console.log(rowsUpdated)
			res.json({
				status: "Success",
				message: "Verification successful"
			});
		}
		)
	}
}



/**
 * protected route
 * req body: current new pwd
 * REVIEW function already exist genpoechangepassword
 */
exports.genpoechangepwd = async (req, res) => {

}


/**
 * open route
 * req body: email
 * REVIEW 	maintain token sent for perticular user if and delete after one time use or expiry
 * 			once token set dont send again unless first expired or deleted from db
 * 			mongo supports ttl for records -> can be useful for token storage and auto deletion	
 */
exports.genpoeforgotpwd = async (req, res) => {
	shouldReturnFromFuntion = false
	email = req.body.email
	var userfromdb
	var capToken = req.body.recaptcha;
	console.log('recaptcha is ', capToken);

	await validate.validateEmail(email).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
			res.json(vres);
			shouldReturnFromFuntion = true;
			return;
		}
	})
	if (shouldReturnFromFuntion) return;
	request({
		url: recaptcha.googleUrl,
		method: "POST",
		json: true,   // <--Very important!!!
		qs: {
			secret: recaptcha.secret,
			response: capToken
		}
	}, async function (error, response) {
		if (response) {
			//console.log(response.body);
			if (response.body.success === true) {
				console.log("captcha valid");
				message = "valid";
				// chek user
				await genPoeUser.findOne({
					"username": email
				}).then((user) => {

					//user does not exist
					/* if (!user) {
						shouldReturnFromFuntion = true
						res.json({
							status: "Failed",
							message: "User does not exist"
						});
						return
					} */
					if (!user || !user.isEmailVerified) {
						shouldReturnFromFuntion = true
						res.json({
							status: "Failed",
							message: "User account is not Registered / Activated. Please check your email for the activation link if already registered."
						});
						return
					}
					userfromdb = user
				})
				if (shouldReturnFromFuntion) return

				//helper.sendForgotpwdMail(email, userfromdb.fullname).then((res) => {
				sendForgotpwdMail(email, userfromdb.fullname).then((res) => {
					console.log(res)
				}).catch((err) => {
					console.log(err)
				})
				res.json({
					status: "Success",
					message: "Link to change password is sent to your registered email ID"
					//message: "Please use the link sent to your registered e-mail address to change your password [valid for 24 hours only]"
				});
			}
		}
	});


}

exports.genpoeforgotpwdNC = async (req, res) => {
	shouldReturnFromFuntion = false
	email = req.body.email
	var userfromdb

	validate.validateEmail(email).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('email valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('email Invalid ', vres.message));
		}
	})

	// chek user
	await genPoeUser.findOne({
		"username": email
	}).then((user) => {

		//user does not exist
		/* if (!user) {
			shouldReturnFromFuntion = true
			res.json({
				status: "Failed",
				message: "User does not exist"
			});
			return
		} */
		if (!user || !user.isEmailVerified) {
			shouldReturnFromFuntion = true
			res.json({
				status: "Failed",
				message: "User account is not Registered / Activated. Please check your email for the activation link if already registered."
			});
			return
		}
		userfromdb = user
	})
	if (shouldReturnFromFuntion) return

	//helper.sendForgotpwdMail(email, userfromdb.fullname).then((res) => {
	sendForgotpwdMail(email, userfromdb.fullname).then((res) => {
		console.log(res)
	}).catch((err) => {
		console.log(err)
	})
	res.json({
		status: "Success",
		message: "Link to change password is sent to your registered email ID"
		//message: "Please use the link sent to your registered e-mail address to change your password [valid for 24 hours only]"
	});

}

/**
 * open route// uses sprate tokens
 * req body: token sent from genpoeforgotpwd , email , new password
 * TODO chk token validity
 * TODO compare registered email from body and compare with token mail
 */
exports.genpoeforgotpwdchange = async (req, res) => {
	console.log('genpoeforgotpwdchange:::')

	var token = req.body.token
	var newpassword = req.body.newpassword
	var confirmpassword = req.body.confirmpassword
	var tokenValidationResponse
	var shouldReturnFromFuntion = false
	var capToken = req.body.recaptcha;
	console.log('recaptcha is ', capToken);

	validate.validatePassword(newpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('newpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('newpassword Invalid ', vres.message));
			res.json(vres);
		}
	})

	validate.validatePassword(confirmpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('confirmpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('confirmpassword Invalid ', vres.message));
			res.json(vres);
		}
	})

	request({
		url: recaptcha.googleUrl,
		method: "POST",
		json: true,   // <--Very important!!!
		qs: {
			secret: recaptcha.secret,
			response: capToken
		}
	}, async function (error, response) {
		if (response) {
			//console.log(response.body);
			if (response.body.success === true) {
				console.log("captcha valid");
				message = "valid";

				if (!newpassword) {
					res.send(common.getErrorMessage('\'password\''));
					return;
				}
				if (!confirmpassword) {
					res.send(common.getErrorMessage('\'confirm password\''));
					return;
				}
				if (newpassword != confirmpassword) {
					res.send(common.getErrorMessage('\'Mismatch in NewPassword and confirm password\''));
					return;
				}


				//await helper.verifyMailByToken(token)
				await verifyMailByToken(token)
					.then((res) => {
						console.log("verifyMailByToken success", res)
						tokenValidationResponse = res
					})
					.catch((err) => {
						console.log("verifyMailByToken err", err)
						shouldReturnFromFuntion = true
						res.json({
							status: "Failed",
							message: " failed"
						});

					})
				if (shouldReturnFromFuntion) return

				/**
				 * Check if user exist
				 */
				if (tokenValidationResponse && tokenValidationResponse.status == "Success") {
					await genPoeUser.findOne({
						"username": tokenValidationResponse.email
					}).then((user) => { }).catch((err) => {
						if (err) {
							shouldReturnFromFuntion = true
							res.json({
								status: "Failed",
								message: "User does not exist"
							});
							return
						}
					})
				}
				if (shouldReturnFromFuntion) return

				let saltRounds = 10;
				bcrypt.hash(newpassword, saltRounds, function (err, hashedpwd) {
					if (err) {
						console.log(chalk.bgRed('salting passwd failed ', err));
						return;
					} else {
						newpassword = hashedpwd;

						console.log(chalk.bgGreen('salting password success ', newpassword));

						genPoeUser.update({ "username": tokenValidationResponse.email },
							{ $set: { "password": newpassword } },
							function (err, rowsUpdated) {
								if (err) {
									res.json({
										status: "Failed",
										message: "Password change failed: " + err
									});
								}
								console.log(chalk.bgGreen("Password changed successfully User details updated"));
								res.json({
									status: "Success",
									message: "Password changed successfully"
								});
							}
						);
					}
				});
			}
		}
	});


}

//GenPoe::: Change Password from forgot password
exports.genpoeforgotpwdchangeNC = async (req, res) => {
	console.log('genpoeforgotpwdchange:::')

	var token = req.body.token
	var newpassword = req.body.newpassword
	var confirmpassword = req.body.confirmpassword
	var tokenValidationResponse
	var shouldReturnFromFuntion = false

	validate.validatePassword(newpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('newpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('newpassword Invalid ', vres.message));
			res.json(vres);
		}
	})

	validate.validatePassword(confirmpassword).then(vres => {
		if (vres.status == "Success") {
			console.log(chalk.bgGreen('confirmpassword valid'));
		} else if (vres.status == "Failed") {
			console.log(chalk.bgRed('confirmpassword Invalid ', vres.message));
			res.json(vres);
		}
	})


	if (!newpassword) {
		res.send(common.getErrorMessage('\'password\''));
		return;
	}
	if (!confirmpassword) {
		res.send(common.getErrorMessage('\'confirm password\''));
		return;
	}
	if (newpassword != confirmpassword) {
		res.send(common.getErrorMessage('\'Mismatch in NewPassword and confirm password\''));
		return;
	}

	//await helper.verifyMailByToken(token)
	await verifyMailByToken(token)
		.then((res) => {
			console.log("verifyMailByToken success", res)
			tokenValidationResponse = res
		})
		.catch((err) => {
			console.log("verifyMailByToken err", err)
			shouldReturnFromFuntion = true
			res.json({
				status: "Failed",
				message: " failed"
			});

		})
	if (shouldReturnFromFuntion) return

	/**
	 * Check if user exist
	 */
	if (tokenValidationResponse && tokenValidationResponse.status == "Success") {
		await genPoeUser.findOne({
			"username": tokenValidationResponse.email
		}).then((user) => { }).catch((err) => {
			if (err) {
				shouldReturnFromFuntion = true
				res.json({
					status: "Failed",
					message: "User does not exist"
				});
				return
			}
		})
	}
	if (shouldReturnFromFuntion) return

	let saltRounds = 10;
	bcrypt.hash(newpassword, saltRounds, function (err, hashedpwd) {
		if (err) {
			console.log(chalk.bgRed('salting passwd failed ', err));
			return;
		} else {
			newpassword = hashedpwd;

			console.log(chalk.bgGreen('salting password success ', newpassword));

			genPoeUser.update({ "username": tokenValidationResponse.email },
				{ $set: { "password": newpassword } },
				function (err, rowsUpdated) {
					if (err) {
						res.json({
							status: "Failed",
							message: "Password change failed: " + err
						});
					}
					console.log(chalk.bgGreen("Password changed successfully User details updated"));
					res.json({
						status: "Success",
						message: "Password changed successfully"
					});
				}
			);
		}
	});
}

/**
 * helper function  for sendConfirmationMail()
 * Author: Vikas
 * Date: 28 aug 2019
 * @param {*} email 
 */
var generateMailConfirmationToken = async function (email) {
	var token = jwt.sign({
		//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		exp: Math.floor(Date.now().valueOf() / 1000) + 30 * 24 * 60 * 60, // expires in 30 days
		// exp: Math.floor(Date.now().valueOf() / 1000) + 5 * 60, // expires in 5 Minutes
		//exp: Math.floor(Date.now().valueOf() / 1000) + 60 * 60 * 24, // expires in 24 hours
		email: email,
	}, gconfig.secret);
	return token
}

var generateMailConfirmationToken_Org = async function (orgID, orgEmail, orgName, userEmail, userName) {
	var token = jwt.sign({
		//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		exp: Math.floor(Date.now().valueOf() / 1000) + 30 * 24 * 60 * 60, // expires in 30 days
		// exp: Math.floor(Date.now().valueOf() / 1000) + 5 * 60, // expires in 5 Minutes
		//exp: Math.floor(Date.now().valueOf() / 1000) + 60 * 60 * 24, // expires in 24 hours
		userOrgID: orgID,
		userOrgAdminemail: orgEmail,
		userOrgName: orgName,
		userOrgemail: userEmail,
		fullname: userName
	}, gconfig.secret);
	return token
}


/**
 * Sending Confirmation mail
 * Author: Vikas
 * Date: 28 aug 2019
 * @param {*} email 
 */
var sendConfirmationMail = async function (email, fullname) {
	let token = await generateMailConfirmationToken(email)
	return new Promise((resolve, reject) => {
		console.log(poeEnv.verificationURL);
		// console.log(env.verificationURL);
		let link = '<a href=' + poeEnv.verificationURL + `/user/verify/${token}` + '> Click here to verify </a>'
		console.log(link);
		let mailOptions = {
			from: '"cdacchain" <cdacchain@cdac.in>',
			to: email,
			bcc: 'cdacchain@cdac.in',
			subject: "Verify your Blockchain based Proof of Existence Account",
			html: `Dear ${fullname},
    
				<p>Greetings from C-DAC !!!</p>				
				<p>You have registered ${email} as your account ID for Blockchain based Proof of Existence.</p>
				<p>If you click on the below link, your account authentication will be completed.</p>			
				<p>${link}</>
				<br>
				<p>----------------------</p>
				<p>Your Proof Of Existence Team,</p>
				<p>C-DAC, Hyderabad</p>
				<br>
				<br>
				`
		}

		emailConfig.transporter.sendMail(mailOptions, function (err, info) {
			if (!err) {
				console.log("email sent: %s", info.response);
				resolve(true)
			} else {
				console.log("send email failed");
				reject(false)
			}

		})
	})
}

var sendConfirmationMail_Org = async function (orgID, orgEmail, orgName, userEmail, userName) {
	let token = await generateMailConfirmationToken_Org(orgID, orgEmail, orgName, userEmail, userName)
	return new Promise((resolve, reject) => {
		console.log(poeEnv.verificationURL);
		// console.log(env.verificationURL);
		let link = '<a href=' + poeEnv.verificationURL + `/org/verify/${token}` + '> Click here to verify </a>'
		console.log(link);
		let name, org, email;
		let mailOptions;
		if (userEmail === "" && userName === "") {
			name = "Administrator";
			org = orgName;
			email = orgEmail;
			mailOptions = {
				from: '"cdacchain" <cdacchain@cdac.in>',
				to: email,
				bcc: 'cdacchain@cdac.in',
				subject: "Verify your Blockchain based Proof of Existence Account",
				html: `Dear ${name},
		
					<p>Greetings from C-DAC !!!</p>				
					<p>You have successfully registered ${org} in Blockchain based Proof of Existence.</p>
					<p>Your account is registered with email ID: ${email} and organization ID: ${orgID} . Use these details for account login </p>
					<p>If you click on the below link, your account authentication will be completed.</p>			
					<p>${link}</>
					<br>
					<p>----------------------</p>
					<p>Blockchain based Proof Of Existence Team,</p>
					<p>C-DAC, Hyderabad</p>
					<br>
					<br>
					`
			}
		} else {
			name = userName;
			org = orgName;
			email = userEmail;
			mailOptions = {
				from: '"cdacchain" <cdacchain@cdac.in>',
				to: email,
				bcc: 'cdacchain@cdac.in',
				subject: "Verify your Blockchain based Proof of Existence Account",
				html: `Dear ${name},
		
					<p>Greetings from C-DAC !!!</p>				
					<p>You organization <b> ${org} </b> has enrolled for using Blockchain based Proof of Existence.</p>
					<p>One user account is created on your name by your organization</p>  
					<p>Credentials for using the account are: </p>
					<p>    <i>email ID:</i> <b> ${email} </b> </p>
					<p>    <i>organization ID:</i> <b> ${orgID} </b> </p> 
					<p>Please activate your account by clicking on the below link before using it </p>
					<br>
					<p>${link}</>
					<br>
					<p>----------------------</p>
					<p>Blockchain based Proof Of Existence Team,</p>
					<p>C-DAC, Hyderabad</p>
					<br>
					<br>
					`
			}
		}



		emailConfig.transporter.sendMail(mailOptions, function (err, info) {
			if (!err) {
				console.log("email sent: %s", info.response);
				resolve(true)
			} else {
				console.log("send email failed");
				reject(false)
			}

		})
	})
}

/**
 * Verify mail link click
 * Author: Vikas
 * Date: 28 aug 2019
 * @param {*} token 
 */
var verifyMailByToken = async function (token) {
	console.log("verifyMailByToken", token)
	return new Promise((resolve, reject) => {
		jwt.verify(token, gconfig.secret, function (err, decoded) {
			if (err) {
				console.log("Token is invalid " + err);
				reject({ 'status': "Failed" });
			} else {
				console.log("Token is valid");
				var email = decoded.email;
				resolve({ 'status': "Success", 'email': email })
			}
		});
	})
}

var verifyMailByToken_Org = async function (token) {
	console.log("verifyMailByToken_Org", token)
	let emailID;
	return new Promise((resolve, reject) => {
		jwt.verify(token, gconfig.secret, function (err, decoded) {
			if (err) {
				console.log("Token is invalid " + err);
				reject({ 'status': "Failed" });
			} else {
				console.log("Token is valid");
				if (decoded.userOrgemail === "" && decoded.fullname === "") {
					//This is for Organization Registration
					console.log("This is for Organization Registration ", decoded.userOrgAdminemail)
					emailID = decoded.userOrgAdminemail;
				} else {
					//This is for OrgUser Registration
					console.log("This is for OrgUser Registration ", decoded.userOrgemail)
					emailID = decoded.userOrgemail;
				}
				resolve({ 'status': "Success", 'email': emailID })
			}
		});
	})
}
/**
 * Sending Forgot password mail
 * Author: Vikas
 * Date: 28 aug 2019
 * @param {*} email 
 */
var sendForgotpwdMail = async function (email, fullname) {

	let token = await generateMailConfirmationToken(email)

	return new Promise((resolve, reject) => {
		console.log(poeEnv.verificationURL);
		// console.log(env.verificationURL);
		let link = '<a href=' + poeEnv.verificationURL + `/user/forgotpwd/${token}` + '> Click here to change password </a>'
		console.log(link);
		let mailOptions = {
			from: '"cdacchain" <cdacchain@cdac.in>',
			to: email,
			bcc: 'cdacchain@cdac.in',
			subject: "Change password for your Blockchain based Proof of Existence Account",
			html: `Dear ${fullname},
    
				<p>Greetings from C-DAC !!!</p>				
				<p>You have requested password change for your account ID ${email} for Blockchain based Proof of Existence.</p>
				<p>If you click on the below link, you will be redirected to page where you can set new password.</p>			
				<p>${link}</p>
				<br>
				<p><i>NOTE: this link is valid for 30 days</i></p>
				<br>
				<p>----------------------</p>
				<p>Your Proof Of Existence Team,</p>
				<p>C-DAC, Hyderabad</>
				<br>
				<br>
				`
		}

		emailConfig.transporter.sendMail(mailOptions, function (err, info) {
			if (!err) {
				console.log("email sent: %s", info.response);
				resolve(true)
			} else {
				console.log("send email failed");
				reject(false)
			}

		})
	})
}

var sendOrgForgotpwdMail = async function (userfromdb) {

	var userOrgID = userfromdb.userOrgID;
	var userOrgName = userfromdb.userOrgName;
	var userOrgemail = userfromdb.userOrgemail;
	var fullName = userfromdb.fullName;
	var orgEmail;
	await genericUser.findOne({					
		userOrgID: userOrgID,
		role: "admin" 
	}).then((user) => { 
		orgEmail = user.userOrgemail;
		console.log("Admin email inside sendorgforgotpwdmail ", orgEmail);
	});

	let token = await generateMailConfirmationToken_Org (userOrgID, orgEmail, userOrgName, userOrgemail, fullName)

	return new Promise((resolve, reject) => {
		console.log(poeEnv.verificationURL);
		// console.log(env.verificationURL);
		let link = '<a href=' + poeEnv.verificationURL + `/org/forgotpwd/${token}` + '> Click here to change password </a>'
		console.log(link);
		let mailOptions = {
			from: '"cdacchain" <cdacchain@cdac.in>',
			to: userOrgemail,
			bcc: 'cdacchain@cdac.in',
			subject: "Change password for your Blockchain based Proof of Existence Account",
			html: `Dear ${fullName},
    
				<p>Greetings from C-DAC !!!</p>				
				<p>You have requested password change for your account ID ${userOrgemail} for Blockchain based Proof of Existence.</p>
				<p>If you click on the below link, you will be redirected to page where you can set new password.</p>			
				<p>${link}</p>
				<br>
				<p><i>NOTE: this link is valid for 30 days</i></p>
				<br>
				<p>----------------------</p>
				<p>Your Proof Of Existence Team,</p>
				<p>C-DAC, Hyderabad</>
				<br>
				<br>
				`
		}

		emailConfig.transporter.sendMail(mailOptions, function (err, info) {
			if (!err) {
				console.log("email sent: %s", info.response);
				resolve(true)
			} else {
				console.log("send email failed");
				reject(false)
			}

		})
	})
}

//TODO email undefined coming
exports.userProfileInfo = async (req, res) => {
	var resultLisT = {
		email: "",
		regDate: "",
		enable: false,
		count: 0
	};
	var username = req.username;
	//console.log("email",req.username);
	//To retrieve user details from DB
	await genPoeUser.findOne({
		username: username
	},
		{
			eMail: 1,
			regDate: 1,
			enable: 1
		}).then(uprofile => {
			resultLisT.email = uprofile.eMail;
			resultLisT.regDate = uprofile.regDate;
			resultLisT.enable = uprofile.enable;

		})

	//To retrieve count of documents uploaded by a user
	await proofofex.find({ "issuedTo": username }).count(function (err, count) {
		//console.log(chalk.bgCyan('docs uploaded by user are ' + count));
		resultLisT.count = count;
		res.json({
			status: "Success",
			message: "General PoE User Profile Details",
			result: resultLisT
		});
	})
}
