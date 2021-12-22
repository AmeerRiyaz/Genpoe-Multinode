const mongoose = require('mongoose');
var install = require('../hyperledger/install-chaincode.js');
var instantiate = require('../hyperledger/instantiate-chaincode.js');
var invoke = require('../hyperledger/poe/invoke-transaction.js');
var query = require('../hyperledger/poe/query.js');
const proofofex = require('../models/poe.model');
var log4js = require('log4js');
var logger = log4js.getLogger('poechaincode.controller');
var validator = require('validator');
const validFilename = require('valid-filename');
const User = require('../models/bctuser.model.js');
const io = require('socket.io-client');
var rtelib0 = require('../rtelib/rte-lib');
var rtconfig = require('../config/rtconfig');
//var serverIP = 'http://10.244.0.48:3000';
const socket = io(rtconfig.rteserverIP + '/blockchain-nsp');
var rtelib = new rtelib0(socket);
const nodemailer = require("nodemailer");
const fs = require('fs');
var mustache = require('mustache');
var ipfsClient = require('./ipfs_client');
const chalk = require('chalk');
const dateFormat = require('dateformat');
const genPoeUser = require('../models/genpoeuser.model');
const genPoeData = require('../models/genericpoedata.model');
const validate = require('./validations');
const genericUser = require('../models/genericUser.model');
const keys=require('../models/key.model')
const queryNew=require('./query')
const invokeNew=require('./invoke')
//const validate = require('./validations');
var monogotest= require("./mongotest")
// var privatekey=monogotest.getkey()

var crypto = require('crypto'),
algorithm = 'aes-256-ctr',
password = '';

const path = require('path');
var invoke = require('./invoke')
// const fs = require('fs')

function encryptKey(toEncrypt, relativeOrAbsolutePathToPublicKey) {
  const absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey)
  const publicKey = fs.readFileSync(absolutePath, 'utf8')
  const buffer = Buffer.from(toEncrypt, 'utf8')
  const encrypted = crypto.publicEncrypt(publicKey, buffer)
  return encrypted.toString('base64')
}

function decryptKey(toDecrypt, relativeOrAbsolutePathtoPrivateKey) {
  const absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey)
  const privateKey = fs.readFileSync(absolutePath, 'utf8')
  const buffer = Buffer.from(toDecrypt, 'base64')
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey.toString(),
      passphrase: '',
    },
    buffer,
  )
  return decrypted.toString('utf8')
}
// async function getpass(){
//     const privatekey=await monogotest.findOne()
//     console.log("private key is ",privatekey)
//     fs.writeFile('/tmp/private.pem', privatekey, function (err) {
//         if (err) throw err;
//         console.log('Saved!');
//       }); 
//     var content = await fs.readFileSync('key','utf8');
//     const decr = await decryptKey(content, '/tmp/private.pem')
//     // const decr = await decryptKey(content, 'private.pem')
//     console.log('decrypted is ::', decr)
//     password=decr
//     console.log(password)
// }

//Here "aes-256-cbc" is the advance encryption standard we are using for encryption.
function writeFile(text){ // Write Key into the file in temp
    fs.writeFile('/tmp/private.pem', text, function (err) {
        if (err) throw err;
        console.log('Saved!');
        readKey()
      }); 
}
async function getpass(){ // Getting the pass from Mongodb
    const privatekey=await monogotest.findOne()
    console.log("private key is ",privatekey)
    let buff = Buffer.from(privatekey, 'base64');  
    // console.log(buff)
    let text = buff.toString('utf-8');
    await writeFile(text)    
}
async function readKey(){ // decrypting the cipher text  
    var content = await fs.readFileSync('key','utf8');
    const decr = await decryptKey(content, '/tmp/private.pem')
    // const decr = await decryptKey(content, 'private.pem')
    console.log('decrypted is ::', decr)
    password=decr
    console.log(password)
}
function encrypt(text){
    var tex=text
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}


