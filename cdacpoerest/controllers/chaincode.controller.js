var install = require('../hyperledger/install-chaincode.js');
var instantiate = require('../hyperledger/instantiate-chaincode.js');
var upgrade = require('../hyperledger/upgrade-chaincode.js');
var invoke = require('../hyperledger/invoke-transaction.js');
var query = require('../hyperledger/query.js');
var rtconfig = require('../config/rtconfig');
const io = require('socket.io-client');
var rtelib0 = require('../rtelib/rte-lib');
//var serverIP = 'http://10.244.0.48:3000';
const socket = io(rtconfig.rteserverIP + '/blockchain-nsp');
var rtelib = new rtelib0(socket);
var common = require('../common/common');
function getErrorMessage(field) {
	var response = {
		status: "Failed",
		message: field + ' field is missing or Invalid in the request'
	};
	return response;
};


// Install chaincode on target peers
exports.install = async (req, res) => {
	console.log('==================== INSTALL CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodePath = req.body.chaincodePath;
	var chaincodeVersion = req.body.chaincodeVersion;
	var chaincodeType = req.body.chaincodeType;
	var username = req.username;
	var orgname = req.orgname;
	console.log('peers : ' + peers); // target peers list
	console.log('chaincodeName : ' + chaincodeName);
	console.log('chaincodePath  : ' + chaincodePath);
	console.log('chaincodeVersion  : ' + chaincodeVersion);
	console.log('chaincodeType..  : ' + chaincodeType);
	if (!peers || peers.length == 0) {
		res.json(getErrorMessage('\'peers\''));
		return;
	}
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodePath) {
		res.json(getErrorMessage('\'chaincodePath\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}
	if (!chaincodeType) {
		res.json(getErrorMessage('\'chaincodeType\''));
		return;
	}
	let message = await install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, username, orgname)
	if (message.status === "Success") {
		res.send(message);
		rtelib.raiseEvent('blockchain', 'installCC', {
			ts: common.cts(),
			ccName: chaincodeName,
			ccVersion: chaincodeVersion,
			peers: peers,
			userName: username,
			orgName: orgname
		});
	} else
		res.send(message);
};
// Instantiate chaincode on target peers
exports.instantiate = async (req, res) => {
	console.log('==================== INSTANTIATE CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodeVersion = req.body.chaincodeVersion;
	var channelName = req.params.channelName;
	var chaincodeType = req.body.chaincodeType;
	var fcn = req.body.fcn;
	var args = req.body.args;
	var username = req.username;
	var orgname = req.orgname;
	console.log('peers  : ' + peers);
	console.log('channelName  : ' + channelName);
	console.log('chaincodeName : ' + chaincodeName);
	console.log('chaincodeVersion  : ' + chaincodeVersion);
	console.log('chaincodeType  : ' + chaincodeType);
	console.log('fcn  : ' + fcn);
	console.log('args  : ' + args);

	/*if (!peers || peers.length == 0) {
		res.status(400).json(getErrorMessage('\'peers\''));
		return;
	}*/
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	/*if (!chaincodeType) {
		res.status(400).json(getErrorMessage('\'chaincodeType\''));
		return;
	}*/
	/*	if (!args) {
			res.status(400).json(getErrorMessage('\'args\''));
			return;
		}
	*/
	let message = await instantiate.instantiateChaincode(peers, channelName, chaincodeName, chaincodeVersion, chaincodeType, fcn, args, username, orgname);
	if (message.status === "Success") {
		res.send(message);
		rtelib.raiseEvent('blockchain', 'instantiateCC', {
			ts: cts(),
			ccName: chaincodeName,
			ccVersion: chaincodeVersion,
			peers: peers,
			userName: username,
			orgName: orgname
		});
	} else
		res.send(message);
};

// Upgrade chaincode on target peers
exports.upgrade = async (req, res) => {
	console.log('==================== UPGRADE CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var chaincodeVersion = req.body.chaincodeVersion;
	var channelName = req.params.channelName;
	var chaincodeType = req.body.chaincodeType;
	var fcn = req.body.fcn;
	var args = req.body.args;
	var username = req.username;
	var orgname = req.orgname;
	console.log('peers  : ' + peers);
	console.log('channelName  : ' + channelName);
	console.log('chaincodeName : ' + chaincodeName);
	console.log('chaincodeVersion  : ' + chaincodeVersion);
	console.log('chaincodeType  : ' + chaincodeType);
	console.log('fcn  : ' + fcn);
	console.log('args  : ' + args);

	/*if (!peers || peers.length == 0) {
		res.status(400).json(getErrorMessage('\'peers\''));
		return;
	}*/
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!chaincodeVersion) {
		res.json(getErrorMessage('\'chaincodeVersion\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	/*if (!chaincodeType) {
		res.status(400).json(getErrorMessage('\'chaincodeType\''));
		return;
	}*/
	/*	if (!args) {
			res.status(400).json(getErrorMessage('\'args\''));
			return;
		}
	*/
	let message = await upgrade.upgradeChaincode(peers, channelName, chaincodeName, chaincodeVersion, chaincodeType, fcn, args, username, orgname);
	if (message.status === "Success") {
		res.send(message);
		rtelib.raiseEvent('blockchain', 'upgradeCC', {
			ts: cts(),
			ccName: chaincodeName,
			ccVersion: chaincodeVersion,
			peers: peers,
			userName: username,
			orgName: orgname
		});
	} else
		res.send(message);
};

// Invoke transaction on chaincode on target peers
exports.invoke = async (req, res) => {
	console.log('==================== INVOKE ON CHAINCODE ==================');
	var peers = req.body.peers;
	var chaincodeName = req.body.chaincodeName;
	var channelName = req.params.channelName;
	var fcn = req.body.fcn;
	var args = req.body.args;
	var username = req.username;
	var orgname = req.orgname;
	console.log('channelName  : ' + channelName);
	console.log('chaincodeName : ' + chaincodeName);
	console.log('fcn  : ' + fcn);
	console.log('args  : ' + args);
	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}

	let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, username, orgname);
	if (message.status === "Success")
		res.send(message);
	else
		res.send(message);
};



// Query on chaincode on target peers
exports.query = async (req, res) => {
	console.log('==================== QUERY BY CHAINCODE ==================');
	var channelName = req.params.channelName;
	var chaincodeName = req.params.chaincodeId;
	let args = req.query.args;
	let fcn = req.query.fcn;
	let peer = req.query.peer;
	var username = req.username;
	var orgname = req.orgname;

	console.log('channelName : ' + channelName);
	console.log('chaincodeName : ' + chaincodeName);
	console.log('fcn : ' + fcn);
	console.log('args : ' + args);

	if (!chaincodeName) {
		res.json(getErrorMessage('\'chaincodeName\''));
		return;
	}
	if (!channelName) {
		res.json(getErrorMessage('\'channelName\''));
		return;
	}
	if (!fcn) {
		res.json(getErrorMessage('\'fcn\''));
		return;
	}
	if (!args) {
		res.json(getErrorMessage('\'args\''));
		return;
	}
	args = args.replace(/'/g, '"');
	args = JSON.parse(args);
	console.log(args);

	let message = await query.queryChaincode(peer, channelName, chaincodeName, args, fcn, username, orgname);
	if (message.status === "Success")
		res.send(message);
	else
		res.send(message);
};