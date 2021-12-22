

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
// const connectionProfile = yaml.safeLoad(data);
async function query(user,fcn,args) {
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
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        console.log("gateway")
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: true, asLocalhost: true } });
        console.log("connected")
        const network = await gateway.getNetwork('generalpoechannel');
        const contract = network.getContract('genpoe');
        await contract.evaluateTransaction(fcn,...args);
        console.log('Transaction has been submitted');

        await gateway.disconnect();
    }
    catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }

    // let message = await invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, issuedByUser, issuedByOrg); 
}
// test();
module.exports.query = query;