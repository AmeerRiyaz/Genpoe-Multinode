const mongoose = require('mongoose');
var install = require('../../hyperledger/install-chaincode.js');
var instantiate = require('../../hyperledger/instantiate-chaincode.js');
var invoke = require('../../hyperledger/poe/invoke-transaction.js');
var query = require('../../hyperledger/poe/query.js');
const proofofex = require('../../models/training/certificate.model');
var log4js = require('log4js');
var logger = log4js.getLogger('poechaincode.controller');
var validator = require('validator');
const validFilename = require('valid-filename');
const User = require('../../models/bctuser.model.js');
const cdacUser = require('../../models/training/cdacusers.model.js');
const io = require('socket.io-client');
var rtelib0 = require('../../rtelib/rte-lib');
var rtconfig = require('../../config/rtconfig');
//var serverIP = 'http://10.244.0.48:3000';
const socket = io(rtconfig.rteserverIP + '/blockchain-nsp');
var rtelib = new rtelib0(socket);
const nodemailer = require("nodemailer");
const fs = require('fs');
const Student = require('../../models/training/student.model.js');
var rabbitq = require('../rabbitqsender');
var pdf = require('html-pdf');
var ipfsClient = require('../ipfs_client');
var zip = require('express-zip');
var phantom = require('phantom');
const PDFDocument = require('pdfkit');
const qrcode = require('qrcode');
const env = require('../../config/environment');
const Captcha = require('./captcha.controller');
var jwt = require('jsonwebtoken');
const gconfig = require("../../config/generalconfig");
//var centerCodes = require('./centerCodes.json');
//var courseCodes = require('./courseCodes.json');
const chalk = require('chalk');
var Center = require('../../models/training/centre.model');
var Course = require('../../models/training/course.model');
const request = require('request');
const dateFormat = require('dateformat')
var sleep = require('sleep');
const recaptcha = require('../../config/recaptcha');
const emailConfig = require('../../config/email');
const validate = require('../validations');
const readChunk = require('read-chunk');
const OrigfileType = require('file-type');

//var ipfsAPI = require('ipfs-api')
var ipfsAPI = require('ipfs-http-client');
async = require("async");

var ipfs;
//ipfs = ipfsAPI({host:'10.244.1.233', port:'5001', protocol: 'http'})
function cts() {
    var current = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    //var curr_ts = current.toString();
    return current;
}

function getErrorMessage(message) {
    var response = {
        status: "Failed",
        message: message,
        result: ""
    };
    logger.debug(chalk.bgRed(response.status + ' : ' + response.message));
    // rtelib.raiseEvent('blockchain', 'poeSearch', {
    //     ts: cts(),
    //     msg: 'Query failed due to ' + field
    // });
    return response;
}
// Invoke transaction on chaincode on target peers

exports.invoke_bk = async (req, res) => {
    logger.debug('==================== INVOKE ON CHAINCODE ==================');


    var data = req.body;
    var peers = "peer0.actsorg.cdac.in";
    var chaincodeName = "cdacpoe";
    var channelName = "cdacpoechannel";

    var fcn = "recordProofOfEx";
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }

    /* var re1 = new RegExp('^([a-zA-Z/]+)$');
    var re2 = new RegExp('^([a-zA-Z]+)$');
    var re3 = new RegExp('^([a-zA-Z0-9 _-]+)$'); */
    let resultList = [];
    //var done = false;
    var i = 0;

    for (i = 0; i < data.length; i++) {

        let cert = new proofofex();

        var error_message = null;

        var file = data[i].fileName;
        console.log(file);
        file = file.substring(0, file.lastIndexOf('.'));
        console.log(file);
        validate.validatefileName(file).then(vres => {
            if (vres.status == "Success") {
                console.log(chalk.bgGreen('fileName valid'));
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('fileName Invalid ', vres.message));
                res.json(vres);
                return;
            }
        })

        var documentType = data[i].documentType;
        validate.validatefileName(documentType).then(vres => {
            if (vres.status == "Success") {
                console.log(chalk.bgGreen('Document Type valid'));
                cert.documentType = documentType;
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('Document Type Invalid ', vres.message));
                res.json(getErrorMessage("Invalid request"));
            }
        })


        var sha256Hash = data[i].sha256Hash;
        validate.validateSha256Hash(sha256Hash).then(vres => {
            if (vres.status == "Success") {
                cert.sha256Hash = sha256Hash;
                //console.log(chalk.bgGreen('sha256Hash valid'));
            } else if (vres.status == "Failed") {
                res.json(vres);
                console.log(chalk.bgRed('sha256Hash Invalid ', vres.message));
                return;
            }
        })



        var sha1Hash = data[i].sha1Hash;
        validate.validateSha1Hash(sha1Hash).then(vres => {
            if (vres.status == "Success") {
                //console.log(chalk.bgGreen('sha1Hash valid'));
                cert.sha1Hash = sha1Hash;
            } else if (vres.status == "Failed") {
                res.json(vres);
                console.log(chalk.bgRed('sha1Hash Invalid ', vres.message));
                return;
            }
        })



        var backLink = "";

        var issuedByOrg = req.orgname;
        cert.issuedByOrg = issuedByOrg;

        var issuedByUser = req.username;
        cert.issuedByUser = issuedByUser;

        var content = data[i].base64;
        var mime = content.split(':')[1].split(';')[0];
        var b64 = content.split(',')[1]
        validate.validateBase64(b64).then(vres => {
            if (vres.status == "Success") {
                //console.log(chalk.bgGreen('base64 valid'));
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('base64 Invalid ', vres.message));
                res.json(vres);
                return;
            }
        });

        var issuedTo;
        var rollNo = data[i].issuedTo;

        rollNo = validator.trim(rollNo.toString());
        validate.validateRollNo(rollNo).then(vres => {
            if (vres.status == "Success") {
                //console.log(chalk.bgGreen('rollNo valid'));
                cert.issuedTo = rollNo;
                issuedTo = rollNo;
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('rollNo Invalid ', vres.message));
                res.json(vres);
                return;
            }
            //console.log('roll: ' + rollNo + ' Name: '+row[1]+' email: '+row[2]+' mobile: '+row[3]);
        })

        var fileType;
        var fileName;
        validate.validateMimeType(b64).then(async vres => {
            //console.log(vres);
            if (vres.status == "Failed") {
                console.log(chalk.bgRed('Unsupported file ', vres.message));
            
                res.json(vres);
                return;
            } else if (vres.status == "Success") {
                //console.log(chalk.bgGreen('base64 valid'));
                //console.log("111", vres.status)
                cert.fileType = vres.result;
                fileType = vres.result;
                fileName = file + '.' + vres.result;
                cert.fileName = fileName;
                //var issuedByUser = req.fullname;

                Student.findOne({
                    "rollNo": rollNo
                }, function (err, student) {
                    if (student) {
                        //console.log(chalk.bgGreen("student rollNo exist"));
                    } else if (student === null || err) {
                        res.json(getErrorMessage('\'Roll No not matched\''));
                        return;
                    }
                });


                var year = rollNo.substr(0, 2);
                year = "20" + year;
                //console.log(chalk.bgGreen('year:', year));
                cert.year = year;

                var monthsName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                // var month = rollNo.substr(2,2);
                var month = rollNo.substr(2, 2);
                month = monthsName[month - 1];
                //console.log(chalk.bgGreen('month:', month));
                cert.month = month;

                var args = [
                    sha256Hash,
                    sha1Hash,
                    fileName,
                    fileType,
                    documentType,
                    issuedTo,
                    backLink
                ];
                console.log("after filling args = ")
                console.log(args);
                var regtime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

                cert.txstatus = "Pending";
                cert.txId = "";
                cert.timestamp = regtime;

                //console.log(chalk.bgCyan('cert is ', cert));

                //cert.course = "";
                var centreCode = rollNo.substr(4, 3);
                var centreName;

                var courseid = rollNo.substr(7, 2);
                var courseName = '';


                //****************************************** */
                Center.findOne({
                    "code": centreCode
                }, function (err, cdata) {
                    if (cdata) {
                        centreName = cdata.name;
                        cert.centre = cdata.name;

                        Course.findOne({
                            "code": courseid
                        }, function (err, cdata) {
                            if (cdata) {
                                courseName = cdata.name;
                                cert.course = cdata.name;

                                cert.save(async (err, newPoe) => {
                                    if (err) {
                                        error_message = err.message;
                                        console.log(chalk.bgRed('Error in storing record in DB ' + error_message));
                                        //res.json("Error creating new asset: " + err.message);
                                        // return;
                                    } else {
                                        logger.debug(chalk.bgGreen("Asset saved in db successfully"));
                                        console.log(chalk.bgGreen("db saved"));
                                        res.statusCode = 200;
                                        res.message = "Asset created successfully";
                                    }
                                });
                            }
                        });
                    }
                });

                var No = rollNo.substr(9, 3);

                var localfile = process.cwd() + '/certificates/' + rollNo + "-" + documentType + "." + fileType;

                //console.log(localfile);


                //****************************************** */
                fs.writeFileSync(localfile, content);

                //save the file in PoS
                // Save a new asset/property
                //console.log(error_message);
                if (!error_message) {
                    //console.log('before invoke');

                    //****************************************** */
                    let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);

                    //console.log(chalk.bgCyan('i = ' + i + ' Response from invokechaincode 00000000000000000 is ', message.status));
                    if (message.status === "Success") {
                        //var timestamp = new Date();

                        var timestamp = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

                        //****************************************** */
                        ipfsClient.storeFile(localfile, await function (posHash) {
                            console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage function 1111111 status = ', posHash));
                            posStatus = true;
                            var email = "";
                            var name = "";

                            //****************************************** */
                            //sending mail to  student
                            Student.findOne({
                                "rollNo": rollNo
                            }, function (err, student) {
                                console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage, student record function 2222222222222 student'));
                                if (student) {
                                    proofofex.update({
                                        "sha256Hash": sha256Hash
                                    }, {
                                        $set: {
                                            "txstatus": "Success",
                                            "txId": message.txId,
                                            "timestamp": timestamp,
                                            "posHash": posHash,
                                            "posStatus": posStatus,
                                            "emailStatus": ""
                                        }
                                    },
                                        {
                                            "multi": true
                                        }, function (err, rowsUpdated) {
                                            if (!err) {
                                                proofofex.findOne({
                                                    "sha256Hash": sha256Hash
                                                }, function (err, poe1) {
                                                    //console.log("updated");
                                                    resultList.push({
                                                        "fileName": fileName,
                                                        "sha256Hash": sha256Hash,
                                                        "status": "Success",
                                                        message: poe1
                                                    });
                                                });
                                            }
                                        });
                                    email = student.email;
                                    rollNo = student.rollNo;
                                    name = student.name;
                                    //sendmailToStudent(documentType, localfile, email, rollNo, name, centre, function (emailStatus) {
                                    sendmailToStudent(documentType, content, email, rollNo, name, centreName, courseName, function (emailStatus) {
                                        //console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage, student record, sendmail function 3333333333333333 emailstatus = ', emailStatus));
                                        //console.log(emailStatus);
                                        console.log('email status is ', emailStatus);
                                    });

                                }
                            });


                        });

                        if (data.length == resultList.length) {
                            console.log(resultList)
                            res.send(resultList);
                        }


                    } else {
                        rtelib.raiseEvent('blockchain', 'poe', {
                            ts: cts(),
                            msg: fileName + ' already exist'
                        });
                        resultList.push({
                            "fileName": fileName,
                            "sha256Hash": sha256Hash,
                            "status": "Failed",
                            "message": fileName + " already exist"
                        });
                        /// console.log(chalk.bgRed("File i = " + i + "Already Exist" + " result length = " + resultList.length));
                        if (data.length == resultList.length) {
                            console.log(resultList)
                            res.send(resultList);
                        }
                    }
                } else {
                    resultList.push({
                        "fileName": fileName,
                        "status": "Failed",
                        "message": "Problem in storing to DB"
                    });
                    /* console.log(chalk.bgRed("Incorrect File::::  i = " + i + " result length = " + resultList.length));
                    if (data.length == resultList.length) {
                        console.log(resultList)
                        res.send(resultList);
                    } */
                } //else end of error_message
                //console.log(chalk.bgRed("Incorrect File::::  i = " + i + " result length = " + resultList.length));
                /* if (data.length == resultList.length) {
                    console.log(resultList)
                    res.send(resultList);
                } */
            } // else end of validateMimeType function
        }); //end of validateMimeType function
        //} //end of file extenstion if case
    }
};

