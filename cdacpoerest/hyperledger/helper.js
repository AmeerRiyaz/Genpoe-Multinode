'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('Helper');
var path = require('path');
var util = require('util');
var copService = require('fabric-ca-client');
var jwt = require('jsonwebtoken');
const gconfig = require("../config/generalconfig");
const emailConfig = require('../config/email');
const envConf = require('../config/environment');

var hfc = require('fabric-client');
//hfc.setLogger(logger);
var ORGS = hfc.getConfigSetting('network-config');

var clients = {};
var channels = {};
var caClients = {};

var sleep = async function (sleep_time_ms) {
	return new Promise(resolve => setTimeout(resolve, sleep_time_ms));
}

async function 	getClientForOrg(userorg, username) {
	//logger.debug('getClientForOrg - ****** START %s %s', userorg, username)
	// get a fabric client loaded with a connection profile for this org
	//logger.debug("in get ClientForOrg");
	let config = '-connection-profile-path';

	// build a client context and load it with a connection profile
	// lets only load the network settings and save the client for later
	let client = hfc.loadFromConfig(hfc.getConfigSetting('network' + config));


	//logger.debug('Network connection path: ');
	// This will load a connection profile over the top of the current one one
	// since the first one did not have a client section and the following one does
	// nothing will actually be replaced.
	// This will also set an admin identity because the organization defined in the
	// client section has one defined
	client.loadFromConfig(hfc.getConfigSetting(userorg + config));

	// this will create both the state store and the crypto store based
	// on the settings in the client section of the connection profile
	await client.initCredentialStores();

	// The getUserContext call tries to get the user from persistence.
	// If the user has been saved to persistence then that means the user has
	// been registered and enrolled. If the user is found in persistence
	// the call will then assign the user to the client object.
	if (username) {
		let user = await client.getUserContext(username, true);
		if (!user) {
			throw new Error(util.format('User was not found :', username));
		} else {
			//logger.debug('User %s was found to be registered and enrolled', username);
		}
	}
	//logger.debug('getClientForOrg - ****** END %s %s \n\n', userorg, username)

	return client;
}

var getRegisteredUser = async function (username, userOrg, attr, isJson) {
	try {


		var client = await getClientForOrg(userOrg);
		//	logger.debug('Successfully initialized the credential stores');
		//logger.debug('Successfully initialized the credential stores');
		// client can now act as an agent for organization Org1
		// first check to see if the user is already enrolled
		var user = await client.getUserContext(username, true);
		if (user && user.isEnrolled()) {
			logger.debug('Successfully loaded member from persistence');
		} else {
			// user was not enrolled, so we will need an admin user object to register
			//	logger.debug('User %s was not enrolled, so we will need an admin user object to register', username);
			var admins = hfc.getConfigSetting('admins');
			// logger.debug('username: ' + admins[0].username);
			// logger.debug('password: ' + admins[0].secret);

			let adminUserObj = await client.setUserContext({
				username: admins[0].username,
				password: admins[0].secret
			});

			let caClient = client.getCertificateAuthority();
			//	logger.debug("Successfully got certificateauthority");

			let secret = await caClient.register({
				enrollmentID: username,
				affiliation: userOrg.toLowerCase(),// + '.esec',
				attrs: [{
					name: "role",
					value: attr,
					ecert: true
				}]
				/*attrs:[
					{name: attr, value: "true"}
				]*/
				//attrs:["role", role]
				//role:role
				//affiliation: 'regorg' + '.department1'
			}, adminUserObj);
			logger.debug('Successfully got the secret for user %s', username);
			user = await client.setUserContext({
				username: username,
				password: secret
			});
			// logger.debug('Successfully enrolled username %s  and setUserContext on the client object', username);
			// logger.debug('Successfully enrolled username %s  with role %s ', user.username);

			logger.debug('Successfully enrolled ');
		}
		if (user && user.isEnrolled) {
			if (isJson && isJson === true) {
				var response = {
					status: "Success",
					//secret: user._enrollmentSecret,
					message: username + ' enrolled Successfully'
				};
				return response;
			}
		} else {
			let errresp = {
				status: "Failed",
				message: 'User was not enrolled'
			};
			return errresp;
			//throw new Error('User was not enrolled ');
		}
	} catch (error) {
		//	logger.error('Failed to get registered user: %s with error: %s', username, error.toString());
		let errresp = {
			status: "Failed",
			message: error.toString()
		};
		return errresp;
		//return 'failed '+error.toString();
	}

};



// /**
//  * helper function  for sendConfirmationMail()
//  * Author: Vikas
//  * Date: 28 aug 2019
//  * @param {*} email 
//  */
// var generateMailConfirmationToken = async function (email) {
// 	var token = jwt.sign({
// 		//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
// 		// exp: Math.floor(Date.now().valueOf() / 1000) + 30*24*60*60, // expires in 30 days
// 		// exp: Math.floor(Date.now().valueOf() / 1000) + 5 * 60, // expires in 5 Minutes
// 		exp: Math.floor(Date.now().valueOf() / 1000) + 60 * 60 * 24, // expires in 24 hours
// 		email: email,
// 	}, gconfig.secret);
// 	return token
// }


