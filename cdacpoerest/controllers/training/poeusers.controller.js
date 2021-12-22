const Student = require('../../models/training/student.model.js');
const cdacUser = require('../../models/training/cdacusers.model.js');
const bctUser = require('../../models/bctuser.model');
const Centre = require('../../models/training/centre.model');
const Course = require('../../models/training/course.model');
const gconfig = require("../../config/generalconfig");
const Captcha = require('./captcha.controller');
var log4js = require('log4js');
var logger = log4js.getLogger('poeusers.controller');
var jwt = require('jsonwebtoken');
require('../../config/config.js');
var helper = require('../../hyperledger/helper.js');
var common = require('../../common/common.js');
var rtconfig = require('../../config/rtconfig');
const io = require('socket.io-client');
var rtelib0 = require('../../rtelib/rte-lib');
const socket = io(rtconfig.rteserverIP + '/blockchain-nsp');
var rtelib = new rtelib0(socket);
const csv = require('csvtojson');
const fs = require('fs');
const proofofex = require('../../models/training/certificate.model');
var centerCodes = require('./centerCodes.json');
var courseCodes = require('./courseCodes.json');
const chalk = require('chalk');
const bcrypt = require('bcrypt');
var validator = require('validator');
const request = require('request');
//var sleep = require('sleep');
const dateFormat = require('dateformat')
const recaptcha = require('../../config/recaptcha');
const validate = require('../validations');
// const ftype = require('file-type');

function cts() {
    var current = new Date();
    var curr_ts = current.toString();
    return curr_ts;
}


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
	logger.debug(chalk.bgRed(response.status +' : ' + response.message));
    return response;
}
// Create and Save a new user
exports.studentaccount = async (req, res) => {

	var attr1;
	var username = req.body.username;
    var password = req.body.password;
	var confirmpassword = req.body.confirmpassword;
	var rollNo = req.body.rollNo;
    	
//	logger.info('End point : /signup');
//	logger.info('User name : ' + username);

	if (!username) {
		res.send(common.getErrorMessage('\'username\''));
		return;
	}
	if (!password) {
		res.send(common.getErrorMessage('\'password\''));
		return;
    }
    
    if (!confirmpassword) {
		res.send(common.getErrorMessage('\'confirm password\''));
		return;
	}
	if (!rollNo) {
		res.send(common.getErrorMessage('\'rollNo\''));
		return;
	}
    
    if(password != confirmpassword){
		res.send(common.getErrorMessage('\'Mismatch in Password and confirm password\''));
		return;
    }
	
	Student.findOne({"rollNo":rollNo},async function(err,found){
		if(err)
		{
			console.log(err);
		}
		if(found){
			console.log("student rollNo exist in db");
			   
			var role = 'student';
			var orgName = "ActsOrg";
			//var regdate = new Date();
			var regdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
			console.log("regdate" +regdate);
			//token exp 1800 = 30*60 = 30mins
			//token exp 30days = 30*24*60*60
			var token = jwt.sign({
				username: username,		
				role: role
			}, gconfig.secret);
			let response = await helper.getRegisteredUser(username, orgName, attr1, true);
		//	logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
			if (response && typeof response !== 'string') {
		//		logger.debug('Successfully registered the username %s for organization %s', username, orgName);
				rtelib.raiseEvent('blockchain', 'userRegistration', {
					ts: common.cts(),
					userName: username,
					orgName: orgName,
					role: role
				});
				
				//check if user exists or not
		
				Student.findOne({
					username: username			
				}, function (err, user1) {
					if (user1) {
							res.json({
								status: "Failed",
								message: "User already exists"
							});
					} else {
						// BCT user
						console.log(rollNo)
						Student.update({"rollNo":rollNo},{
							$set: {
								"username": username,
								"password": password,
								"regDate": regdate,
								"enable": false
							}
						
						},{
							"multi": true
						},function(err,user){
							console.log(user);
							if (err) {
								res.json({
									status: "Failed",
									message: "Error creating new user: " + err.message
								});
							} else {
								console.log("User saved in db successfully");
								//	res.statusCode = 200;
								//	res.message = "User registered successfully";
								//	res.json(newUser);
								let cdacuser = new cdacUser({
									username: username,
									password: password,
									role: role,
									token: token,
									regDate: regdate,
									enable: false,
									reset: false
							
								});
								cdacuser.save((err, newUser) => {
									if (err) {
										res.json({
											status: "Failed",
											message: "Error creating new user: " + err.message
										});
									} else {
										console.log(newUser +" saved in db successfully");
										//	res.statusCode = 200;
										//	res.message = "User registered successfully";
											/*res.json({status:"Success",
											message:newUser
											});*/
											res.json(response);
									}
								});								
								
							}
						})
					}
					if (err) {
						console.log(err);
					}
		
				})
				
			} else {
				logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
				res.json({
					status: "Failed",
					message: response
				});
			}
		}
		else{
			res.send(common.getErrorMessage('\'Roll no not exist\''));
		return;

		}
	})

};


//For creating new user in the organization ACTS
exports.orgaccount_bk = async (req, res) => {

	var attr;
	var fullname = req.body.fullname;
	var username = req.body.username;
    var password = req.body.password;
    var confirmpassword = req.body.confirmpassword;
    var centre = req.body.centre;
    var role = req.body.role;
	
	var orgName = "ActsOrg";
	//logger.info('End point : /org/signup');
	console.log('User name : ' + username);
	
	if (!fullname) {
		if(!validator.isAlphanumeric(fullname)) {
			res.send(common.getErrorMessage('\'fullname\''));
			return;
		}
	}

	if (!username) {
		if(!validator.isAlphanumeric(fullname)) {
			res.send(common.getErrorMessage('\'username\''));
			return;
		}
	}
	if (!password) {
		res.send(common.getErrorMessage('\'password\''));
		return;
    }
    if (!confirmpassword) {
		res.send(common.getErrorMessage('\'confirm password\''));
		return;
    }
    
    if(password != confirmpassword){
		res.send(common.getErrorMessage('\'Mismatch in Password and confirm password\''));
		return;
    }
    if (!centre) {
		res.send(common.getErrorMessage('\'centre\''));
		return;
    }
	
	if (!role) {
		res.send(common.getErrorMessage('\'role\''));
		return;
	}
	//if (role === "ch") {
	if(	role === "Centre Head"){
		attr = "reader";
	}
	//if (role === "tc") {
	if(role === "Training Coordinator")
		attr = "writer";
	
	//if (role === "po") {
	if(	role === "Placement Officer")
		attr = "reader";
	
	//if (role === "cc") {
		if(role === "Course Coordinator")
		attr = "reader";
	
	
	var regdate = Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime);
	if (role === "admin"){		
	console.log("regdate" +regdate);
	var token = jwt.sign({
		//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		//exp: Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime),
		//exp: regdate,
		fullname: fullname,
		username: username,
		orgName: orgName,
		role: role,
		centre: centre
	}, gconfig.secret);

	


	let user = new cdacUser({
		fullname: fullname,
		username: username,
		password: password,
		centre: centre,
		role: role,
		token: token,
		regDate: regdate,
		enable: false,
		reset: false

	});
	user.save((err, newUser) => {
		if (err) {
			res.json({
				status: "Failed",
				message: "Error creating new user: " + err.message
			});
		} else {
			console.log(newUser +" saved in db successfully");
			//	res.statusCode = 200;
			//	res.message = "User registered successfully";
				res.json({status:"Success",
				message:newUser
				});
		}
	});
}
else {
	//var regdate = new Date();
	var regdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
console.log("regdate" +regdate);
//token exp 1800 = 30*60 = 30mins
//token exp 30days = 30*24*60*60
var token = jwt.sign({
	//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
	//exp: Math.floor(Date.now().valueOf() / 1000) + 300,
	exp: Math.floor(Date.now().valueOf() / 1000) + 30*24*60*60,
	fullname: fullname,
	username: username,
	orgName: orgName,
	role: role,
	centre: centre
}, gconfig.secret);
let response = await helper.getRegisteredUser(username, orgName, attr, true);//
//logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
if (response && typeof response !== 'string') {
//	logger.debug('Successfully registered the username %s for organization %s', username, orgName);
	rtelib.raiseEvent('blockchain', 'userRegistration', {
		ts: common.cts(),
		userName: username,
		orgName: orgName,
		role: role
	});
	//response.token = token;
	//encrypt the password with bcrypt
	let saltRounds = 10;
	bcrypt.hash(password, saltRounds, function(err, hashedpwd) {
		if(err) {
			console.log(chalk.bgRed('salting passwd failed ', err));
			return;
		} else {			
			password = hashedpwd;

			console.log(chalk.bgGreen('salting password success ', password));
			// storing the userdetails in database
			let user = new cdacUser({
				fullname: fullname,
				username: username,
				password: password,
				centre: centre,
				role: role,
				token: token,
				regDate: regdate,
				enable: false,
				reset: false
				

			});

			//check if user exists or not

			cdacUser.findOne({
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
							console.log("User saved in db successfully");
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

			});
			
		}
	});




	/* // storing the userdetails in database
	let user = new cdacUser({
		fullname: fullname,
		username: username,
		password: password,
		centre: centre,
		role: role,
		token: token,
		regDate: regdate,
		enable: false,
		reset: false
		

	});

	//check if user exists or not

	cdacUser.findOne({
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
					console.log("User saved in db successfully");
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

	}) */
	
} else {
	logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
	res.json({
		status: "Failed",
		message: response
	});
}
}
	
	
};