exports.invoke = async (req, res) => {
    //==================== RESTRUCTURED ON 9th AUGEST : Vikas ==================
    logger.debug('==================== INVOKE ON CHAINCODE ==================');

    var data = req.body;
    var peers = "peer0.actsorg.cdac.in";
    var chaincodeName = "cdacpoe";
    var channelName = "cdacpoechannel";
    var fcn = "recordProofOfEx";

    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }


    var resultList = [];

    var i = 0;

    for (i = 0; i <= data.length; i++) {
        if (i < data.length) {
            let cert = new proofofex();
            // var error_message = null;


            var backLink = "";

            var issuedByOrg = req.orgname;
            cert.issuedByOrg = issuedByOrg;

            var issuedByUser = req.username;
            cert.issuedByUser = issuedByUser;


            var file = data[i].fileName;

            shouldSkipThisFile = false
            /******************** VALIDATIONS START *******************/
            file = file.substring(0, file.lastIndexOf('.'));


            await validate.validatefileName(file).then(vres => {
                if (vres.status == "Success") {
                    // console.log(chalk.bgGreen('fileName valid'));
                } else if (vres.status == "Failed") {
                    console.log(chalk.bgRed('fileName Invalid ', vres.message));
                    shouldSkipThisFile = true
                    resultList.push(vres)

                }
            })
            if (shouldSkipThisFile) continue



            var documentType = data[i].documentType;
            await validate.validatefileName(documentType).then(vres => {
                if (vres.status == "Success") {
                    // console.log(chalk.bgGreen('Document Type valid'));
                    cert.documentType = documentType;
                } else if (vres.status == "Failed") {
                    console.log(chalk.bgRed('Document Type Invalid ', vres.message));
                    shouldSkipThisFile = true
                    resultList.push(vres)

                }
            })
            if (shouldSkipThisFile) continue


            var sha256Hash = data[i].sha256Hash;
            await validate.validateSha256Hash(sha256Hash).then(vres => {
                if (vres.status == "Success") {
                    cert.sha256Hash = sha256Hash;
                    //console.log(chalk.bgGreen('sha256Hash valid'));
                } else if (vres.status == "Failed") {
                    console.log(chalk.bgRed('sha256Hash Invalid ', vres.message));
                    shouldSkipThisFile = true
                    resultList.push(vres)

                }
            })
            if (shouldSkipThisFile) continue



            var sha1Hash = data[i].sha1Hash;
            await validate.validateSha1Hash(sha1Hash).then(vres => {
                if (vres.status == "Success") {
                    //console.log(chalk.bgGreen('sha1Hash valid'));
                    cert.sha1Hash = sha1Hash;
                } else if (vres.status == "Failed") {
                    console.log(chalk.bgRed('sha1Hash Invalid ', vres.message));
                    shouldSkipThisFile = true
                    resultList.push(vres)

                }
            })
            if (shouldSkipThisFile) continue



            var content = data[i].base64;
            var mime = content.split(':')[1].split(';')[0];
            var b64 = content.split(',')[1]


            await validate.validateBase64(b64).then(vres => {
                if (vres.status == "Success") {
                    //console.log(chalk.bgGreen('base64 valid'));
                } else if (vres.status == "Failed") {
                    console.log(chalk.bgRed('base64 Invalid ', vres.message));
                    shouldSkipThisFile = true
                    resultList.push(vres)

                }
            });
            if (shouldSkipThisFile) continue


            var fileType;
            var fileName;

            await validate.validateMimeType(b64).then(vres => {
                if (vres.status == "Failed") {
                    console.log(chalk.bgRed('Unsupported file ', vres.message));
                    shouldSkipThisFile = true
                    resultList.push(vres)

                } else if (vres.status == "Success") {
                    cert.fileType = vres.result;
                    fileType = vres.result;
                    fileName = file + '.' + vres.result;
                    cert.fileName = fileName;
                    console.log("validateMimeType FILE TYPE", vres)
                }
            })
            if (shouldSkipThisFile) continue


            var issuedTo;
            var rollNo = data[i].issuedTo;

            rollNo = validator.trim(rollNo.toString());
            console.log(chalk.bgCyan(rollNo));
            await validate.validateRollNo(rollNo).then(vres => {
                if (vres.status == "Success") {
                    console.log(chalk.bgGreen('rollNo valid'));
                    cert.issuedTo = rollNo;
                    issuedTo = rollNo;
                } else if (vres.status == "Failed") {
                    console.log(chalk.bgRed('rollNo Invalid ', vres.message));
                    shouldSkipThisFile = true
                    resultList.push(vres)

                }
            })
            if (shouldSkipThisFile) continue





            /******************** VALIDATIONS END *******************/


            /**
             * Check if roll no exist
             * */
            var student = await Student.findOne({
                "rollNo": rollNo
            }, function (err, student) {
                if (student) {
                    //console.log(chalk.bgGreen("student rollNo exist"));
                } else if (student === null || err) {
                    resultList.push(getErrorMessage('\'Failed to retrieve roll no details\''))
                    shouldSkipThisFile = true
                }
            });// END-OF Check if roll no exist
            if (shouldSkipThisFile) continue



            var year = rollNo.substr(0, 2);
            year = "20" + year;
            cert.year = year;
            var monthsName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var month = rollNo.substr(2, 2);
            month = monthsName[month - 1];
            cert.month = month;
            var args = [
                sha256Hash,
                sha1Hash,
                fileName,
                fileType,
                documentType,
                issuedTo,
                backLink
            ];
            console.log("after filling args = ")
            console.log(args);
            var regtime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            cert.txstatus = "Pending";
            cert.txId = "";
            cert.timestamp = regtime;


            var centreCode = rollNo.substr(4, 3);
            var centreName;

            var courseid = rollNo.substr(7, 2);
            var courseName = '';



            /**
             * find the center
             */
            await Center.findOne({
                "code": centreCode
            }, function (err, cdata) {
                if (cdata) {
                    centreName = cdata.name;
                    cert.centre = cdata.name;
                }
                else if (err) {
                    resultList.push(getErrorMessage('\'Failed to retrieve center details\''))
                    shouldSkipThisFile = true
                }
            });//END-OF find the center
            if (shouldSkipThisFile) continue



            /**
             * find the cource
             */
            await Course.findOne({
                "code": courseid
            }, function (err, cdata) {
                if (cdata) {
                    courseName = cdata.name;
                    cert.course = cdata.name;
                }
                else if (err) {
                    resultList.push(getErrorMessage('\'Failed to retrieve course details\''))
                    shouldSkipThisFile = true
                }
            });// END-OF find course
            if (shouldSkipThisFile) continue




            /**
             * Save file in blockchain
             */


            console.log('before invoke');
            var invokeChaincodeResponse
            // invoke.invokeChaincode(e,)
            await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg).then(message1 => {
                console.log('SUCCESSSSS')
                invokeChaincodeResponse = message1
                console.log(message1);
                console.log(message1.toString());
                console.log(chalk.bgCyan('i = ' + i + ' Response from invokechaincode is', message1.status));
                console.log(chalk.bgCyan('Response from invokeChaincode is ', message1.message));
            })

            if (invokeChaincodeResponse.status == "Failed") {
                rtelib.raiseEvent('blockchain', 'poe', {
                    ts: cts(),
                    msg: fileName + ' already exist'
                });
                resultList.push({
                    "fileName": fileName,
                    "sha256Hash": sha256Hash,
                    "status": "Failed",
                    "message": invokeChaincodeResponse.message
                });
                shouldSkipThisFile = true
            }
            if (shouldSkipThisFile) continue




            /**
             * Save in database
             */
            var localfile = process.cwd() + '/certificates/' + rollNo + "-" + documentType + "." + fileType;
            fs.writeFileSync(localfile, content);

            await cert.save().then(
                newPoe => {
                    logger.debug(chalk.bgGreen("Asset saved in db successfully"));
                    console.log(chalk.bgGreen("db saved"));
                }
            ).catch(err => {
                shouldSkipThisFile = true// error_message = err.message;
                console.log(chalk.bgRed('Error in storing record in DB ' + err));
                resultList.push(getErrorMessage('\'Failed to store record in db\''))
            });
            //END-OF Save in database
            if (shouldSkipThisFile) continue




            var timestamp = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            email = student.email;
            rollNo = student.rollNo;
            name = student.name;


            /**
             * Save in ipfs
             */
            var posHash
            await ipfsClient.storeFile_by_VIKAS(localfile).then((posH) => {
                // console.log(posH)
                posHash = posH
                console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage function status ', posHash));
            }).catch((err) => {
                resultList.push(getErrorMessage('\'Failed to store record in ipfs\''))
                shouldSkipThisFile = true
            });
            //END-OF Save in ipfs
            if (shouldSkipThisFile) continue



            /**
             * Send mail
             */
            posStatus = true;
            email = student.email;
            rollNo = student.rollNo;
            name = student.name;
            var txnID = invokeChaincodeResponse.txId;
            var emailstatusNew


            await sendmailToStudent_by_VIKAS(documentType, email, rollNo, name, centreName, courseName, fileName, b64, fileType, txnID, cert, timestamp).then((emailStatusRes) => {
                emailstatusNew = emailStatusRes
            }).catch((emailStatusRes) => {
                emailstatusNew = emailStatusRes
            })

            console.log('inside invoke:: mail status = ', emailstatusNew)

            /**
             * REVIEW
             * Update status 
             */
            await proofofex.update({ "sha256Hash": sha256Hash }, {
                $set: {
                    "txstatus": "Success",
                    "txId": invokeChaincodeResponse.txId,
                    "timestamp": timestamp,
                    "posHash": posHash,
                    "posStatus": posStatus,
                    "emailStatus": emailstatusNew
                }
            }, { "multi": true })
                .then((resp) => {
                    console.log("Transaction update in db successful:", resp)
                }).catch((err) => {
                    console.log("Transaction update in db failed:", resp.message)
                })


            //localfile should be deleted
            try {
                fs.unlinkSync(localfile)
                console.log(chalk.bgGreen(localfile + ' is deleted'))
                //file removed
            } catch (err) {
                console.error('Unable to remove temp file ' + localfile + 'error: ' + err);
            }

            /**
             * 
             * send entire result object back to client
             */
            var finalResponse
            await proofofex.findOne({
                "sha256Hash": sha256Hash
            }).then((resp) => {
                finalResponse = resp
            }).catch((err) => {
                finalResponse = '\'Failed to prepare response but transaction is successful\''
            })




            /** END OF ITERATION 
             * This is final insertion of result after all checks 
             * if anything failed in between will be skiped there itself with respective failure response
             * Correct the response structure for every response added to result list
            */
            resultList.push({
                "fileName": fileName,
                "sha256Hash": sha256Hash,
                "status": "Success",
                message: "Recording successfull with Transaction id:"+finalResponse.txId
            });

        } else {
            console.log(chalk.bgGreen("Recording transactions completed sending response"))
            console.log(resultList)
            res.send(resultList);

        }
    }
}


exports.invoke_aug_9_working = async (req, res) => {
    logger.debug('==================== INVOKE ON CHAINCODE ==================');


    var data = req.body;
    var peers = "peer0.actsorg.cdac.in";
    var chaincodeName = "cdacpoe";
    var channelName = "cdacpoechannel";

    var fcn = "recordProofOfEx";
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }

    /* var re1 = new RegExp('^([a-zA-Z/]+)$');
    var re2 = new RegExp('^([a-zA-Z]+)$');
    var re3 = new RegExp('^([a-zA-Z0-9 _-]+)$'); */
    let resultList = [];
    //var done = false;
    var i = 0;

    for (i = 0; i < data.length; i++) {

        let cert = new proofofex();

        var error_message = null;

        var file = data[i].fileName;
        console.log(file);
        file = file.substring(0, file.lastIndexOf('.'));
        console.log(file);
        validate.validatefileName(file).then(vres => {
            if (vres.status == "Success") {
                console.log(chalk.bgGreen('fileName valid'));
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('fileName Invalid ', vres.message));
                res.json(vres);
                return;
            }
        })

        var documentType = data[i].documentType;
        validate.validatefileName(documentType).then(vres => {
            if (vres.status == "Success") {
                console.log(chalk.bgGreen('Document Type valid'));
                cert.documentType = documentType;
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('Document Type Invalid ', vres.message));
                res.json(getErrorMessage("Invalid request"));
            }
        })


        var sha256Hash = data[i].sha256Hash;
        validate.validateSha256Hash(sha256Hash).then(vres => {
            if (vres.status == "Success") {
                cert.sha256Hash = sha256Hash;
                //console.log(chalk.bgGreen('sha256Hash valid'));
            } else if (vres.status == "Failed") {
                res.json(vres);
                console.log(chalk.bgRed('sha256Hash Invalid ', vres.message));
                return;
            }
        })



        var sha1Hash = data[i].sha1Hash;
        validate.validateSha1Hash(sha1Hash).then(vres => {
            if (vres.status == "Success") {
                //console.log(chalk.bgGreen('sha1Hash valid'));
                cert.sha1Hash = sha1Hash;
            } else if (vres.status == "Failed") {
                res.json(vres);
                console.log(chalk.bgRed('sha1Hash Invalid ', vres.message));
                return;
            }
        })



        var backLink = "";

        var issuedByOrg = req.orgname;
        cert.issuedByOrg = issuedByOrg;

        var issuedByUser = req.username;
        cert.issuedByUser = issuedByUser;

        var content = data[i].base64;
        var mime = content.split(':')[1].split(';')[0];
        var b64 = content.split(',')[1]
        validate.validateBase64(b64).then(vres => {
            if (vres.status == "Success") {
                //console.log(chalk.bgGreen('base64 valid'));
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('base64 Invalid ', vres.message));
                res.json(vres);
                return;
            }
        });

        var issuedTo;
        var rollNo = data[i].issuedTo;

        rollNo = validator.trim(rollNo.toString());
        validate.validateRollNo(rollNo).then(vres => {
            if (vres.status == "Success") {
                //console.log(chalk.bgGreen('rollNo valid'));
                cert.issuedTo = rollNo;
                issuedTo = rollNo;
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('rollNo Invalid ', vres.message));
                res.json(vres);
                return;
            }
            //console.log('roll: ' + rollNo + ' Name: '+row[1]+' email: '+row[2]+' mobile: '+row[3]);
        })

        var fileType;
        var fileName;
        validate.validateMimeType(b64).then(async vres => {
            //console.log(vres);
            if (vres.status == "Failed") {
                console.log(chalk.bgRed('Unsupported file ', vres.message));
                res.json(vres);
                return;
            } else if (vres.status == "Success") {
                //console.log(chalk.bgGreen('base64 valid'));
                //console.log("111", vres.status)
                cert.fileType = vres.result;
                fileType = vres.result;
                fileName = file + '.' + vres.result;
                cert.fileName = fileName;
                //var issuedByUser = req.fullname;

                Student.findOne({
                    "rollNo": rollNo
                }, function (err, student) {
                    if (student) {
                        //console.log(chalk.bgGreen("student rollNo exist"));
                    } else if (student === null || err) {
                        res.json(getErrorMessage('\'Roll No not matched\''));
                        return;
                    }
                });


                var year = rollNo.substr(0, 2);
                year = "20" + year;
                //console.log(chalk.bgGreen('year:', year));
                cert.year = year;

                var monthsName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                // var month = rollNo.substr(2,2);
                var month = rollNo.substr(2, 2);
                month = monthsName[month - 1];
                //console.log(chalk.bgGreen('month:', month));
                cert.month = month;

                var args = [
                    sha256Hash,
                    sha1Hash,
                    fileName,
                    fileType,
                    documentType,
                    issuedTo,
                    backLink
                ];
                console.log("after filling args = ")
                console.log(args);
                var regtime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

                cert.txstatus = "Pending";
                cert.txId = "";
                cert.timestamp = regtime;

                //console.log(chalk.bgCyan('cert is ', cert));

                //cert.course = "";
                var centreCode = rollNo.substr(4, 3);
                var centreName;

                var courseid = rollNo.substr(7, 2);
                var courseName = '';


                //****************************************** */
                Center.findOne({
                    "code": centreCode
                }, function (err, cdata) {
                    if (cdata) {
                        centreName = cdata.name;
                        cert.centre = cdata.name;

                        Course.findOne({
                            "code": courseid
                        }, function (err, cdata) {
                            if (cdata) {
                                courseName = cdata.name;
                                cert.course = cdata.name;

                                cert.save(async (err, newPoe) => {
                                    if (err) {
                                        error_message = err.message;
                                        console.log(chalk.bgRed('Error in storing record in DB ' + error_message));
                                        //res.json("Error creating new asset: " + err.message);
                                        // return;
                                    } else {
                                        logger.debug(chalk.bgGreen("Asset saved in db successfully"));
                                        console.log(chalk.bgGreen("db saved"));
                                        res.statusCode = 200;
                                        res.message = "Asset created successfully";
                                    }
                                });
                            }
                        });
                    }
                });

                var No = rollNo.substr(9, 3);

                var localfile = process.cwd() + '/certificates/' + rollNo + "-" + documentType + "." + fileType;

                //console.log(localfile);


                //****************************************** */
                fs.writeFileSync(localfile, content);

                //save the file in PoS
                // Save a new asset/property
                //console.log(error_message);
                if (!error_message) {
                    console.log('before invoke');

                    //****************************************** */
                    let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);

                    console.log(chalk.bgCyan('i = ' + i + ' Response from invokechaincode 00000000000000000 is ', message.status));
                    if (message.status === "Success") {
                        //var timestamp = new Date();

                        var timestamp = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

                        //****************************************** */
                        ipfsClient.storeFile(localfile, await function (posHash) {
                            console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage function 1111111 status = ', posHash));
                            posStatus = true;
                            var email = "";
                            var name = "";

                            //****************************************** */
                            //sending mail to  student
                            Student.findOne({
                                "rollNo": rollNo
                            }, function (err, student) {
                                console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage, student record function 2222222222222 student'));
                                if (student) {
                                    email = student.email;
                                    rollNo = student.rollNo;
                                    name = student.name;
                                    //sendmailToStudent(documentType, localfile, email, rollNo, name, centre, function (emailStatus) {
                                    sendmailToStudent(documentType, content, email, rollNo, name, centreName, courseName, function (emailStatus) {
                                        console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage, student record, sendmail function 3333333333333333 emailstatus = ', emailStatus));
                                        //console.log(emailStatus);
                                        proofofex.update({
                                            "sha256Hash": sha256Hash
                                        },
                                            {
                                                $set: {
                                                    "txstatus": "Success",
                                                    "txId": message.txId,
                                                    "timestamp": timestamp,
                                                    "posHash": posHash,
                                                    "posStatus": posStatus,
                                                    "emailStatus": emailStatus
                                                }
                                            },
                                            {
                                                "multi": true
                                            },
                                            function (err, rowsUpdated) {
                                                if (err) console.log(err);
                                                console.log(chalk.bgGreen("DB row updated with new transaction data"));

                                                proofofex.findOne({
                                                    "sha256Hash": sha256Hash
                                                }, function (err, poe1) {
                                                    console.log(chalk.bgCyan('poe for file ', i, ' is '));
                                                    // logger.debug(poe1);

                                                    // rtelib.raiseEvent('blockchain', 'poe', {
                                                    //     ts: cts(),
                                                    //     msg: sha256Hash + ' uploaded in PoE'
                                                    // });
                                                    //TODO mail certificate to student
                                                    // Student.findOne({"rollNo":rollNo},async function(err,student){
                                                    //     console.log(student.email);
                                                    //     var qdata = student.email+";"+";"+localfile;
                                                    //rabbitq.sendData(qdata);                           
                                                    console.log("updated");
                                                    //  done = true;
                                                    resultList.push({
                                                        "fileName": fileName,
                                                        "sha256Hash": sha256Hash,
                                                        "status": "Success",
                                                        message: poe1

                                                    });
                                                    //console.log(resultList + "i = " + i);
                                                    console.log(chalk.bgCyan("i = " + i + " result length = " + resultList.length + " data length " + data.length));
                                                    if (data.length === resultList.length) {
                                                        console.log(resultList)
                                                        res.send(resultList);
                                                    }
                                                    else {
                                                        console.log("i not reached to end");
                                                    }

                                                });

                                                //

                                            });

                                    });

                                }
                            });


                        });



                    } else {
                        rtelib.raiseEvent('blockchain', 'poe', {
                            ts: cts(),
                            msg: fileName + ' already exist'
                        });
                        resultList.push({
                            "fileName": fileName,
                            "sha256Hash": sha256Hash,
                            "status": "Failed",
                            "message": fileName + " already exist"
                        });
                        console.log(chalk.bgRed("File i = " + i + "Already Exist" + " result length = " + resultList.length));
                        if (data.length == resultList.length) {
                            console.log(resultList)
                            res.send(resultList);
                        }
                        //return;
                        // res.send({
                        //     status: "Failed",
                        //     message: fileName + " already exist",
                        //     result: ""
                        // });

                    }
                } else {
                    resultList.push({
                        "fileName": fileName,
                        "status": "Failed",
                        "message": "Incorrect file"
                    });
                    console.log(chalk.bgRed("Incorrect File::::  i = " + i + " result length = " + resultList.length));
                    if (data.length == resultList.length) {
                        console.log(resultList)
                        res.send(resultList);
                    }
                    //  res.json(getErrorMessage('\'Incorrect file\''));
                    // return;
                }//else end of error_message
                console.log(chalk.bgRed("Incorrect File::::  i = " + i + " result length = " + resultList.length));
                /* if (data.length == resultList.length) {
                    console.log(resultList)
                    res.send(resultList);
                } */
            } // else end of validateMimeType function
        }); //end of validateMimeType function
        //} //end of file extenstion if case
    }
};

