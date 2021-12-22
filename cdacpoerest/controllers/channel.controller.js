var helper = require('../hyperledger/helper.js');
var createChannel = require('../hyperledger/create-channel.js');
var join = require('../hyperledger/join-channel.js');
var query = require('../hyperledger/query.js');
var log4js = require('log4js');
var logger = log4js.getLogger('channel.controller');
const io = require('socket.io-client');
var rtelib0 = require('../rtelib/rte-lib');
var rtconfig = require('../config/rtconfig');
var asn1 = require("asn1-ber");
let queryNew= require("./query")
//var serverIP = 'http://10.244.0.48:3000';
const socket = io(rtconfig.rteserverIP + '/blockchain-nsp');
var rtelib = new rtelib0(socket);
var sha = require('js-sha256');
var asn = require('asn1.js');
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
function cts() {
	var current = new Date();
	var curr_ts = current.toString();
	return curr_ts;
}
// Creates a new Channel
exports.create = async function (req, res) {
	console.log("in create channel");
	logger.debug('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
	//logger.debug('End point : /channels');
	var channelName = req.body.channelName;
	var channelConfigPath = req.body.channelConfigPath;
	var username = req.username;
	var orgname = req.orgname;
	//logger.debug('Channel name : ' + channelName);
	//logger.debug('channelConfigPath : ' + channelConfigPath); //../artifacts/channel/mychannel.tx
//	logger.debug('Orgname :' + orgname);
//	logger.debug('Username :' + username);
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!channelConfigPath) {
		res.json(getErrorMessage('\'channelConfigPath\''));
		return;
	}
	/*	if (!username) {
			res.json(getErrorMessage('\'username\''));
			return;
		}*/
	if (!orgname) {
		res.json(getErrorMessage('\'orgname\''));
		return;
	}
	let message = await createChannel.createChannel(channelName, channelConfigPath, username, orgname);
	if (message.status === "Success") {
		res.send(message);
		rtelib.raiseEvent('blockchain', 'createChannel', {
			ts: cts(),
			channelName: channelName,
			userName: username,
			orgName: orgname
		});
	} else
		res.json(message);
};

function getErrorMessage(field) {
	var response = {
		status: "Failed",
		message: field + ' field is missing or Invalid in the request'
	};
	return response;
};

