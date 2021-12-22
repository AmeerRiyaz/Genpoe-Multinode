/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function registerUser(user,userOrg,attr) {
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '/home/cdac/fabric-samples/fabcar/javascript/generalpoechannel_connection_for_nodesdk.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca1.cdachorg.cdac.in'].url;
        
        const ca = new FabricCAServices(caURL);
        console.log("ca  ::",ca)

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(user);
        if (userIdentity) {
            console.log('An identity for the user "appUser1" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            enrollmentID: user,
				affiliation: 'org1.department1',//userOrg.toLowerCase(),// + '.esec',
				attrs: [{
					name: "role",
					value: "client",
					ecert: true
				}]
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: user,
            enrollmentSecret: secret
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'cdachorg-cdac-in',
            type: 'X.509',
        };
        await wallet.put(user, x509Identity);
        console.log('Successfully registered and enrolled admin user "appUser1" and imported it into the wallet');
        var response = {
            status: "Success",
            //secret: user._enrollmentSecret,
            message: user + ' enrolled Successfully'
        };
        return response;

    } catch (error) {
        console.error(`Failed to register user "appUser1": ${error}`);
        let errresp = {
            status: "Failed",
            message: 'User was not enrolled'
        };
        return errresp;
        // process.exit(1);
        // return
    }
}

//registerUser();
 module.exports.registerUser=registerUser;