/**
 * Generate pdf
 * Author : vikas 
 * Date : 26 aug 19
 */

const base64 = require('base64-stream');
var query = require('../hyperledger/poe/query.js');
const proofofex = require('../models/poe.model');
const receiptEnv = require('../config/receiptEnviron');
const queryNew=require('./query')

// const assetDir = require('../assets')
const dateFormat = require('dateformat');
const fs = require('fs')
var QRCode = require('qrcode')
const PDFDocument = require("pdfkit")
var query1 = require('../hyperledger/query.js');
//Todo encytpion to be moved 
var encDec = require('./poechaincode.controller')

var marginSize
var logoHeight
var qrcodeWidth
var dataTableTopMargin
qrcodeUrl = receiptEnv.qrcodeUrl
qrcodeUrlACTS = receiptEnv.qrcodeUrlACTS;
qrcodeUrlOrg = receiptEnv.qrcodeUrlOrg;
// dataForPdfFromSearch
const genericUser = require('../models/genericUser.model');
var sha = require('js-sha256');
var asn = require('asn1.js');
const { measureMemory } = require('vm');
var calculateBlockHash = function(header) {
    let headerAsn = asn.define('headerAsn', function() {
      this.seq().obj(
        this.key('Number').int(),
        this.key('PreviousHash').octstr(),
       this.key('DataHash').octstr()
     );
   });
  
    let output = headerAsn.encode({
        Number: parseInt(header.number),
        PreviousHash: Buffer.from(header.previous_hash, 'hex'),
        DataHash: Buffer.from(header.data_hash, 'hex')
      }, 'der');
    let hash = sha.sha256(output);
    return hash;
  };
/**
 * main function 
 * */

 function getErrorMessage(field) {
	var response = {
		status: "Failed",
		message: field + ' field is missing or Invalid in the request'
	};
	return response;
};


exports.generateReceipt = async (req, res) =>
// async function generateReceipt(dataForPdf, Qr {
{
    marginSize = 44
    logoHeight = 60
    qrcodeWidth = 92
    dataTableTopMargin = 132
    let doc = new PDFDocument({
        margin: marginSize / 2,
        layout: "landscape",
        size: 'A4'
    })

    //-----------------------------------------------------------------------------
    // logger.debug('==================== generateReceipt ==================');
    var peers = "peer0.cdachorg.cdac.in";
    var chaincodeName = "poe";
    var channelName = "generalpoechannel";
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

    if (txId.length != 64) {
        res.json(getErrorMessage("Invalid request"));
        return;
    }
    var args = [
        txId
    ]
    let user="ravikishore6"
    //let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
    // let message = await query.queryChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg);
    let message= await queryNew.query(user,channelName,chaincodeName,fcn,args)


    if (message.status === "Success") {
        // var result = JSON.parse(message.message.toString());
        // if (result[0].found === true) {
        //     console.log("RESULT", result[0])

        //     proofofex.findOne({
        //         "sha256Hash": result[0].sha256Hash
        //     }, async function (err, poe1) {
        //         getHeader(doc);
        //         result[0].txstatus = poe1.txstatus
        //         getTable(doc, result[0]);
        //         await getFooter(doc, qrcodeUrl + result[0].txId);
        //         doc.pipe(res)
        //         // doc.pipe(fs.createWriteStream('output.pdf'));
        //         doc.end();

        //     });
        // }
        console.log(message)

        var result = message.result
        // console.log(encDec.decryptTxt(result[0].issuedTo))
        result.issuedTo=encDec.decryptTxt(result.issuedTo)
        console.log(result.issuedTo)

        await getOrgLogo(doc, null)
        getHeader(doc);
        getTable(doc, result);
        await getFooter(doc, qrcodeUrl + result.txId);
        // const stream = doc.pipe(blobStream());
        // doc.pipe(res)

        // doc.pipe(fs.createWriteStream('output.pdf'));
        // res.send(stream)
        // doc.pipe(res)
        // doc.end();

        var finalString = 'data:application/pdf;base64,'; // contains the base64 string

        var stream = doc.pipe(new base64.Base64Encode());

        doc.end(); // will trigger the stream to end

        stream.on('data', function (chunk) {
            finalString += chunk;
        });

        stream.on('end', function () {
            // the stream is at its end, so push the resulting base64 string to the response
            res.json({
                status: "Success",
                result: finalString
            });
        });

    } else {
        res.send(getErrorMessage(message));
    }

    //-----------------------------------------------------------------------------


}