function decrypt(text){
    // console.log(text)
   var decipher = crypto.createDecipher(algorithm,password)
   var dec = decipher.update(text,'hex','utf8')
   dec += decipher.final('utf8');
//    console.log("decrypt data is")
//    console.log(JSON.parse(dec))
   var reet=JSON.parse(dec)
//    console.log("reeet is ",reet)
   return reet;
}
function decryptTxt(text){
    // console.log(text)
   var decipher = crypto.createDecipher(algorithm,password)
   var dec = decipher.update(text,'hex','utf8')
   dec += decipher.final('utf8');

   return dec;
}
getpass()
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
    return response;
}
// Invoke transaction on chaincode on target peers
exports.invoke_BK = async (req, res) => {
    logger.debug('==================== INVOKE ON CHAINCODE ==================');
    console.log('inside genpoe invoke function');
    // logger.debug(req.body);
    var peers = "peer0.cdachorg.cdac.in";
    /* if(req.body.peers){
          peers = req.body.peers;
     }
     else
      peers = "";*/
    //    var peers = req.body.peers;
    //var chaincodeName = req.body.chaincodeName;
    //var channelName = req.params.channelName;
    var chaincodeName = "cdacpoe";
    //var channelName = "cdacpoechannel";
    var channelName = "generalpoechannel";
    //console.log('body is ', req.body);
    var fcn = "recordProofOfEx";
    var error_message = null;

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
    var re4 = new RegExp('^([a-zA-Z0-9 _-\\s]+)$');
    var fileName = req.body.fileName;
    console.log('fileName is ', fileName);
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



    // doing for removing duplications like filename(1).pdf
    var file = fileName;
    var fileext = file.split('.');

    var name = fileext[0].split('(');
    fileName = name[0] + "." + fileext[1];

    var fileType = req.body.fileType;
    console.log('fileType is ', fileType);

    if (re1.test(fileType)) {
        console.log("fileType Valid");
    } else {
        console.log("fileType Invalid");
        res.json(getErrorMessage("Invalid fileType request"));
        return;
    }

    if (fileType == "application/pdf" || fileType == "image/png" ||
        fileType == "image/jpeg" || fileType == "image/gif") {
        console.log('filtype supported');
    } else {
        console.log('filtype unsupported');
        res.json(getErrorMessage("Unsupported fileType request"));
        return;
    }

    console.log('file extension is ', fileext[1])
    // if(fileext[1] !== "jpg"||fileext[1] !== "png"||
    // fileext[1] !== "jpeg"||fileext[1] !== "pdf"||
    // fileext[1] !== "doc"||fileext[1] !== "docx" ||
    // fileext[1] !== "ppt" ||fileext[1] !== "pptx"
    // )
    if (fileext[1] == 'jpg' || fileext[1] == 'png' ||
        fileext[1] == 'jpeg' || fileext[1] == 'pdf' ||
        fileext[1] == 'doc' || fileext[1] == 'docx' ||
        fileext[1] == 'ppt' || fileext[1] == 'pptx') {
        var documentType = req.body.documentType;

        if (re4.test(documentType)) {
            console.log("DocType " + documentType + " Valid");
        } else {
            console.log("DocType " + documentType + " Invalid");
            res.json(getErrorMessage("Invalid DocType request"));
            return;
        }
        //  var typecheck = documentType.match(!/[^a-zA-Z0-9]/);
        // console.log(typecheck)
        //if(!/[^a-zA-Z0-9]/.documentType($(this).val())) {
        // $("#documentType").html("OK");
        //}
        var sha256Hash = req.body.sha256Hash;
        var sha1Hash = req.body.sha1Hash;
        var storage = req.body.allowStorage;
        //var issuedByOrg = req.body.issuedByOrg;
        //var issuedByUser = req.body.issuedByUser;
        var issuedByOrg = req.orgname;
        var issuedByUser = req.username;
        var issuedTo = req.body.issuedTo;

        if (re3.test(issuedTo)) {
            console.log("Valid issuedTo");
        } else {
            console.log("Invalid issuedTo");
            res.json(getErrorMessage("Invalid issuedTo request"));
            return;
        }

        if (!validator.isHash(sha256Hash, 'sha256')) {
            console.log("InValid sha256");
            res.json(getErrorMessage("Invalid sha256 request"));
            return;
        }
        if (!validator.isHash(sha1Hash, 'sha1')) {
            console.log("InValid sha1");
            res.json(getErrorMessage("Invalid sha1 request"));
            return;
        }
        /* if(!validFilename(fileName)){
             res.json(getErrorMessage("Invalid request"));
             return;
         }*/
        var backLink = "";
        var args = [
            sha256Hash,
            sha1Hash,
            fileName,
            fileType,
            documentType,
            issuedTo,
            backLink
        ]

        //var regtime = new Date();
        var regtime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
        // logger.debug("regtime", regtime);
        let poe = new proofofex({
            fileName: fileName,
            fileType: fileType,
            documentType: documentType,
            sha256Hash: sha256Hash,
            sha1Hash: sha1Hash,
            issuedByOrg: issuedByOrg,
            issuedByUser: issuedByUser,
            issuedTo: issuedTo,
            allowStorage: storage,
            txstatus: "Pending",
            txId: "",
            posHash: "",
            posStatus: "false",
            timestamp: regtime

        });


        // Save a new asset/property
        //var newPoe = await poe.save();
        poe.save(await function (err, newPoe) {
            if (err) {
                error_message = err.message;
                // console.log(error_message);
                //res.json("Error creating new asset: " + err.message);
                // return;
            } else {
                logger.debug("Asset saved in db successfully");
                console.log("Asset saved in db successfully");
                /* res.send({
                    status: "Success",
                    message: "Asset created successfully",
                    result: "Asset created successfully"
                }); */
                res.statusCode = 200;
                res.message = "Asset created successfully";
            }
        })
        if (!error_message) {
    
            //todo
          // let message = await test(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
            
            // console.log(message);
            if (message.status === "Success") {
                //var timestamp = new Date();
                // var ts = new Date();
                //     // var timestamp = ts.getFullYear()+'-'+ts.getMonth()+1+'-'+ts.getDate()+','+ts.getHours()+':'+
                //     // ts.getMinutes()+":"+ts.getSeconds();
                // var timestamp = ts.getFullYear() + '-' + ts.getMonth()+1 + '-' + ts.getDate() + ',' + ts.getHours() + ':' +
                //     ts.getMinutes() + ":" + ts.getSeconds();
                var timestamp = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

                /*  var content = "Hello";
                   var decode_buf = new Buffer(content,'base64');
                   fs.open('/home/cdac/poedocs/'+fileName,'w',function(err,fd){
                       fs.writeSync(fd,decode_buf);
                   });*/
                //var localfile = '/home/cdac/poedocs'+fileName;
                //fs.writeFileSync(localfile,decode_buf);
                //fs.writeSync(fd,decode_buf);
                if (storage === "true") {
                    console.log('storage selected');
                    var content = req.body.base64;
                    //var decode_buf = new Buffer(content,'base64');
                    //var localfile = process.cwd() + '/poedocuments/' +fileName+"_" + documentType + "." + fileType;
                    var localfile = process.cwd() + '/poedocuments/' + fileName;
                    console.log(localfile);
                    fs.writeFileSync(localfile, content);

                    //storing it in PoS using ipfs
                    //                var posHash= "test";
                    ipfsClient.storeFile(localfile, await function (posHash) {

                        //ipfsClient.storeFile(localfile, await function (posHash) {
                        proofofex.update({
                            "sha256Hash": sha256Hash
                        }, {
                            $set: {
                                "txstatus": "Success",
                                "txId": message.txId,
                                "timestamp": timestamp,
                                "posHash": posHash,
                                "posStatus": true
                            }
                        }, {
                            "multi": true
                        },
                            function (err, rowsUpdated) {
                                proofofex.findOne({
                                    "sha256Hash": sha256Hash
                                }, function (err, poe1) {
                                    // logger.debug(poe1);
                                    rtelib.raiseEvent('blockchain', 'poe', {
                                        ts: cts(),
                                        msg: sha256Hash + ' uploaded in PoE'
                                    });

                                    let dbstatus = {
                                        "status": "Success",
                                        "result": poe1,
                                        "_id": poe1._id,
                                        "__v": poe1.__v,
                                        "txstatus": poe1.txstatus
                                    }
                                    //  logger.debug(dbstatus);
                                    if (poe1.posStatus == "Success") {
                                        dbstatus.message = "Please download the PoE Receipt and pos file from the URLs",
                                            dbstatus.poereceiptURL = "http://localhost:5000/poe/bct/transactions?txId=" + poe1.txId
                                        dbstatus.posURL = "http://localhost:5000/poepos/file?hash=" + poe1.posHash;
                                    }
                                    else {
                                        dbstatus.message = "Please download the PoE Receipt from the URL",
                                            dbstatus.poereceiptURL = "http://localhost:5000/poe/bct/transactions?txId=" + poe1.txId
                                    }
                                    res.send(dbstatus);
                                    /* res.json({
                                        status: "Success",
                                        message: "",
                                        result: poe1
                                    }); */
                                    /* res.json({
                                        status: "Success",
                                        message: "Please download the PoE Receipt from the URL",
                                        result: "http://localhost:5000/poe/bct/transactions?txId="+poe1.txId
                                    }); */
                                });
                            });
                    });


                }
                else {
                    console.log("not storing");
                    proofofex.update({
                        "sha256Hash": sha256Hash
                    }, {
                        $set: {
                            "txstatus": "Success",
                            "txId": message.txId,
                            "timestamp": timestamp
                        }
                    }, {
                        "multi": true
                    },
                        function (err, rowsUpdated) {
                            proofofex.findOne({
                                "sha256Hash": sha256Hash
                            }, function (err, poe1) {
                                // logger.debug(poe1);
                                rtelib.raiseEvent('blockchain', 'poe', {
                                    ts: cts(),
                                    msg: sha256Hash + ' uploaded in PoE'
                                });

                                res.json({
                                    status: "Success",
                                    message: "",
                                    result: poe1
                                });
                            });
                        });
                }



            } else{ 
                rtelib.raiseEvent('blockchain', 'poe', {
                    ts: cts(),
                    msg: message.message
                });
                res.send({
                    status: "Failed",
                    message: message.message,
                    result: ""
                });
            }
        }
        else{
            rtelib.raiseEvent('blockchain', 'poe', {
                ts: cts(),
                msg: fileName + ' already exist'
            });
            res.send({
                status: "Failed",
                message: fileName + " already exist",
                result: ""
            });

        }
    }
    else {
        console.log('incorrect file')
        res.json(getErrorMessage('\'Incorrect file\''));
        return;
    }

};
//for generating a unique token with the timestamp and user id and saving in mongo db
async function tokenGen(time,userid)
{
    var cipher="Cd@c@123$#";
    var key=cipher+time+userid;
    const hash=crypto.createHash('sha256').update(key).digest('hex');
    var key =new keys({id: userid, 
    cipherkey:hash })
    key.save(function(err, doc) {
        if (err) return console.error(err);
        console.log("Document inserted succussfully!");
      }) //saving the keypair in the database.
    return hash

};
//for seeing if the token is valid or not and authenticating the user.
async function tokenCompare(token){
    keys.find({cipherkey:token}, function (err, docs) {
        console.log(docs);
        if(err){
            return {"status":err}
        }
        else{
            return {"status":"success","message":"found in database","result":docs}
        }
      });
}
//for deleting th token from the database.
async function tokenRemove(token){
    keys.deleteOne({cipherkey:token}, function (err, docs) {
        console.log(docs);
        if(err){
            return  {"status":err}
        }
        else{
            return {"status":"success","message":"deleted from database","result":""}
        }
      });
}