// /**
//  * Sending Confirmation mail
//  * Author: Vikas
//  * Date: 28 aug 2019
//  * @param {*} email 
//  */
// var sendConfirmationMail = async function (email, fullname) {
// 	let token = await generateMailConfirmationToken(email)
// 	return new Promise((resolve, reject) => {
// 		console.log(envConf.verificationURL);
// 		// console.log(env.verificationURL);
// 		let link = '<a href=' + envConf.verificationURL + `/user/verify/${token}` + '> Click here to verify </a>'
// 		console.log(link);
// 		let mailOptions = {
// 			from: '"cdacchain" <cdacchain@cdac.in>',
// 			to: email,
// 			subject: "Verify your Blockchain based Proof of Existence Account",
// 			html: `Dear ${fullname},
    
// 				<p>Greetings from C-DAC !!!</p>				
// 				<p>You have registered ${email} as your account ID for Blockchain based Proof of Existence.</p>
// 				<p>If you click on the below link, your account authentication will be completed.</p>			
// 				<p>${link}</>
// 				<br>
// 				<p>Your Proof Of Existence Team,</p>
// 				<p>C-DAC, Hyderabad</p>
// 				<br>
// 				`
// 		}

// 		emailConfig.transporter.sendMail(mailOptions, function (err, info) {
// 			if (!err) {
// 				console.log("email sent: %s", info.response);
// 				resolve(true)
// 			} else {
// 				console.log("send email failed");
// 				reject(false)
// 			}

// 		})
// 	})
// }

// /**
//  * Verify mail link click
//  * Author: Vikas
//  * Date: 28 aug 2019
//  * @param {*} token 
//  */
// var verifyMailByToken = async function (token) {
// 	console.log("verifyMailByToken",token)
// 	return new Promise((resolve, reject) => {
// 		jwt.verify(token, gconfig.secret, function (err, decoded) {
// 			if (err) {
// 				console.log("Token is invalid " + err);
// 				reject({ 'status': "Failed"});
// 			} else {
// 				console.log("Token is valid");
// 				var email = decoded.email;
// 				resolve({ 'status': "Success", 'email': email })
// 			}
// 		});
// 	})
// }

// /**
//  * Sending Forgot password mail
//  * Author: Vikas
//  * Date: 28 aug 2019
//  * @param {*} email 
//  */
// var sendForgotpwdMail = async function (email, fullname) {
// 	let token = await generateMailConfirmationToken(email)

// 	return new Promise((resolve, reject) => {
// 		console.log(envConf.verificationURL);
// 		// console.log(env.verificationURL);
// 		let link = '<a href=' + envConf.verificationURL + `/user/forgotpwd/${token}` + '> Click here to change password </a>'
// 		console.log(link);
// 		let mailOptions = {
// 			from: '"cdacchain" <cdacchain@cdac.in>',
// 			to: email,
// 			subject: "Change password for your Blockchain based Proof of Existence Account",
// 			html: `Dear ${fullname},
    
// 				<p>Greetings from C-DAC !!!</p>				
// 				<P>You have requested password change for your account ID ${email} for Blockchain based Proof of Existence.</>
// 				<P>If you click on the below link, you will be ridirected to page where you can set new password.</>			
// 				<p>${link}</>
// 				<br>
// 				<p><i>NOTE: this link is valid for 24 hours</i></>
// 				<br>
// 				<P>Your Proof Of Existence Team,</>
// 				<P>C-DAC, Hyderabad</>
// 				<br>
// 				`
// 		}

// 		emailConfig.transporter.sendMail(mailOptions, function (err, info) {
// 			if (!err) {
// 				console.log("email sent: %s", info.response);
// 				resolve(true)
// 			} else {
// 				console.log("send email failed");
// 				reject(false)
// 			}

// 		})
// 	})
// }


var setupChaincodeDeploy = function () {
	process.env.GOPATH = path.join(__dirname, hfc.getConfigSetting('CC_SRC_PATH'));
};

var getLogger = function (moduleName) {
	var logger = log4js.getLogger(moduleName);
	//	logger.setLevel('DEBUG');
	return logger;
};

function getNetworkConfigClient() {
	let config = '-connection-profile-path';
	let client = hfc.loadFromConfig(hfc.getConfigSetting('network' + config));
	return client;
};

exports.getClientForOrg = getClientForOrg;
exports.getLogger = getLogger;
exports.setupChaincodeDeploy = setupChaincodeDeploy;
exports.getRegisteredUser = getRegisteredUser;
exports.getNetworkConfigClient = getNetworkConfigClient;
// exports.sendConfirmationMail = sendConfirmationMail
// exports.verifyMailByToken = verifyMailByToken
// exports.sendForgotpwdMail = sendForgotpwdMail