exports.invoke_workingOld = async (req, res) => {
    logger.debug('==================== INVOKE ON CHAINCODE ==================');


    var data = req.body;
    var peers = "peer0.actsorg.cdac.in";
    var chaincodeName = "cdacpoe";
    var channelName = "cdacpoechannel";

    var fcn = "recordProofOfEx";
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }

    /* var re1 = new RegExp('^([a-zA-Z/]+)$');
    var re2 = new RegExp('^([a-zA-Z]+)$');
    var re3 = new RegExp('^([a-zA-Z0-9 _-]+)$'); */
    let resultList = [];
    //var done = false;
    var i = 0;

    for (i = 0; i < data.length; i++) {

        let cert = new proofofex();

        var error_message = null;

        var file = data[i].fileName;
        console.log(file);
        file = file.substring(0, file.lastIndexOf('.'));
        console.log(file);
        validate.validatefileName(file).then(vres => {
            if (vres.status == "Success") {
                console.log(chalk.bgGreen('fileName valid'));
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('fileName Invalid ', vres.message));
                res.json(vres);
                return;
            }
        })

        var documentType = data[i].documentType;
        validate.validatefileName(documentType).then(vres => {
            if (vres.status == "Success") {
                console.log(chalk.bgGreen('Document Type valid'));
                cert.documentType = documentType;
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('Document Type Invalid ', vres.message));
                res.json(getErrorMessage("Invalid request"));
            }
        })


        var sha256Hash = data[i].sha256Hash;
        validate.validateSha256Hash(sha256Hash).then(vres => {
            if (vres.status == "Success") {
                cert.sha256Hash = sha256Hash;
                //console.log(chalk.bgGreen('sha256Hash valid'));
            } else if (vres.status == "Failed") {
                res.json(vres);
                console.log(chalk.bgRed('sha256Hash Invalid ', vres.message));
                return;
            }
        })



        var sha1Hash = data[i].sha1Hash;
        validate.validateSha1Hash(sha1Hash).then(vres => {
            if (vres.status == "Success") {
                //console.log(chalk.bgGreen('sha1Hash valid'));
                cert.sha1Hash = sha1Hash;
            } else if (vres.status == "Failed") {
                res.json(vres);
                console.log(chalk.bgRed('sha1Hash Invalid ', vres.message));
                return;
            }
        })



        var backLink = "";

        var issuedByOrg = req.orgname;
        cert.issuedByOrg = issuedByOrg;

        var issuedByUser = req.username;
        cert.issuedByUser = issuedByUser;

        var content = data[i].base64;
        var mime = content.split(':')[1].split(';')[0];
        var b64 = content.split(',')[1]
        validate.validateBase64(b64).then(vres => {
            if (vres.status == "Success") {
                //console.log(chalk.bgGreen('base64 valid'));
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('base64 Invalid ', vres.message));
                res.json(vres);
                return;
            }
        });

        var issuedTo;
        var rollNo = data[i].issuedTo;

        rollNo = validator.trim(rollNo.toString());
        validate.validateRollNo(rollNo).then(vres => {
            if (vres.status == "Success") {
                //console.log(chalk.bgGreen('rollNo valid'));
                cert.issuedTo = rollNo;
                issuedTo = rollNo;
            } else if (vres.status == "Failed") {
                console.log(chalk.bgRed('rollNo Invalid ', vres.message));
                res.json(vres);
                return;
            }
            //console.log('roll: ' + rollNo + ' Name: '+row[1]+' email: '+row[2]+' mobile: '+row[3]);
        })

        var fileType;
        var fileName;
        validate.validateMimeType(b64).then(async vres => {
            //console.log(vres);
            if (vres.status == "Failed") {
                console.log(chalk.bgRed('Unsupported file ', vres.message));
                // res.json(vres);
                res.send({
                        status: "Failed",
                        message: "Unsupported or Corrupted File ",
                        result: ""
                    });
                return;
            } else if (vres.status == "Success") {
                //console.log(chalk.bgGreen('base64 valid'));
                //console.log("111", vres.status)
                cert.fileType = vres.result;
                fileType = vres.result;
                fileName = file + '.' + vres.result;
                cert.fileName = fileName;
                //var issuedByUser = req.fullname;

                Student.findOne({
                    "rollNo": rollNo
                }, function (err, student) {
                    if (student) {
                        //console.log(chalk.bgGreen("student rollNo exist"));
                    } else if (student === null || err) {
                        res.json(getErrorMessage('\'Roll No not matched\''));
                        return;
                    }
                });


                var year = rollNo.substr(0, 2);
                year = "20" + year;
                //console.log(chalk.bgGreen('year:', year));
                cert.year = year;

                var monthsName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                // var month = rollNo.substr(2,2);
                var month = rollNo.substr(2, 2);
                month = monthsName[month - 1];
                //console.log(chalk.bgGreen('month:', month));
                cert.month = month;

                var args = [
                    sha256Hash,
                    sha1Hash,
                    fileName,
                    fileType,
                    documentType,
                    issuedTo,
                    backLink
                ];
                console.log("after filling args = ")
                console.log(args);
                var regtime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

                cert.txstatus = "Pending";
                cert.txId = "";
                cert.timestamp = regtime;

                //console.log(chalk.bgCyan('cert is ', cert));

                //cert.course = "";
                var centreCode = rollNo.substr(4, 3);
                var centreName;

                var courseid = rollNo.substr(7, 2);
                var courseName = '';


                //****************************************** */
                Center.findOne({
                    "code": centreCode
                }, function (err, cdata) {
                    if (cdata) {
                        centreName = cdata.name;
                        cert.centre = cdata.name;

                        Course.findOne({
                            "code": courseid
                        }, function (err, cdata) {
                            if (cdata) {
                                courseName = cdata.name;
                                cert.course = cdata.name;

                                cert.save(async (err, newPoe) => {
                                    if (err) {
                                        error_message = err.message;
                                        console.log(chalk.bgRed('Error in storing record in DB ' + error_message));
                                        //res.json("Error creating new asset: " + err.message);
                                        // return;
                                    } else {
                                        logger.debug(chalk.bgGreen("Asset saved in db successfully"));
                                        console.log(chalk.bgGreen("db saved"));
                                        res.statusCode = 200;
                                        res.message = "Asset created successfully";
                                    }
                                });
                            }
                        });
                    }
                });

                var No = rollNo.substr(9, 3);

                var localfile = process.cwd() + '/certificates/' + rollNo + "-" + documentType + "." + fileType;

                //console.log(localfile);


                //****************************************** */
                fs.writeFileSync(localfile, content);

                //save the file in PoS
                // Save a new asset/property
                //console.log(error_message);
                if (!error_message) {
                    console.log('before invoke');

                    //****************************************** */
                    let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);

                    console.log(chalk.bgCyan('i = ' + i + ' Response from invokechaincode 00000000000000000 is ', message.status));
                    if (message.status === "Success") {
                        //var timestamp = new Date();

                        var timestamp = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

                        //****************************************** */
                        ipfsClient.storeFile(localfile, await function (posHash) {
                            console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage function 1111111 status = ', posHash));
                            posStatus = true;
                            var email = "";
                            var name = "";

                            //****************************************** */
                            //sending mail to  student
                            Student.findOne({
                                "rollNo": rollNo
                            }, function (err, student) {
                                console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage, student record function 2222222222222 student'));
                                if (student) {
                                    email = student.email;
                                    rollNo = student.rollNo;
                                    name = student.name;
                                    //sendmailToStudent(documentType, localfile, email, rollNo, name, centre, function (emailStatus) {
                                    sendmailToStudent(documentType, content, email, rollNo, name, centreName, courseName, function (emailStatus) {
                                        console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage, student record, sendmail function 3333333333333333 emailstatus = ', emailStatus));
                                        //console.log(emailStatus);
                                        proofofex.update({
                                            "sha256Hash": sha256Hash
                                        },
                                            {
                                                $set: {
                                                    "txstatus": "Success",
                                                    "txId": message.txId,
                                                    "timestamp": timestamp,
                                                    "posHash": posHash,
                                                    "posStatus": posStatus,
                                                    "emailStatus": emailStatus
                                                }
                                            },
                                            {
                                                "multi": true
                                            },
                                            function (err, rowsUpdated) {
                                                if (err) console.log(err);
                                                console.log(chalk.bgGreen("DB row updated with new transaction data"));

                                                proofofex.findOne({
                                                    "sha256Hash": sha256Hash
                                                }, function (err, poe1) {
                                                    console.log(chalk.bgCyan('poe for file ', i, ' is '));
                                                    // logger.debug(poe1);

                                                    // rtelib.raiseEvent('blockchain', 'poe', {
                                                    //     ts: cts(),
                                                    //     msg: sha256Hash + ' uploaded in PoE'
                                                    // });
                                                    //TODO mail certificate to student
                                                    // Student.findOne({"rollNo":rollNo},async function(err,student){
                                                    //     console.log(student.email);
                                                    //     var qdata = student.email+";"+";"+localfile;
                                                    //rabbitq.sendData(qdata);                           
                                                    console.log("updated");
                                                    //  done = true;
                                                    resultList.push({
                                                        "fileName": fileName,
                                                        "sha256Hash": sha256Hash,
                                                        "status": "Success",
                                                        message: poe1

                                                    });
                                                    //console.log(resultList + "i = " + i);
                                                    console.log(chalk.bgCyan("i = " + i + " result length = " + resultList.length + " data length " + data.length));
                                                    if (data.length === resultList.length) {
                                                        console.log(resultList)
                                                        res.send(resultList);
                                                    }
                                                    else {
                                                        console.log("i not reached to end");
                                                    }

                                                });

                                                //

                                            });

                                    });

                                }
                            });


                        });



                    } else {
                        rtelib.raiseEvent('blockchain', 'poe', {
                            ts: cts(),
                            msg: fileName + ' already exist'
                        });
                        resultList.push({
                            "fileName": fileName,
                            "sha256Hash": sha256Hash,
                            "status": "Failed",
                            "message": fileName + " already exist"
                        });
                        console.log(chalk.bgRed("File i = " + i + "Already Exist" + " result length = " + resultList.length));
                        if (data.length == resultList.length) {
                            console.log(resultList)
                            res.send(resultList);
                        }
                        //return;
                        // res.send({
                        //     status: "Failed",
                        //     message: fileName + " already exist",
                        //     result: ""
                        // });

                    }
                } else {
                    resultList.push({
                        "fileName": fileName,
                        "status": "Failed",
                        "message": "Incorrect file"
                    });
                    console.log(chalk.bgRed("Incorrect File::::  i = " + i + " result length = " + resultList.length));
                    if (data.length == resultList.length) {
                        console.log(resultList)
                        res.send(resultList);
                    }
                    //  res.json(getErrorMessage('\'Incorrect file\''));
                    // return;
                }//else end of error_message
                console.log(chalk.bgRed("Incorrect File::::  i = " + i + " result length = " + resultList.length));
                /* if (data.length == resultList.length) {
                    console.log(resultList)
                    res.send(resultList);
                } */
            } // else end of validateMimeType function
        }); //end of validateMimeType function
        //} //end of file extenstion if case
    }
};