exports.invoke_generic_old_working = async (req, res) => {
    console.log("invoke generic")
    logger.debug('==================== GENERIC INVOKE ON CHAINCODE ==================');
    var peers = "peer0.cdachorg.cdac.in";
    var chaincodeName = "cdacpoe";
    var channelName = "generalpoechannel";
    var fcn = "recordProofOfExGeneric";
    var error_message = null;
    var shouldReturnFromFunction = false;
    var storage = req.body.allowStorage;
    var content = req.body.base64;
    var data = req.body;
    //console.log(data)

    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }


    if (storage === "true") {
        var localfile = process.cwd() + '/poedocuments/temp';
        fs.writeFileSync(localfile, content);


        var posHash
        await ipfsClient.storeFile_by_VIKAS(localfile).then((posH) => {
            console.log(posH);
            posHash = posH;
            // data["posHash"] = posHash;
            data.posHash = posHash;
            console.log(chalk.bgCyan('inside ipfs file storage function status ', posHash));
        }).catch((err) => {
            console.log(err);
            //data["posHash"] = null;
            shouldReturnFromFunction = true
            res.send(getErrorMessage('\'Failed to store record in ipfs\''))

        })
        //END-OF Save in ipfs
    } else {
        // data["posHash"] = null;
        data.posHash = null;
    }
    if (shouldReturnFromFunction) return
    var sha256Hash = req.body.sha256Hash;
    var sha1Hash = req.body.sha1Hash;
    var uniqueID = req.body.uniqueID;
    var issuer = req.body.issuer;

    var args = [
        sha256Hash.toString(),
        sha1Hash.toString(),
        uniqueID.toString(),
        issuer.toString(),
        posHash
    ]

    console.log("args", args);

    //var args = JSON.stringify(args)

    //console.log("args", args);
    var dataObj = new genPoeData();
    dataObj.sha256Hash = data.sha256Hash;
    dataObj.sha1Hash = data.sha1Hash;
    dataObj.uniqueID = data.uniqueID;
    dataObj.issuer = data.issuer;
    dataObj.posHash = data.posHash;



    /**
     * invoke
     */
    //console.log(reqData)
    //await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, req.body, req.username, req.orgname).then((result) => {
    await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname).then((result) => {
        console.log("Invoke resolved", result);
        dataObj.txId = result.txId;
        //res.send(result)
    }).catch((err) => {
        console.log("Invoke rejected", err)
        shouldReturnFromFunction = true
        res.send(getErrorMessage('\'Failed to record in Blockchain\''))
        //res.send(err)
    })
    if (shouldReturnFromFunction) return

    await dataObj.save().then(
        newPoe => {
            logger.debug(chalk.bgGreen("Asset saved in db successfully"));
            console.log(chalk.bgGreen("db saved"));
        }
    ).catch(err => {
        console.log(chalk.bgRed('Error in storing record in DB ' + err));
        res.send(getErrorMessage('\'Failed to store record in db\''))
        shouldReturnFromFunction = true
    })
    if (shouldReturnFromFunction) return

    //send Response as status, txID and Timestamp

}

