'use strict';
var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var helper = require('./helper.js');
var logger = helper.getLogger('instantiate-chaincode');

var instantiateChaincode = async function (peers, channelName, chaincodeName, chaincodeVersion, chaincodeType, functionName, args, username, org_name) {
	console.log('\n\n============ Instantiate chaincode on channel ' + channelName +
		' ============\n');
	var error_message = null;

	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
		console.log('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);
		if (!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			logger.error(message);
			throw new Error(message);
		}
		var tx_id = client.newTransactionID(true); // Get an admin based transactionID
		// An admin based transactionID will
		// indicate that admin identity should
		// be used to sign the proposal request.
		// will need the transaction ID string for the event registration later
		var deployId = tx_id.getTransactionID();

		// send proposal to endorser
		var request = {
			targets: peers,
			chaincodeId: chaincodeName,
			chaincodeType: chaincodeType,
			chaincodeVersion: chaincodeVersion,
			args: args,
			txId: tx_id,
			

		};

		if (functionName)
			request.fcn = functionName;

		let results = await channel.sendInstantiateProposal(request, 300000); //instantiate takes much longer

		// the returned object has both the endorsement results
		// and the actual proposal, the proposal will be needed
		// later when we send a transaction to the orderer
		var proposalResponses = results[0];
		var proposal = results[1];

		// lets have a look at the responses to see if they are
		// all good, if good they will also include signatures
		// required to be committed
		var all_good = true;
		for (var i in proposalResponses) {
			let one_good = false;
			if (proposalResponses && proposalResponses[i].response &&
				proposalResponses[i].response.status === 200) {
				one_good = true;
				console.log('instantiate proposal was good');
			} else {
				logger.error('instantiate proposal was bad');
			}
			all_good = all_good & one_good;
		}

		if (all_good) {
			console.log(util.format(
				'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
				proposalResponses[0].response.status, proposalResponses[0].response.message,
				proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));

			// wait for the channel-based event hub to tell us that the
			// instantiate transaction was committed on the peer
			var promises = [];
			let event_hubs = channel.getChannelEventHubsForOrg();
			console.log('found %s eventhubs for this organization %s', event_hubs.length, org_name);
			event_hubs.forEach((eh) => {
				let instantiateEventPromise = new Promise((resolve, reject) => {
					console.log('instantiateEventPromise - setting up event');
					let event_timeout = setTimeout(() => {
						let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
						logger.error(message);
						eh.disconnect();
					}, 80000);
					eh.registerTxEvent(deployId, (tx, code, block_num) => {
							console.log('The chaincode instantiate transaction has been committed on peer %s', eh.getPeerAddr());
							console.log('Transaction %s has status of %s in blocl %s', tx, code, block_num);
							clearTimeout(event_timeout);

							if (code !== 'VALID') {
								let message = until.format('The chaincode instantiate transaction was invalid, code:%s', code);
								logger.error(message);
								reject(new Error(message));
							} else {
								let message = 'The chaincode instantiate transaction was valid.';
								console.log(message);
								resolve(message);
							}
						}, (err) => {
							clearTimeout(event_timeout);
							logger.error(err);
							reject(err);
						},
						// the default for 'unregister' is true for transaction listeners
						// so no real need to set here, however for 'disconnect'
						// the default is false as most event hubs are long running
						// in this use case we are using it only once
						{
							unregister: true,
							disconnect: true
						}
					);
					eh.connect();
				});
				promises.push(instantiateEventPromise);
			});

			var orderer_request = {
				txId: tx_id, // must include the transaction id so that the outbound
				// transaction to the orderer will be signed by the admin
				// id as was the proposal above, notice that transactionID
				// generated above was based on the admin id not the current
				// user assigned to the 'client' instance.
				proposalResponses: proposalResponses,
				proposal: proposal
			};
			var sendPromise = channel.sendTransaction(orderer_request);
			// put the send to the orderer last so that the events get registered and
			// are ready for the orderering and committing
			promises.push(sendPromise);
			let results = await Promise.all(promises);
			console.log(util.format('------->>> R E S P O N S E : %j', results));
			let response = results.pop(); //  orderer results are last in the results
			if (response.status === 'SUCCESS') {
				//console.log('Successfully sent transaction to the orderer.');
				console.log('Successfully sent transaction to the orderer.');
			} else {
				error_message = util.format('Failed to order the transaction. Error code: %s', response.status);
				console.log(error_message);
			}

			// now see what each of the event hubs reported
			for (let i in results) {
				let event_hub_result = results[i];
				let event_hub = event_hubs[i];
				console.log('Event results for event hub :%s', event_hub.getPeerAddr());
				if (typeof event_hub_result === 'string') {
					console.log(event_hub_result);
				} else {
					if (!error_message) error_message = event_hub_result.toString();
					console.log(event_hub_result.toString());
				}
			}
		} else {
			error_message = util.format('Failed to send Proposal and receive all bad ProposalResponse');
			console.log(error_message);
		}
	} catch (error) {
		//logger.error('Failed to send instantiate due to error: ' + error.stack ? error.stack : error);
		error_message = error.toString();
	}

	if (!error_message) {
		let message = util.format(
			'Successfully instantiate chaingcode in organization %s to the channel \'%s\'',
			org_name, channelName);
		//console.log(message);
		// build a response to send back to the REST caller
		let response = {
			status: "Success",
			message: message
		};
		return response;
	} else {
		let message = util.format('Failed to instantiate. cause:%s', error_message);
		let reserror = {
			status: "Failed",
			message: message
		};
		//logger.error(message);
		//	throw new Error(message);
		return reserror;
	}
};
exports.instantiateChaincode = instantiateChaincode;