exports.invoke_bk1 = async (req, res) => {
    logger.debug('==================== INVOKE ON CHAINCODE ==================');

    // logger.debug(req.body);
    var data = req.body;
    console.log(data.length);
    var peers = "peer0.actsorg.cdac.in";
    /* if(req.body.peers){
          peers = req.body.peers;
     }
     else
      peers = "";*/
    //    var peers = req.body.peers;
    //var chaincodeName = req.body.chaincodeName;
    //var channelName = req.params.channelName;
    var chaincodeName = "cdacpoe";
    var channelName = "cdacpoechannel";

    var fcn = "recordProofOfEx";
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }

    var re1 = new RegExp('^([a-zA-Z/]+)$');
    var re2 = new RegExp('^([a-zA-Z]+)$');
    var re3 = new RegExp('^([a-zA-Z0-9 _-]+)$');
    let resultList = [];
    var done = false;
    // if(resultList != []){
    // async.each( data1,function (data,callback) {
    var i = 0;
    console.log(chalk.bgCyan('data length is ', data.length));
    //console.log(chalk.bgCyan('data is ', data));


    for (i = 0; i < data.length; i++) {

        //sleep.sleep(5);
        console.log('sleep completed i = ', i)
        let cert = new proofofex();

        var error_message = null;
        console.log(chalk.bgCyan("i ==== ", i));
        // console.log(data);
        //   if (done == false) {
        //

        //for(var i =0 ;i< data.length; i++){

        //if(data.done == true) {

        var fileName = data[i].fileName;
        /* if(!validator.isMimeType(fileName)) {
            console.log(chalk.bgRed('invalid MIME type for the input file ', fileName));
            res.json({
                status: "Failed",
                message: "Invalid File Type. Please upload valid file(s)"
            });
            return;            
        } else {
            console.log(chalk.bgGreen('Valid MIME type for the input file ', fileName));            
        } */

        cert.fileName = fileName;
        // doing for removing duplications like filename(1).pdf
        var file = fileName;
        var fileext = file.split('.');
        var name = fileext[0].split('(');
        fileName = name[0] + "." + fileext[1];
        var fileType = data[i].fileType;

        console.log(fileType);

        if (fileType == "application/pdf" || fileType == "image/png" ||
            fileType == "image/jpeg" || fileType == "image/gif") {
            //console.log('filtype supported');
        } else {
            console.log(chalk.bgRed('filetype unsupported'));
            res.json(getErrorMessage("Unsupported fileType request"));
            return;
        }

        if (re1.test(fileType)) {
            //console.log(chalk.bgGreen("filetype Valid"));
        } else {
            console.log(chalk.bgRed("filetype Invalid"));
            res.json(getErrorMessage("Unsupported fileType request"));
            return;
        }
        cert.fileType = fileType;

        fileType = fileType.split('/').pop();
        console.log(fileType);
        console.log(fileext[1]);
        if (fileext[1] == 'jpg' || fileext[1] == 'png' ||
            fileext[1] == 'jpeg' || fileext[1] == 'pdf' /* ||
            fileext[1] == 'doc' || fileext[1] == 'docx' ||
            fileext[1] == 'ppt' || fileext[1] == 'pptx' */) {

            var documentType = data[i].documentType;
            if (re2.test(documentType)) {
                //console.log(chalk.bgGreen("document type Valid"));
            } else {
                console.log(chalk.bgRed("docType Invalid"));
                res.json(getErrorMessage("Invalid request"));
                return;
            }
            cert.documentType = documentType;
            var sha256Hash = data[i].sha256Hash;
            valRes = validator.isHash(sha256Hash, 'sha256')
            if (valRes) {
                //console.log('sha256 hash valid')
            } else {
                console.log('sha256 hash invalid');
                res.json(getErrorMessage("Invalid request"));
                return;
            }
            cert.sha256Hash = sha256Hash;

            var sha1Hash = data[i].sha1Hash;
            valRes = validator.isHash(sha1Hash, 'sha1')
            if (valRes) {
                //console.log('sha1 hash valid')
            } else {
                console.log('sha1 hash invalid');
                res.json(getErrorMessage("Invalid request"));
                return;
            }
            cert.sha1Hash = sha1Hash;

            var backLink = "";
            /* if (!validator.isHash(sha256Hash, 'sha256')) {
                res.json(getErrorMessage("Invalid request"));
                return;
            }
            if (!validator.isHash(sha1Hash, 'sha1')) {
                res.json(getErrorMessage("Invalid request"));
                return;
            } */



            //var issuedByOrg = req.body.issuedByOrg;
            //var issuedByUser = req.body.issuedByUser;
            var issuedByOrg = req.orgname;
            cert.issuedByOrg = issuedByOrg;

            var issuedByUser = req.username;
            cert.issuedByUser = issuedByUser;

            var content = data[i].base64;
            var mime = content.split(':')[1].split(';')[0];
            var b64 = content.split(',')[1]
            if (!validator.isBase64(b64)) {
                console.log(chalk.bgRed("Invalid base64 content"));
                res.json(getErrorMessage("Invalid base64 content"));
                return;
            } else {
                //console.log(chalk.bgGreen("base64 content is Valid"));
            }

            //var issuedByUser = req.fullname;
            var issuedTo = data[i].issuedTo;
            if (re3.test(issuedTo)) {
                //console.log(chalk.bgGreen("issued To Valid"));
            } else {
                console.log(chalk.bgRed("Roll number :: (issued To) Invalid"));
                res.json(getErrorMessage("Invalid request"));
                return;
            }
            cert.issuedTo = issuedTo;

            var rollNo = data[i].issuedTo;

            rollNo = validator.trim(rollNo);
            if (!validator.isNumeric(rollNo)) {
                console.log(chalk.bgRed("Invalid rollNo content"));
                res.json(getErrorMessage("Invalid rollNo"));
                return;
            }


            //****************************************** */
            //checking the rollNo validation
            Student.findOne({
                "rollNo": rollNo
            }, function (err, student) {
                if (student) {
                    //console.log(chalk.bgGreen("student rollNo exist"));
                } else if (student === null || err) {
                    res.json(getErrorMessage('\'Roll No not matched\''));
                    return;
                }
            });


            var year = rollNo.substr(0, 2);
            year = "20" + year;
            //console.log(chalk.bgGreen('year:', year));
            cert.year = year;

            var monthsName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            // var month = rollNo.substr(2,2);
            var month = rollNo.substr(2, 2);
            month = monthsName[month - 1];
            //console.log(chalk.bgGreen('month:', month));
            cert.month = month;
            /* if (month === "02")
                month = "February"
            if (month === "08")
                month = "August" */

            var args = [
                sha256Hash,
                sha1Hash,
                fileName,
                fileType,
                documentType,
                issuedTo,
                backLink
            ]
            var regtime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");;

            cert.txstatus = "Pending";
            cert.txId = "";
            cert.timestamp = regtime;

            //console.log(chalk.bgCyan('cert is ', cert));

            //cert.course = "";
            var centreCode = rollNo.substr(4, 3);
            var centreName;

            var courseid = rollNo.substr(7, 2);
            var courseName = '';


            //****************************************** */
            Center.findOne({
                "code": centreCode
            }, await function (err, cdata) {
                //console.log("data in center finding " + cdata);
                if (cdata) {
                    //console.log("data in center finding " + cdata.name);
                    centreName = cdata.name;
                    cert.centre = cdata.name;

                    Course.findOne({
                        "code": courseid
                    }, function (err, cdata) {
                        //console.log("data in Course finding " + cdata);
                        //console.log("data in Course finding " + cdata.name);
                        if (cdata) {
                            courseName = cdata.name;
                            cert.course = cdata.name;


                            cert.save(async (err, newPoe) => {
                                if (err) {
                                    error_message = err.message;
                                    console.log(chalk.bgRed('Error in storing record in DB ' + error_message));
                                    //res.json("Error creating new asset: " + err.message);
                                    // return;
                                } else {
                                    logger.debug(chalk.bgGreen("Asset saved in db successfully"));
                                    console.log(chalk.bgGreen("db saved"));
                                    res.statusCode = 200;
                                    res.message = "Asset created successfully";
                                }
                            });
                        }
                    });
                }
            });

            var No = rollNo.substr(9, 3);

            var localfile = process.cwd() + '/certificates/' + rollNo + "-" + documentType + "." + fileType;

            //console.log(localfile);


            //****************************************** */
            fs.writeFileSync(localfile, content);

            //save the file in PoS
            // Save a new asset/property
            //console.log(error_message);
            if (!error_message) {
                console.log('before invoke');

                //****************************************** */
                let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);

                console.log(chalk.bgCyan('i = ' + i + ' Response from invokechaincode 00000000000000000 is ', message.status));
                if (message.status === "Success") {
                    //var timestamp = new Date();

                    var timestamp = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

                    //****************************************** */
                    ipfsClient.storeFile(localfile, await function (posHash) {
                        console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage function 1111111 status = ', posHash));
                        posStatus = true;
                        var email = "";
                        var name = "";

                        //****************************************** */
                        //sending mail to  student
                        Student.findOne({
                            "rollNo": rollNo
                        }, function (err, student) {
                            console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage, student record function 2222222222222 student'));
                            if (student) {
                                email = student.email;
                                rollNo = student.rollNo;
                                name = student.name;
                                //sendmailToStudent(documentType, localfile, email, rollNo, name, centre, function (emailStatus) {
                                sendmailToStudent(documentType, content, email, rollNo, name, centreName, courseName, function (emailStatus) {
                                    console.log(chalk.bgCyan('i = ' + i + 'inside ipfs file storage, student record, sendmail function 3333333333333333 emailstatus = ', emailStatus));
                                    //console.log(emailStatus);
                                    proofofex.update({
                                        "sha256Hash": sha256Hash
                                    },
                                        {
                                            $set: {
                                                "txstatus": "Success",
                                                "txId": message.txId,
                                                "timestamp": timestamp,
                                                "posHash": posHash,
                                                "posStatus": posStatus,
                                                "emailStatus": emailStatus
                                            }
                                        },
                                        {
                                            "multi": true
                                        },
                                        function (err, rowsUpdated) {
                                            if (err) console.log(err);
                                            console.log(chalk.bgGreen("DB row updated with new transaction data"));

                                            proofofex.findOne({
                                                "sha256Hash": sha256Hash
                                            }, function (err, poe1) {
                                                console.log(chalk.bgCyan('poe for file ', i, ' is '));
                                                // logger.debug(poe1);

                                                // rtelib.raiseEvent('blockchain', 'poe', {
                                                //     ts: cts(),
                                                //     msg: sha256Hash + ' uploaded in PoE'
                                                // });
                                                //TODO mail certificate to student
                                                // Student.findOne({"rollNo":rollNo},async function(err,student){
                                                //     console.log(student.email);
                                                //     var qdata = student.email+";"+";"+localfile;
                                                //rabbitq.sendData(qdata);                           
                                                console.log("updated");
                                                //  done = true;
                                                resultList.push({
                                                    "fileName": fileName,
                                                    "sha256Hash": sha256Hash,
                                                    "status": "Success",
                                                    message: poe1

                                                });
                                                //console.log(resultList + "i = " + i);
                                                console.log(chalk.bgCyan("i = " + i + " result length = " + resultList.length + " data length " + data.length));
                                                if (data.length === resultList.length) {
                                                    console.log(resultList)
                                                    res.send(resultList);
                                                }
                                                else {
                                                    console.log("i not reached to end");
                                                }

                                            });

                                            //

                                        });

                                });

                            }
                        });


                    });



                } else {
                    rtelib.raiseEvent('blockchain', 'poe', {
                        ts: cts(),
                        msg: fileName + ' already exist'
                    });
                    resultList.push({
                        "fileName": fileName,
                        "sha256Hash": sha256Hash,
                        "status": "Failed",
                        "message": fileName + " already exist"
                    });
                    console.log(chalk.bgRed("File i = " + i + "Already Exist" + " result length = " + resultList.length));
                    if (data.length == resultList.length) {
                        console.log(resultList)
                        res.send(resultList);
                    }
                    //return;
                    // res.send({
                    //     status: "Failed",
                    //     message: fileName + " already exist",
                    //     result: ""
                    // });

                }
            } else {
                resultList.push({
                    "fileName": fileName,
                    "status": "Failed",
                    "message": "Incorrect file"
                });
                console.log(chalk.bgRed("Incorrect File::::  i = " + i + " result length = " + resultList.length));
                if (data.length == resultList.length) {
                    console.log(resultList)
                    res.send(resultList);
                }
                //  res.json(getErrorMessage('\'Incorrect file\''));
                // return;
            }
        }
    }
};

// Query a transaction by hash of the file
exports.querybyrollNo = async (req, res) => {

    logger.debug('==================== INVOKE ON CHAINCODE BY HASH==================');


    var peers = "peer0.actsorg.cdac.in";
    /* if (req.body.peers) {
        peers = req.body.peers;
    } else
        peers = ""; */
    //    var peers = req.body.peers;
    var chaincodeName = "cdacpoe";
    var channelName = "cdacpoechannel";
    var fcn = "queryProofOfExByTxid";
    var nullTxn = 0;

    var rollNo = req.body.rollNo;
    rollNo = validator.trim(rollNo);
    if (!validator.isNumeric(rollNo)) {
        console.log(chalk.bgRed("Invalid rollNO content"));
        res.json(getErrorMessage("Invalid rollNo"));
        return;
    }
    console.log(chalk.bgCyan('inside query by hash ', rollNo));
    /*  var re2 = new RegExp('^([a-zA-Z0-9]+)$');
     if (re2.test(sha256Hash)) {
         console.log("Valid");
     } else {
         console.log("Invalid");
         res.json(getErrorMessage("Invalid request"));
         return;
     } */
    //var issuedByOrg = req.body.issuedByOrg;
    //var issuedByUser = req.body.issuedByUser;

    var issuedByOrg = req.orgname;
    var issuedByUser = req.username;

    //   logger.debug(req.body);
    // logger.debug('channelName  : ' + channelName);
    // logger.debug('chaincodeName : ' + chaincodeName);
    //logger.debug('fcn  : ' + fcn);

    if (!chaincodeName) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    var finalresult = [];

    proofofex.find({
        issuedTo: rollNo
    }, {
        txId: 1,
        _id: 0
    }, async function (err, records) {
        console.log('no of records for ' + rollNo + ' is ' + records.length);
        //console.log(records.length);
        if (records.length > 0) {
            for (var i = 0; i < records.length; i++) {

                var txId = records[i].txId
                if (txId == null || txId == ' ' || txId == '') {
                    console.log(chalk.bgRed('txID is null ', txId));
                    nullTxn++;
                    continue;
                } else {
                    console.log(chalk.bgGreen('txID is ', txId))
                }
                var re2 = new RegExp('^([a-zA-Z0-9]+)$');
                if (re2.test(txId)) {
                    console.log("Valid");
                    var args = [
                        records[i].txId
                    ]

                    // let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
                    let message = await query.queryChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);

                    // logger.debug("MEssage---------" + JSON.stringify(message));


                    if (message.status === "Success") {
                        if (message.message.length != 0) {
                            var result = JSON.parse(message.message.toString());
                            //   logger.debug(result);
                            // logger.debug('found ', result[0].found);
                            if (result[0].found === true) {
                                //   logger.debug("found true");
                                proofofex.findOne({
                                    "sha256Hash": result[0].sha256Hash
                                }, function (err, poe1) {
                                    //     logger.debug(poe1);
                                    rtelib.raiseEvent('blockchain', 'poeSearch', {
                                        ts: cts(),
                                        msg: 'Query based on file hash ' + result[0].sha256Hash + ' is performed'
                                    });
                                    let dbstatus = {
                                        "status": "Success",
                                        "message": "",
                                        "result": result[0],
                                        "_id": poe1._id,
                                        "__v": poe1.__v,
                                        "txstatus": poe1.txstatus
                                    }
                                    //   logger.debug(dbstatus);
                                    // res.send(dbstatus);
                                    finalresult.push(result[0]);
                                    console.log(chalk.bgCyan('records.length is ' + records.length));
                                    console.log(chalk.bgCyan('nullTxn is ' + nullTxn));
                                    console.log(chalk.bgCyan('finalresult.length is ' + finalresult.length));
                                    if ((records.length - nullTxn) == finalresult.length) {
                                        console.log(finalresult)
                                        res.send({
                                            "status": "Success",
                                            "message": "",
                                            "result": finalresult
                                        });
                                    }
                                    // console.log("records length " + records.length + "finalresult " + finalresult.length);
                                    /* if (records.length == finalresult.length) {
                                        console.log(finalresult)
                                        res.send(finalresult);
                                    } */
                                });
                            } else { //result.found === false

                                /* res.send({
                                    "status": "Success",
                                    "message": "",
                                    "result": result
                                }); */
                                logger.debug("Failed" + result[0]);
                                finalresult.push(result[0]);
                            }
                        } //closing if(message!=0)
                        /* else { // if message is empty -- hash not present in ledger
    
    
                            /* res.send({
                                status: "Success",
                                message: "",
                                result: {
                                    "txId": 0,
                                    "assetVersion": 0,
                                    "sha256Hash": 0,
                                    "sha1Hash": 0,
                                    "fileName": 0,
                                    "fileType": 0,
                                    "documentType": 0,
                                    "issuedTo": 0,
                                    "issuedByOrg": 0,
                                    "issuedByUser": 0,
                                    "timestamp": {
                                        "seconds": 0,
                                        "nanos": 0
                                    },
                                    "found": false
                                }
                            }) */
                        // logger.debug("Document not found");
                        //  finalresult.push(result[0]);
                        // } */
                    } else { // in case of error

                        //res.send(getErrorMessage(JSON.stringify(message)));
                        logger.debug("Failed" + message);
                        finalresult.push(message);
                    }


                    /*            proofofex.update({
                                        "sha256Hash": sha256Hash
                                    }, {
                                        $set: {
                                            "txstatus": "Success",
                                            "txId": message.txId,
                                            "timestamp": timestamp,
                                            "posHash": posHash,
                                            "posStatus":posStatus
                                        }
                                    }, {
                                        "multi": true
                                    },
                                    function (err, rowsUpdated) {
                                        proofofex.findOne({
                                            "sha256Hash": sha256Hash
                                        }, function (err, poe1) {
                                            // logger.debug(poe1);
                                if(poe1){
                                            
                                            rtelib.raiseEvent('blockchain', 'poe', {
                                                ts: cts(),
                                                msg: sha256Hash + ' uploaded in PoE'
                                            });
                                            //TODO mail certificate to student
                                            Student.findOne({"rollNo":rollNo},function(err,student){
                                                console.log(student.email);
                                                var qdata = student.email+";"+";"+localfile;
                                                //rabbitq.sendData(qdata);                           
                    
                                                var emailStatus = sendmailToStudent(documentType,localfile,student.email,student.rollNo,student.name,centre);
                                                resultList.push({"fileName":fileName,"sha256Hash":sha256Hash,"status":"success",message:poe1,"emailStatus":emailStatus,"posStatus":posStatus});
                                            })
                                         //   
                                           /*  res.json({
                                                status: "Success",
                                                message: "",
                                                result: poe1
                                            }); */
                    /*              } else {
                                      console.log("Invalid");
                                      finalresult.push({
                                          "status": "Failed",
                                          "message": "Invalid Transaction Id"
                                      });
                                      //res.json(getErrorMessage("Invalid request"));
                                      //return;
                                  }
                  
                  
                                  //res.send(finalresult);
                              //}
                         // } else {
                           //   rtelib.raiseEvent('blockchain', 'poe', {
                             //     ts: cts(),
                               //   msg: message.message
                             // });
                             // resultList.push({"fileName":fileName,"sha256Hash":sha256Hash,"status":"Failed",message:message.message});
                  /*             res.send({
                                  status: "Failed",
                                  message: message.message,
                                  result: ""
                              }); */
                    // }
                    //} else {
                    //  rtelib.raiseEvent('blockchain', 'poe', {
                    //    ts: cts(),
                    //  msg: fileName + ' already exist'
                    //});
                    // resultList.push({"fileName":fileName,"sha256Hash":sha256Hash,"status":"Failed","message":fileName + " already exist"});
                    /* res.send({
                        status: "Failed",
                        message: fileName + " already exist",
                        result: ""
                    }); */

                }
            }
        }
        else {
            // res.json(getErrorMessage('\'No documents found\''));
            // return;

            res.send({
                status: "Success",
                "message": "No documents found",
                result: records
            })
        }
    });



};