exports.invoke_generic = async (req, res) => {
    console.log("invoke generic")
    logger.debug('==================== GENERIC INVOKE ON CHAINCODE ==================');
    var peers = "peer0.cdachorg.cdac.in";
    var chaincodeName = "cdacpoe";
    var channelName = "generalpoechannel";

    //var fcn = "recordProofOfExGeneric";
    var fcn = "recordProofOfExGeneric_old_working_git";
    var error_message = null;
    var fileType = ""
    console.log("req.username, req.orgname ", req.username, req.orgname)
    var data = req.body;
    console.log(data.length)
    // var data = JSON.parse(req.body);

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
        let shouldReturnFromFunction = false;

        if (i < data.length) {
            var storage = data[i].allowStorage;
            //var content = data[i].base64;
            var content;
            let fileName = data[i].fileName;
            let sendMail = data[i].sendMail;
            let b64

            if (storage === "true") {
                console.log(chalk.bgCyan('allowStorage is true ', storage))
                content = data[i].base64;
                if (!content || content === undefined || content === null || content === "") {
                    console.log(chalk.bgRed('base64 Content not present'));
                    logger.debug(chalk.bgRed('base64 Content not present'));
                    shouldReturnFromFunction = true
                    res.send(getErrorMessage('Invalid base64 field'));
                }
                if (shouldReturnFromFunction) return;

                mime = content.split(':')[1].split(';')[0];
                b64 = content.split(',')[1]
                // b64 = content

                isValidBase64 = false
                await validate.validateBase64(b64).then(vres => {
                    //console.log(chalk.bgCyan('base64 CONTENT::::: ', content));
                    if (vres.status == "Success") {
                        isValidBase64 = true
                        //console.log(chalk.bgGreen('base64 valid'));
                    } else if (vres.status == "Failed") {
                        //console.log(chalk.bgCyan('base64::::: ', b64));
                        console.log(chalk.bgRed('base64 Invalid ', vres.message));
                        logger.debug(chalk.bgRed('base64 Invalid ', vres.message));
                        shouldReturnFromFunction = true
                        res.send(vres)
                    }
                })

                if (isValidBase64) {
                    await validate.validateMimeType(b64).then(vres => {
                        if (vres.status == "Failed") {
                            console.log(chalk.bgRed('Unsupported file ', vres.message));
                            logger.debug(chalk.bgRed('Unsupported file ', vres.message));
                            shouldReturnFromFunction = true
                            res.send(vres)

                        } else if (vres.status == "Success") {
                            //cert.fileType = vres.result;
                            fileType = vres.result;
                            //fileName = file + '.' + vres.result;
                            //dataObj.file = fileName;
                            console.log("validateMimeType FILE TYPE", vres)
                            logger.debug("validateMimeType FILE TYPE", vres);
                        }
                    })
                }
                var localfile = process.cwd() + '/poedocuments/temp';
                fs.writeFileSync(localfile, content);


                var posHash
                console.log("storing", i)
                await ipfsClient.storeFile_by_VIKAS(localfile).then((posH) => {
                    console.log(posH);
                    posHash = posH;
                    // data["posHash"] = posHash;
                    data[i].posHash = posHash;
                    console.log(chalk.bgCyan('inside ipfs file storage function status ', posHash));
                }).catch((err) => {
                    console.log(err);
                    //data["posHash"] = null;
                    shouldReturnFromFunction = true
                    res.send(getErrorMessage('\'Failed to store record in ipfs\''))

                })
                console.log("storing finished", i)
                //END-OF Save in ipfs
            } else {
                // data["posHash"] = null;
                data[i].posHash = null;
                console.log(chalk.bgCyan('allowStorage is false ', storage))
            }
            if (shouldReturnFromFunction) continue
            // var sha256Hash = req.body.sha256Hash;
            // var sha1Hash = req.body.sha1Hash;
            // var uniqueID = req.body.uniqueID;
            // var issuerOrg = req.body.issuerOrg;
            // var issuerOrgUserName = req.body.issuerOrgUserName;
            // var issuerOrgUserEmail = req.body.issuerOrgUserEmail;

            //data1 = JSON.parse(data);
            
            //Organization issuer details
            data[i].issuerOrgName = req.userOrgName;
            data[i].issuerOrgEmail = req.userOrgAdminemail;
            data[i].issuerOrgUserName = req.userOrgUserName;
            data[i].issuerOrgUserEmail = req.userOrgemail;

            data1 = data[i];
            // data1.issuerOrgName = req.userOrgName;
            // data1.issuerOrgEmail = req.userOrgAdminemail;
            // data1.issuerOrgUserName = req.userOrgUserName;
            // data1.issuerOrgUserEmail = req.userOrgemail;
            //data1.posHash = posHash;
            //data1.allowStorage = true;
            data1.base64 = "";

            console.log("after edit ", data1);

            var data2 = JSON.stringify(data1);

            console.log("data2 is ", data2);
            console.log("data2 length is ", data2.length);

            var args = [
                data2.toString()
            ]
            console.log(args)

            /* var args = [
                sha256Hash.toString(),
                sha1Hash.toString(),
                uniqueID.toString(),
                issuer.toString(),
                posHash
            ] */

            // console.log("args", args);

            //var args = JSON.stringify(args)

            //console.log("args", args);
            var dataObj = new genPoeData();

            //Recording Document details
            dataObj.sha256Hash = data[i].sha256Hash;
            dataObj.sha1Hash = data[i].sha1Hash;
            dataObj.uniqueID = data[i].uniqueID;
            dataObj.posHash = data[i].posHash;
            dataObj.documentType = data[i].documentType;
            
            //Organization issuer details
            dataObj.issuerOrgName = req.userOrgName;
            dataObj.issuerOrgEmail = req.userOrgAdminemail;
            dataObj.issuerOrgUserName = req.userOrgUserName;
            dataObj.issuerOrgUserEmail = req.userOrgemail;


            // //Organization issuer details
            // dataObj.issuerOrgName = data[i].issuerOrgName;
            // dataObj.issuerOrgEmail = data[i].issuerOrgEmail;
            // dataObj.issuerOrgUserName = data[i].issuerOrgUserName;
            // dataObj.issuerOrgUserEmail = data[i].issuerOrgUserEmail;


            //Receipient Details
            dataObj.recipientName = data[i].recipientName;
            dataObj.recipientEmail = data[i].recipientEmail;
            dataObj.recipientMobile = data[i].recipientMobile;




            /**
             * invoke
             */
            //console.log(reqData)
            //await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, req.body, req.username, req.orgname).then((result) => {
            var invokeChaincodeResponse
            await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname).then((result) => {
                console.log("Invoke resolved", result);
                dataObj.txId = result.txId;
                // res.send(result)
                invokeChaincodeResponse = result
            }).catch((err) => {
                console.log("Invoke rejected", err)
                invokeChaincodeResponse = err
                shouldReturnFromFunction = true
                // res.send(getErrorMessage('\'Failed to record in Blockchain\''))
                //res.send(err)
            })
            console.log(invokeChaincodeResponse)
            if (invokeChaincodeResponse.status == "Failed") {
                // rtelib.raiseEvent('blockchain', 'poe', {
                //     ts: cts(),
                //     msg: fileName + ' already exist'
                // });
                resultList.push({
                    // "fileName": fileName,
                    // "sha256Hash": sha256Hash,
                    "status": "Failed",
                    "message": fileName + " Failed record - already exist"
                });
                shouldReturnFromFunction = true
            }
            if (shouldReturnFromFunction) continue

            if (sendMail === true) {
                console.log(chalk.bgGreen("sendMail is enabled") );
                await sendmailToMember(dataObj, fileType, b64).then((emailStatusRes) => {
                    emailstatusNew = emailStatusRes
                    dataObj.emailStatus = true;
                }).catch((emailStatusRes) => {
                    emailstatusNew = emailStatusRes
                    dataObj.emailStatus = false;
                })
                console.log('inside invoke:: mail status = ', emailstatusNew)
            } else {
                console.log(chalk.bgRed("sendMail is DISABLED"));
            }

            await dataObj.save().then(
                newPoe => {
                    logger.debug(chalk.bgGreen("Asset saved in db successfully"));
                    console.log(chalk.bgGreen("db saved"));
                }
            ).catch(err => {
                console.log(chalk.bgRed('Error in storing record in DB ' + err));
                resultList.push({
                    // "fileName": fileName,
                    // "sha256Hash": sha256Hash,
                    "status": "Failed",
                    "message": fileName + "  Error in storing record in DB"
                });
                // res.send(getErrorMessage('\'Failed to store record in db\''))
                shouldReturnFromFunction = true
            })
            if (shouldReturnFromFunction) continue

            resultList.push(invokeChaincodeResponse)
            // resultList.push({
            //     "fileName": fileName,
            //     "sha256Hash": sha256Hash,
            //     "status": "Success",
            //     message: invokeChaincodeResponse
            // });
            //send Response as status, txID and Timestamp
        } else if (resultList.length == data.length) {
            console.log(chalk.bgGreen("Recording transactions completed sending response"))
            console.log(resultList)
            res.send(resultList);

        }
    }
}