// Joins a Channel
exports.join = async (req, res) => {
	logger.debug('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
	var channelName = req.params.channelName;
	var peers = req.body.peers;
	var username = req.username;
	var orgname = req.orgname;
	// logger.debug('channelName : ' + channelName);
	// logger.debug('peers : ' + peers);
	// logger.debug('username :' + username);
	// logger.debug('orgname:' + orgname);

	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	if (!username) {
		res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!orgname) {
		res.json(getErrorMessage('\'orgname\''));
		return;
	}
	let message = await join.joinChannel(channelName, peers, username, orgname);
	if (message.status === "Success") {
		res.send(message);
		rtelib.raiseEvent('blockchain', 'joinChannel', {
			ts: cts(),
			channelName: channelName,
			peers: peers,
			userName: username,
			orgName: orgname
		});
	} else
		res.json(message);
};

//Query for ACTS Channel Information
exports.query = async (req, res) => {
	logger.debug('================ GET CHANNEL INFORMATION ======================');
	//logger.debug('channelName : ' + req.params.channelName);
	//var channelName = req.params.channelName;
	var channelName = "cdacpoechannel";
	var peers = "peer0.cdachorg.cdac.in";
	//let peers = req.query.peer;
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	console.log(req.username);
	let message = await query.getChainInfo(peers, channelName, req.username, req.orgname);	
		  
	// console.log("bheeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee isssssssssssssssssssssssss",JSON.stringify(message) )
	// var reader = new asn1.BerReader(message.message.currentBlockHash.buffer)
	// console.log(reader)
	// console.log(message.message)
	// let height=message.message.height
    // height=JSON.parse(height)
	// let bheight=height 
	// console.log('height is', bheight)
	// message = await query.getBlockByNumber(peers, channelName,2+1, req.username, req.orgname);
	// // message1 = await query.getBlockByNumber(peers, channelName,53, req.username, req.orgname);
	// // console.log(message.header)
	
	// let curehash= calculateBlockHash(message.header)
	// // let curehash1= calculateBlockHash(message1.header)
	// console.log("************************************************** bheight current blockhash")
	// console.log(curehash)
	// // console.log(curehash11)
	// // console.log(message1.header)
	// let message1 = await query.getBlockByTxid('6a11634e541dcd30a526b9489faeaec34b843654ff714f3ddd62169c8c4369c3',peers, channelName, req.username, req.orgname);
	// console.log(message1)
	// res.send(message.message);

	if (message.status === "Success")
	res.send(message.message.height);
	else
		res.json(message);
};

//Query for Gen Poe Channel Information
exports.genpoequery = async (req, res) => {
	logger.debug('================ GET Gen Poe CHANNEL INFORMATION ======================');
	//logger.debug('channelName : ' + req.params.channelName);
	//var channelName = req.params.channelName;
	var channelName = "generalpoechannel";
	var peers = "peer0.cdachorg.cdac.in";
	//let peers = req.query.peer;
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	console.log(req.username)
	let message = await query.getChainInfo(peers, channelName, req.username, req.orgname);

	if (message.status === "Success")
		res.send(message.message.height);
	else
		res.json(message);
};


//Query for Channel Information
exports.querypeers = async (req, res) => {
	logger.debug('================ GET CHANNEL INFORMATION ======================');
	// logger.debug('channelName : ' + req.params.channelName);
	// logger.debug('orgName : ' + req.params.orgName);

	let message = await query.getOrgPeerInfo(req.params.channelName, req.username, req.orgname);
	//logger.debug(message);
	res.json(message);
};

// Query to fetch channels
exports.fetch = async (req, res) => {
	logger.debug('================ GET CHANNELS ======================');
	//logger.debug('peer: ' + req.query.peer);
	var peer = req.query.peer;
	var username = req.query.username;
	var orgname = req.query.orgname;
	if (!peer) {
		res.json(getErrorMessage('\'peer\''));
		return;
	}
	if (!username) {
		res.json(getErrorMessage('\'username\''));
		return;
	}
	if (!orgname) {
		res.json(getErrorMessage('\'orgname\''));
		return;
	}

	let message = await query.getChannels(peer, username, orgname);
	res.send(message);
};

//Query for Channel instantiated chaincodes
exports.querychaincodes = async (req, res) => {
	logger.debug('================ GET INSTANTIATED CHAINCODES ======================');
	//logger.debug('channelName : ' + req.params.channelName);
	let channelName = req.params.channelName;
	let peers = req.query.peer;

	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	let message = await query.getInstalledChaincodes(peers, channelName, 'instantiated', req.username, req.orgname);
	res.send(message);
};

// Query for blocks by BlockNumber

exports.queryblocks = async (req, res) => {
	logger.debug('==================== GET BLOCK BY NUMBER ==================');
	let blockId = req.params.blockId;
	let peers = req.query.peer;
	let channelName = req.params.channelName;
	// logger.debug('channelName : ' + req.params.channelName);
	// logger.debug('BlockID : ' + blockId);
	// logger.debug('Peer : ' + peers);
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!blockId) {
		res.json(getErrorMessage('\'blockId\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	let message = await query.getBlockByNumber(peers, req.params.channelName, blockId, req.username, req.orgname);
	res.send(message);
};

// Query Get Transaction by Transaction ID
exports.transactions = async (req, res) => {
	logger.debug('================ GET TRANSACTION BY TRANSACTION_ID ======================');
	//logger.debug('channelName : ' + req.params.channelName);
	let channelName = req.params.channelName;
	let trxnId = req.params.transactionId;
	let peers = req.query.peer;
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!trxnId) {
		res.json(getErrorMessage('\'trxnId\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	let message = await query.getTransactionByID(peers, channelName, trxnId, req.username, req.orgname);
	res.send(message);
};

// Query Get Block by Hash
exports.queryblcokhash = async (req, res) => {
	logger.debug('================ GET BLOCK BY HASH ======================');
	//logger.debug('channelName : ' + req.params.channelName);
	let channelName = req.params.channelName;
	let hash = req.query.hash;
	let peers = req.query.peer;
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}

	if (!hash) {
		res.json(getErrorMessage('\'hash\''));
		return;
	}

	let message = await query.getBlockByHash(peers, req.params.channelName, hash, req.username, req.orgname);
	res.send(message);
};

// Query chaincodes by Id(chaincodeName)
exports.querychaincodesbyId = async (req, res) => {
	logger.debug('================ GET INSTANTIATED CHAINCODES ======================');
	// logger.debug('channelName : ' + req.params.channelName);
	// logger.debug('chaincodeName : ' + req.params.id);
	let peers = req.query.peer;
	let id = req.params.id;
	let channelName = req.params.channelName;
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	let message = await query.getChaincodesbyId(peers, channelName, id, 'instantiated', req.username, req.orgname);
	res.send(message);
};