exports.verifyrollNo = async (req, res) => {
    console.log('inside verify rollNo');


    // var googleUrl = "https://www.google.com/recaptcha/api/siteverify";
    // var secret = "6LcZlqkUAAAAAMcLN7zbqB3ZCgPICi5AmXklmHWQ";
    var capToken = req.body.recaptcha;

    request({
        url: recaptcha.googleUrl,
        method: "POST",
        json: true,   // <--Very important!!!
        qs: {
            secret: recaptcha.secret,
            response: capToken
        }
    }, function (error, response) {
        //  console.log('inside captcha Validate ',body);
        if (response) {
            if (response.body.success === true) {
                console.log('captcha is correct');

                var peers = "peer0.actsorg.cdac.in";
                var chaincodeName = "cdacpoe";
                var channelName = "cdacpoechannel";
                var fcn = "queryProofOfExByTxid";
                var nullTxn = 0;

                var rollNo = req.body.rollNo;
                rollNo = validator.trim(rollNo);
                if (!validator.isNumeric(rollNo)) {
                    console.log(chalk.bgRed("Invalid rollNo content"));
                    res.json(getErrorMessage("Invalid rollNo"));
                    return;
                }
                var issuedByOrg = req.orgname;
                var issuedByUser = req.username;



                if (!chaincodeName) {
                    res.json(getErrorMessage("Invalid request"));
                    return;
                }
                if (!channelName) {
                    res.json(getErrorMessage("Invalid request"));
                    return;
                }
                var finalresult = [];

                proofofex.find({
                    issuedTo: rollNo
                }, {
                    txId: 1,
                    _id: 0
                }, async function (err, records) {
                    console.log('no of records for ' + rollNo + ' is ' + records);
                    console.log('inside query by roll no ' + records.length);
                    if (records.length > 0) {
                        for (var i = 0; i < records.length; i++) {

                            var txId = records[i].txId;
                            if (txId == null || txId == ' ' || txId == '') {
                                console.log(chalk.bgRed('txID is null ', txId));
                                nullTxn++;
                                continue;
                            } else {
                                console.log(chalk.bgGreen('txID is ', txId))
                            }

                            var re2 = new RegExp('^([a-zA-Z0-9]+)$');
                            if (re2.test(txId)) {
                                console.log("Valid");
                                /* if(txId == null || txId == ' ' || txId == '') {
                                    console.log(chalk.red('txID is null ', txID));
                                    continue;
                                } */
                                var args = [
                                    records[i].txId
                                ]

                                // let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
                                let message = await query.queryChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);

                                // logger.debug("MEssage---------" + JSON.stringify(message));


                                if (message.status === "Success") {
                                    if (message.message.length != 0) {
                                        var result = JSON.parse(message.message.toString());
                                        //   logger.debug(result);
                                        // logger.debug('found ', result[0].found);
                                        if (result[0].found === true) {
                                            //   logger.debug("found true");
                                            proofofex.findOne({
                                                "sha256Hash": result[0].sha256Hash
                                            }, function (err, poe1) {
                                                //     logger.debug(poe1);
                                                rtelib.raiseEvent('blockchain', 'poeSearch', {
                                                    ts: cts(),
                                                    msg: 'Query based on file hash ' + result[0].sha256Hash + ' is performed'
                                                });
                                                let dbstatus = {
                                                    "status": "Success",
                                                    "message": "",
                                                    "result": result[0],
                                                    "_id": poe1._id,
                                                    "__v": poe1.__v,
                                                    "txstatus": poe1.txstatus,
                                                    "posHash": poe1.posHash
                                                }
                                                let myResult = {
                                                    "bctResult": result[0],
                                                    "posHash": poe1.posHash
                                                };
                                                //   logger.debug(dbstatus);
                                                // res.send(dbstatus);
                                                //finalresult.push(result[0]);
                                                finalresult.push(myResult);
                                                // console.log("records length " + records.length + "finalresult " + finalresult.length);
                                                //if (records.length == finalresult.length) {
                                                console.log(chalk.bgCyan('records.length is ' + records.length));
                                                console.log(chalk.bgCyan('nullTxn is ' + nullTxn));
                                                console.log(chalk.bgCyan('finalresult.length is ' + finalresult.length));
                                                if ((records.length - nullTxn) == finalresult.length) {
                                                    console.log(finalresult)
                                                    res.send(finalresult);
                                                }
                                            });
                                        } else { //result.found === false

                                            /* res.send({
                                                "status": "Success",
                                                "message": "",
                                                "result": result
                                            }); */
                                            logger.debug("Failed" + result[0]);
                                            finalresult.push(result[0]);
                                        }
                                    } //closing if(message!=0)
                                    /* else { // if message is empty -- hash not present in ledger
                
                
                                        /* res.send({
                                            status: "Success",
                                            message: "",
                                            result: {
                                                "txId": 0,
                                                "assetVersion": 0,
                                                "sha256Hash": 0,
                                                "sha1Hash": 0,
                                                "fileName": 0,
                                                "fileType": 0,
                                                "documentType": 0,
                                                "issuedTo": 0,
                                                "issuedByOrg": 0,
                                                "issuedByUser": 0,
                                                "timestamp": {
                                                    "seconds": 0,
                                                    "nanos": 0
                                                },
                                                "found": false
                                            }
                                        }) */
                                    // logger.debug("Document not found");
                                    //  finalresult.push(result[0]);
                                    // } */
                                } else { // in case of error

                                    //res.send(getErrorMessage(JSON.stringify(message)));
                                    logger.debug("Failed" + message);
                                    finalresult.push(message);
                                }




                            }
                        }
                    } else {
                        res.json(getErrorMessage('\'No documents found for this Roll number \''));
                        //res.json(getErrorMessage('\'Incorrect file\''));
                        return;

                        res.send({
                            status: "Sucess",
                            "message": "No documents found"
                        })
                    }
                });
            } else {
                res.send({ status: "Failed", "message": "incorrect Captcha!!! Please Try Again" });
            }
        } else {
            console.log(chalk.bgRed("Response from captcha not success ", response));
            res.send({ status: "Failed", "message": "Something went Wrong... Please Try Again!!!" });
        }

    });
};

// Query a transaction by hash of the file
exports.querybyhash = async (req, res) => {

    logger.debug('==================== INVOKE ON CHAINCODE BY HASH==================');

    var peers = "peer0.actsorg.cdac.in";
    /*  var peers = "";
     if (req.body.peers) {
         peers = req.body.peers;
     } else
         peers = ""; */
    //    var peers = req.body.peers;
    var chaincodeName = "cdacpoe";
    var channelName = "cdacpoechannel";
    var fcn = "queryProofOfEx";


    var sha256Hash = req.body.sha256Hash;
    if (!validator.isHash(sha256Hash, 'sha256')) {
        console.log('sha256 hash invalid');
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    /* var re2 = new RegExp('^([a-zA-Z0-9]+)$');
     if (re2.test(sha256Hash)) {
         console.log("Valid");
     } else {
         console.log("Invalid");
         res.json(getErrorMessage("Invalid request"));
         return;
     }  */
    //var issuedByOrg = req.body.issuedByOrg;
    //var issuedByUser = req.body.issuedByUser;

    var issuedByOrg = req.orgname;
    var issuedByUser = req.username;

    //  logger.debug(req.body);
    // logger.debug('channelName  : ' + channelName);
    //logger.debug('chaincodeName : ' + chaincodeName);
    //logger.debug('fcn  : ' + fcn);

    if (!chaincodeName) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    if (!validator.isHash(sha256Hash, 'sha256')) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }

    var args = [
        sha256Hash
    ]

    // let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
    let message = await query.queryChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);

    //  logger.debug("MEssage---------" + JSON.stringify(message));


    if (message.status === "Success") {
        if (message.message.length != 0) {
            var result = JSON.parse(message.message.toString());
            // logger.debug(result);
            //logger.debug('found ', result.found);
            if (result.found === true) {
                //  logger.debug("found true");
                proofofex.findOne({
                    "sha256Hash": sha256Hash
                }, function (err, poe1) {
                    //    logger.debug(poe1);
                    rtelib.raiseEvent('blockchain', 'poeSearch', {
                        ts: cts(),
                        msg: 'Query based on file hash ' + sha256Hash + ' is performed'
                    });
                    let dbstatus = {
                        "status": "Success",
                        "message": "",
                        "result": result,
                        "_id": poe1._id,
                        "__v": poe1.__v,
                        "txstatus": poe1.txstatus
                    }
                    //logger.debug(dbstatus);
                    res.send(dbstatus);
                });
            } else //result.found === false
                res.send({
                    "status": "Success",
                    "message": "",
                    "result": result
                });
        } //closing if(message!=0)
        else { // if message is empty -- hash not present in ledger

            res.send({
                status: "Success",
                message: "",
                result: {
                    "txId": 0,
                    "assetVersion": 0,
                    "sha256Hash": 0,
                    "sha1Hash": 0,
                    "fileName": 0,
                    "fileType": 0,
                    "documentType": 0,
                    "issuedTo": 0,
                    "issuedByOrg": 0,
                    "issuedByUser": 0,
                    "timestamp": {
                        "seconds": 0,
                        "nanos": 0
                    },
                    "found": false
                }
            })
        }
    } else { // in case of error
        res.send(getErrorMessage(JSON.stringify(message)));
    }


};

exports.querybytxId = async (req, res) => {

    logger.debug('==================== INVOKE ON CHAINCODE BY HASH==================');
    var peers = "peer0.actsorg.cdac.in";
    /* var peers = "";
    if (req.body.peers) {
        peers = req.body.peers;
    } else
        peers = ""; */
    //    var peers = req.body.peers;
    //  var chaincodeName = req.body.chaincodeName;
    //var channelName = req.params.channelName;
    var chaincodeName = "cdacpoe";
    var channelName = "cdacpoechannel";
    var fcn = "queryProofOfExByTxid";

    var txId = req.body.txId;
    var re2 = new RegExp('^([a-zA-Z0-9]+)$');
    if (re2.test(txId)) {
        console.log("Valid");
    } else {
        console.log("Invalid");
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    //var issuedByOrg = req.body.issuedByOrg;
    //var issuedByUser = req.body.issuedByUser;

    var issuedByOrg = req.orgname;
    var issuedByUser = req.username;

    // logger.debug('channelName  : ' + channelName);
    //logger.debug('chaincodeName : ' + chaincodeName);
    //logger.debug('fcn  : ' + fcn);

    if (!chaincodeName) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }

    // logger.debug("txId Length :" + txId.length);

    if (txId.length != 64) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    var args = [
        txId
    ]

    //let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
    let message = await query.queryChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);

    if (message.status === "Success") {
        var result = JSON.parse(message.message.toString());
        if (result[0].found === true) {

            proofofex.findOne({
                "sha256Hash": result[0].sha256Hash
            }, function (err, poe1) {
                //   logger.debug(poe1);
                rtelib.raiseEvent('blockchain', 'poeSearch', {
                    ts: cts(),
                    msg: 'Query based on transaction Id ' + txId + ' is performed'
                });
                let dbstatus = {
                    "status": "Success",
                    "message": "",
                    "result": result[0],
                    "_id": poe1._id,
                    "__v": poe1.__v,
                    "txstatus": poe1.txstatus
                }

                res.send(dbstatus);
            });
        } else
            res.send({
                "status": "Success",
                "message": "",
                "result": result[0]
            });
    } else
        res.send(getErrorMessage(message));

};

exports.getquerybytxId = async (req, res) => {

    logger.debug('==================== INVOKE ON CHAINCODE BY TXID==================');
    /*
    var peers = "";
    if(req.body.peers){
         peers = req.body.peers;
    }
    else
     peers = "";*/
    var peers = "peer0.actsorg.cdac.in";
    var chaincodeName = "cdacpoe";
    var channelName = "cdacpoechannel";
    var fcn = "queryProofOfExByTxid";


    var txId = req.query.txId;
    var re2 = new RegExp('^([a-zA-Z0-9]+)$');
    if (re2.test(txId)) {
        console.log("Valid");
    } else {
        console.log("Invalid");
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    //var issuedByOrg = req.body.issuedByOrg;
    //var issuedByUser = req.body.issuedByUser;

    var issuedByOrg = req.orgname;
    var issuedByUser = req.username;

    // logger.debug('channelName  : ' + channelName);
    //logger.debug('chaincodeName : ' + chaincodeName);
    //logger.debug('fcn  : ' + fcn);

    if (!chaincodeName) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }

    //logger.debug("txId Length :" + txId.length);

    if (txId.length != 64) {
        res.render('error', {
            data: 'Invalid Request'
        });
        return;
        //res.json(getErrorMessage("Invalid request"));
        //return;
    }
    var args = [
        txId
    ]

    //let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
    let message = await query.queryChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);

    if (message.status === "Success") {
        var result = JSON.parse(message.message.toString());
        if (result[0].found === true) {

            proofofex.findOne({
                "sha256Hash": result[0].sha256Hash
            }, function (err, poe1) {
                //  logger.debug(poe1);
                rtelib.raiseEvent('blockchain', 'poeSearch', {
                    ts: cts(),
                    msg: 'Query based on transaction Id ' + txId + ' is performed'
                });
                /* let dbstatus = {
                    "status": "Success",
                    "message": "",
                    "result": result[0],
                    "_id": poe1._id,
                    "__v": poe1.__v,
                    "txstatus": poe1.txstatus
                } */



                generatepdf(result[0].txId, result[0].fileName, result[0].fileType, result[0].documentType, result[0].sha256Hash, result[0].sha1Hash, result[0].issuedTo, result[0].issuedByUser, result[0].issuedByOrg, result[0].timestamp, res);
                var html = '<html><embed src="/tmp/PoEReceipt_' + txId + ".pdf" + '"' + ' type="application/pdf"   height="100%" width="100%" class="responsive"></html>';

                res.contentType("application/html");
                res.send(html);

                //ipfs fetfile
                /*  ipfsClient.fetchFile(poe1.posHash,poe1.issuedTo,poe1.documentType,function(content){
                     //fs.writeFileSync('/tmp/' + poe1.issuedTo + "_" + poe1.documentType+".txt", content);
                 }); */
                //var content = "test";


                /*  var files = [{
                         path: '/tmp/PoEReceipt_' + txId + '.pdf',
                         name: 'PoEReceipt_' + txId + '.pdf'
                     },
                     {
                         path: '/tmp/' + poe1.issuedTo + "_" + poe1.documentType,
                         name: poe1.issuedTo + "_" + poe1.documentType
                     }
                 ] */
                // var data =fs.readFileSync(process.cwd()+'/poereceipts/ba1bca832ee4b3b7c49bd8fd0b3e1b62caf9663a21e10836a01eafde520c52ae.pdf');
                //  res.contentType("application/html");
                //res.send(receipt_html);
                //res.download('/tmp/PoEReceipt_' + txId + '.pdf',"PoEReceipt_"+txId+".pdf");
                // res.zip(files);
            });
        } else
            res.send({
                "status": "Success",
                "message": "",
                "result": result[0]
            });
    } else
        //res.send(getErrorMessage(message));
        //res.send('error',{data:message})
        res.status(400).send({
            data: message
        })

};