exports.orgaccount = async (req, res) => {

	var attr;
	var fullname = req.body.fullname;
	var username = req.body.username;
    var password = req.body.password;
	var confirmpassword = req.body.confirmpassword;
	var email = req.body.email;
    var centre = req.body.centre;
    var role = req.body.role;
	
	var orgName = "ActsOrg";
	//logger.info('End point : /org/signup');
	console.log('User name : ' + username);
	
	if (!fullname) {
		if(!validator.isAlphanumeric(fullname)) {
			res.send(common.getErrorMessage('\'fullname\''));
			return;
		}
	}
	
	if (!username) {
		if(!validator.isAlphanumeric(username)) {
			res.send(common.getErrorMessage('\'username\''));
			return;
		}
	}
	
	if (!password) {
		res.send(common.getErrorMessage('\'password\''));
		return;
    }
    if (!confirmpassword) {
		res.send(common.getErrorMessage('\'confirm password\''));
		return;
    }
    
    if(password != confirmpassword){
		res.send(common.getErrorMessage('\'Mismatch in Password and confirm password\''));
		return;
    }
    if (!centre) {
		res.send(common.getErrorMessage('\'centre\''));
		return;
	}
	if (!email) {
		res.send(common.getErrorMessage('\'email\''));
		return;
	}
	if(!validator.isEmail(email)) {
		res.send(common.getErrorMessage('\'Invalid email\''));
		console.log(chalk.bgRed('invalid email'));
		return;
	}
	
	if (!role) {
		res.send(common.getErrorMessage('\'role\''));
		return;
	}

	

	//if (role === "ch") {
	if(	role === "Centre Head"){
		attr = "reader";
	}
	//if (role === "tc") {
	if(role === "Training Coordinator")
		attr = "writer";
	
	//if (role === "po") {
	if(	role === "Placement Officer")
		attr = "reader";
	
	//if (role === "cc") {
		if(role === "Course Coordinator")
		attr = "reader";
	
	
	var regdate = Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime);
	if (role === "admin"){		
		console.log("regdate" +regdate);
		var token = jwt.sign({
			//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
			//exp: Math.floor(Date.now() / 1000) + parseInt(gconfig.jwt_expiretime),
			//exp: regdate,
			fullname: fullname,
			username: username,
			orgName: orgName,
			role: role,
			centre: centre
		}, gconfig.secret);

		


		let user = new cdacUser({
			fullname: fullname,
			username: username,
			email: email,
			password: password,
			centre: centre,
			role: role,
			token: token,
			regDate: regdate,
			enable: false,
			reset: false

		});
		user.save((err, newUser) => {
			if (err) {
				res.json({
					status: "Failed",
					message: "Error creating new user: " + err.message
				});
			} else {
				console.log(newUser +" saved in db successfully");
				//	res.statusCode = 200;
				//	res.message = "User registered successfully";
					res.json({status:"Success",
					message:newUser
					});
			}
		});
	}
	else {
		//var regdate = new Date();
		var regdate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
		console.log("regdate" +regdate);
		//token exp 1800 = 30*60 = 30mins
		//token exp 30days = 30*24*60*60
		var token = jwt.sign({
			//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
			//exp: Math.floor(Date.now().valueOf() / 1000) + 300,
			exp: Math.floor(Date.now().valueOf() / 1000) + 30*24*60*60,
			fullname: fullname,
			username: username,
			orgName: orgName,
			role: role,
			centre: centre
		}, gconfig.secret);
		let response = await helper.getRegisteredUser(username, orgName, attr, true);//
		//logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
		if (response && typeof response !== 'string') {
		//	logger.debug('Successfully registered the username %s for organization %s', username, orgName);
			rtelib.raiseEvent('blockchain', 'userRegistration', {
				ts: common.cts(),
				userName: username,
				orgName: orgName,
				role: role
			});
			//response.token = token;
			//encrypt the password with bcrypt
			let saltRounds = 10;
			bcrypt.hash(password, saltRounds, function(err, hashedpwd) {
				if(err) {
					console.log(chalk.bgRed('salting passwd failed ', err));
					return;
				} else {			
					password = hashedpwd;

					console.log(chalk.bgGreen('salting password success ', password));
					// storing the userdetails in database
					let user = new cdacUser({
						fullname: fullname,
						username: username,
						password: password,
						centre: centre,
						role: role,
						token: token,
						regDate: regdate,
						enable: false,
						reset: false
						

					});

					//check if user exists or not

					cdacUser.findOne({
						username: username,
						orgname: orgName,
						centre: centre
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
									console.log("User saved in db successfully");
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

					});
					
				}
			});




			/* // storing the userdetails in database
			let user = new cdacUser({
				fullname: fullname,
				username: username,
				password: password,
				centre: centre,
				role: role,
				token: token,
				regDate: regdate,
				enable: false,
				reset: false
				

			});

			//check if user exists or not

			cdacUser.findOne({
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
							console.log("User saved in db successfully");
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

			}) */
	
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
exports.listcdacusers = (req, res) => {
	var id = {
        "_id": -1
    };
	
	cdacUser.find({},{ username: 1, role: 1, centre: 1, enable: 1, _id: 0 }).sort(id).then(eachUser => {
		res.json(eachUser);
	});
};


exports.studentlogin = (req, res) => {
    
    var username = req.body.username;
    var password = req.body.password;
  
    User.findOne({
        username: username,
        password: password
    }, function (err, user1) {
        
       if(user1 == null){
        res.send({
            status: "Failed",
            message: 'Username or Password is incorrect'
        });
        return;
	   }
	   
	   if(user1.role == "admin"){
		   	role = "admin";
	   }
		
	    if (user1.role === "sro") {
			role = "writer";
		}
		if (user1.role === "survey") {
			role = "creator";
		}
		if (user1.role === "tahsildar") {
			role = "writer";
		}
		if (user1.role === "other") {
			role = "reader";
		}
	   
	   //token exp 300 = 5*60 = 5mins
	   //token exp 1800 = 30*60 = 30mins
	   var token = jwt.sign({
		//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
       // exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
	  // exp: Math.floor(Date.now().valueOf() / 1000) + 1800,
	  exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
       // expiryIn: '1hr',
		username: username,
		orgName: user1.orgname,
		role: role
        }, gconfig.secret);
        
        User.update({"username": username}, {$set: {"token": token,"reset": false}},function (err, rowsUpdated) {
            if(err)
                logger.debug("Token Update failed:", err);
            console.log("Token updated");
        });
        if (user1 && user1.enable === true) {
        
            if(user1.role === "admin"){
                res.send({
                    status: "Success",
                    token: token,
                    message: "Administrator logged in Successfully"
                });
            }
            else{
         
           res.send({
               status: "Success",
               token: token,
               message: "Login Successful"
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
        } else if(err){
            res.send({
                status: "Failed",
                message: err
            });
           return;
        }
    });
   
};



exports.signin_old = async (req, res) => {
    
    var username = req.body.username;
	var password = req.body.password;
	var capToken = req.body.recaptcha;
	
	var role;


	console.log("in signin");

// 	var googleUrl = "https://www.google.com/recaptcha/api/siteverify";
//   var secret = "6LcZlqkUAAAAAMcLN7zbqB3ZCgPICi5AmXklmHWQ";
  
  request({
    url: recaptcha.googleUrl,
    method: "POST",
    json: true,   // <--Very important!!!
    qs: {
       secret: recaptcha.secret,
       response: capToken
      }
  },  function (error, response){
  //  console.log('inside captcha Validate ',body);
		if(response) {
			if(response.body.success === true){
				console.log("valid");
				message = "valid";
			   // callback(message);
			  // if(result === "valid") {
		  
				  
				  cdacUser.findOne({
					  username: username,
					  password: password
				  }, function (err, user1) {
					  
					 if(user1 == null){
					  res.send({
						  status: "Failed",
						  message: 'Username or Password is incorrect'
					  });
					  return;
					 }
					 
					 if(user1.role == "admin"){
							 role = "admin";
					 }
					  
					 
					 
					 //token exp 300 = 5*60 = 5mins
					 //token exp 1800 = 30*60 = 30mins
					 var token = jwt.sign({
					  //exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
					 // exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
					// exp: Math.floor(Date.now().valueOf() / 1000) + 1800,
					exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
					 // expiryIn: '1hr',
					  username: username,
					  orgName: user1.orgname,
					  role: user1.role,
					  centre:user1.centre
					  }, gconfig.secret);
					  
					  cdacUser.update({"username": username}, {$set: {"token": token,"reset": false}},function (err, rowsUpdated) {
						  if(err)
							  logger.debug("Token Update failed:", err);
						  console.log("Token updated");
					  });
					  if (user1 && user1.enable === true) {
					  
						  if(user1.role === "admin"){
							  res.send({
								  status: "Success",
								  token: token,
								  message: "Administrator logged in Successfully"
							  });
						  }
						  else{
					   
						 res.send({
							 status: "Success",
							 token: token,
							 message: "User Login Successful"
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
					  } else if(err){
						  res.send({
							  status: "Failed",
							  message: err
						  });
						 return;
					  }
				  });
				 
			  //}
			  // else
			  // res.send({status:"Failed","message":"Usesrname Password or captcha is incorrect..!"});
	  
	  
				return message;
			  } else {
				  message = "invalid";
				  console.log("Invalid");
				  res.send({status:"Failed","message":"Usesrname Password or captcha is incorrect..!"});
			   //   callback(message);
				  //return message;
			  }
		} else {
			console.log(chalk.bgRed("Response from captcha not success ", response));
            res.send({status:"Failed","message":"Something went Wrong... Please Try Again!!!"});
		}
        
        // message = await myfun(response);
        // return message;
     //   callback(message);
  });











	/* Captcha.validateCaptcha(req, await function(err,result){
		if(err)
		console.log(err);
		console.log(chalk.bgCyan('inside user signin ', result)); */

	/* if(result === "valid") {
	
			
		cdacUser.findOne({
			username: username,
			password: password
		}, function (err, user1) {
			
		   if(user1 == null){
			res.send({
				status: "Failed",
				message: 'Username or Password is incorrect'
			});
			return;
		   }
		   
		   if(user1.role == "admin"){
				   role = "admin";
		   }
			
		   
		   
		   //token exp 300 = 5*60 = 5mins
		   //token exp 1800 = 30*60 = 30mins
		   var token = jwt.sign({
			//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		   // exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
		  // exp: Math.floor(Date.now().valueOf() / 1000) + 1800,
		  exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
		   // expiryIn: '1hr',
			username: username,
			orgName: user1.orgname,
			role: user1.role,
			centre:user1.centre
			}, gconfig.secret);
			
			cdacUser.update({"username": username}, {$set: {"token": token,"reset": false}},function (err, rowsUpdated) {
				if(err)
					logger.debug("Token Update failed:", err);
				console.log("Token updated");
			});
			if (user1 && user1.enable === true) {
			
				if(user1.role === "admin"){
					res.send({
						status: "Success",
						token: token,
						message: "Administrator logged in Successfully"
					});
				}
				else{
			 
			   res.send({
				   status: "Success",
				   token: token,
				   message: "User Login Successful"
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
			} else if(err){
				res.send({
					status: "Failed",
					message: err
				});
			   return;
			}
		});
	   
	}
	else
	res.send({status:"Failed","message":"Usesrname Password or captcha is incorrect..!"}); */
	
	

	
	
	

  
    
};

exports.signin = async (req, res) => { //sigin with salted passwords
	
	console.log("in signin");
	console.log('basic auth pass ',req.headers.authorization)
    let basicData = req.headers.authorization;
    
    let b64string = basicData.split(' ')[1];
    
    let buf = new Buffer.from(b64string, 'base64').toString('utf-8');
    console.log('buffer is ', buf);
    let signinData = buf.split(':');
    let username = signinData[0];
    let password = signinData[1];
	if(!validator.isAlphanumeric(username)) {
		res.send(common.getErrorMessage('\'username\''));
		return;
	}
	//TODO passwd validation
	console.log('user pass is ', signinData[0], signinData[1]);
	

	
	// var username = req.body.username;
	// var password = req.body.password;

	var capToken = req.body.recaptcha;
	console.log('recaptcha is ', capToken);
	
	var role;


	

	
// 	var googleUrl = "https://www.google.com/recaptcha/api/siteverify";
//   var secret = "6LcZlqkUAAAAAMcLN7zbqB3ZCgPICi5AmXklmHWQ";
  
  request({
    url: recaptcha.googleUrl,
    method: "POST",
    json: true,   // <--Very important!!!
    qs: {
       secret: recaptcha.secret,
       response: capToken
      }
  },  function (error, response){
  //  console.log('inside captcha Validate ',body);
		if(response) {
			//console.log(response.body);
			if(response.body.success === true){
				console.log("captcha valid");
				message = "valid";
			   // callback(message);
			  // if(result === "valid") {
				  //Using Salted Password bcrypt
				  cdacUser.findOne({
					username: username,					
				  }, function(err, user1) {
						if(user1 == null){
							res.send({
								status: "Failed",
								message: 'Username or Password is incorrect'
							});
							return;
						}
						bcrypt.compare(password, user1.password, function (err, match) {
							console.log('inside compare password ',password, ' salted pass ', user1.password, ' status= ',  match);
							if (match == true) {
								console.log('user logged in success');
								if(user1.role == "admin"){
									role = "admin";
								}
								var token = jwt.sign({									
								  exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
								   // expiryIn: '1hr',
									username: username,
									orgName: user1.orgname,
									role: user1.role,
									centre:user1.centre
									}, gconfig.secret);
								
								cdacUser.update({"username": username}, {$set: {"token": token,"reset": false}},function (err, rowsUpdated) {
									if(err)
										logger.debug("Token Update failed:", err);
									console.log("Token updated in signin");
								});

								if (user1 && user1.enable === true) {
					  
									if(user1.role === "admin"){
										res.send({
											status: "Success",
											token: token,
											message: "Administrator logged in Successfully"
										});
									}
									else{
								 
										res.send({
											status: "Success",
											token: token,
											message: "User Login Successful"
										});
									}	
								} else if (user1 && user1.enable === false) {
									res.send({
										status: "Failed",
										message: 'Token is disabled'
									});
									return;
								} else if(err){
									res.send({
										status: "Failed",
										message: err
									});
								   return;
								}
								return message;

							} else {
								console.log('NOT matched')
								message = "invalid";								
								res.send({status:"Failed","message":"Username or Password is incorrect..!"});
							}
						});
				  });
			  } else {
				  message = "invalid";
				  console.log(" captcha Invalid");
				  res.send({status:"Failed","message":"captcha is incorrect..!"});			   
			  }
		} else {
			console.log(chalk.bgRed("Response from captcha not success ", response));
            res.send({status:"Failed","message":"Something went Wrong... Please Try Again!!!"});
		}
  });
};

exports.signout = async (req, res) => { //Signout with 

};

// Retrieve and return all users from the database.
exports.listCentres = (req, res) => {

	console.log("*****************");
	Centre.find({}).then(centre => {
		/* centre.forEach(centre1 => {
			res.json(centre1.name);
			
		}); */
		console.log(centre);
		
		res.json(centre);
	});
	//res.json(['C-DAC Hyderabad']);
};


exports.listCourses = (req, res) => {

	
	 Course.find({}).then(course => {
		/*course.forEach(course1 =>{
		res.json(course1.name);
		})*/
		console.log(course);
		res.json(course);
	});

	//res.json(['DAC','DSSD','DESD','DITISS'])
}

exports.listRoles = (req, res) => {

	
	/*/Course.find({}).then(course => {
		/*course.forEach(course1 =>{
		res.json(course1.name);
		})*/
		/*res.json(course);
	});*/
	let roles = {'Centre Head' : 'View Records','Training Coordinator' : 'Upload, View & Share Records','Course Coordinator' : 'View & Share Records','Placement Officer' : 'View & Share Records'};
	//res.json(['Centre Head - View Records','Training Coordinator - Upload, View & Share Records','Course Coordinator - View & Share Records','Placement Officer - View & Share Records'])
	res.json(roles);
}

exports.userdetails = async (req,res) => {

	var re1 = new RegExp('^([a-zA-Z/]+)$');
	//var re11 = new RegExp("^(?!.*(?:\.(?:exe|sh|js|bat|pdf|zip)(?:\.|$))).*\.(?:csv|xls|xlsx)$");
	var fileName = req.body.fileName;
	var content = req.body.base64;
	var decode_buf = new Buffer(content,'base64');
	
	


	var XLSX = require('xlsx');
	var workbook = XLSX.read(decode_buf, {type:'buffer'});
	var errorFlag = 0;
	
	var resultArray = []
	var successFullRecordCount = 0

	for (let index = 0; index <= workbook.SheetNames.length; index++) {
		const sheetName = workbook.SheetNames[index];
		var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header:1});
		roa.splice(0, 1); //for removing header row in the parsed data

		if (index <= workbook.SheetNames.length) {
			if(index < workbook.SheetNames.length){
				for (i = 0; i <= roa.length; i++) {
					var shouldReturnFromIteration = false
					if (i < roa.length) {
						row = roa[i]
					
						var student = new Student();
						student.username = "";
						student.password="";
						student.regDate="";
						student.enable=false;
						student.rollNo=row[0].toString().trim();

						student.name=row[1].trim();
						student.email=row[2].trim();
						student.mobileNo=row[3].toString().trim();

						/********************************Validations START*************************************************** */
						student.rollNo = validator.trim(student.rollNo.toString());
            			console.log(chalk.bgCyan(student.rollNo));
						await validate.validateRollNo(student.rollNo).then( vres => {
							//console.log("AFTER",res)
							if(vres.status == "Success") {
								console.log(chalk.bgGreen('rollNo valid'));
							} else if(vres.status == "Failed") {
								console.log(chalk.bgRed('rollNo Invalid ', vres.message));
								// res.send(common.getErrorMessage('\'RollNo\''));
								resultArray.push({
									'status': 'Failed',
									'rollNo' : student.rollNo,
									'message' : "Roll-Number Invalid "
								})
								shouldReturnFromIteration = true
							}				
						});
						if(shouldReturnFromIteration) continue;

						//*************Validate Mobile Number ********* 
						await validate.validateMobile(student.mobileNo).then(vres => {
							if(vres.status == "Success") {
								console.log(chalk.bgGreen('Mobile Number valid'));
							} else if(vres.status == "Failed") {
								console.log(chalk.bgRed('Mobile Number Invalid ', vres.message));
								// res.send(common.getErrorMessage('\'Mobile Number\''));
								resultArray.push({
									'status': 'Failed',
									'rollNo' : student.rollNo,
									'message' : "Mobile Number Invalid "
								})
								shouldReturnFromIteration = true
							}
						})
						if(shouldReturnFromIteration) continue;

						//***************Validate email ***************
						await validate.validateEmail(student.email).then(vres => {
							if(vres.status == "Success") {
								console.log(chalk.bgGreen('email valid'));
							} else if(vres.status == "Failed") {
								console.log(chalk.bgRed('email Invalid ', vres.message));
								// res.send(common.getErrorMessage('\'email\''));
								resultArray.push({
									'status': 'Failed',
									'rollNo' : student.rollNo,
									'message' : "Email Address Invalid "
								})
								shouldReturnFromIteration = true;
							}
						})
						if(shouldReturnFromIteration) continue;

						student.name = student.name.replace(/\s+/g, ' ');
						await validate.validateStudentName(student.name).then(vres => {
						//await validate.validateUserName(student.name).then(vres => {
							if(vres.status == "Success") {
								console.log(chalk.bgGreen('userName valid'));
							} else if(vres.status == "Failed") {
								console.log(chalk.bgRed('userName Invalid ', vres.message));
								// res.send(common.getErrorMessage('\'Student Name\''));
								resultArray.push({
									'status': 'Failed',
									'rollNo' : student.rollNo,
									'message' : "Student Name Invalid "
								})
								shouldReturnFromIteration = true;
							}
						})
						if(shouldReturnFromIteration) continue;

						/********************************Validations END*************************************************** */

						var year = student.rollNo.substr(0,2);
						year = "20"+year;
						student.year= year;
								
						//Retrieving month name from month number
						var monthsName = ["January", "February", "March", "April", "May", "June", "July", "August","September","October","November","December"];
						var month = student.rollNo.substr(2,2);
						month = monthsName[month-1];
						student.month= month;
						var centreCode = student.rollNo.substr(4,3);
						var centreName ='';

						var courseid = student.rollNo.substr(7,2);
						var courseName = '';


						await Centre.findOne({
							"code": centreCode
						}, function (err, cdata) {
							if (cdata) {
								centreName = cdata.name;
								student.centre = cdata.name;
							}
							else if (err) {
								resultArray.push({
									'status': 'Failed',
									'rollNo' : student.rollNo,
									'message' : "Can not find Centre "
								})
								shouldReturnFromIteration = true
							}
						});//END-OF find the center
						if(shouldReturnFromIteration) continue;


						/**
						 * find the cource
						 */
						await Course.findOne({
							"code": courseid
						}, function (err, cdata) {
							if (cdata) {
								courseName = cdata.name;
								student.course = cdata.name;
							}
							else if (err) {
								// resultList.push(getErrorMessage('\'Failed retrieve course details\''))
								resultArray.push({
									'status': 'Failed',
									'rollNo' : student.rollNo,
									'message' : "Can not find Course "
								})
								shouldReturnFromIteration = true
							}
						});// END-OF find course
						if (shouldReturnFromIteration) continue;
						

						/**
						 * Save stud details
						 */
						await student.save().then(newStud => {
							successFullRecordCount++
							resultArray.push({
								'status': 'Success',
								'rollNo' : student.rollNo,
								'message' : "Details Saved Successfully ",
								'result': newStud
							})
							console.log(chalk.inverse("student details saved in DB savedetails = ", newStud ));
						}).catch(err => {
							resultArray.push({
								'status': 'Failed',
								'rollNo' : student.rollNo,
								'message' : "Record Already Exist"
							})
							// shouldReturnFromIteration = true
							console.log(chalk.bgRed('Error in storing record in DB ' + err));
						})
						
					}else{
						
					}
				}
			}else{
				if(resultArray.length == 0) {
					res.json({
						status: "Success",
						message: "All records successfully uploaded"
					});
				} else{
					res.json({
						status: "Failed",
						message: `${successFullRecordCount} successful, ${resultArray.length - successFullRecordCount } failed to upload, check details`,
						result: resultArray
					});
				}
			}
		}
	}
	
	
	

	//******************************* *CSV PARSING STARTED************************************//

	// csv()
	// .fromFile(fileName)
	// .then((jsonArray)=>{
	// 	//console.log("JSON "+ jsonArray);
	// 	jsonArray.forEach(function(data) {
	
	// 		console.log('data is' + data );	
	// 		/*****************Validation of Input fields are to be done here ***************************/
	// 		var rollNo = data.PRN;
	// 		rollNo = rollNo.trim();
	// 		//console.log(chalk.inverse(rollNo));
	// 		var student = new Student();
	// 		student.username = "";
	// 		student.password="";
	// 		student.regDate="";
	// 		student.enable=false;
	// 		student.rollNo=data.PRN.trim();
	// 		student.name=data.Name;
	// 		student.email=data.eMail;
	// 		student.mobileNo=data.MobileNo;

	// 		var year = rollNo.substr(0,2);
	// 		year = "20"+year;
	// 		student.year= year;
					
	// 		//Retrieving month name from month number
	// 		var monthsName = ["January", "February", "March", "April", "May", "June", "July", "August","September","October","November","December"];
	// 		var month = rollNo.substr(2,2);
	// 		month = monthsName[month-1];
	// 		student.month= month;
	// 		var centreCode = rollNo.substr(4,3);
	// 		var centreName ='';

	// 		var courseid = rollNo.substr(7,2);
	// 		var courseName = '';

	// 		Centre.findOne({
	// 			"code": centreCode
	// 		}, function (err, cdata) {
	// 			//console.log("data in center finding "+ cdata);
	// 			if(cdata) {
	// 				//console.log("data in center finding "+ cdata.name);
	// 				centreName = cdata.name;
	// 				student.centre= cdata.name; //centre name updation from database
	// 				//searching for course name				
	// 				Course.findOne({
	// 					"code": courseid
	// 				}, function (err, crdata) {
	// 					//console.log("data in Course finding "+ crdata);
	// 					//console.log("data in Course finding "+ crdata.name);
	// 					if(crdata) {
	// 						courseName = crdata.name;
	// 						student.course= crdata.name; //course name updation from database
							
	// 						//console.log(chalk.bgGreen('courseName is ', courseName));
	
	// 						//saving student details to database
	// 						student.save(function (saveErr, savedetail) {
	// 							//resolve();
	// 							if (saveErr) {
	// 								  console.log(saveErr)
	// 							} else {
	// 								console.log(chalk.inverse("student details saved in DB savedetails = ", savedetail ));
	// 							}
	// 					   });
	// 					}
	// 				});			
	// 			}			
		
	// 		})
	// 	});
	// 	res.json({
	// 		status: "Success",
	// 		message: "Student details uploaded"
	// 	});
	// })
	
	//******************************* *CSV PARSING ENDED************************************//    

}

exports.userdetails_bk = async (req,res) => {

	var re1 = new RegExp('^([a-zA-Z/]+)$');
	//var re11 = new RegExp("^(?!.*(?:\.(?:exe|sh|js|bat|pdf|zip)(?:\.|$))).*\.(?:csv|xls|xlsx)$");
	var fileName = req.body.fileName;
	var content = req.body.base64;
	var decode_buf = new Buffer(content,'base64');
	
	//var mime = content.split(':')[1].split(';')[0]; //retreives fileType from base64 content

	/* if (re11.test(fileName)) {
		console.log(chalk.bgGreen("REG EXP::: filetype Valid"));
	} else {
		console.log(chalk.bgRed("REG EXP filetype Invalid"));
		res.json(getErrorMessage("Unsupported fileType request"));
		return;
	} */


	var fileType = req.body.fileType;
	console.log('fileType in userdetails upload is ', fileType);
	if (re1.test(fileType)) {
		console.log(chalk.bgGreen("REG EXP::: filetype Valid"));
	} else {
		console.log(chalk.bgRed("REG EXP filetype Invalid"));
		res.json(getErrorMessage("Unsupported fileType request"));
		return;
	}
	if(fileType === "text/csv" || fileType === "application/vnd.ms-excel" ||
    fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        console.log('Comp::: filtype supported');
    } else {
        console.log('Comp:: filtype unsupported');
        res.json(getErrorMessage("Unsupported fileType request"));
        return;
    }


	fs.writeFileSync(fileName,decode_buf);
	
	//console.log("before csv parsing")
	/* if(!validator.isMimeType(fileName)) {
		console.log(chalk.bgRed('invalid MIME type for the input file ', fileName));
		res.json({
			status: "Failed",
			message: "Invalid File Type. Please upload only csv files"
		});
		return;            
	} else {
		console.log(chalk.bgGreen('Valid MIME type for the input file ', fileName));            
	} */

	csv()
	.fromFile(fileName)
	.then((jsonArray)=>{
		//console.log("JSON "+ jsonArray);
		jsonArray.forEach(function(data) {
	
			console.log('data is' + data );	
			/*****************Validation of Input fields are to be done here ***************************/
			var rollNo = data.PRN;
			rollNo = rollNo.trim();
			//console.log(chalk.inverse(rollNo));
			var student = new Student();
			student.username = "";
			student.password="";
			student.regDate="";
			student.enable=false;
			student.rollNo=data.PRN.trim();
			student.name=data.Name;
			student.email=data.eMail;
			student.mobileNo=data.MobileNo;

			var year = rollNo.substr(0,2);
			year = "20"+year;
			student.year= year;
					
			//Retrieving month name from month number
			var monthsName = ["January", "February", "March", "April", "May", "June", "July", "August","September","October","November","December"];
			var month = rollNo.substr(2,2);
			month = monthsName[month-1];
			student.month= month;
			var centreCode = rollNo.substr(4,3);
			var centreName ='';

			var courseid = rollNo.substr(7,2);
			var courseName = '';

			Centre.findOne({
				"code": centreCode
			}, function (err, cdata) {
				//console.log("data in center finding "+ cdata);
				if(cdata) {
					//console.log("data in center finding "+ cdata.name);
					centreName = cdata.name;
					student.centre= cdata.name; //centre name updation from database
					//searching for course name				
					Course.findOne({
						"code": courseid
					}, function (err, crdata) {
						//console.log("data in Course finding "+ crdata);
						//console.log("data in Course finding "+ crdata.name);
						if(crdata) {
							courseName = crdata.name;
							student.course= crdata.name; //course name updation from database
							
							//console.log(chalk.bgGreen('courseName is ', courseName));
	
							//saving student details to database
							student.save(function (saveErr, savedetail) {
								//resolve();
								if (saveErr) {
									  console.log(saveErr)
								} else {
									console.log(chalk.inverse("student details saved in DB savedetails = ", savedetail ));
								}
						   });
						}
					});			
				}			
		
			})
		});
		res.json({
			status: "Success",
			message: "Student details uploaded"
		});

   
		/* var courseid = rollNo.substr(7,2);
		var courseName = '';
		Course.findOne({
			"code": courseid
		}, await function (err, cdata) {
			console.log("data in Course finding "+ cdata);
			console.log("data in Course finding "+ cdata.name);
			if(cdata) {
				courseName = cdata.name;
				student.update({
					"rollNo": rollNo
				}, 
				{
					$set: {
						"course": cdata.name
					}
				}, 
				function (err, courseUpdated) {
					if (err) {
						//throw err;
						console.log(err);
					}
					else 
						console.log(chalk.bgGreen("course name updated"));
				});
				//console.log(chalk.bgGreen('courseName is ', courseName));
			}
		}); */

		//sleep.msleep(2000); // sleep for 500 milliseconds

    //var No = rollNo.substr(9,3);

    
       /* var student = new Student(
           {
			username:"",
			password:"",
			regDate:"",
			enable:false,
            rollNo:data.PRN.trim(),
            name:data.Name,
            email:data.eMail,
			mobileNo:data.MobileNo,
			year: year,
			month: month,
			course: courseName,			
			centre: centreName			
           }
       ); */
       //details=data;
       
    })
    /* .on("end", function(){
		console.log(fileName, " parsing completed");
		res.json({
			status: "Success",
			message: "Student details uploaded"
		})
    })
 */
}

//Plain Text Password
exports.changepassword_bk = async (req, res) => {

	var attr1;
	var username = req.username;
	var password = req.body.password;
	var newpassword = req.body.newpassword;
    var confirmpassword = req.body.confirmpassword;
   	
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
    
    if(newpassword != confirmpassword){
		res.send(common.getErrorMessage('\'Mismatch in NewPassword and confirm password\''));
		return;
    }
   	//check if user exists or not

	cdacUser.findOne({
		username: username,
		password: password
	}, function (err, user1) {
		if (user1) {
			cdacUser.update({
					"username": username
				}, {
					$set: {
						"password": newpassword
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
					res.json({
						status: "Success",
						message: "User updated"
					});
				})
				
		} 
	else {
	logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
	res.json({
		status: "Failed",
		message: "User not found"
	});
	}

});
	
};

//Login plain text and change passwd to salted 
exports.changepassword_half = async (req, res) => { //migrating old user passwds to new salted passwds

	var attr1;
	var username = req.body.username;
	var password = req.body.password;
	var newpassword = req.body.newpassword;
	var confirmpassword = req.body.confirmpassword;
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
		res.send(common.getErrorMessage('\'new password\''));
		return;
    }
    if (!confirmpassword) {
		res.send(common.getErrorMessage('\'confirm password\''));
		return;
    }
    
    if(newpassword != confirmpassword){
		res.send(common.getErrorMessage('\'Mismatch in NewPassword and confirm password\''));
		return;
    }
   	//check if user exists or not

	cdacUser.findOne({
		username: username,
		password: password		
	}, function (err, user1) {
		if (user1) {
			//Check the old password matching with database or not
			//bcrypt.compare(password, user1.password, function (err, match) {
				//console.log('inside compare ', match);
				//if (match == true) { //if old passwd is correct
					//Salt the new Password
					let saltRounds = 10;
					bcrypt.hash(newpassword, saltRounds, function(err, hashedpwd) {
						if(err) {
							console.log(chalk.bgRed('salting passwd failed ', err));
							return;
						} else {			
							newpassword = hashedpwd;

							console.log(chalk.bgGreen('salting password success ', newpassword));
							cdacUser.update({
								"username": username
							}, {
								$set: {
									"password": newpassword
								}
							},
							function (err, rowsUpdated) {
								if (err){
								//	console.log("Update failed:", err);
									res.json({
										status: "Failed",
										message: "Passwd change failed: " + err
									});
								}
								console.log("User details updated");
								res.json({
									status: "Success",
									message: "Password changed successfully"
								});
							});
						}
					});
				// } else {
				// 	res.json({
				// 		status: "Failed",
				// 		message: "Old Password not matched"
				// 	});
				// }					
			//});
		} else {
			logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
			res.json({
				status: "Failed",
				message: "User not found for chaning the password"
			});
		}

	});
	
};

//Login and change password with salting
exports.changepassword = async (req, res) => { // USe this for full salting

	var attr1;
	var username = req.username;
	var password = req.body.password;
	var newpassword = req.body.newpassword;
    var confirmpassword = req.body.confirmpassword;
	   
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
    
    if(newpassword != confirmpassword){
		res.send(common.getErrorMessage('\'Mismatch in NewPassword and confirm password\''));
		return;
    }
   	//check if user exists or not

	cdacUser.findOne({
		username: username,		
	}, function (err, user1) {
		if (user1) {
			//Check the old password matching with database or not
			bcrypt.compare(password, user1.password, function (err, match) {
				console.log('inside compare ', match);
				if (match === true) { //if old passwd is correct
					//Salt the new Password
					let saltRounds = 10;
					bcrypt.hash(newpassword, saltRounds, function(err, hashedpwd) {
						if(err) {
							console.log(chalk.bgRed('salting passwd failed ', err));
							return;
						} else {			
							newpassword = hashedpwd;

							console.log(chalk.bgGreen('salting password success ', newpassword));
							cdacUser.update({
								"username": username
							}, {
								$set: {
									"password": newpassword
								}
							},
							function (err, rowsUpdated) {
								if (err){
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
				} else if (match === false){
					res.json({
						status: "Failed",
						message: "Old Password not matched"
					});
				}					
			});
		} else {
			logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
			res.json({
				status: "Failed",
				message: "User not found for chaning the password"
			});
		}

	});
	
};

// Update a user identified by the userId in the request
exports.update_bk = (req, res) => {

	var token = req.body.token;
	var enable = req.body.enable;
	console.log(req.body.enable)
	cdacUser.update({
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

exports.update = (req, res) => {

	var username = req.body.username;
	var enable = req.body.enable;
	console.log(req.body.enable)
	if(username === 'Admin') {
		res.json({
			status: "Failed",
			message: "Admin User cannot be disabled"
		});
		return;
	}
	cdacUser.update({
			"username": username
		}, {
			$set: {
				"enable": enable
			}
		},
		function (err, rowsUpdated) {
			if (err) {
			//	console.log("Update failed:", err);
				logger.debug("User Update failed:", err);
				res.json({
					status: "Failed",
					message: "User updation failed"
				});
			} else {
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
			}
			console.log("User status updated");
		})
	/* if (enable === true)
		res.send({
			status: "Success",
			message: "Token enabled"
		});
	else
		res.send({
			status: "Success",
			message: "Token disabled"
		}); */
};

exports.totalStudents = (req, res) => {

    Student.find({}).then(student => {
        /*res.json({
            "rollNo":eachPoe.issuedTo,
            "documentType":eachPoe.documentType,
            "sha256hash":eachPoe.sha256Hash,
            "txId": eachPoe.txId,
            "timestamp":eachPoe.timestamp
        });*/
        res.json({"NoOfStudents":student.length});
    })
    //  res.send("Find Allstudents");

};
exports.totalregisteredUsers = (req, res) => {

	var Noofstudents;
	var Nooforgusers;
	var Noofbctusers;
	var totalusers;

	bctUser.find({"enable":true}).then(users=>{

		Noofbctusers = users.length;
		console.log(Noofbctusers);
		cdacUser.find({"enable":true}).then(users=>{

			Nooforgusers = users.length;
			console.log(Nooforgusers);
			Student.find({"enable":true}).then(student => {
        
				Noofstudents = student.length;	
				totalusers = Noofstudents + Nooforgusers + Noofbctusers
				res.json({"NoOfEnabledUsers":totalusers});
				});
		})
	})
	
    
	
    //  res.send("Find Allstudents");

};

exports.totalUsers = (req, res) => {

	var Noofstudents;
	var Nooforgusers;
	var Noofbctusers;
	var totalusers;

	bctUser.find({}).then(users=>{

		Noofbctusers = users.length;
		console.log(Noofbctusers);
		cdacUser.find({}).then(users=>{

			Nooforgusers = users.length;
			console.log(Nooforgusers);
			Student.find({}).then(student => {
		   
				Noofstudents = student.length;	
				console.log(Noofstudents);
				totalusers = Noofstudents + Nooforgusers + Noofbctusers;
				console.log(totalusers);
				res.json({"NoOfUsers":totalusers});
				});
				
		})
		
	})
	
	
    //  res.send("Find Allstudents");

};

exports.fetchyear = (req, res) => {

    var centre = req.body.centre;
    //console.log(chalk.bgYellow('inside fetchYear ',centre));
    Student.find({"centre":centre},{
		year:1,
		_id:0
    }).then(eachCentre => {
        /*res.json({
            "rollNo":eachPoe.issuedTo,
            "documentType":eachPoe.documentType,
            "sha256hash":eachPoe.sha256Hash,
            "txId": eachPoe.txId,
            "timestamp":eachPoe.timestamp
		});*/
		//console.log(chalk.bgCyan('inside fetch year:::', eachCentre));
        res.json(eachCentre);
    })
    //  res.send("Find All Properties");

};
exports.fetchbatch = (req, res) => {

    var centre = req.body.centre;
    var year = req.body.year;
    
    Student.find({"centre":centre,"year":year},{
        month:1,
        _id:0
    }).then(eachPoe => {
        /*res.json({
            "rollNo":eachPoe.issuedTo,
            "documentType":eachPoe.documentType,
            "sha256hash":eachPoe.sha256Hash,
            "txId": eachPoe.txId,
            "timestamp":eachPoe.timestamp
        });*/
        res.json(eachPoe);
    })
    //  res.send("Find All Properties");

};
exports.fetchcourse = (req, res) => {

    var centre = req.body.centre;
    var year = req.body.year;
    var batch = req.body.batch;
    
    Student.find({"centre":centre,"year":year,"month":batch},{
        course:1,
        _id:0
    }).then(eachPoe => {
        /*res.json({
            "rollNo":eachPoe.issuedTo,
            "documentType":eachPoe.documentType,
            "sha256hash":eachPoe.sha256Hash,
            "txId": eachPoe.txId,
            "timestamp":eachPoe.timestamp
        });*/
        res.json(eachPoe);
    })
    //  res.send("Find All Properties");

};

exports.fetchrollNo = (req, res) => {

    var centre = req.body.centre;
    var year = req.body.year;
    var batch = req.body.batch;
    var course = req.body.course;
    
    Student.find({"centre":centre,"year":year,"month":batch,"course":course},{
        rollNo:1,
        _id:0
    }).then(eachPoe => {
        /*res.json({
            "rollNo":eachPoe.issuedTo,
            "documentType":eachPoe.documentType,
            "sha256hash":eachPoe.sha256Hash,
            "txId": eachPoe.txId,
            "timestamp":eachPoe.timestamp
        });*/
        res.json(eachPoe);
    })
    //  res.send("Find All Properties");

};

exports.fetchCentre = (req, res) => {

    console.log(chalk.bgYellow('inside fetchCentre ', req.body.centre));
    Student.find({},{
        centre:1,
        _id:0
    }).then(eachPoe => {
        /*res.json({
            "rollNo":eachPoe.issuedTo,
            "documentType":eachPoe.documentType,
            "sha256hash":eachPoe.sha256Hash,
            "txId": eachPoe.txId,
            "timestamp":eachPoe.timestamp
		});*/
		console.log(chalk.bgCyan('inside fetchcentre::::', eachPoe));
        res.json(eachPoe);
    })
    //  res.send("Find All Properties");

};

/* exports.signin = async (req, res) => {
    
    var username = req.body.username;
	var password = req.body.password;
	var capToken = req.body.recaptcha;
	
	var role;


	console.log("in signin");

	var googleUrl = "https://www.google.com/recaptcha/api/siteverify";
  var secret = "6LcZlqkUAAAAAMcLN7zbqB3ZCgPICi5AmXklmHWQ";
  
  request({
    url: googleUrl,
    method: "POST",
    json: true,   // <--Very important!!!
    qs: {
       secret: secret,
       response: capToken
      }
  },  function (error, response){
  //  console.log('inside captcha Validate ',body);
		if(response) {
			if(response.body.success === true){
				console.log("valid");
				message = "valid";
			   // callback(message);
			  // if(result === "valid") {
		  
				  
				  cdacUser.findOne({
					  username: username,
					  password: password
				  }, function (err, user1) {
					  
					 if(user1 == null){
					  res.send({
						  status: "Failed",
						  message: 'Username or Password is incorrect'
					  });
					  return;
					 }
					 
					 if(user1.role == "admin"){
							 role = "admin";
					 }
					  
					 
					 
					 //token exp 300 = 5*60 = 5mins
					 //token exp 1800 = 30*60 = 30mins
					 var token = jwt.sign({
					  //exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
					 // exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
					// exp: Math.floor(Date.now().valueOf() / 1000) + 1800,
					exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
					 // expiryIn: '1hr',
					  username: username,
					  orgName: user1.orgname,
					  role: user1.role,
					  centre:user1.centre
					  }, gconfig.secret);
					  
					  cdacUser.update({"username": username}, {$set: {"token": token,"reset": false}},function (err, rowsUpdated) {
						  if(err)
							  logger.debug("Token Update failed:", err);
						  console.log("Token updated");
					  });
					  if (user1 && user1.enable === true) {
					  
						  if(user1.role === "admin"){
							  res.send({
								  status: "Success",
								  token: token,
								  message: "Administrator logged in Successfully"
							  });
						  }
						  else{
					   
						 res.send({
							 status: "Success",
							 token: token,
							 message: "User Login Successful"
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
					  } else if(err){
						  res.send({
							  status: "Failed",
							  message: err
						  });
						 return;
					  }
				  });
				 
			  //}
			  // else
			  // res.send({status:"Failed","message":"Usesrname Password or captcha is incorrect..!"});
	  
	  
				return message;
			  } else {
				  message = "invalid";
				  console.log("Invalid");
				  res.send({status:"Failed","message":"Usesrname Password or captcha is incorrect..!"});
			   //   callback(message);
				  //return message;
			  }
		} else {
			console.log(chalk.bgRed("Response from captcha not success ", response));
            res.send({status:"Failed","message":"Something went Wrong... Please Try Again!!!"});
		}
        
        // message = await myfun(response);
        // return message;
     //   callback(message);
  });











	/* Captcha.validateCaptcha(req, await function(err,result){
		if(err)
		console.log(err);
		console.log(chalk.bgCyan('inside user signin ', result)); */

	/* if(result === "valid") {
	
			
		cdacUser.findOne({
			username: username,
			password: password
		}, function (err, user1) {
			
		   if(user1 == null){
			res.send({
				status: "Failed",
				message: 'Username or Password is incorrect'
			});
			return;
		   }
		   
		   if(user1.role == "admin"){
				   role = "admin";
		   }
			
		   
		   
		   //token exp 300 = 5*60 = 5mins
		   //token exp 1800 = 30*60 = 30mins
		   var token = jwt.sign({
			//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		   // exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
		  // exp: Math.floor(Date.now().valueOf() / 1000) + 1800,
		  exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
		   // expiryIn: '1hr',
			username: username,
			orgName: user1.orgname,
			role: user1.role,
			centre:user1.centre
			}, gconfig.secret);
			
			cdacUser.update({"username": username}, {$set: {"token": token,"reset": false}},function (err, rowsUpdated) {
				if(err)
					logger.debug("Token Update failed:", err);
				console.log("Token updated");
			});
			if (user1 && user1.enable === true) {
			
				if(user1.role === "admin"){
					res.send({
						status: "Success",
						token: token,
						message: "Administrator logged in Successfully"
					});
				}
				else{
			 
			   res.send({
				   status: "Success",
				   token: token,
				   message: "User Login Successful"
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
			} else if(err){
				res.send({
					status: "Failed",
					message: err
				});
			   return;
			}
		});
	   
	}
	else
	res.send({status:"Failed","message":"Usesrname Password or captcha is incorrect..!"}); */
	/*
	
	

	
	
	

  
    
}; */


// exports.signin = async (req, res) => {
    
//     var username = req.body.username;
// 	var password = req.body.password;
	
// 	var role;


// 	console.log("in signin");

// 	let result = await Captcha.validateCaptcha(req);
// 	console.log(result);

// 	if(result === "valid") {
	
			
// 			cdacUser.findOne({
// 				username: username,
// 				password: password
// 			}, function (err, user1) {
				
// 			   if(user1 == null){
// 				res.send({
// 					status: "Failed",
// 					message: 'Username or Password is incorrect'
// 				});
// 				return;
// 			   }
			   
// 			   if(user1.role == "admin"){
// 					   role = "admin";
// 			   }
				
			   
			   
// 			   //token exp 300 = 5*60 = 5mins
// 			   //token exp 1800 = 30*60 = 30mins
// 			   var token = jwt.sign({
// 				//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
// 			   // exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
// 			  // exp: Math.floor(Date.now().valueOf() / 1000) + 1800,
// 			  exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
// 			   // expiryIn: '1hr',
// 				username: username,
// 				orgName: user1.orgname,
// 				role: user1.role,
// 				centre:user1.centre
// 				}, gconfig.secret);
				
// 				cdacUser.update({"username": username}, {$set: {"token": token,"reset": false}},function (err, rowsUpdated) {
// 					if(err)
// 						logger.debug("Token Update failed:", err);
// 					console.log("Token updated");
// 				});
// 				if (user1 && user1.enable === true) {
				
// 					if(user1.role === "admin"){
// 						res.send({
// 							status: "Success",
// 							token: token,
// 							message: "Administrator logged in Successfully"
// 						});
// 					}
// 					else{
				 
// 				   res.send({
// 					   status: "Success",
// 					   token: token,
// 					   message: "User Login Successful"
// 				   });
// 				}
				   
				   
// 					//logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
// 					//return next();
// 				} else if (user1 && user1.enable === false) {
// 					res.send({
// 						status: "Failed",
// 						message: 'Token is disabled'
// 					});
// 					return;
// 				} else if(err){
// 					res.send({
// 						status: "Failed",
// 						message: err
// 					});
// 				   return;
// 				}
// 			});
		   
// 		}
// 		else
// 		res.send({status:"Failed","message":"Usesrname Password or captcha is incorrect..!"});
	
	
	

  
    
// };

//Not using this
/* let saveToDb = async (code, name, callback)=>{

	console.log(code)
	console.log(name)


	Centre.findOne({ //Finding whether centre already exists in DB
		code: code.toString()
		// code: "503"
		// }, function (err, cent) {
		}).then(cent => {
			// console.log(chalk.bgRed('error in finding centre '+ err));
			console.log(chalk.bgGreen('Center already exists in DB, cent ' + cent));
			// if(err) {
			// 	console.log(chalk.bgRed('error in finding centre '+ err));
			// 	throw err;
			// } else if(cent) { // If Centre already exists
			// 	console.log(chalk.bgGreen('Center already exists in DB, cent ' + cent));
			// } else { //If not exists then add this new centre to db
				let cdacCenter = new Centre({
					name:name,
					code:code
				});
			// 	console.log(chalk.cyan(cdacCenter));
				cdacCenter.save(async (err, newCenter) => {
				//cdacCenter.save( (err, newCenter) => {
					if(err) {
						console.log(chalk.bgRed('Error in saving center details'));
						callback(false)
						throw err;
					} else {
						console.log(chalk.bgGreen('New center details saved in DB'));
						callback(true)
					}
	
				});
			// }
	});
}


var findCentreName = function(cCode, done) { //Check the database if Centre exists.
	Centre.findOne({ code: cCode }, (err, data) => {
		if (err) {
			done(err);
		}
		done(null, data);
	})
};

var SaveCentre = function(cCode, cName, done) { //Adds a new Centre.
	let cdacCenter = new Centre({
		name:cName,
		code:cCode
	});

	cdacCenter.save( (err, data) => {
		if(err) {
			console.log(chalk.bgRed('Error in saving center details'));
				//callback(false)
				//throw err;
			return done(err);
		} else {
			console.log(chalk.bgGreen('New center details saved in DB'));
				//callback(true)
			return done(null, data)
		}

	});
} */

/* Captcha.validateCaptcha(req, await function(err,result){
		if(err)
		console.log(err);
		console.log(chalk.bgCyan('inside user signin ', result)); */

	/* if(result === "valid") {
	
			
		cdacUser.findOne({
			username: username,
			password: password
		}, function (err, user1) {
			
		   if(user1 == null){
			res.send({
				status: "Failed",
				message: 'Username or Password is incorrect'
			});
			return;
		   }
		   
		   if(user1.role == "admin"){
				   role = "admin";
		   }
			
		   
		   
		   //token exp 300 = 5*60 = 5mins
		   //token exp 1800 = 30*60 = 30mins
		   var token = jwt.sign({
			//exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
		   // exp: Math.floor(Date.now().valueOf() / 1000) + parseInt(gconfig.jwt_expiretime),
		  // exp: Math.floor(Date.now().valueOf() / 1000) + 1800,
		  exp: Math.floor(Date.now().valueOf() / 1000) + 2592000,
		   // expiryIn: '1hr',
			username: username,
			orgName: user1.orgname,
			role: user1.role,
			centre:user1.centre
			}, gconfig.secret);
			
			cdacUser.update({"username": username}, {$set: {"token": token,"reset": false}},function (err, rowsUpdated) {
				if(err)
					logger.debug("Token Update failed:", err);
				console.log("Token updated");
			});
			if (user1 && user1.enable === true) {
			
				if(user1.role === "admin"){
					res.send({
						status: "Success",
						token: token,
						message: "Administrator logged in Successfully"
					});
				}
				else{
			 
			   res.send({
				   status: "Success",
				   token: token,
				   message: "User Login Successful"
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
			} else if(err){
				res.send({
					status: "Failed",
					message: err
				});
			   return;
			}
		});
	   
	}
	else
	res.send({status:"Failed","message":"Usesrname Password or captcha is incorrect..!"}); */
	