//Generate Receipt for ACTS certificates
exports.generateOrgReceipt = async function (txnData) {
    marginSize = 44
    logoHeight = 64
    qrcodeWidth = 92
    dataTableTopMargin = 132
    let doc = new PDFDocument({
        margin: marginSize / 2,
        layout: "landscape",
        size: 'A4'
    })


    var txId = txnData.txId;
    var re2 = new RegExp('^([a-zA-Z0-9]+)$');
    if (re2.test(txId)) {
        console.log("Valid");
    } else {
        console.log("Invalid");
        res.json(getErrorMessage("Invalid request"));
        return;
    }

    // var issuedByOrg = txnData.issuerOrgName;
    // var issuedByUser = txnData.issuerOrgUserName;


    
    await getOrgLogo(doc, txnData.issuerOrgEmail)
    getHeader(doc);

    // FIXME Timestamp should be from transaction
    // if (timestamp.seconds){
    //     timestamp =  dateFormat(new Date(timestamp.seconds * 1000), "yyyy-mm-dd HH:MM:ss")
    // }

    // var timestamp = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");


    getOrgTable(doc, txnData);

    //getTable(doc, );
    //await getFooter(doc, qrcodeUrlOrg + txnData.txId); //for transactio based

    await getFooter(doc, qrcodeUrlOrg + txnData.sha256Hash); // for sha based link

    var finalString = 'data:application/pdf;base64,'; // contains the base64 string
    var finalString = ''; // contains the base64 string

    var stream = doc.pipe(new base64.Base64Encode());

    doc.end(); // will trigger the stream to end

    stream.on('data', function (chunk) {
        finalString += chunk;
    });


    // the stream is at its end, so push the resulting base64 string to the response

    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            if (finalString) {
                resolve(finalString)
                // console.log('inside resolve', finalString)
            }
            else {
                reject(null)
                // console.log('inside reject', finalString)
            }
        })
    })

    // });


    // stream.on('end', function () {
    //     // the stream is at its end, so push the resulting base64 string to the response

    //     callback(finalString)
    // });

    //-----------------------------------------------------------------------------


}


