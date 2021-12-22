#!/usr/bin/env node
var fs  = require('fs');
var amqp = require('amqplib/callback_api');
var data;
var ch;
var conn;
 async function rabbitqConn(){

     conn = amqp.connect('amqp://rabbit:rabbit@10.244.5.68:7070');
     ch = conn.createChannel();
//   conn.createChannel(function(err, ch) {
//     var q = 'email';
//  /*   var mailOptions = 'from: '"C-DAC" <msec@cdac.in>', // sender address
//     to: "sireeshac@cdac.in", // list of receivers
//     subject: "Hello", // Subject line
//     text: "Hello world?" // plain text body
// ';
//    */

//     //var data = '[sireeshac@cdac.in siri.chiliveri@gmail.com],,/home/cdac/certificates/file.pdf';
//     var data = 'sireeshac@cdac.in siri.chiliveri@gmail.com,http://cdacchain.in\n http://cdac.in,';
//     //var data = 'sireeshac@cdac.in siri.chiliveri@gmail.com,,';
// //	var result = getByteArray('/home/cdac/testing/sendsms.js');

//     ch.assertQueue(q, {durable: true});
//     ch.sendToQueue(q, Buffer.from(data));
//     console.log(" [x] Sent %s", data);
//   });
  //setTimeout(function() { conn.close(); process.exit(0) }, 500);
//});
}

async function sendData(msg){
    amqp.connect('amqp://rabbit:rabbit@10.244.5.68:7070', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var q = 'email';
    data = msg;
    ch.sendToQueue(q, Buffer.from(data));
    console.log(" [x] Sent %s", data);
  });
 // setTimeout(function() { conn.close(); process.exit(0) }, 500);

});
}

function getByteArray(filePath){
    let fileData = fs.readFileSync(filePath).toString('hex');
    let result = []
    for (var i = 0; i < fileData.length; i+=2)
      result.push('0x'+fileData[i]+''+fileData[i+1])
    return result;
}

exports.rabbitqConn = rabbitqConn;
exports.sendData = sendData;