var genReceipt = require("./generate-pdf");
var emailConfig = require("../config/email");
const { main } = require('../test');
const { invokeChaincode } = require('../hyperledger/invoke-transaction.js');
const { copySync } = require('fs-extra');
async function sendmailToMember(mailData, extension, content) {
    console.log("***********************************sendingmail*******************************************")
    receipt = "";
    await genReceipt.generateOrgReceipt(mailData).then((vres) => {
        // console.log('recipt response0 ' + vres);
        if (vres) receipt = vres;
    });



    var i = 1
    // var fName = rollNo + '_' + documentType + "." + extension;
    // console.log(chalk.bgCyan(fName));
    return new Promise((resolve, reject) => {
        var fName = mailData.recipientName + '_' + mailData.documentType + "." + extension;
        var fReceipt = mailData.recipientName + '_' + mailData.documentType + "_Receipt.pdf";
        console.log(chalk.bgCyan(fReceipt));
        let mailOptions = {
            from: '"cdacchain" <cdacchain@cdac.in>', // sender address
            to: mailData.recipientEmail, // list of receivers
            bcc: '"cdacchain" <cdacchain@cdac.in>',
            subject: mailData.documentType + ' of ' + mailData.recipientName, // Subject line
            html: `Dear ${mailData.recipientName},
    
          <p>Greetings from ${mailData.issuerOrgName} !!!</p>
          
          <p>Your ${mailData.documentType} issued by ${mailData.issuerOrgName} is recorded in C-DAC’s Blockchain based Proof of Existence(PoE) and attached a copy of the same along with Blockchain Receipt for your future reference. <br />  
          
          <p>Regards,<br />
          
          
          ${mailData.issuerOrgName}</p>
          <h3 style="color:blue;">Blockchain based Proof of Existence is developed by C-DAC Hyderabad, supported by MeitY, Govt. of India.</h1>`,
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

//to edit
exports.invoke = async (req, res) => {
    //==================== RESTRUCTURED ON 19th AUGEST : Vikas =================='
    logger.debug('==================== INVOKE ON CHAINCODE ==================');
    console.log("Invoke start")
    var shouldReturnFromFunction = false
    var data = req.body;
    var peers = req.body.peers;
    var chaincodeName = "poe";
    var channelName = "generalpoechannel";
    var fcn = "recordProofOfEx";
  
	var orgname = req.orgname;
    var error_message = null;
    console.log('channelName  : ' + channelName);
	console.log('chaincodeName : ' + chaincodeName);
	console.log('fcn  : ' + fcn);

    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }

//	let message = await test(peers, channelName, chaincodeName, fcn, orgname);


    var storage = req.body.allowStorage;
    let cert = new proofofex();
    var backLink = "";
    cert.issuedByOrg = req.orgname;
    cert.issuedByUser = req.username;
    cert.issuedTo = encrypt(req.body.issuedTo);
    cert.allowStorage = storage;

    var file = req.body.fileName;

    /******************** VALIDATIONS START *******************/
    //file = file.substring(0, file.lastIndexOf('.'));
    console.log(chalk.bgCyan(file));


    await validate.validatefileName(file).then(vres => {
        if (vres.status == "Success") {
            // console.log(chalk.bgGreen('fileName valid'));
        } else if (vres.status == "Failed") {
            console.log(chalk.bgRed('fileName Invalid ', vres.message));
            logger.debug(chalk.bgRed('fileName Invalid ', vres.message));
            shouldReturnFromFunction = true
            res.send(vres)
        }
    })
    if (shouldReturnFromFunction) return

    var documentType = req.body.documentType;
    console.log(chalk.bgCyan('doctype is ',documentType));

    await validate.validatefileName(documentType).then(vres => {
        if (vres.status == "Success") {
            // console.log(chalk.bgGreen('Document Type valid'));
            cert.documentType = documentType;
        } else if (vres.status == "Failed") {
            console.log(chalk.bgRed('Document Type Invalid ', vres.message));
            logger.debug(chalk.bgRed('Document Type Invalid ', vres.message));
            shouldReturnFromFunction = true
            res.send(vres)
        }
    })
    if (shouldReturnFromFunction) return

    var sha256Hash = req.body.sha256Hash;
    sha256Hash = sha256Hash.trim().toLowerCase();
    await validate.validateSha256Hash(sha256Hash).then(vres => {
        if (vres.status == "Success") {
            cert.sha256Hash = sha256Hash;
            //console.log(chalk.bgGreen('sha256Hash valid'));
        } else if (vres.status == "Failed") {
            console.log(chalk.bgRed('sha256Hash Invalid ', vres.message));
            logger.debug(chalk.bgRed('sha256Hash Invalid ', vres.message));
            shouldReturnFromFunction = true
            res.send(vres)
        }
    })
    if (shouldReturnFromFunction) return

    var sha1Hash = req.body.sha1Hash;
    sha1Hash = sha1Hash.trim().toLowerCase();
    await validate.validateSha1Hash(sha1Hash).then(vres => {
        if (vres.status == "Success") {
            //console.log(chalk.bgGreen('sha1Hash valid'));
            cert.sha1Hash = sha1Hash;
        } else if (vres.status == "Failed") {
            console.log(chalk.bgRed('sha1Hash Invalid ', vres.message));
            logger.debug(chalk.bgRed('sha1Hash Invalid ', vres.message));
            shouldReturnFromFunction = true
            res.send(vres)
        }
    })
    if (shouldReturnFromFunction) return


    var fileType;
    var fileName;




    //REVIEW
    var issuedTo = req.body.issuedTo;
    await validate.validateEmail(issuedTo).then(vres => {
        if (vres.status == "Success") {
            // console.log(chalk.bgGreen('Document Type valid'));
            cert.documentType = documentType;
        } else if (vres.status == "Failed") {
            console.log(chalk.bgRed('issuedTo Invalid ', vres.message));
            logger.debug(chalk.bgRed('issuedTo Invalid ', vres.message));
            shouldReturnFromFunction = true
            res.send(vres)
        }
    })
    if (shouldReturnFromFunction) return
    issuedTo=encrypt(issuedTo)

    var content
    var mime
    var b64
    if (storage === "true") {

        content = req.body.base64;
        if (!content || content === undefined || content === null || content === "") {
            console.log(chalk.bgRed('base64 Content not present'));
            logger.debug(chalk.bgRed('base64 Content not present'));
            shouldReturnFromFunction = true
            res.send(getErrorMessage('Invalid base64 field'));
        }
        if (shouldReturnFromFunction) return;

        mime = content.split(':')[1].split(';')[0];
        b64 = content.split(',')[1]
        // b64 = content

        isValidBase64 = false
        await validate.validateBase64(b64).then(vres => {
            //console.log(chalk.bgCyan('base64 CONTENT::::: ', content));
            if (vres.status == "Success") {
                isValidBase64 = true
                //console.log(chalk.bgGreen('base64 valid'));
            } else if (vres.status == "Failed") {
                //console.log(chalk.bgCyan('base64::::: ', b64));
                console.log(chalk.bgRed('base64 Invalid ', vres.message));
                logger.debug(chalk.bgRed('base64 Invalid ', vres.message));
                shouldReturnFromFunction = true
                res.send(vres)
            }
        })

        if (isValidBase64) {
            await validate.validateMimeType(b64).then(vres => {
                if (vres.status == "Failed") {
                    console.log(chalk.bgRed('Unsupported file ', vres.message));
                    logger.debug(chalk.bgRed('Unsupported file ', vres.message));
                    shouldReturnFromFunction = true
                    res.send(vres)

                } else if (vres.status == "Success") {
                    cert.fileType = vres.result;
                    fileType = vres.result;
                    fileName = file + '.' + vres.result;
                    cert.fileName = fileName;
                    console.log("validateMimeType FILE TYPE", vres)
                    logger.debug("validateMimeType FILE TYPE", vres);
                }
            })
        }
    } else {
        fileName = req.body.fileName;
        fileType = req.body.fileType;
        cert.fileName = fileName
        cert.fileType = fileType
    }
    if (shouldReturnFromFunction) return


    var args = [
        sha256Hash,
        sha1Hash,
        fileName,
        fileType,
        documentType,
        issuedTo,
        backLink
    ]
    console.log("after filling args = ")
    console.log(args);
    logger.info(args);
    var regtime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    cert.txstatus = "Pending";
    cert.txId = "";
    cert.timestamp = regtime;



    /**
    * Save file in blockchain
    * 
    */
    console.log('before invoke');
	var invokeChaincodeResponse
    await invokeNew.invoke('admin',channelName,chaincodeName,fcn,args)
        .then((message1) => {
            console.log(message1)
            invokeChaincodeResponse = message1
            console.log(chalk.bgCyan('Response from invokechaincode is', message1.status));
            logger.debug(chalk.bgCyan('Response from invokechaincode is', message1.status));

        })

    if (invokeChaincodeResponse.status == "Failed") {
        rtelib.raiseEvent('blockchain', 'poe', {
            ts: cts(),
            msg: fileName + ' already exist'
        });
        res.send({
            "fileName": fileName,
            "sha256Hash": sha256Hash,
            "status": "Failed",
            "message": fileName + " Failed record - already exist"
        });
        shouldReturnFromFunction = true
    }
    if (shouldReturnFromFunction) return


    /**
    * Save record
    */
    await cert.save().then(
        newPoe => {
            logger.debug(chalk.bgGreen("Asset saved in db successfully"));
            console.log(chalk.bgGreen("db saved"));
        }
    ).catch(err => {
        console.log(chalk.bgRed('Error in storing record in DB ' + err));
        shouldReturnFromFunction = true;
        res.send(getErrorMessage('\'Failed to store record in db\''))
    })
    if (shouldReturnFromFunction) return
    //END-OF Save record



    query
    /**
    * Save in ipfs
    * REVIEW FILENAME
    */


    if (storage === "true") {
        var localfile = process.cwd() + '/poedocuments/' + issuedTo + "-" + documentType + "-" + fileName + "-" + regtime + "." + fileType;
        fs.writeFileSync(localfile, content);


        var posHash
        await ipfsClient.storeFile_by_VIKAS(localfile).then((posH) => {
            // console.log(posH)
            posHash = posH
            console.log(chalk.bgCyan('inside ipfs file storage function status ', posHash));
        }).catch((err) => {
            console.log(err)
            res.send(getErrorMessage('\'Failed to store record in ipfs\''))
            shouldReturnFromFunction = true
        })
        //END-OF Save in ipfs
    }
    if (shouldReturnFromFunction) return




    /**
     * REVIEW
    * Update status
    */
    await proofofex.update({ "sha256Hash": sha256Hash },
        {
            $set: storage ? {
                "txstatus": "Success",
                "txId": invokeChaincodeResponse.txId,
                "timestamp": regtime,
                "posHash": posHash,
                "posStatus": true,
            } : {
                    "txstatus": "Success",
                    "txId": invokeChaincodeResponse.txId,
                    "timestamp": regtime,
                }
        }, { "multi": true }
    ).then((res) => {
        console.log("Transaction update in db successful:", res)
    }).catch((err) => {
        console.log("Transaction update in db failed:", res)
    })



    await proofofex.findOne({
        "sha256Hash": sha256Hash
    },
        {
            issuedTo: 1,
            allowStorage: 1,
            documentType: 1,
            sha256Hash: 1,
            sha1Hash: 1,
            fileType: 1,
            fileName: 1,
            txstatus: 1,
            txId: 1,
            timestamp: 1,
            posHash: 1,


        }).then((result) => {
            rtelib.raiseEvent('blockchain', 'poe', {
                ts: cts(),
                msg: sha256Hash + ' uploaded in PoE'
            });

            if (storage) {
                let dbstatus = {
                    "status": "Success",
                    "result": result,
                    "_id": result._id,
                    "__v": result.__v,
                    "txstatus": result.txstatus
                }
                /* if (result.posStatus == "Success") {
                    dbstatus.message = "Please download the PoE Receipt and pos file from the URLs",
                        dbstatus.poereceiptURL = "http://localhost:5000/poe/bct/transactions?txId=" + result.txId
                    dbstatus.posURL = "http://localhost:5000/poepos/file?hash=" + result.posHash;
                }
                else {
                    dbstatus.message = "Please download the PoE Receipt from the URL",
                        dbstatus.poereceiptURL = "http://localhost:5000/poe/bct/transactions?txId=" + result.txId
                } */
                res.send(dbstatus);
            } else {
                res.json({
                    status: "Success",
                    message: "",
                    result: result
                });
            }
        }).catch((err) => {

        })
    //localfile should be deleted
    if (localfile) {
        try {
            fs.unlinkSync(localfile)
            console.log(chalk.bgGreen(localfile + ' is deleted'))
            //file removed
        } catch (err) {
            console.error('Unable to remove temp file ' + localfile + 'error: ' + err);
        }
    }


}

// Query a transaction by hash of the file
exports.querybyhash = async (req, res) => {

    logger.debug('==================== INVOKE ON CHAINCODE BY HASH==================');


    // var peers = "";
    var peers = "peer0.cdachorg.cdac.in";
    //  if(req.body.peers){
    //       peers = req.body.peers;
    //  }
    //  else
    //   peers = "";
    //    var peers = req.body.peers;
    var chaincodeName = "genpoe";
    var channelName = "generalpoechannel";
    let user="ravikishore"

    //  var channelName = "cdacpoechannel";
    var fcn = "queryProofOfEx";
    var shouldReturnFromFunction = false;

    var sha256Hash = req.body.sha256Hash;
    console.log(sha256Hash)
    sha256Hash = sha256Hash.trim().toLowerCase();
    await validate.validateSha256Hash(sha256Hash).then(vres => {
        if (vres.status == "Success") {

            console.log(chalk.bgGreen('sha256Hash valid'));
        } else if (vres.status == "Failed") {
            console.log(chalk.bgRed('sha256Hash Invalid ', vres.message));
            res.send(vres)
            shouldReturnFromFunction = true
        }
    })
    if (shouldReturnFromFunction) return

    /* var re2 = new RegExp('^([a-zA-Z0-9]+)$');
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

    // logger.debug(req.body);
    // logger.debug('channelName  : ' + channelName);
    // logger.debug('chaincodeName : ' + chaincodeName);
    // logger.debug('fcn  : ' + fcn);

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
    //hhhh
    // let message = await query.queryChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
    let message= await queryNew.queryHash(user,channelName,chaincodeName,fcn,args)

    //logger.debug("MEssage---------" + JSON.stringify(message));
    console.log(message)


    if (message.status === "Success") {
        console.log(chalk.bgCyan(message.status));
        if (message.message.length != 0) {
            var result = message.result
            console.log(chalk.bgCyan(result));
            // logger.debug(result);
            // logger.debug('found ', result.found);
            let mresult = result;
            delete mresult.assetVersion;
            delete mresult.ca;
            delete mresult.issuedByOrg;
            delete mresult.issuedByUser;
            // mresult.issuedTo=decryptTxt(mresult.issuedTo)
            if (result.found === true) {
                //  logger.debug("found true");
                proofofex.findOne({
                    "sha256Hash": sha256Hash
                }, function (err, poe1) {
                    // logger.debug(poe1);
                    //console.log(chalk.bgCyan(poe1));

                    rtelib.raiseEvent('blockchain', 'poeSearch', {
                        ts: cts(),
                        msg: 'Query based on file hash ' + sha256Hash + ' is performed'
                    });


                    /* let respData = {
                        "issuedTo":  result.issuedTo,
                        "documentType":result.documentType,
                        "sha1Hash": result.sha1Hash,
                        "sha256Hash": result.sha256Hash,
                        "fileName": result.fileName,
                        "fileType":[String] [Type of file - “application/pdf, image/jpeg, image/png, image/bmp” formats],
                        "txId":[String] [AlphaNumerics],
                        "timestamp":  {
                            "seconds": [String],
                            "nanos": [String]
                            },
                        "backLink": [String],
                        "found": [String] “
                    } */
                    let dbstatus = {
                        "status": "Success",
                        "message": "",
                        "result": mresult,
                        // "_id": poe1._id,
                        // "__v": poe1.__v,
                        //"txstatus": poe1.txstatus
                    }
                    //   logger.debug(dbstatus);
                    if (poe1.posStatus == "Success") {
                        dbstatus.posURL = env.verificationURL + "/poepos/file?hash=" + poe1.posHash;
                    }
                    res.send(dbstatus);
                });
            } else {//result.found === false
                console.log(chalk.bgCyan('result.found === ', result.found));

                res.send({
                    "status": "Failed",
                    "message": message.message,
                    "result": mresult
                });
            }
        } //closing if(message!=0)
        /* else { // if message is empty -- hash not present in ledger

            res.send({
                status: "Success",
                message: "No data found",
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
        } */
    } else if (message.status === "Failure") { // in case of error

        res.send(getErrorMessage(JSON.stringify(message)));
    }


};

