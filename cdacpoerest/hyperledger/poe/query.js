var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var helper = require('../helper.js');
var logger = helper.getLogger('Query');

var queryChaincode = async function (peer, channelName, chaincodeName, fcn, args, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
	//	logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if (!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}

		// send query
		var request = {
			targets: peer, //queryByChaincode allows for multiple targets
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: args
		};
	//	logger.debug("request " + request.args);
		let response_payloads = await channel.queryByChaincode(request);

		console.log("response payload :" + response_payloads);
		if (response_payloads.toString().indexOf("Error") > -1) {
			console.log("in error");
			let errresp = {
				status: "Failed",
				message: response_payloads.toString()
			};
			return errresp;
		} else {
			if (response_payloads && response_payloads.length != 0) {
				for (let i = 0; i < response_payloads.length; i++) {
					logger.info(args[0] + ' now has ' + response_payloads[i].toString('utf8') +
						' after the move');
				}
				//return args[0]+' now has ' + response_payloads[0].toString('utf8') +
				//	' after the move';
				let response = {
					status: "Success",
					message: response_payloads[0].toString('utf8')
				}
				//return response_payloads[0].toString('utf8');
				return response;
			} else {

				logger.error('response_payloads is null');
				let errresp = {
					status: "Failed",
					message: "response_payloads is null"
				};
				return errresp;
				//return 'response_payloads is null';
			}
		}
	} catch (error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		let errresp = {
			status: "Failed",
			message: "Failed to Query"
		};
		return errresp;
		//return error.toString();
	}
};
var getBlockByNumber = async function (peer, channelName, blockNumber, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
	//	logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if (!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}

		let response_payload = await channel.queryBlock(parseInt(blockNumber, peer));
		if (response_payload) {
		//	logger.debug(response_payload);
			return response_payload;
		} else {
			logger.error('response_payload is null');
			return 'response_payload is null';
		}
	} catch (error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};
var getTransactionByID = async function (peer, channelName, trxnID, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
	//	logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if (!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}

		let response_payload = await channel.queryTransaction(trxnID, peer);
		if (response_payload) {
		//	logger.debug(response_payload);
			return response_payload;
		} else {
			logger.error('response_payload is null');
			return 'response_payload is null';
		}
	} catch (error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};
var getBlockByHash = async function (peer, channelName, hash, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
	//	logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if (!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}

		let response_payload = await channel.queryBlockByHash(Buffer.from(hash), peer);
		if (response_payload) {
		//	logger.debug(response_payload);
			return response_payload;
		} else {
			logger.error('response_payload is null');
			return 'response_payload is null';
		}
	} catch (error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};
var getChainInfo = async function (peer, channelName, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
	//	logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if (!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}

		let response_payload = await channel.queryInfo(peer);
		if (response_payload) {
		//	logger.debug(response_payload);
			return response_payload;
		} else {
			logger.error('response_payload is null');
			return 'response_payload is null';
		}
	} catch (error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};
//getInstalledChaincodes
var getInstalledChaincodes = async function (peer, channelName, type, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
	//	logger.debug('Successfully got the fabric client for the organization "%s"', org_name);

		let response = null
		if (type === 'installed') {
			response = await client.queryInstalledChaincodes(peer, true); //use the admin identity
		} else {
			var channel = client.getChannel(channelName);
			if (!channel) {
				let message = util.format('Channel %s was not defined in the connection profile', channelName);
				logger.error(message);
				throw new Error(message);
			}
			response = await channel.queryInstantiatedChaincodes(peer, true); //use the admin identity
		}
		if (response) {
			if (type === 'installed') {
				logger.debug('<<< Installed Chaincodes >>>');
			} else {
				logger.debug('<<< Instantiated Chaincodes >>>');
			}
			var details = [];
			for (let i = 0; i < response.chaincodes.length; i++) {
				// logger.debug('name: ' + response.chaincodes[i].name + ', version: ' +
				// 	response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				// );
				details.push('name: ' + response.chaincodes[i].name + ', version: ' +
					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				);
			}
			return details;
		} else {
			logger.error('response is null');
			return 'response is null';
		}
	} catch (error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};


//get Chaincode by Id
var getChaincodesbyId = async function (peer, channelName, id, type, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
	//	logger.debug('Successfully got the fabric client for the organization "%s"', org_name);

		let response = null
		if (type === 'installed') {
			response = await client.queryInstalledChaincodes(peer, true); //use the admin identity
		} else {
			var channel = client.getChannel(channelName);
			if (!channel) {
				let message = util.format('Channel %s was not defined in the connection profile', channelName);
				logger.error(message);
				throw new Error(message);
			}
			response = await channel.queryInstantiatedChaincodes(peer, true); //use the admin identity
		}
		if (response) {
			if (type === 'installed') {
				logger.debug('<<< Installed Chaincodes >>>');
			} else {
				logger.debug('<<< Instantiated Chaincodes >>>');
			}
			var details = [];
			for (let i = 0; i < response.chaincodes.length; i++) {

				if (response.chaincodes[i].name === id) {
					details = response;
				}
				/*logger.debug('name: ' + response.chaincodes[i].name + ', version: ' +
					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				);
				details.push('name: ' + response.chaincodes[i].name + ', version: ' +
					response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
				);*/
			}
			return details;
		} else {
			logger.error('response is null');
			return 'response is null';
		}
	} catch (error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};

var getChannels = async function (peer, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
	//	logger.debug('Successfully got the fabric client for the organization "%s"', org_name);

		let response = await client.queryChannels(peer);
		if (response) {
		//	logger.debug('<<< channels >>>');
			var channelNames = [];
			for (let i = 0; i < response.channels.length; i++) {
				channelNames.push('channel id: ' + response.channels[i].channel_id);
			}
			//logger.debug(channelNames);
			return response;
		} else {
			logger.error('response_payloads is null');
			return 'response_payloads is null';
		}
	} catch (error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};


var getOrgPeerInfo = async function (channelName, username, org_name) {
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
	//	logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if (!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}

		var promises = [];
		var block_registration_numbers = [];
		let channel_event_hubs = channel.getChannelEventHubsForOrg(org_name);
		channel_event_hubs.forEach((eh) => {
			let channelPromise = new Promise((resolve, reject) => {
				let event_timeout = setTimeout(() => {
					let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
					logger.error(message);
					eh.disconnect();
				}, 60000);

			});
			promises.push(channelPromise);
			eh.connect(); //this opens the event stream that must be shutdown at some point with a disconnect()

			//logger.debug(eh)	;
			let response_payload = {
				peerName: eh.getPeerAddr(),
				PeerAddr: eh._peer._name
			}
			//let response_payload = await channel.queryInfo(peer);
			if (response_payload) {
			//	logger.debug(response_payload);
				return response_payload;
			} else {
				logger.error('response_payload is null');
				return 'response_payload is null';
			}
		});

	} catch (error) {
		logger.error('Failed to query due to error: ' + error.stack ? error.stack : error);
		return error.toString();
	}
};
exports.queryChaincode = queryChaincode;
exports.getBlockByNumber = getBlockByNumber;
exports.getTransactionByID = getTransactionByID;
exports.getBlockByHash = getBlockByHash;
exports.getChainInfo = getChainInfo;
exports.getInstalledChaincodes = getInstalledChaincodes;
exports.getChannels = getChannels;
exports.getOrgPeerInfo = getOrgPeerInfo;
exports.getChaincodesbyId = getChaincodesbyId;