//Generate Receipt for ACTS certificates
exports.generateACTSReceipt = async function (txnID, fileName, documentType, student, timestamp) {
    var channelName = "cdacpoechannel";
	var peers = "peer0.cdachorg.cdac.in";
    // let message = await query1.getChainInfo(peers, channelName, 'saigopal1', 'ActsOrg');
    // let height=message.message.height
    // height=JSON.parse(height)
	// let bheight=height    
    // message = await query.getBlockByNumber(peers, channelName,47, req.username, req.orgname);
    let message = await query1.getBlockByTxid(txnID,peers, channelName,'saigopal1', 'ActsOrg');
    let height=message.header.number
    height=JSON.parse(height)
    let bheight=height    
    message1 = await query1.getBlockByNumber(peers, channelName,parseInt(bheight)-1,'saigopal1', 'ActsOrg');
    console.log('current block data')
   	console.log(message1)
	// console.log(message.header)
	// let curehash= calculateBlockHash(message.header)
    let curehash1= calculateBlockHash(message1.header)
    console.log('current blockhash')
    console.log(curehash1)
    marginSize = 44
    logoHeight = 60
    qrcodeWidth = 92
    dataTableTopMargin = 132
    let doc = new PDFDocument({
        margin: marginSize / 2,
        layout: "landscape",
        size: 'A4'
    })


    var txId = txnID;
    var re2 = new RegExp('^([a-zA-Z0-9]+)$');
    if (re2.test(txId)) {
        console.log("Valid");
    } else {
        console.log("Invalid");
        res.json(getErrorMessage("Invalid request"));
        return;
    }

    var issuedByOrg = student.issuedByOrg;
    var issuedByUser = student.issuedByUser;


    await getOrgLogo(doc, null)
    getHeader(doc);
    if (timestamp.seconds) {
        // var timestamp = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
        timestamp = dateFormat(new Date(timestamp.seconds * 1000), "yyyy-mm-dd HH:MM:ss")
    }
    // console.log(student);
    //console.log(timestamp);
    var data = [txId, fileName, documentType, student.sha256Hash, student.sha1Hash, student.issuedTo, student.issuedByOrg, timestamp,curehash1];

    getACTSTable(doc, data);

    //getTable(doc, );
    await getFooter(doc, qrcodeUrlACTS + txId);

    var finalString = 'data:application/pdf;base64,'; // contains the base64 string
    var finalString = ''; // contains the base64 string

    var stream = doc.pipe(new base64.Base64Encode());

    doc.end(); // will trigger the stream to end

    stream.on('data', function (chunk) {
        finalString += chunk;
    });


    // the stream is at its end, so push the resulting base64 string to the response

    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            if (finalString) {
                resolve(finalString)
                // console.log('inside resolve', finalString)
            }
            else {
                reject(null)
                // console.log('inside reject', finalString)
            }
        })
    })

}


/**
 * Return the header
 * @param {*} doc 
 */
function getHeader(doc) {

    doc
        //PoE logo
        // .image(__dirname + "/../assets/poe-new.png", marginSize, marginSize - 24, { width: logoWidth,height: logoWidth, })
        .image(__dirname + "/../assets/poe-new.png", (doc.page.width - marginSize - logoHeight), marginSize - 24, { height: logoHeight, width: logoHeight, align: 'right' })
        //Title
        .fillColor("#2D2D2D").fontSize(24)
        .font('Helvetica').text("RECEIPT", marginSize, marginSize, { align: 'center' })

        //Sub title
        .fillColor("#2D2D2D").fontSize(22)
        .font('Helvetica').text("Proof of Existence", marginSize, marginSize + 24, { align: 'center' })

        //cdac logo
        // .image(__dirname + "/../assets/cdaclogo.png", (doc.page.width - marginSize - logoWidth - 16), marginSize - 8, { width: logoWidth + 16, align: 'right' })

        //line
        .moveTo(marginSize, marginSize * 2.4)
        .lineTo(doc.page.width - marginSize, marginSize * 2.4)
        .strokeColor("#7c7c7c").lineWidth(0.4).stroke()
}


async function getOrgLogo(doc, orgEmail) {

    // this is to set logog for other than org pdf generation
    if (orgEmail == null) {
        doc.image(__dirname + "/../assets/cdaclogo.png", marginSize, marginSize - 24, { height: logoHeight, })
        return
    }

    await genericUser.findOne({
        $and:
            [
                { userOrgemail: orgEmail },
                { role: 'admin' }
            ]
    },
        {
            orgLogo: 1,
        }).then(logo => {
            if (logo) {
                doc.image(logo.orgLogo, marginSize, marginSize - 24, { height: logoHeight, })
                // doc.image(logo.orgLogo, (doc.page.width - marginSize - logoWidth ), marginSize - 24, { height: logoWidth, width: logoWidth, align: 'right' })
            } else {

                // doc.image(__dirname + "/../assets/cdaclogo.png", (doc.page.width - marginSize - logoWidth ), marginSize - 24, { height: logoWidth ,width: logoWidth, align: 'right' })
                doc.image(__dirname + "/../assets/cdaclogo.png", marginSize, marginSize - 24, { height: logoHeight, })
            }

        });
    return

}


/**
 * Returns the fotter
 * @param {*} doc 
 */