exports.querybyhash_generic = async (req, res) => {

    logger.debug('==================== Query Generic ON CHAINCODE BY HASH==================');


    // var peers = "";
    var peers = "peer0.cdachorg.cdac.in";
    //  if(req.body.peers){
    //       peers = req.body.peers;
    //  }
    //  else
    //   peers = "";
    //    var peers = req.body.peers;
    var chaincodeName = "genpoe";
    var channelName = "generalpoechannel";
    //  var channelName = "cdacpoechannel";
    var fcn = "queryProofOfExGeneric_Old";

    var shouldReturnFromFunction = false;


    var sha256Hash = req.body.sha256Hash;
    await validate.validateSha256Hash(sha256Hash).then(vres => {
        if (vres.status == "Success") {
            //cert.sha256Hash = sha256Hash;
            //console.log(chalk.bgGreen('sha256Hash valid'));
        } else if (vres.status == "Failed") {
            console.log(chalk.bgRed('sha256Hash Invalid ', vres.message));
            res.send(vres)
            shouldReturnFromFunction = true
        }
    })
    if (shouldReturnFromFunction) return;


    /* var re2 = new RegExp('^([a-zA-Z0-9]+)$');
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

    // logger.debug(req.body);
    // logger.debug('channelName  : ' + channelName);
    // logger.debug('chaincodeName : ' + chaincodeName);
    // logger.debug('fcn  : ' + fcn);

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

    //logger.debug("MEssage---------" + JSON.stringify(message));


    if (message.status === "Success") {
        console.log(chalk.bgCyan(message.status));
        if (message.message.length != 0) {
            var result = JSON.parse(message.message.toString());
            console.log(chalk.bgCyan(result));
            // logger.debug(result);
            // logger.debug('found ', result.found);
            if (result.found === true) {
                //  logger.debug("found true");
                let bcRecord = {
                    "status": "Success",
                    "message": "",
                    "result": result
                }
                res.send(bcRecord);
                /* proofofex.findOne({
                    "sha256Hash": sha256Hash
                }, function (err, poe1) {
                    // logger.debug(poe1);
                    console.log(chalk.bgCyan(poe1));

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
                    //   logger.debug(dbstatus);
                    if (poe1.posStatus == "Success") {
                        dbstatus.posURL = env.verificationURL + "/poepos/file?hash=" + poe1.posHash;
                    }
                    res.send(dbstatus);
                }); */
            } else {//result.found === false
                console.log(chalk.bgCyan('result.found === ', result.found));

                res.send({
                    "status": "Failed",
                    "message": message.message,
                    "result": result
                });
            }
        } //closing if(message!=0)
        /* else { // if message is empty -- hash not present in ledger

            res.send({
                status: "Success",
                message: "No data found",
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
        } */
    } else if (message.status === "Failed") { // in case of error
        res.json({
            status: "Failed",
            message: message.message,
            result: ''
        });
        //res.send(getErrorMessage(JSON.stringify(message)));
    }


};

