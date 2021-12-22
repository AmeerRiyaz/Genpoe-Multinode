const chalk = require('chalk');
var validator = require('validator');
var fs = require('fs');
const readChunk = require('read-chunk');
const OrigfileType = require('file-type');
var log4js = require('log4js');
var logger = log4js.getLogger('validations');

function cts() {
    //var current = new Date();
    //var curr_ts = current.toString();
    var curr_ts = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    return curr_ts;
}

function getErrorMessage(field, result) {
    var response = {
        status: "Failed",
        message: field,
        result: result
    };
    /* rtelib.raiseEvent('blockchain', 'poeSearch', {
        ts: cts(),
        msg: 'Query failed due to ' + field
    }); */
    logger.debug(chalk.bgRed(response.status + ' : ' + response.message));
    return response;
}



function getSuccessMessage(field, result) {
    var response = {
        status: "Success",
        message: field,
        result: result
    };

    return response;
}

//var re1 = new RegExp('^([a-zA-Z/]+)$');
//var re2 = new RegExp('^([a-zA-Z]+)$');
var re3 = new RegExp('^([a-zA-Z0-9_-]+)$');

//Accepts Alphanumerics with special characters as -, _, space 
var re4 = new RegExp('^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*$');
/*********************************************
**Regular Expression for Validating Password**
**(?=.*[a-z]) = atleast one small alphabet****
**(?=.*[A-Z]) = atleast one capital alphabet**
**(?=.*[0-9]) = atleast one digit*************
**(?=.*[!@#$]) = atleast one special character*
**[A-Za-z\d!@#$].{6,64} = Min of 6 len, Max of 64 Len *********
**********************************************/

var re5 = new RegExp('^[a-zA-Z]+([ ]?[a-zA-Z])*$');

//const orgIDRegex = '[a-zA-Z0-9]+([a-zA-Z0-9])*'
const orgIDRegex = '^[A-Za-z0-9]{3,10}$'
exports.validateOrgID = async (userOrgID) => {
    if (validator.matches(userOrgID, orgIDRegex)) {
        console.log('valid')
        res = getSuccessMessage("userOrgID valid", null);
    } else {
        res = getErrorMessage("userOrgID invalid", null);
        console.log('Invalid')
    }
    return res;
}

/***************Validate userOrgID******************
  await validate.validateOrgID(userOrgID).then(vres => {
    if(vres.status == "Success") {
        console.log(chalk.bgGreen('userOrgID valid'));
    } else if(vres.status == "Failed") {
        console.log(chalk.bgRed('userOrgID Invalid ', vres.message));
    }
})
 **************************************************/

const regex = '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$])[A-Za-z\d!@#$].{6,64}';

exports.validatePassword = async (passwd) => {
    if (validator.matches(passwd, regex)) {
        console.log('valid')
        res = getSuccessMessage("password valid", null);
    } else {
        res = getErrorMessage("password invalid", null);
        console.log('Invalid')
    }
    return res;
}

/***************Validate Password******************
  await validate.validatePassword(password).then(vres => {
    if(vres.status == "Success") {
        console.log(chalk.bgGreen('password valid'));
    } else if(vres.status == "Failed") {
        console.log(chalk.bgRed('password Invalid ', vres.message));
    }
})
 **************************************************/



//FOr Validating UserName
exports.validateUserName = async (userName) => {
    var res;
    if (re4.test(userName)) {
        res = getSuccessMessage("userName valid", null);
    } else {
        res = getErrorMessage("userName invalid", null);
    }
    return res;
}

/***************Validate UserName******************
  await validate.validateUserName(uname).then(vres => {
    if(vres.status == "Success") {
        console.log(chalk.bgGreen('userName valid'));
    } else if(vres.status == "Failed") {
        console.log(chalk.bgRed('userName Invalid ', vres.message));
    }
})
 **************************************************/

