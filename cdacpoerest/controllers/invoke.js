

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { channel } = require('diagnostics_channel');
// const connectionProfile = yaml.safeLoad(data);
async function invoke(user,channel,cc,fcn,arg) {
    var error_message = null;
	var tx_id_string = null;
    var result
    try {
        // const ccpPath = path.resolve(__dirname,'./hyperledger/network-config.json');
        const data = fs.readFileSync('/home/cdac/genpoe-2.2.3/cdacpoerest/hyperledger/network-config_new.yaml');
        console.log("data")
        // let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        let ccp = yaml.safeLoad(data);
        console.log(ccp)
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const identity = await wallet.get(user);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        console.log("gateway")
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: false } });
        console.log("connected")
        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(cc);
        let args=[arg]
        console.log(args)
        // let result=await contract.submitTransaction(fcn,...args);
        let ct= contract.createTransaction(fcn)
        tx_id_string=ct.getTransactionId()
        //result =await ct.setEndorsingPeers(["peer0.cdachorg.cdac.in"]).submit(...arg)
        result =await ct.submit(...arg)
        // result =await ct.setEndorsingPeers(["peer0.cdachorg.cdac.in","peer0.demoorg.cdac.in","peer0.actsorg.cdac.in","peer1.cdachorg.cdac.in","peer1.demoorg.cdac.in","peer1.actsorg.cdac.in"]).submit(...arg)

        console.log('Transaction has been submitted');
        // console.log(txId)

        await gateway.disconnect();
        // return result
    }
    catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        error_message = error.toString();
        //process.exit(1);
    }
    if (!error_message) {
		
		let respresult;
		respresult = {
			status: "Success",
			txId: tx_id_string
		}
		return respresult;


	} else {
		// let message = util.format('Failed to invoke chaincode. cause:%s', error_message);
		// logger.error(message);
		// var msg = message.split('at');
		// let errmsg = msg[0];
		//  msg=errmsg.split('{')
		//  errmsg=msg[1]
		//  msg=errmsg.split('}')
		//  errmsg=msg[0]
		//console.log(msg[3]+msg[4]);
		//var msgerr = msg.split(':');
		//console.log(msgerr);
		let reserror = {
			status: "Failed",
			//message: message
			message: result
		};
		return reserror;
		//return Buffer.from(JSON.stringify(reserror));
		//throw new Error(message);
	}

    // let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg); 
}
//invoke();
module.exports.invoke = invoke;