exports.querybytxId = async (req, res) => {

    logger.debug('==================== INVOKE ON CHAINCODE BY HASH==================');
    console.log("inside queryBytxID finction for genpoe");
    var peers = "peer0.cdachorg.cdac.in";
    // var peers = "";
    // if(req.body.peers){
    //      peers = req.body.peers;
    // }
    // else
    //  peers = "";
    //    var peers = req.body.peers;
    //  var chaincodeName = req.body.chaincodeName;
    //var channelName = req.params.channelName;
    var chaincodeName = "poe";
    var channelName = "generalpoechannel";
    let user="ravikishore6"

    // var channelName = "cdacpoechannel";
    var fcn = "queryProofOfExByTxid";

    var txId = req.body.txId;
    txId = txId.trim().toLowerCase();
    console.log(chalk.bgCyan('txID is ' + txId));
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
    // logger.debug('chaincodeName : ' + chaincodeName);
    // logger.debug('fcn  : ' + fcn);

    if (!chaincodeName) {
        res.json(getErrorMessage(" cc Invalid request"));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage("ch Invalid request"));
        return;
    }

    // logger.debug("txId Length :" + txId.length);

    if (txId.length != 64) {
        res.json(getErrorMessage("txInvalid request"));
        return;
    }
    var args = [
        txId
    ]
    //let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
    // let message = await query.queryChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
    let message= await queryNew.query(user,channelName,chaincodeName,fcn,args)
    console.log(message)
    

    if (message.status === "Success") {
        // var result = JSON.parse(message.message.toString());

        var result=message.result
        console.log('111',result)
        let mresult = result;
        delete mresult.assetVersion;
        delete mresult.ca;
        delete mresult.issuedByOrg;
        delete mresult.issuedByUser;
        // mresult.issuedTo=decryptTxt(mresult.issuedTo)
        if (result.found === true) {

            proofofex.findOne({
                "sha256Hash": result.sha256Hash
            }, function (err, poe1) {
                //  logger.debug(poe1);
                rtelib.raiseEvent('blockchain', 'poeSearch', {
                    ts: cts(),
                    msg: 'Query based on transaction Id ' + txId + ' is performed'
                });

                let dbstatus = {
                    "status": "Success",
                    "message": "",
                    "result": mresult,
                    "posHash": poe1.posHash
                    // "txstatus": poe1.txstatus,
                    // "posHash": poe1.posHash
                }

                res.send(dbstatus);
            });
        } else
            res.send({
                "status": "Failed",
                "message": "Not Found",
                "result": mresult
            });
    } else
        res.send(getErrorMessage(message));

};

exports.querybytxId_generic = async (req, res) => {

    logger.debug('==================== INVOKE GENERIC ON CHAINCODE BY HASH==================');
    console.log("inside queryBytxID Generic finction for genpoe");
    var peers = "peer0.cdachorg.cdac.in";
    // var peers = "";
    // if(req.body.peers){
    //      peers = req.body.peers;
    // }
    // else
    //  peers = "";
    //    var peers = req.body.peers;
    //  var chaincodeName = req.body.chaincodeName;
    //var channelName = req.params.channelName;
    var chaincodeName = "cdacpoe";
    var channelName = "generalpoechannel";
    // var channelName = "cdacpoechannel";
    //var fcn = "queryProofOfExByTxidGeneric";
    var fcn = "queryProofOfExByTxidGeneric_old";


    var txId = req.body.txId;
    console.log(chalk.bgCyan('txID is ' + txId));
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
    // logger.debug('chaincodeName : ' + chaincodeName);
    // logger.debug('fcn  : ' + fcn);

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
        console.log(result);
        //if (result[0].found === true) {
        if (result.found === true) {

            let bcRecord = {
                "status": "Success",
                "message": "",
                //"result": result[0]
                "result": result
            }

            res.send(bcRecord);

            /* proofofex.findOne({
                "sha256Hash": result[0].sha256Hash
            }, function (err, poe1) {
                //  logger.debug(poe1);
                rtelib.raiseEvent('blockchain', 'poeSearch', {
                    ts: cts(),
                    msg: 'Query based on transaction Id ' + txId + ' is performed'
                });
                let dbstatus = {
                    "status": "Success",
                    "message": "",
                    "result": result[0],
                    "txstatus": poe1.txstatus,
                    "posHash": poe1.posHash
                }

                res.send(dbstatus);
            }); */
        } else {
            res.send({
                "status": "Success",
                "message": "",
                "result": result[0]
            });
        }
    } else {
        res.send({
            "status": "Failed",
            "message": message.message,
            "result": ""
        });
        //res.send(getErrorMessage(message.message));
    }


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
    var peers = "peer0.cdachorg.cdac.in";
    var chaincodeName = "genpoe";
    var channelName = "generalpoechannel";
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
    // logger.debug('chaincodeName : ' + chaincodeName);
    // logger.debug('fcn  : ' + fcn);

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
        // res.json(getErrorMessage("Invalid request"));
        res.render('error', { data: 'Invalid Request' });
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
                //  logger.debug(poe1);
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
    } else {
        //     var page = fs.readFileSync('./error.html',"utf8");
        //     var html = mustache.to_html(page,message);
        //res.send(getErrorMessage(message));
        res.send('error', { data: message });
        //     res.send(html);
    }

};