async function getFooter(doc, qrdata) {
    var qrCode = await getQrCode(qrdata)
    doc
        //Instruction
        .fillColor("#444444").fontSize(11)
        .font('Helvetica').text("Scan QR-Code or visit following url to verify authenticity of this document.", marginSize, doc.page.height - marginSize * 2.8, { align: 'left' })
        .font('Helvetica').text("This document is computer generated and hence does not require signature.", marginSize, doc.page.height - marginSize * 2.5, { align: 'left' })

        // .fillColor("#3333ff").font('Helvetica').text(qrdata, marginSize, doc.page.height - marginSize * 1.8, { align: 'left' })
        .font('Helvetica').fillColor("#3333ff").text(qrdata, marginSize, doc.page.height - marginSize * 1.8, { align: 'left' })
        .link(marginSize, doc.page.height - marginSize * 1.8, doc.widthOfString(qrdata), doc.currentLineHeight(), qrdata)

        //QR-Code
        .image(qrCode, (doc.page.width - marginSize - qrcodeWidth + 8), doc.page.height - qrcodeWidth - marginSize * 1.4, { width: qrcodeWidth, align: 'right' })

        //Bottom line
        .moveTo(marginSize, doc.page.height - marginSize * 1.24)
        .lineTo(doc.page.width - marginSize, doc.page.height - marginSize * 1.24)
        .strokeColor("#7c7c7c").lineWidth(0.4).stroke()

        //Copyright
        .fillColor("#444444").fontSize(11)
        .font('Helvetica').text("© Centre for Development of Advanced Computing, Hyderabad", marginSize, doc.page.height - marginSize + 8, { align: 'center' })
}

async function getQrCode(dataForQr) {
    var qr = await QRCode.toDataURL(dataForQr, {
        color: {
            dark: '#2D2D2D',
            light: '#0000' // Transparent background
        }
    })
    return qr
}

function getTable(doc, data) {
    keys = ['Transaction ID', 'SHA256 Hash', 'File Name', 'User', 'Timestamp']
    values = [data.txId, data.sha256Hash, data.documentType, data.issuedTo, new Date(data.timestamp.seconds * 1000)]
    for (let index = 0; index < keys.length; index++)
        generateTableRow(doc, dataTableTopMargin, keys[index], values[index]);
}

function getOrgTable(doc, data) {
    keys = ['Transaction ID', 'SHA256 Hash', 'Document Type', 'Issuer Organization', 'Organization email', 'Recipient Name', 'Recipient email']
    values = [data.txId, data.sha256Hash, data.documentType, data.issuerOrgName, data.issuerOrgEmail, data.recipientName, data.recipientEmail]
    for (let index = 0; index < keys.length; index++)
        generateTableRow(doc, dataTableTopMargin, keys[index], values[index]);
}

function getACTSTable(doc, data) {
    keys = ['Transaction ID', 'File Name', 'Document Type', 'SHA256 Hash', 'SHA1 Hash', 'Issued To', 'Issued By Org', 'Timestamp','Block ID']
    values = data;
    for (let index = 0; index < keys.length; index++)
        generateTableRow(doc, dataTableTopMargin, keys[index], values[index]);
}


function generateTableRow(doc, y, key, value) {
    doc
        .fontSize(11)
        .font('Helvetica-Bold').text(key, marginSize, y)
        .font('Helvetica').text(":", 148, y, { align: 'left' })
        .font('Helvetica').text(value, 178, y)
    // .font('Helvetica').text(unitCost, 280, y, { width: 90, align: "right" })
    dataTableTopMargin = dataTableTopMargin + 18;
    generateHr(doc, dataTableTopMargin)
    dataTableTopMargin = dataTableTopMargin + 10;
}


function generateHr(doc, y) {
    doc
        .moveTo(marginSize, y)
        .lineTo(doc.page.width - marginSize, y)
        .strokeColor("#eaeaea").lineWidth(0.4).stroke();
}