//FOr Validating UserName
exports.validateStudentName = async (studentName) => {
    var res;
    if (re5.test(studentName)) {
        res = getSuccessMessage("studentName valid", null);
    } else {
        res = getErrorMessage("studentName invalid", null);
    }
    return res;
}

/***************Validate studentName******************
  await validate.validateStudentName(studentName).then(vres => {
    if(vres.status == "Success") {
        console.log(chalk.bgGreen('studentName valid'));
    } else if(vres.status == "Failed") {
        console.log(chalk.bgRed('studentName Invalid ', vres.message));
    }
})
 **************************************************/



//FOr Validating fileName
exports.validatefileName = async (fileName) => {
    var res;
    console.log('in validate Filename ', fileName)
    if (re4.test(fileName)) {
        res = getSuccessMessage("fileName valid", null);
    } else {
        res = getErrorMessage("fileName invalid", null);
    }
    return res;
}


/**************** Validate FileName ********************
  await validate.validatefileName(name).then(vres => {
    if(vres.status == "Success") {
        console.log(chalk.bgGreen('fileName valid'));
    } else if(vres.status == "Failed") {
        console.log(chalk.bgRed('fileName Invalid ', vres.message));
    }
})
 *******************************************************/

//FOr Validating email
exports.validateEmail = async (email) => {
    var res;
    if (!validator.isEmail(email)) { //Error condition
        res = getErrorMessage("email invalid", null);
    } else {
        res = getSuccessMessage("email valid", null);
    }
    return res;
}

/****************Validate email ***************
  await validate.validateEmail(email).then(vres => {
    if(vres.status == "Success") {
        console.log(chalk.bgGreen('email valid'));
    } else if(vres.status == "Failed") {
        console.log(chalk.bgRed('email Invalid ', vres.message));
    }
})
 **********************************************/


//FOr Validating Mobile Number
exports.validateMobile = async (mobile) => {
    var res;
    if (!validator.isMobilePhone(mobile, 'en-IN')) { //Error condition
        res = getErrorMessage("Mobile Number invalid", null);
    } else {
        res = getSuccessMessage("Mobile Number valid", null);
    }
    return res;
}

/**************Validate Mobile Number *********
 await validate.validateMobile(mobile).then(vres => {
    if(vres.status == "Success") {
        console.log(chalk.bgGreen('Mobile Number valid'));
    } else if(vres.status == "Failed") {
        console.log(chalk.bgRed('Mobile Number Invalid ', vres.message));
    }
})

 **********************************************/

//FOr Validating sha256hash
exports.validateSha256Hash = async (sha256Hash) => {
    var res;
    //console.log(chalk.bgCyan("sha256 is ", sha256Hash.trim().toLowerCase()));
    //if (!validator.isHash(sha256Hash.trim(), 'sha256')) { //Error condition
    if (!validator.isHash(sha256Hash.trim().toLowerCase(), 'sha256')) { //Error condition
        res = getErrorMessage("sha256hash invalid", null);
    } else {
        res = getSuccessMessage("sha256hash valid", null);
    }
    return res;
}

/**************Validate sha256hash *********
 await validate.validateSha256Hash(sha256Hash).then(vres => {
    if(vres.status == "Success") {
        console.log(chalk.bgGreen('sha256Hash valid'));
    } else if(vres.status == "Failed") {
        console.log(chalk.bgRed('sha256Hash Invalid ', vres.message));
    }
})
 **********************************************/


//FOr Validating sha1hash
exports.validateSha1Hash = async (sha1Hash) => {

    var res;
    if (!validator.isHash(sha1Hash.trim().toLowerCase(), 'sha1')) { //Error condition
        res = getErrorMessage("sha1hash invalid", null);
    } else {
        res = getSuccessMessage("sha1hash valid", null);
    }
    return res;
}

/**************Validate sha1hash *********
 await validate.validateSha1Hash(sha1Hash).then(vres => {
    if(vres.status == "Success") {
        console.log(chalk.bgGreen('sha1Hash valid'));
    } else if(vres.status == "Failed") {
        console.log(chalk.bgRed('sha1Hash Invalid ', vres.message));
    }
})
 **********************************************/


