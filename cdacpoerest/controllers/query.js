

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { channel } = require('diagnostics_channel');
// const connectionProfile = yaml.safeLoad(data);
async function query(user,channel,cc,fcn,args) {
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
            console.log('An identity for the user "appUser1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        console.log("gateway")
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: false } });
        console.log("connected")
        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(cc);
        let response_payloads= await contract.evaluateTransaction(fcn,...args);
        let msg=JSON.parse(response_payloads)[0]
        console.log(JSON.parse(response_payloads))
        console.log(msg.found)
        let resp={}

        if(msg.found==true){
            resp.status="Success"
            resp.message="Found"
            resp.result=msg
        }else if (msg.found==false){
            resp.status="Success"
            resp.message="not found"
            resp.result=msg
        } else{
            resp.status="Failure"
            resp.message="Error"
            resp.result=""
        }

        console.log('Transaction has been submitted');
        console.log("data")
        
        await gateway.disconnect();
        return resp
    }
    catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        // process.exit(1);
    }

    // let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg); 
}
async function queryHash(user,channel,cc,fcn,args) {
    try {
        // const ccpPath = path.resolve(__dirname,'./hyperledger/network-config.json');
        const data = fs.readFileSync('/home/cdac/genpoe/cdacpoerest/hyperledger/network-config_new.yaml');
        console.log("data")
        // let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        let ccp = yaml.safeLoad(data);
        console.log(ccp)
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const identity = await wallet.get('appUser1');
        if (!identity) {
            console.log('An identity for the user "appUser1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        console.log("gateway")
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
        console.log("connected")
        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(cc);
        let response_payloads= await contract.evaluateTransaction(fcn,...args);
        let msg=JSON.parse(response_payloads)
        // console.log(JSON.parse(response_payloads))
        console.log(msg.found)
        let resp={}

        if(msg.found==true){
            resp.status="Success"
            resp.message="Found"
            resp.result=msg
        }else if (msg.found==false){
            resp.status="Success"
            resp.message="not found"
            resp.result=msg
        } else{
            resp.status="Failure"
            resp.message="Error"
            resp.result=""
        }

        console.log('Transaction has been submitted');
        console.log("data")
        
        await gateway.disconnect();
        return resp
    }
    catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        // process.exit(1);
    }

    // let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg); 
}
//query();
module.exports.query = query;
module.exports.queryHash = queryHash;