exports.getquerybyposHash = async (req, res) => {

    logger.debug('==================== INVOKE ON CHAINCODE BY TXID==================');
    console.log(chalk.bgCyan('querybyposHash::::'));
    /*
    var peers = "";
    if(req.body.peers){
         peers = req.body.peers;
    }
    else
     peers = "";*/
    var content;
    var posHash = req.query.hash;
    console.log(chalk.bgCyan(posHash));
    //ipfsClient.fetchFile(posHash,content);
    ipfsClient.fetchFile(posHash, function (content) {
        //if(!err) {
        //console.log('ipfs chain code file ' + content.base64);
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

//Retrieving User Specific documents in General PoE
exports.fetchDocsbyUserName = (req, res) => {
    console.log('inside fetch Documents by UserName')
    var username = req.body.username;
    username=encrypt(username)
    console.log('username', username);
    genPoeUser.find({
        username: username
    }).then(genUser => {
        console.log('username found in records ', genUser)
        //console.log(student[0].rollNo);
        proofofex.find({
            "issuedTo": username
        }, {
            issuedTo: 1,
            documentType: 1,
            sha256Hash: 1,
            txId: 1,
            timestamp: 1,
            fileName: 1,
            fileType: 1,
            txstatus: 1,
            posHash: 1,
            _id: 0
        }).then(eachPoe => {
            // console.log(eachPoe[0])
            for(var ii=0;ii<eachPoe.length;ii++){
                console.log(eachPoe[ii].issuedTo)
                var x=eachPoe[ii].issuedTo
                console.log(x)
                eachPoe[ii].issuedTo=decryptTxt(x.toString())
            }
            console.log(eachPoe)
            /*res.json({
                "rollNo":eachPoe.issuedTo,
                "documentType":eachPoe.documentType,
                "sha256hash":eachPoe.sha256Hash,
                "txId": eachPoe.txId,
                "timestamp":eachPoe.timestamp
            });*/
            res.json({
                status: "Success",
                message: "fetchDocsbyUserName General PoE",
                result: eachPoe
            });
        })

    })


    //  res.send("Find All Properties");

};

//Retrieving User Specific documents in Generic PoE
exports.fetchDocsbyUserName_Generic = (req, res) => {
    console.log('inside fetch Documents by UserName')
    var userOrgemail = req.userOrgemail;
    var userOrgID = req.userOrgID;
    console.log('userOrgemail ', userOrgemail);
    console.log('userOrgID ', userOrgID);

    genericUser.find({
        $and:
            [{ userOrgID: userOrgID },
            { userOrgemail: userOrgemail }]
    }).then(genUser => {
        console.log('userOrgemail found in records ', genUser)
        //console.log(student[0].rollNo);
        genPoeData.find({
            "issuerOrgUserEmail": userOrgemail
        }, {
            documentType: 1,
            sha256Hash: 1,
            txId: 1,
            timestamp: 1,
            issuerOrgName: 1,
            issuerOrgEmail: 1,
            issuerOrgUserName: 1,
            issuerOrgUserEmail: 1,
            recipientName: 1,
            recipientEmail: 1,
            recipientMobile: 1,
            allowStorage: 1,
            posHash: 1,
            _id: 0
        }).then(eachPoe => {
            /*res.json({
                "rollNo":eachPoe.issuedTo,
                "documentType":eachPoe.documentType,
                "sha256hash":eachPoe.sha256Hash,
                "txId": eachPoe.txId,
                "timestamp":eachPoe.timestamp
            });*/
            res.json({
                status: "Success",
                message: "fetchDocsbyUserName Generic PoE",
                result: eachPoe
            });
        })

    })


    //  res.send("Find All Properties");

};

//Sending email to cdacchain.in when getcallback request is received from cdacchain.in 
exports.getCallBack = (req, res) => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing

    var name = req.body.name;
    var organisation = req.body.organisation;
    var city = req.body.city;
    var email = req.body.email;
    var phone = req.body.phone;
    var re4 = new RegExp('^([a-zA-Z0-9 _-\\s]+)$');

    if (!validator.isAlphanumeric(name)) {
        console.log("InValid Name");
        res.json(getErrorMessage("Invalid Name"));
        return;
    }

    if (re4.test(organisation)) {
        console.log("Organization " + organisation + " Valid");
    } else {
        console.log("Organization " + organisation + " Invalid");
        res.json(getErrorMessage("Invalid organisation request"));
        return;
    }

    if (!validator.isAlphanumeric(city)) {
        console.log("InValid City Name");
        res.json(getErrorMessage("Invalid City Name"));
        return;
    }

    if (!validator.isEmail(email)) {
        console.log("InValid email");
        res.json(getErrorMessage("Invalid email request"));
        return;
    }


    if (!validator.isNumeric(phone) || (phone.length != 10)) {
        console.log("InValid Name");
        res.json(getErrorMessage("Invalid Name"));
        return;
    }

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.cdac.in",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'cdacchain', // generated ethereal user
            pass: 'cdachyd@123$'// generated ethereal password
        }
    });

    // send mail with defined transport object

    //  var sourceBuff=new Buffer(file.split("base64")[1], "base64")
    let mailOptions = {
        from: email,//,'"cdacchain" <cdacchain@cdac.in>', // sender address
        to: "cdacchain@cdac.in", // list of receivers
        subject: "Callback Requested", // Subject line
        html: `
         
          <div style='font-size:20px'>Dear Sir/Madam,
        <p>Please Find the client details below <br />
         <b>Name:  </b> ${name}<br/>
         <b>Oraganization: </b>${organisation}<br/>
         <b>City:  </b>${city}<br/>
         <b>Email: </b>${email}<br/>
         <b>Phone: </b> ${phone}<br/>         
        </p>
  
        <p>Regards,<br>
        ${name}<br />
        <h3 style="color:blue;">PoE for ACTS Certificate solution is a Blockchain based Proof of Existence Solution developed by C-DAC Hyderabad.</h1>
        
        </div>`
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (err, info) {
        var emailStatus;
        if (err) {
            emailStatus = false
            res.send({
                "status": "Failure",
                "message": err
                //"result": result[0]
            });
            console.log(err)
        } else {
            emailStatus = true;
            console.log("Message sent: %s", info.response);
            res.send({
                "status": "Success",
                "message": info.response
                //"result": result[0]
            });
            //res.json(info.response);
            //return info.response
        }
        // console.log("Message sent: %s", info.messageId);
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    })
};

exports.decryptTxt=decryptTxt