//FOr Validating base64
exports.validateBase64 = async (b64) => {
    var res;
    if (!validator.isBase64(b64)) {
        res = getErrorMessage("Invalid base64 content", null);
    } else
        res = getSuccessMessage('base64 valid', null);
    return res;
}

/***************  Use this code to call the validate function****************************
await validate.validateBase64(content).then( vres => {
    if(vres.status == "Success") {
        console.log(chalk.bgGreen('base64 valid'));
    } else if(vres.status == "Failed") {
        console.log(chalk.bgRed('base64 Invalid ', vres.message));
    }
});*/

//FOr Validating Rollno
/******Use rollNo.trim() method before calling this function ********/
exports.validateRollNo = async (rollNo) => {
    rollNo = validator.trim(rollNo);
    //rollNo = rollNo.trim();
    var res;
    if (!validator.isNumeric(rollNo)) {
        res = getErrorMessage("Invalid rollNo", null);
    } else {
        res = getSuccessMessage("RollNo valid", null);
    }
    return res;
}

/***************  Use this code to call the validate function****************************
await validate.validateRollNo(rollNo).then( vres => {
    //console.log("AFTER",res)
    if(vres.status == "Success") {
        console.log(chalk.bgGreen('rollNo valid'));
    } else if(vres.status == "Failed") {
        console.log(chalk.bgRed('rollNo Invalid ', vres.message));
    }
    //console.log('roll: ' + rollNo + ' Name: '+row[1]+' email: '+row[2]+' mobile: '+row[3]);
})*/

//For validating mime type of a file from base64 content
exports.validateMimeType = async (b64) => {
    console.log("inside validateMimeType validation")
    var res;
    var bdata = process.cwd() + '/certificates/mimetypeValidation.pdf';
    fs.writeFileSync(bdata, b64, 'base64');
    const mybuffer = readChunk.sync(bdata, 0, OrigfileType.minimumBytes);
    var typeRes = OrigfileType(mybuffer);
    //=> {ext: 'png', mime: 'image/png'}

    if (!typeRes) {
        //console.log("InValid file-type:: Extension:" + typeRes.ext + " Mime type:" + typeRes.mime);
        res = getErrorMessage("Corrupted File", " ");
    } else if ((typeRes.ext === 'png' && typeRes.mime === 'image/png') ||
        (typeRes.ext === 'jpg' && typeRes.mime === 'image/jpg') ||
        (typeRes.ext === 'jpeg' && typeRes.mime === 'image/jpeg') ||
        (typeRes.ext === 'jpg' && typeRes.mime === 'image/jpeg') ||
        (typeRes.ext === 'jpeg' && typeRes.mime === 'image/jpg') ||
        (typeRes.ext === 'bmp' && typeRes.mime === 'image/bmp') ||
        (typeRes.ext === 'pdf' && typeRes.mime === 'application/pdf')) {
        console.log("Valid file-type:: Extension:" + typeRes.ext + " Mime type:" + typeRes.mime);
        res = getSuccessMessage("Supported File", typeRes.ext, typeRes.mime);
    } else {
        console.log("Invalid file-type:: Extension:" + typeRes.ext + " Mime type:" + typeRes.mime);
        //console.log("Invalid file-type:: Extension:" + typeRes.ext + " Mime type:" + typeRes.mime);
        res = getErrorMessage("UnSupported File for this Application", typeRes.ext);
    }
    return res;
}

/************Validating Mime type from file content in base64 encoded format******
await validate.validateMimeType(b64).then(async vres => {
    //console.log(vres);
    if (vres.status == "Failed") {
        console.log(chalk.bgRed('Unsupported file ', vres.message));
        res.json(vres);
        return;
    } else if (vres.status == "Success") {
        //console.log(chalk.bgGreen('base64 valid'));
    }
})
 ************************************************************************************/