/*
Chaincode for storing logs from cloud on blockchain for Property Management System.
Author: Sandeep Romana
Date: 07-02-2019
Code based on sample chaincodes from hyperledger fabric-samples repo.
Copyright(R) - 2019, Center For Development of Advanced Computing, Hyderabad.
CLOG VERSION 1.0
*/

/* The peer chaincode invoke command allows administrators to call chaincode 
functions on a peer using the supplied arguments. The transaction is recorded on the blockchain.

The peer chaincode query command allows the chaincode to be queried by calling 
the Invoke method on the chaincode. The difference between the query and the 
invoke subcommands is that, on successful response, invoke proceeds to submit a 
transaction to the orderer whereas query just outputs the response, successful 
or otherwise, to stdout. Thus the transaction is not recorded on the blockchain */

const shim = require('fabric-shim');
//const util = require('util');
//const ClientIdentity = require('fabric-shim').ClientIdentity;
//var validator = require('validator');
//var equal = require('fast-deep-equal');

let Chaincode = class {

    // initialize the chaincode
    async Init(stub) {
        console.info('=========== Instantiated cloud logs chaincode ===========');
        return shim.success();
    }

    /* Will invoke a specific function requested by the user. All the supported functions can be invoked from here.*/
    /* Access Control: None */
    async Invoke(stub) {

        console.info('=========== Invoking the requested functionality ===========');

        let ret = stub.getFunctionAndParameters();

        console.info(ret);

        let method = this[ret.fcn];

        if (!method) {
            console.error('no function of name:' + ret.fcn + ' found');
            throw new Error('Received unknown function ' + ret.fcn + ' invocation');
        }
        try {
            let payload = await method(stub, ret.params);
            return shim.success(payload);
        } catch (err) {
            console.log(err);
            return shim.error(err);
        }
    }

    /* Dummy init function for use with REST as it requires some function to be passed during instantiation */
    /* Access Control: None */
    async initCLogLedger(stub, arg) {

        if (arg.length != 1) {
            throw new Error('Invalid args. Expects no args');
        }

        console.info('============= Initializing Ledger Done===========');
    }

    /* Allows to query range of logs based on logId. Results will be limited by the totalQueryLimit defined in core.yaml */
    /* Access Control: None */
    async queryCLogRange(stub, arg) {

        console.info('=========== Quering Range of Logs ===========');

        var args = JSON.parse(arg);
        console.log(args);                        // for debugging

        let startKey = args.startLogId;
        let endKey = args.endLogId;

        let recordsIterator = await stub.getStateByRange(startKey, endKey); //get the range of log records
        let allResults = [];    // empty array to contain range of logs

        while(true) {
            let item = await recordsIterator.next();

            if( item.value && item.value.value.toString()) {
                console.log(' ========== Quering Record ============ ');
                let jsonRecord = {};
                console.log(item.value.value.toString('utf8')); // for debugging
                jsonRecord.logId = item.value.logId;

                try{
                    jsonRecord.record = JSON.parse(item.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRecord.record = item.value.value.toString('utf8');
                }

                allResults.push(jsonRecord);
            }

            if(item.done) {
                console.info('=========== End of Iterator ===========');
                await recordsIterator.close();
                console.log(allResults);        // for debugging
                break;
            }
        }

        return Buffer.from(JSON.stringify(allResults));
    }

    /* Allows to query a specific log record based on log id. */
    /* Access Control: None */
    async queryCLog(stub, arg) {

        console.info('=========== Quering Specific Log ===========');        

        var record = JSON.parse(arg);
        console.log(record);                        // for debugging

        let logId = record.logId;
        let recordAsBytes = await stub.getState(logId); //get the log record from chaincode state

        if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
            throw new Error(logId + ' does not exist: Try with other log id.');
        }

        console.log(recordAsBytes.toString());

        console.info('=========== Quering Specific LogId Done ===========');

        return recordAsBytes;
    }

    /* Will allow to record log on the blockchain */
    /* Access Control: None */
    async recordCLog(stub, arg) {

        console.info('============= Recording Log ===========');        

        var record = JSON.parse(arg);
        console.log(record);                        // for debugging

        let recordAsBytes = await stub.getState(record.logId);
        if (!recordAsBytes || recordAsBytes.toString().length <= 0) {

            record.txId = stub.getTxID(); // Autofetch

            await stub.putState(record.logId, Buffer.from(JSON.stringify(record)));

            console.log('txid: ' + record.txId); // for ease of access during testing
        } else
            throw new Error('Log with Id ' + record.logId + ' is already recorded');

        console.info('============= Recording Log Done ===========');
    }
};

shim.start(new Chaincode());

// EOF