exports.getbytxId = async (req, res) => {

    logger.debug('==================== INVOKE ON CHAINCODE BY TXID==================');
    /*
    var peers = "";
    if(req.body.peers){
         peers = req.body.peers;
    }
    else
     peers = "";*/
    var peers = "peer0.actsorg.cdac.in";
    var chaincodeName = "cdacpoe";
    var channelName = "cdacpoechannel";
    var fcn = "queryProofOfExByTxid";
    var shouldSkipThisFile = false;
    //By Ravi for link validation
    var txId = '';
    var token = req.query.txId;
    console.log(txId.length)
    if(token.length === 64) {
        console.log("Incoming request for transaction id");
        txId = token;
        var re2 = new RegExp('^([a-zA-Z0-9]+)$');
        if (re2.test(txId)) {
            console.log("Valid");
        } else {
            console.log("Invalid");
            shouldSkipThisFile = true;
            res.json(getErrorMessage("Invalid txId"));            
        }
    } else {
        console.log("Incoming request for token");

        jwt.verify(token, gconfig.secret, function (err, decoded) {
            if (err) {
                res.send({
                    status: "Failed",
                    message: "Link validity Expired. Please visit www.cdachain.in/ACTS/verification for verifying the student certificates"
                });
                console.log("Token is invalid " + err);
                shouldSkipThisFile = true;
            } else {
                console.log("Token is valid");
                //res.send(dbstatus);                   
                txId = decoded.txId;
            }
        });
    
    }
    if(shouldSkipThisFile) return;
    
    //var txUrl = req.query.txId;
    //console.log("inside getquerybytxId::: txUrl = " +txUrl);
    //var resp = txUrl.split("///");
    //console.log("inside getquerybytxId::: resp = " +resp);
    //console.log("inside getquerybytxId::: txID =  " + resp[0] + " and token = " +resp[1]);

    //var txId = resp[0];
    //var token = resp[1];
    /* jwt.verify(token, gconfig.secret, function (err, decoded) {
       if(err) {
            res.send({
                status: "Failed",
                message: "Link Expired"
            });
            console.log("Token is invalid "+err);
            return;
       } else {
           console.log("Token is valid");
       } 
    }); */
    //Added till here for link expiry

    //var txId = req.query.txId; Original One Working
    /* var re2 = new RegExp('^([a-zA-Z0-9]+)$');
    if (re2.test(txId)) {
        console.log("Valid");
    } else {
        console.log("Invalid");
        res.json(getErrorMessage("Invalid request"));
        return;
    } */
    //var issuedByOrg = req.body.issuedByOrg;
    //var issuedByUser = req.body.issuedByUser;

    var issuedByOrg = req.orgname;
    var issuedByUser = req.username;

    // logger.debug('channelName  : ' + channelName);
    //logger.debug('chaincodeName : ' + chaincodeName);
    //logger.debug('fcn  : ' + fcn);

    if (!chaincodeName) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }

    //logger.debug("txId Length :" + txId.length);

    /* if (txId.length != 64) {
        res.render('error', {
            data: 'Invalid Request'
        });
        return;
        //res.json(getErrorMessage("Invalid request"));
        //return;
    } */
    var args = [
        txId
    ]

    //let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
    let message = await query.queryChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);

    if (message.status === "Success") {

        var result = JSON.parse(message.message.toString());

        let receipt
        /**TEMPRORYLY SENDING RECEIPT IN REPONSE */
        await genReceipt.generateACTSReceipt(txId, result[0].fileName, result[0].documentType, result[0], result[0].timestamp).then((vres) => {
            // console.log('recipt response0 ' + vres);
            if (vres) receipt = vres;
        });



        console.log('inside getTxId::: poe/query ' + result[0]);
        if (result[0].found === true) {

            proofofex.findOne({
                "sha256Hash": result[0].sha256Hash
            }, function (err, poe1) {
                //  logger.debug(poe1);
                rtelib.raiseEvent('blockchain', 'poeSearch', {
                    ts: cts(),
                    msg: 'Query based on transaction Id ' + txId + ' is performed'
                });
                result[0].issuedByOrg = 'Centre for Development of Advanced Computing (C-DAC)';
                //retreiving posHash from Database based on txId
                proofofex.findOne({
                    "txId": txId
                }, function (err, txResult) {
                    //console.log('inside getbytxId ' + txResult.fullname);
                    let dbstatus = {
                        "status": "Success",
                        "message": "",
                        "result": result[0],
                        "_id": poe1._id,
                        "__v": poe1.__v,
                        "txstatus": poe1.txstatus,
                        "posHash": txResult.posHash,
                        "receipt": receipt
                        // "fullname": txResult.fullname
                    }


                    /* jwt.verify(token, gconfig.secret, function (err, decoded) {
                        if(err) {
                             res.send({
                                 status: "Failed",
                                 message: "Link validity Expired"
                             });
                             console.log("Token is invalid "+err);
                    //         return;
                        } else {
                            console.log("Token is valid");
                            res.send(dbstatus);                   
                        } 
                     }); */
                    res.send(dbstatus);




                    //res.send(dbstatus);                   Original Code
                    //console.log('inside getbttxId ' +txResult.posHash);       

                });



                /* let dbstatus = {
                    "status": "Success",
                    "message": "",
                    "result": result[0],
                    "_id": poe1._id,
                    "__v": poe1.__v,
                    "txstatus": poe1.txstatus,
                    "posHash": txResult.posHash
                }

                res.send(dbstatus); */


            });
        } else
            res.send({
                "status": "Success",
                "message": "",
                "result": result[0]
            });
    } else
        //res.send(getErrorMessage(message));
        //res.send('error',{data:message})
        res.status(400).send({
            data: message
        })


};
exports.getquerybyposHash = async (req, res) => {

    logger.debug('==================== INVOKE ON CHAINCODE BY TXID==================');
    /*
    var peers = "";
    if(req.body.peers){
         peers = req.body.peers;
    }
    else
     peers = "";*/
    var content;
    var posHash = req.query.hash; //*******************TODO: posHash Validation *******************************
    //ipfsClient.fetchFile(posHash,content);
    ipfsClient.fetchFile(posHash, function (content) {
        //if(!err) {
        //   console.log('ipfs chain code file ' + content);
        res.send(content);
        //} else
        //    console.log("Error fetching file from IPFS " + err);
    });     //console.log(content);
    // res.send(content); 
    // generatepdf(result[0].txId, result[0].fileName, result[0].fileType, result[0].documentType, result[0].sha256Hash, result[0].sha1Hash, result[0].issuedTo, result[0].issuedByUser, result[0].issuedByOrg, result[0].timestamp,res);
    //var html = '<html><embed src="/tmp/PoS.pdf" type="application/pdf"   height="100%" width="100%" class="responsive"></html>';
    // var html = '<html><embed src="/tmp/pos_' + posHash + '"' + ' height="100%" width="100%" class="responsive"></html>';

    // res.contentType("application/html");
    // res.send(html);

};
// Retrieve and return all properties from the database.
exports.findAll = (req, res) => {

    proofofex.find({}).then(eachPoe => {
        res.json(eachPoe);
    })
    //  res.send("Find All Properties");

};
// Retrieve and return all properties from the database.
exports.findDocs = (req, res) => {

    var id = {
        "_id": -1
    };
    proofofex.find({}).sort(id).limit(10).then(eachPoe => {
        res.json(eachPoe);
    })
    //  res.send("Find All Properties");

};

exports.fetchyear = (req, res) => {

    var centre = req.body.centrecode;
    console.log(chalk.bgCyan('inside fetchYear::: centre = ', centre));
    proofofex.find({
        "centre": centre
    }, {
        year: 1,
        _id: 0
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
exports.fetchbatch = (req, res) => {

    var centre = req.body.centrecode;
    var year = req.body.year;

    proofofex.find({
        "centre": centre,
        "year": year
    }, {
        month: 1,
        _id: 0
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

    var centre = req.body.centrecode;
    var year = req.body.year;
    var batch = req.body.batch;

    proofofex.find({
        "centre": centre,
        "year": year,
        "month": batch
    }, {
        course: 1,
        _id: 0
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

    var centre = req.body.centrecode;
    var year = req.body.year;
    var batch = req.body.batch;
    var course = req.body.course;

    proofofex.find({
        "centre": centre,
        "year": year,
        "month": batch,
        "course": course
    }, {
        issuedTo: 1,
        _id: 0
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

// fetch certificate information
exports.fetchAllcerts = (req, res) => {

    //console.log(chalk.bgCyan('inside fetchAllcerts'));

    var centre = req.body.centre;
    console.log()
    var year = req.body.year;
    var batch = req.body.batch;
    var course = req.body.course;

    console.log(chalk.bgCyan(centre, year, batch, course));
    proofofex.find({
        "centre": centre,
        "year": year,
        "month": batch,
        "course": course
    }, {
        _id: 0
    }).then(eachPoe => {
        /*res.json({
            "rollNo":eachPoe.issuedTo,
            "documentType":eachPoe.documentType,
            "sha256hash":eachPoe.sha256Hash,
            "txId": eachPoe.txId,
            "timestamp":eachPoe.timestamp
        });*/
        //console.log(chalk.bgGreen('fetchallcerts :::', eachPoe));
        res.json(eachPoe);
    })
    //  res.send("Find All Properties");

};
// Retrieve and return all properties from the database.
exports.fetchrecords = (req, res) => {

    var batch = req.body.batch;
    var course = req.body.course;
    proofofex.find({
        "month": batch,
        course: course
    }, {
        issuedTo: 1,
        documentType: 1,
        sha256Hash: 1,
        txId: 1,
        timestamp: 1,
        _id: 0
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

exports.sendmail = async (req, res) => {

    var subject = req.body.subject;
    var content = req.body.content;
    var sendTo = req.body.email;

    let account = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    /*let transporter = nodemailer.createTransport({
      host: "smtp.cdac.in",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "esuraksha", // generated ethereal user
        pass: "cdachyd@123$" // generated ethereal password
      }
    });*/

    let transporter = nodemailer.createTransport({
        host: "smtp.cdac.in",
        port: 587,
        secure: false,
        authMethod: 'STARTTLS',
        debug: true, // true for 465, false for other ports
        auth: {

            user: "esuraksha", // generated ethereal user
            pass: "cdachyd@123$" // generated ethereal password
        },
        messageId: "eSuraksha"
    });
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"eSuraksha" <esuraksha@cdac.in>', // sender address
        to: sendTo, // list of receivers
        subject: subject, // Subject line
        text: content, // plain text body
        attachments: [{
            path: '/home/cdac/CDACPoE/cdacpoerest/6a9f1fd0d9ba7e7ef6706b32f9ce14a6c5912d6dd546e03ec212aff04d8bc576.pdf'

        }]

    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions)

    console.log("Message sent: %s", info.messageId);

    res.json("Mail sent Successfully")
}

var genReceipt = require("../generate-pdf");
async function sendmailToStudent_by_VIKAS(documentType, email, rollNo, name, centre, courseid, fileName, content, extension, txnID, cert, timestamp) {
    console.log("***********************************sendingmail*******************************************")
    receipt = "";
    await genReceipt.generateACTSReceipt(txnID, fileName, documentType, cert, timestamp).then((vres) => {
        // console.log('recipt response0 ' + vres);
        if (vres) receipt = vres;
    });



    var i = 1
    // var fName = rollNo + '_' + documentType + "." + extension;
    // console.log(chalk.bgCyan(fName));
    return new Promise((resolve, reject) => {
        var fName = rollNo + '_' + documentType + "." + extension;
        var fReceipt = rollNo + '_' + documentType + "_Receipt.pdf";
        console.log(chalk.bgCyan(fReceipt));
        let mailOptions = {
            from: '"cdacchain" <cdacchain@cdac.in>', // sender address
            to: email, // list of receivers
            subject: documentType + ' of ' + rollNo, // Subject line
            html: `Dear ${name},
    
          <p>Greetings from C-DAC !!!</p>
          <p>Your ${documentType} for the ${courseid} course completed at ${centre} is uploaded in C-DAC’s PoE for ACTS Certificates and attached a copy of the same for your future reference. <br />  
          
          <p>Regards,<br />
          
          Training Coordinator,<br />
          ${centre}</p>
          <h3 style="color:blue;">PoE for ACTS Certificates is a Blockchain based Proof of Existence, developed by C-DAC Hyderabad.</h1>`,
            attachments: [{
                //path: content1,
                //filename: rollNo + '_' + documentType + "." + extension,
                filename: fName,
                content: content,
                encoding: "base64"
            },
            {
                filename: fReceipt,
                content: receipt,
                encoding: "base64"
            }]

        };
        // send mail with defined transport object
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

//function sendmailToStudent(documentType, content, email, rollNo, name, centre) {
function sendmailToStudent(documentType, content1, email, rollNo, name, centre, courseid, cb) {

    //console.log('inside sendmail content = ' + content1);

    console.log("***********************************sendingmail*******************************************")
    /* let transporter = nodemailer.createTransport({
        host: "smtp.cdac.in",
        port: 587,
        secure: false,
        authMethod: 'STARTTLS',
        debug: true, // true for 465, false for other ports
        auth: {

            user: "cdacchain", // generated ethereal user
            pass: "cdachyd@123$" // generated ethereal password
        },
        messageId: "cdacchain"
    }); */
    // setup email data with unicode symbols
    //You can register to the solution at www.cdacchain.in, to view and share your certificate records existence in C-DACs PoE for ACTS Certificate solution to any prospective agencies organizations.<br />
    //var content1 = Buffer.from(content.toString());

    var data1 = content1.split(",");
    /*var ext = data1[0].split("/");
    var ext1 = ext[1].split(";");
    console.log(ext1[0]); //holds file extension */
    //var fileName = rollNo+'-'+documentType+'.'+ext1[0];

    //Code for extracting the file type from base64 text and creating filename to be attached in email to student
    var ext = content1.substring(content1.indexOf('/') + 1, content1.indexOf(';base64'));
    console.log(ext);
    var fileName = rollNo + '-' + documentType + '.' + ext;
    console.log(fileName);

    //var data = new Buffer(dat, "base64");
    //console.log('data ' + data1[0]);
    //<p>Please find attached the ${documentType}, which is uploaded in the C-DAC’s PoE for ACTS Certificates. Please save this attachment for future use.<br />    </p>
    let mailOptions = {
        from: '"cdacchain" <cdacchain@cdac.in>', // sender address
        to: email, // list of receivers
        subject: documentType + ' of ' + rollNo, // Subject line
        html: `Dear ${name},

      <p>Greetings from C-DAC !!!</p>
      <p>Your ${documentType} for the ${courseid} course completed at ${centre} is uploaded in C-DAC’s PoE for ACTS Certificates and attached a copy of the same for your future reference. <br />  
      
      <p>Regards,<br />
      
      Training Coordinator,<br />
      ${centre}</p>
      <h3 style="color:blue;">PoE for ACTS Certificates is a Blockchain based Proof of Existence, developed by C-DAC Hyderabad.</h1>`,
        attachments: [{
            //path: content1,
            filename: fileName,
            content: data1[1],
            encoding: "base64"
        }]

    };

    // send mail with defined transport object
    emailConfig.transporter.sendMail(mailOptions, function (err, info) {
        //transporter.sendMail(mailOptions, function (err, info) {
        var emailStatus;
        if (err) {
            emailStatus = false
            console.log(err)
        } else {
            emailStatus = true;
            console.log("Message sent: %s", info.response);
        }

        // return emailStatus;
        cb(emailStatus);

    })

    //console.log("Message sent: %s", info.messageId);

    // res.json("Mail sent Successfully")
}

//Sending email to user with new password in case of request for forgot password
function sendmailFgtPwd(email, name, username, password, cb) {

    //console.log('inside sendmail content = ' + content1);

    console.log("***********************************sendingmail********************************************************")
    let transporter = nodemailer.createTransport({
        host: "smtp.cdac.in",
        port: 587,
        secure: false,
        authMethod: 'STARTTLS',
        debug: true, // true for 465, false for other ports
        auth: {

            user: "cdacchain", // generated ethereal user
            pass: "cdachyd@123$" // generated ethereal password
        },
        messageId: "cdacchain"
    });

    let mailOptions = {
        from: '"cdacchain" <cdacchain@cdac.in>', // sender address
        to: email, // list of receivers
        subject: 'Password Recovery for your account in Blockchain based ACTS PoE', // Subject line
        html: `Dear ${name},

      <p>Greetings from C-DAC !!!</p>
      <p> As per your request to regenerate new password, we are sending you a temporary password to login to your account.<br />      
      <p> Name: ${name} <br />  
      <p> Name: ${username} <br /> 
      <p> Password: ${password} <br /> 
      
      <p> Please change your password immediately after login to your account.<br />
      
      <p>Regards,<br />
      
      Administrator<br /> </p>`,
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (err, info) {
        var emailStatus;
        if (err) {
            emailStatus = false
            console.log(err)
        } else {
            emailStatus = true;
            console.log("Message sent: %s", info.response);
        }

        // return emailStatus;
        cb(emailStatus);

    })

    //console.log("Message sent: %s", info.messageId);

    // res.json("Mail sent Successfully")
}


//Students can share to recruiters 
exports.shareStudentRecords = async (req, res) => {

    var txids = req.body.documents;
    var name = req.body.username;
    var sendTo = req.body.email;
    console.log(req.body)
    console.log(txids);
    var link;



    let transporter = nodemailer.createTransport({
        host: "smtp.cdac.in",
        port: 587,
        secure: false,
        authMethod: 'STARTTLS',
        debug: true, // true for 465, false for other ports
        auth: {

            user: "cdacchain", // generated ethereal user
            pass: "cdachyd@123$" // generated ethereal password
        },
        messageId: "cdacchain"
    });
    var link = [];
    txids.forEach(async function (doc) {

        console.log(doc);
        link.push(env.verificationURL + "/poe/transaction?txId=" + doc);
        // var link = "http://localhost:5000/poe/transaction?txId="+doc;

    });
    var construct_html = '<html>'
    console.log(link);

    link.forEach(link => {
        construct_html += '<li><a href=' + link + '>' + link + '</a></li>'
    });

    cdacUser.find({
        "username": name
    }, async function (err, student) {
        if (student) {
            console.log(student);
            let mailOptions = {
                from: '"cdacchain" <cdacchain@cdac.in>', // sender address
                to: sendTo, // list of receivers
                subject: 'Certificate(s) / Marksheet' + ' of ' + student[0].rollNo, // Subject line       
                html: `Dear Sir / Madam,
                    <p>I (${name}), have completed ${student[0].course}, ${student[0].month} batch bearing the Roll no ${student[0].rollNo} from ${student[0].centre}. Please find below the link to view details from PoE ACTS Certificate Application of C-DAC Hyderabad which proves the certificate existence.</p>
                    ${construct_html}
            
                    <p>Regards,<br/>
                    
                    ${name}</p>
                    <h3 style="color:blue;">PoE ACTS Certificate Application is a Blockchain based Proof of Existence Platform developed by C-DAC Hyderabad.</h1>`,


            };
            // send mail with defined transport object
            let info = await transporter.sendMail(mailOptions)
            //  let info =  transporter.sendMail(mailOptions)

            console.log("Message sent: %s", info.messageId);

            proofofex.update({
                "rollNo": student.rollNo
            }, {
                $push: {
                    "sharedTo": {
                        "eMail": sendTo
                    }
                }
            }, function (err, mailupdated) {
                console.log("database updated with email")

            })


            res.json("Mail sent Successfully");



        }
    })
    // setup email data with unicode symbols




}


async function sendmailToVerifier(sendTo, construct_html, centre, cb) {
    console.log(chalk.bgGreen(construct_html));
    /* let transporter = nodemailer.createTransport({
        host: "smtp.cdac.in",
        port: 587,
        secure: false,
        authMethod: 'STARTTLS',
        debug: true, // true for 465, false for other ports
        auth: {

            user: "cdacchain", // generated ethereal user
            pass: "cdachyd@123$" // generated ethereal password
            // pass: "cdachyd@123" // generated ethereal password
        },
        messageId: "cdacchain"
    }); */

    let mailOptions = {
        from: '"cdacchain" <cdacchain@cdac.in>', // sender address
        to: sendTo, // list of receivers
        subject: "Documents for verification", // Subject line       
        html: `Dear Sir / Madam,
        <p>Greetings from C-DAC!!</p>
        <p>Please find below the link(s) of the student(s) Certificate(s) / Marksheet(s) issued by C-DAC <Centre>. These Certificate(s) / Marksheet(s) are recorded in PoE ACTS Certificates Application.</p>
        ${construct_html}

        <p>Regards,<br/>

        Training Coordinator,<br/>
        ${centre}</p>      
        
        <h3 style="color:blue;">PoE ACTS Certificate Application is a Blockchain based Proof of Existence platform developed by C-DAC Hyderabad.</h1>`,


    };
    try {
        // send mail with defined transport object
        //let info = await transporter.sendMail(mailOptions);  
        let info = await emailConfig.transporter.sendMail(mailOptions);


        console.log("Message sent: %s", info.messageId);
        //cb({status: 'Success', message: info.messageId});  
        cb('Success');
        //cb(info.messageId);  
    } catch (error) {
        console.log("Message Failed %s", error);
        //cb({status: 'Failure', message: error});  
        cb('Failed');
    }
}


//Share Student records to Recruiters by ACTS roles
exports.shareRecords_bk = async (req, res) => {

    //var centre = "C-DAC Hyderabad" //TODO from GUI
    var centre = req.body.centre;
    var txids = req.body.documents;
    var sendTo = req.body.email;
    // console.log(txids);
    var link;

    //Added by Ravi for Link Expiry
    var regdate = new Date();
    console.log("regdate" + regdate);
    //token exp 1800 = 30*60 = 30mins
    //token exp 30days = 30*24*60*60
    var batch = 'Aug';
    var year = '2018';
    /* var token = jwt.sign({
        //exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
        //exp: Math.floor(Date.now().valueOf() / 1000) + 300,
        //exp: Math.floor(Date.now().valueOf() / 1000) + 30*24*60*60,
        exp: Math.floor(Date.now().valueOf() / 1000) + 5*60,
        centre: centre,
        batch:batch,
        year: year
    }, gconfig.secret); */

    //console.log('inside SHare Records::token is '+token);



    let transporter = nodemailer.createTransport({
        host: "smtp.cdac.in",
        port: 587,
        secure: false,
        authMethod: 'STARTTLS',
        debug: true, // true for 465, false for other ports
        auth: {

            user: "cdacchain", // generated ethereal user
            pass: "cdachyd@123$" // generated ethereal password
        },
        messageId: "cdacchain"
    });
    var link = [];
    txids.forEach(function (doc) {

        // console.log(doc);
        //  link.push(env.verificationURL+"/poe/transaction?txId=" + doc);
        proofofex.findOne({
            "txId": doc
        }, async function (err, rec) {
            console.log("share records" + rec.fileName);


            var token = jwt.sign({
                //exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
                //exp: Math.floor(Date.now().valueOf() / 1000) + 300,
                //exp: Math.floor(Date.now().valueOf() / 1000) + 30*24*60*60, // expires in 30 days
                exp: Math.floor(Date.now().valueOf() / 1000) + 5 * 60, // expires in 5 Minutes
                centre: centre,
                batch: batch,
                year: year,
                txId: rec.txId
            }, gconfig.secret);


            if (rec.posStatus == true) {
                console.log(rec.posHash)
                //link.push(env.verificationURL+"/poe/transaction?txId=" + rec.txId);
                //link.push(env.verificationURL+"/poe/transaction/" + rec.txId); Original one working

                //link.push(env.verificationURL+"/poe/transaction/" + rec.txId+'/'+token);
                //link.push(env.verificationURL + "/poe/transaction/" + token);
                link.push(env.verificationURL + '/' + token);

                //link.push(env.verificationURL+"/pos/transaction?hash=" + rec.posHash);
                //link.push(env.verificationURL+"/pos/transaction/" + rec.posHash);
            } else {
                console.log("in else")
                //link.push(env.verificationURL+"/poe/transaction?txId=" + rec.txId); Original one working
                //link.push(env.verificationURL+"/poe/transaction?txId=" + rec.txId+'/'+token);
                //link.push(env.verificationURL + "/poe/transaction?txId=" + token);
                link.push(env.verificationURL + "?txId=" + token);
            }
            var construct_html = '<html>'


            link.forEach(link => {
                //construct_html += '<li><a href=' + link + '>' + link + '</a></li>'
                construct_html += '<li> RollNo: ' + rec.issuedTo + '    DocumentType: ' + rec.documentType + '  <a href=' + link + '>' + link + '</a></li>'
            });
            console.log(construct_html);
            // setup email data with unicode symbols
            let mailOptions = {
                from: '"cdacchain" <cdacchain@cdac.in>', // sender address
                to: sendTo, // list of receivers
                subject: "Documents for verification", // Subject line       
                html: `Dear Sir / Madam,
                <p>Greetings!!</p>
                <p>Please find below the link(s) of the student(s) Certificate(s) / Marksheet(s) issued by C-DAC <Centre>. These Certificate(s) / Marksheet(s) are recorded in PoE ACTS Certificates Application.</p>
                ${construct_html}
        
                <p>Regards,<br/>
        
                Training Coordinator,<br/>
                ${centre}</p>      
                
                <h3 style="color:blue;">PoE ACTS Certificate Application is a Blockchain based Proof of Existence platform developed by C-DAC Hyderabad.</h1>`,


            };

            // send mail with defined transport object
            let info = await transporter.sendMail(mailOptions)
            //  let info =  transporter.sendMail(mailOptions)

            console.log("Message sent: %s", info.messageId);
            txids.forEach(async function (doc) {
                proofofex.update({
                    "txId": doc
                }, {
                    $push: {
                        "sharedTo": {
                            "eMail": sendTo
                        }
                    }
                }, function (err, mailupdated) {
                    console.log("database updated with email");

                })
            })


            res.json("Mail sent Successfully");
        })
        // var link = "http://localhost:5000/poe/transaction?txId="+doc;

    });


}

exports.shareRecords = async (req, res) => {

    const receiptEnv = require('../../config/receiptEnviron');
    //var centre = "C-DAC Hyderabad" //TODO from GUI
    var centre = req.body.centre;
    var txids = req.body.documents;
    var sendTo = req.body.email;
    // console.log(txids);
    var link;
    let shouldReturnFromIteration;
    //***************Validate email ***************
    await validate.validateEmail(sendTo).then(vres => {
        if(vres.status == "Success") {
            console.log(chalk.bgGreen('email valid'));
        } else if(vres.status == "Failed") {
            console.log(chalk.bgRed('email Invalid ', vres.message));
            // res.send(common.getErrorMessage('\'email\''));
            res.send({
                status: 'Failed',
                message : "Email Address Invalid ",
                result: sendTo + "invalid"

            });
            shouldReturnFromIteration = true;
        }
    })
    if(shouldReturnFromIteration) return;
    //Added by Ravi for Link Expiry
    var regdate = new Date();
    console.log("regdate" + regdate);
    //token exp 1800 = 30*60 = 30mins
    //token exp 30days = 30*24*60*60
    //var batch = 'Aug';
    //var year = '2018';
    /* var token = jwt.sign({
        //exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
        //exp: Math.floor(Date.now().valueOf() / 1000) + 300,
        //exp: Math.floor(Date.now().valueOf() / 1000) + 30*24*60*60,
        exp: Math.floor(Date.now().valueOf() / 1000) + 5*60,
        centre: centre,
        batch:batch,
        year: year
    }, gconfig.secret); */

    //console.log('inside SHare Records::token is '+token);

    var construct_html = '<html>'
    var iterator = 0;
    var len = txids.length;
    //console.log(chalk.bgCyan('shareRecords:: length = ', len));
    txids.forEach(function (doc) {
        var link = [];
        // console.log(doc);
        proofofex.findOne({
            "txId": doc
        }, async function (err, rec) {
            console.log("share records" + rec.fileName);


            var token = jwt.sign({
                //exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
                //exp: Math.floor(Date.now().valueOf() / 1000) + 300,
                //exp: Math.floor(Date.now().valueOf() / 1000) + 30*24*60*60, // expires in 30 days
                exp: Math.floor(Date.now().valueOf() / 1000) + 5 * 60, // expires in 5 Minutes
                centre: centre,
                //batch: batch,
                //year: year,
                issuedTo: rec.issuedTo,
                txId: rec.txId
            }, gconfig.secret);

            //rNos.push(rec.issuedTo);
            //type.push(rec.documentType);
            if (rec.posStatus == true) {
                console.log(rec.posHash)
                //link.push(env.verificationURL + "/poe/transaction/" + token);
                link.push(env.verificationURL + "/" + token);

            } else {
                console.log("in else")
                //link.push(env.verificationURL + "/poe/transaction?txId=" + token);
                link.push(env.verificationURL + "?txId=" + token);
            }

            link.forEach(loopLink => {
                //construct_html += '<li><a href=' + link + '>' + link + '</a></li>'
                //construct_html += '<li> RollNo: ' + rec.issuedTo + '    DocumentType: ' + rec.documentType + '   Link to Verify: ' + '  <a href=' + loopLink + '>' + loopLink + '</a></li>'
                construct_html += '<li> RollNo: ' + rec.issuedTo + '    DocumentType: ' + rec.documentType + '   Link to Verify: ' + '  <a href=' + loopLink + '> Click Here </a></li>'
            });
            console.log(construct_html);
            iterator++;
            console.log(chalk.bgCyan('shareRecords:: iterator = ', iterator));
            if (iterator === len) {
                sendmailToVerifier(sendTo, construct_html, centre, function (mailStatus) {
                    //if(mailStatus.status === 'Success')
                    if (mailStatus === 'Success') {
                        res.json("Mail sent Successfully");
                        console.log(chalk.bgCyan('mailstatus = ', mailStatus));
                    } else {
                        res.json("Sending mail Failed ");
                    }
                });
            }
        });
    });
}

exports.fetchCertsbyUserName = (req, res) => {
    console.log('inside fetch certificates by UserName')
    var username = req.body.username;
    console.log('username', username);
    Student.find({
        username: username
    }).then(student => {
        console.log(student)
        console.log(student[0].rollNo);
        proofofex.find({
            "issuedTo": student[0].rollNo
        }, {
            issuedTo: 1,
            documentType: 1,
            sha256Hash: 1,
            txId: 1,
            timestamp: 1,
            _id: 0
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

    })
    var course = req.body.course;

    //  res.send("Find All Properties");

};

exports.verifierRecords = (req, res) => {

    // console.log(req)
    var email = req.body.email;
    //var email = "siri.chiliveri@gmail.com";
    proofofex.find({
        "sharedTo.eMail": email
    }, {
        issuedTo: 1,
        documentType: 1,
        sha256Hash: 1,
        txId: 1,
        timestamp: 1,
        _id: 0
    }).then(eachRecord => {
        res.json(eachRecord);
    })

};

function getByteArray(filePath) {
    let fileData = fs.readFileSync(filePath).toString('hex');
    let result = []
    for (var i = 0; i < fileData.length; i += 2)
        result.push('0x' + fileData[i] + '' + fileData[i + 1])
    return result;
}

async function qrcode_gen() {
    var code = await qrcode.toDataURL('http://cdacchain.in');
    return code;
}
async function generatepdf(txId, fileName, fileType, documentType, sha256Hash, sha1Hash, issuedTo, issuedByUser, issuedByOrg, timestamp, res) {



    var code = await qrcode.toDataURL('http://cdacchain.in/poe/transaction?txId=' + txId);
    //console.log(code);
    var receipt_html = '<html>';

    receipt_html += '<head><style>table, th, td {  border: 1px solid black;' +
        '  border-collapse: collapse;}' +
        'th, td {' +
        'word-wrap:break-word; overflow:hidden;padding: 3px;' +
        'text-align: left;    ' +
        'font-size:8pt; font-family="arial";}' +
        'tr:nth-child(even) {background-color:#f3f3f3;}' +
        '</style></head><body>';


    receipt_html += '<img src="file:///home/cdac/Downloads/cdac.png" width="80",alt="cdac" height="50" align="right"><br/><br/>';
    receipt_html += '<b><div style="text-align: center; style="color:blue width="50"; height="50";>PoE Receipt</div></b>';
    receipt_html += '<div><p style="font-size:2px"><table style="width:90%" font-size:"2pt"; font-family="arial";table-layout:fixed; height:"150">';
    receipt_html += '<tr> <th>Transaction Id</th><td font-size:"2pt";>' + txId + '</td></tr>'
    receipt_html += '<tr><th>File Name</th><td>' + fileName + '</td></tr>'
    receipt_html += '<tr><th>File Type</th><td>' + fileType + '</td></tr>'
    receipt_html += '<tr><th>Document Type</th><td>' + documentType + '</td></tr>'
    receipt_html += '<tr><th>sha256Hash</th><td>' + sha256Hash + '</td></tr>'
    receipt_html += '<tr><th>sha1Hash</th><td>' + sha1Hash + '</td></tr>'
    receipt_html += '<tr><th>Issued To</th><td>' + issuedTo + '</td></tr>'
    //receipt_html += '<tr><th>Issued By Organization</th><td>' + issuedByOrg + '</td></tr>'
    receipt_html += '<tr><th>Issued By Organization</th><td>' + 'Centre for Development of Advanced Computing (C-DAC)' + '</td></tr>'
    receipt_html += '<tr><th>Issued By User</th><td>' + issuedByUser + '</td></tr>'
    // receipt_html += '<tr><th>Timestamp</th><td>' + timestamp + '</td></tr>'
    receipt_html += '</table></p></div>'

    //  receipt_html +='<img src="file:///home/cdac/Downloads/qrcode.png" width="80",alt="cdac" height="80" align="left">';
    receipt_html += '<img src="' + code + '"' + 'width="80",alt="cdac" height="80" align="left">';
    //receipt_html+= '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAO/SURBVO3BQY4kRwIDQXqg/v9l3znowFMAiaxuaRY0wz8y84+TmXIyU05myslMOZkpJzPlZKaczJSTmXIyU05myslMOZkpJzPlZKZ88hKQ36TmBsgTahqQJ9TcAPlNat44mSknM+VkpnzyZWq+CcgNkKbmCSA3ahqQN9R8E5BvOpkpJzPlZKZ88sOAPKHmCTUNSFPTgNyo+U1AnlDzk05myslMOZkpn/yfA9LUNCA3QJqa/2cnM+VkppzMlE/+ckBu1DwB5AbIjZq/2clMOZkpJzPlkx+m5iepaUAakKamqbkBcqPmDTX/JScz5WSmnMyUT74MyG8C0tQ0IDdAmpobNQ1IU3MD5L/sZKaczJSTmfLJS2r+TWoakCfUNCBNzRtq/iYnM+VkppzMlE9eAtLUNCBNTQPS1DQgTc2NmgbkBkhT04D8JCBNzQ2QpuabTmbKyUw5mSn4R34QkBs1TwBpat4A0tQ8AeQJNd8EpKl542SmnMyUk5nyyUtAfhKQpuYGyI2apqYBaWpu1NwAuQHS1DQgv+lkppzMlJOZgn/kFwFpahqQpqYBaWoakKbmBkhTcwOkqflNQJqabzqZKScz5WSmfPISkCfUNCBNTQNyA6SpaUCamm8C8oSaGyBNzQ2QpuaNk5lyMlNOZsonL6l5AsgNkKamAWlqngByA6SpaWoakN+kpgH5ppOZcjJTTmbKJy8BaWoakKbmCSBNTQPS1LyhpgFpapqaGyANSFPT1DQgv+lkppzMlJOZ8slLahqQpuYGyI2aJ4A0NTdAGpAbIE3NNwFpahqQpuabTmbKyUw5mSmfvASkqbkB0tQ0IA1IU3OjpgG5UXMDpKlpQN4A8oSan3QyU05myslMwT/yFwPS1NwAaWpugDyh5gkg36TmjZOZcjJTTmbKJy8B+U1qmpobIE3NDZCmpgF5AkhTc6PmBshPOpkpJzPlZKZ88mVqvgnIE0CamgakqWlqbtQ0IDdqngDS1DQ1Dcg3ncyUk5lyMlM++WFAnlDzBJCm5kZNA9LUvAHkDTX/ppOZcjJTTmbKJ385NTdAngDS1DQgTc0TQJ4A0tQ0Nd90MlNOZsrJTPnkLwekqXlDTQPS1PwkIE3NDZCm5o2TmXIyU05myic/TM1PUtOANDU3QBqQGyBPqGlqGpAngDQ133QyU05myslM+eTLgPwmIE8AaWpugHwTkKbmDSBNzRsnM+VkppzMFPwjM/84mSknM+VkppzMlJOZcjJTTmbKyUw5mSknM+VkppzMlJOZcjJTTmbK/wA9Uq0xJJiC3gAAAABJRU5ErkJggg==" width="80",alt="cdac" height="80" align="left">'
    receipt_html += '<span style="font-size:8pt; color:blue;">www.cdacchain.in<br>Scan QR-Code or visit above url to verify authenticity of document.' +
        '<br> This document is computer generated and hence does not require signature.</span>'
    receipt_html += '</body>'
    receipt_html += '</html>'

    var options = {

        // Export options
        "directory": "/tmp", // The directory the file gets written into if not using .toFile(filename, callback). default: '/tmp'

        "format": "A4", // allowed units: A3, A4, A5, Legal, Letter, Tabloid
        "orientation": "portrait", // portrait or landscape

        // Page options

        /* "border": {
            "top": "2in", // default is 0, units: mm, cm, in, px
            "right": "1in",
            "bottom": "2in",
            "left": "1.5in"
        }, */

        paginationOffset: 1, // Override the initial pagination number
        /*  "header": {
             "height": "15mm",
             "contents": '<b><div style="text-align: center; style="color:blue">PoE Receipt</div></b>'
         }, */
        /* "footer": {
            "height": "28mm",
            "contents": {
                first: 'Cover page',
                2: 'Second page', // Any page number is working. 1-based index
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                last: 'Last Page'
            }
        }, */


        // Rendering options
        //  "base": "file:///home/www/your-asset-path", // Base path that's used to load files (images, css, js) when they aren't referenced using a host

        // Zooming option, can be used to scale images if `options.type` is not pdf
        // "zoomFactor": "1", // default is 1

        // File options
        // "type": "pdf", // allowed file types: png, jpeg, pdf
        //  "quality": "75", // only used for types png & jpeg

        // Script options
        // "phantomPath": "./node_modules/phantomjs/bin/phantomjs", // PhantomJS binary which should get downloaded automatically
        // "phantomArgs": [], // array of strings used as phantomjs args e.g. ["--ignore-ssl-errors=yes"]
        // "script": '/url',           // Absolute path to a custom phantomjs script, use the file in lib/scripts as example
        // "timeout": 30000,           // Timeout that will cancel phantomjs, in milliseconds

        // Time we should wait after window load
        // accepted values are 'manual', some delay in milliseconds or undefined to wait for a render event
        "renderDelay": 1000,



    };
    pdf.create(receipt_html, options).toFile('/tmp/PoEReceipt_' + txId + '.pdf', function (err, res1) {
        if (err) return console.log(err);
        console.log(res1); // { filename: '/app/businesscard.pdf' }
        // res.sendFile(res.filename);
        // setResponseHeaders(res, '/tmp/PoEReceipt_' + txId + '.pdf');
        //  res.contentType("application/pdf");
        /*  phantom.create().then(function (ph) {
             ph.createPage().then(function (page) {
                 page.open('/tmp/PoEReceipt_' + txId + '.pdf').then(function (status) {
                     page.render('/tmp/PoEReceipt_' + txId + '.pdf').then(function () {
                         console.log('Page Rendered');
                         ph.exit();
                     });
                 });
             });
         }); */
    });

    //return res;
}




function setResponseHeaders(res, filename) {
    res.header('Content-disposition', 'inline; filename=' + filename);
    res.header('Content-type', 'application/pdf');
}


//Verifier Query for a Roll Number
// exports.verifyrollNo = async (req, res) => {
//     console.log('inside verify rollNo');


// 	let result = await Captcha.validateCaptcha(req);
// 	console.log('captcha result is ' + result);

// 	if(result === "valid") {
//         console.log('captcha is correct');

//         var peers = "peer0.actsorg.cdac.in";
//         var chaincodeName = "cdacpoe";
//         var channelName = "cdacpoechannel";
//         var fcn = "queryProofOfExByTxid";
//         var nullTxn  = 0;

//         var rollNo = req.body.rollNo;
//         rollNo = validator.trim(rollNo); 
//         if(!validator.isNumeric(rollNo)) {
//             console.log(chalk.bgRed("Invalid rollNo content"));
//             res.json(getErrorMessage("Invalid rollNo"));
//             return;
//         }
//         var issuedByOrg = req.orgname;
//         var issuedByUser = req.username;



//         if (!chaincodeName) {
//             res.json(getErrorMessage("Invalid request"));
//             return;
//         }
//         if (!channelName) {
//             res.json(getErrorMessage("Invalid request"));
//             return;
//         }
//         var finalresult = [];

//         proofofex.find({
//             issuedTo: rollNo
//         }, {
//             txId: 1,
//             _id: 0
//         }, async function (err, records) {
//             console.log('no of records for ' + rollNo + ' is ' + records);
//             console.log('inside query by roll no ' + records.length);
//             if (records.length > 0) {
//                 for (var i = 0; i < records.length; i++) {

//                     var txId = records[i].txId;
//                     if(txId == null || txId == ' ' || txId == '') {
//                         console.log(chalk.bgRed('txID is null ', txId));
//                         nullTxn++;
//                         continue;
//                     } else {
//                         console.log(chalk.bgGreen('txID is ', txId))
//                     }

//                     var re2 = new RegExp('^([a-zA-Z0-9]+)$');
//                     if (re2.test(txId)) {
//                         console.log("Valid");
//                         /* if(txId == null || txId == ' ' || txId == '') {
//                             console.log(chalk.red('txID is null ', txID));
//                             continue;
//                         } */
//                         var args = [
//                             records[i].txId
//                         ]

//                         // let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
//                         let message = await query.queryChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);

//                         // logger.debug("MEssage---------" + JSON.stringify(message));


//                         if (message.status === "Success") {
//                             if (message.message.length != 0) {
//                                 var result = JSON.parse(message.message.toString());
//                                 //   logger.debug(result);
//                                 // logger.debug('found ', result[0].found);
//                                 if (result[0].found === true) {
//                                     //   logger.debug("found true");
//                                     proofofex.findOne({
//                                         "sha256Hash": result[0].sha256Hash
//                                     }, function (err, poe1) {
//                                         //     logger.debug(poe1);
//                                         rtelib.raiseEvent('blockchain', 'poeSearch', {
//                                             ts: cts(),
//                                             msg: 'Query based on file hash ' + result[0].sha256Hash + ' is performed'
//                                         });
//                                         let dbstatus = {
//                                             "status": "Success",
//                                             "message": "",
//                                             "result": result[0],
//                                             "_id": poe1._id,
//                                             "__v": poe1.__v,
//                                             "txstatus": poe1.txstatus
//                                         }
//                                         //   logger.debug(dbstatus);
//                                         // res.send(dbstatus);
//                                         finalresult.push(result[0]);
//                                         // console.log("records length " + records.length + "finalresult " + finalresult.length);
//                                         //if (records.length == finalresult.length) {
//                                         console.log(chalk.bgCyan('records.length is '+ records.length));
//                                         console.log(chalk.bgCyan('nullTxn is '+ nullTxn));
//                                         console.log(chalk.bgCyan('finalresult.length is '+ finalresult.length));
//                                         if ((records.length-nullTxn) == finalresult.length) {
//                                             console.log(finalresult)
//                                             res.send(finalresult);
//                                         }
//                                     });
//                                 } else { //result.found === false

//                                     /* res.send({
//                                         "status": "Success",
//                                         "message": "",
//                                         "result": result
//                                     }); */
//                                     logger.debug("Failed" + result[0]);
//                                     finalresult.push(result[0]);
//                                 }
//                             } //closing if(message!=0)
//                             /* else { // if message is empty -- hash not present in ledger


//                                 /* res.send({
//                                     status: "Success",
//                                     message: "",
//                                     result: {
//                                         "txId": 0,
//                                         "assetVersion": 0,
//                                         "sha256Hash": 0,
//                                         "sha1Hash": 0,
//                                         "fileName": 0,
//                                         "fileType": 0,
//                                         "documentType": 0,
//                                         "issuedTo": 0,
//                                         "issuedByOrg": 0,
//                                         "issuedByUser": 0,
//                                         "timestamp": {
//                                             "seconds": 0,
//                                             "nanos": 0
//                                         },
//                                         "found": false
//                                     }
//                                 }) */
//                             // logger.debug("Document not found");
//                             //  finalresult.push(result[0]);
//                             // } */
//                         } else { // in case of error

//                             //res.send(getErrorMessage(JSON.stringify(message)));
//                             logger.debug("Failed" + message);
//                             finalresult.push(message);
//                         }




//                     }
//                 }   
//             } else{
//                 res.json(getErrorMessage('\'No documents found for this Roll number \''));
//                 //res.json(getErrorMessage('\'Incorrect file\''));
//                 return;

//                 res.send({
//                     status: "Sucess",
//                     "message": "No documents found"
//                 })
//             }
//         });
//     } else {
//         res.send({status:"Failed","message":"incorrect Captcha!!! Please Try Again"});
//     }

// }








//TODO
// exports.getACTSReceipt =  async (req,res) => {


//     // documentType, email, rollNo, name, centre, courseid, fileName, content, extension, txnID, cert, timestamp

//     receipt = "";
//     await genReceipt.generateACTSReceipt(txnID, fileName, documentType, cert, timestamp).then((vres) => {
//         // console.log('recipt response0 ' + vres);
//         if (vres) receipt = vres;
//     });
// }