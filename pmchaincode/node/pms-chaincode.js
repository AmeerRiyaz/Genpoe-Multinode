/*
Chaincode for Property Management System - checkslip based.
Author: Sandeep Romana
Date: 22-01-2019
Code based on sample chaincodes from hyperledger fabric-samples repo.
Copyright(R) - 2018, Center For Development of Advanced Computing. Hyderabad.
PMS VERSION 3.0
*/

/* The peer chaincode invoke command allows administrators to call chaincode 
functions on a peer using the supplied arguments. The transaction is recorded on the blockchain.

The peer chaincode query command allows the chaincode to be queried by calling 
the Invoke method on the chaincode. The difference between the query and the 
invoke subcommands is that, on successful response, invoke proceeds to submit a 
transaction to the orderer whereas query just outputs the response, successful 
or otherwise, to stdout. Thus the transaction is not recorded on the blockchain */

const shim = require('fabric-shim');
const util = require('util');
const ClientIdentity = require('fabric-shim').ClientIdentity;
var validator = require('validator');
var equal = require('deep-equal');

let Chaincode = class {

    // initialize the chaincode
    async Init(stub) {
        console.info('=========== Instantiated property management chaincode ===========');
        return shim.success();
    }

    /* Will invoke a specific function requested by the user. All the supported functions can be invoked from here.*/
    /*Access Control: None*/
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
    async initPropertyLedger(stub, arg) {

        if (arg.length != 1) {
            throw new Error('Invalid args. Expects no args');
        }

        console.info('============= Initializing Ledger Done===========');
    }

    /* Allows to query a specific property based on the unique property id. Will return all the values recorded in the key:value pair
    for a specific property. This function could be invoked by a Citizen or SRO/MRO. */
    /*Access Control: Reader, Writer*/
    async queryByPropertyId(stub, arg) {

        // No need to check attribute based access permissions as all roles can call this function

        console.info('=========== Quering Specific Property ===========');

        let cid = new ClientIdentity(stub);

        //if (cid.assertAttributeValue('role', 'reader') ||
        //    cid.assertAttributeValue('role', 'writer') ) { // explicit role validation

        var record = JSON.parse(arg);
        console.log(record); // for debugging

        let uniquePropertyId = record.uniquePropertyId;
        let recordAsBytes = await stub.getState(uniquePropertyId); //get the property record from chaincode state

        if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
            throw new Error(uniquePropertyId + ' does not exist: Try with other property id.');
        }

        console.log(recordAsBytes.toString());

        console.info('=========== Quering Specific Property Done ===========');

        return recordAsBytes;
        //}else {
        //    throw new Error('USER doesnt have required access for query by property-id');
        //}
    }

     /* Allows to query a specific property based on the regdoc No. Will return all the values recorded in the key:value pair
    for a specific property. This function could be invoked by a Citizen or SRO/MRO. */
    /*Access Control: Reader, Writer*/
    async queryByRegDocNo(stub, arg) {

        // No need to check attribute based access permissions as all roles can call this function

        console.info('=========== Quering Specific Property ===========');

        let cid = new ClientIdentity(stub);

        //if (cid.assertAttributeValue('role', 'reader') ||
        //    cid.assertAttributeValue('role', 'writer') ) { // explicit role validation

        var record = JSON.parse(arg);
        console.log(record); // for debugging

        let uniqueId = record.regDocNo + record.regDocYear;
        let recordAsBytes = await stub.getState(uniqueId); //get the property record from chaincode state

        if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
            throw new Error(uniqueId + ' does not exist: Try with other property id.');
        }

        console.log(recordAsBytes.toString());

        console.info('=========== Quering Specific Property Done ===========');

        return recordAsBytes;
        //}else {
        //    throw new Error('USER doesnt have required access for query by property-id');
        //}
    }

    /* Will retrieve the history of the property based on the unique property id. This means that the function returns all the 
    transactions that has been committed on particular property. Helpfull for Encumbrance Certificate/Search. This
    function could be allowed to be invoked by a Citizen or SRO/MRO. */
    /*Access Control: Reader, Writer */
    async getHistoryForPropID(stub, arg) {

        // No need to check attribute based access permissions as all roles can call this function

        console.info('============= Getting History for Property ===========');

        let cid = new ClientIdentity(stub);

        //if (cid.assertAttributeValue('role', 'reader') ||
        //    cid.assertAttributeValue('role', 'writer')) { // explicit role vaildation

        var record = JSON.parse(arg);
        console.log(record); // for debugging

        let uniquePropertyId = record.uniquePropertyId;

        let recordAsBytes = await stub.getState(uniquePropertyId); //get the property from chaincode state
        if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
            throw new Error(uniquePropertyId + ' does not exist: Try with other property id.');
        }

        let resultsIterator = await stub.getHistoryForKey(uniquePropertyId);

        let allResults = []; // this list will contain results

        while (true) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {

                console.log(' ========== Quering Object ============ ');

                let jsonRes = {}; // empty object

                console.log(res.value.value.toString('utf8'));
                jsonRes.TxID = res.value.tx_id;
                jsonRes.Timestamp = res.value.timestamp;

                try {
                    jsonRes.Value = JSON.parse(res.value.value.toString('utf8')); // store record in object
                } catch (err) {
                    console.log(err);
                    jsonRes.Value = res.value.value.toString('utf8');
                }

                allResults.push(jsonRes); // push JSON object to list
            }

            if (res.done) { // when iterator res is past end of iterated sequence

                console.log(' ========== end of data ============ ');

                await resultsIterator.close();
                console.info(allResults);
                break;
            }
        }

        return Buffer.from(JSON.stringify(allResults));
        //} else {
        //    throw new Error('USER doesnt have required access to query property history');
        //}
    }

    /* Will retrieve the history of the property based on the regdocNo and regdoc year. This means that the function returns all the 
    transactions that has been committed on particular property. Helpfull for Encumbrance Certificate/Search. This
    function could be allowed to be invoked by a Citizen or SRO/MRO. */
    /*Access Control: Reader, Writer */
    async getHistoryForRegDocNo(stub, arg) {

        // No need to check attribute based access permissions as all roles can call this function

        console.info('============= Getting History for Property ===========');

        let cid = new ClientIdentity(stub);

        //if (cid.assertAttributeValue('role', 'reader') ||
        //    cid.assertAttributeValue('role', 'writer')) { // explicit role vaildation

        var record = JSON.parse(arg);
        console.log(record); // for debugging

        let uniqueId = record.regDocNo + record.regDocYear;

        let recordAsBytes = await stub.getState(uniqueId); //get the property from chaincode state
        if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
            throw new Error(uniqueId + ' does not exist: Try with other property id.');
        }

        //let resultsIterator = await stub.getHistoryForKey(uniqueId);
	    //
	        console.log(recordAsBytes);
        var jsonRecord = JSON.parse(recordAsBytes.toString());
            console.log(jsonRecord);
        //let resultsIterator = await stub.getHistoryForKey(uniqueId);
        let resultsIterator = await stub.getHistoryForKey(jsonRecord.uniquePropertyId);


        let allResults = []; // this list will contain results

        while (true) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {

                console.log(' ========== Quering Object ============ ');

                let jsonRes = {}; // empty object

                console.log(res.value.value.toString('utf8'));
                jsonRes.TxID = res.value.tx_id;
                jsonRes.Timestamp = res.value.timestamp;

                try {
                    jsonRes.Value = JSON.parse(res.value.value.toString('utf8')); // store record in object
                } catch (err) {
                    console.log(err);
                    jsonRes.Value = res.value.value.toString('utf8');
                }

                allResults.push(jsonRes); // push JSON object to list
            }

            if (res.done) { // when iterator res is past end of iterated sequence

                console.log(' ========== end of data ============ ');

                await resultsIterator.close();
                console.info(allResults);
                break;
            }
        }

        return Buffer.from(JSON.stringify(allResults));
        //} else {
        //    throw new Error('USER doesnt have required access to query property history');
        //}
    }

    /* Will retrieve the history of the checkslip. */
    /*Access Control: Reader, Writer */
    async getHistoryForCheckslip(stub, arg) {

        // No need to check attribute based access permissions as all roles can call this function

        console.info('============= Getting History for Checkslip ===========');

        let cid = new ClientIdentity(stub);

        //if (cid.assertAttributeValue('role', 'reader') ||
        //    cid.assertAttributeValue('role', 'writer')) { // explicit role vaildation

        var record = JSON.parse(arg);
        console.log(record); // for debugging

        let checkslipId = record.checkslipNo + record.checkslipYear;

        let recordAsBytes = await stub.getState(checkslipId); //get the property from chaincode state
        if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
            throw new Error('checkslip ' + checkslipId + ' does not exist');
        }

        let resultsIterator = await stub.getHistoryForKey(checkslipId);

        let allResults = []; // this list will contain results

        while (true) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {

                console.log(' ========== Quering Object ============ ');

                let jsonRes = {}; // empty object

                console.log(res.value.value.toString('utf8'));
                jsonRes.TxID = res.value.tx_id;
                jsonRes.Timestamp = res.value.timestamp;

                try {
                    jsonRes.Value = JSON.parse(res.value.value.toString('utf8')); // store record in object
                } catch (err) {
                    console.log(err);
                    jsonRes.Value = res.value.value.toString('utf8');
                }

                allResults.push(jsonRes); // push JSON object to list
            }

            if (res.done) { // when iterator res is past end of iterated sequence

                console.log(' ========== end of data ============ ');

                await resultsIterator.close();
                console.info(allResults);
                break;
            }
        }

        return Buffer.from(JSON.stringify(allResults));
        //} else {
        //    throw new Error('USER doesnt have required access to query property history');
        //}
    }

    /* Allows updating the poe-transaction-id to property record. 
    Iff record has valid poe-transaction-id it will regarded as fully registered. */
    /* Access Control: writer */
    async updatePoeTxId(stub, arg) {

        console.log('============= updating poe transaction id =============');

        let cid = new ClientIdentity(stub);

        //if (cid.assertAttributeValue('role', 'writer')) {

        console.info('writer is updating poe-transaction-id');

        var record = JSON.parse(arg);
        console.log(record); // for debugging

        let uniquePropertyId = record.uniquePropertyId;

        let jsonRecord = {}; // empty object

        let recordAsBytes = await stub.getState(uniquePropertyId); //get the property from chaincode state
        if (recordAsBytes.toString().length > 0) { // property id exists

            jsonRecord = JSON.parse(recordAsBytes.toString());

            if (jsonRecord.RegDocNo === record.RegDocNo) {

                jsonRecord.poeTransactionId = record.poeTransactionId; // update poe transaction id in property id
                jsonRecord.txId = stub.getTxID(); // update the transaction id also

                //console.log(JSON.stringify(jsonRecord)); // for ease of debugging

                await stub.putState(jsonRecord.uniquePropertyId, Buffer.from(JSON.stringify(jsonRecord)));
            } else {
                throw new Error("mismatch for unique-property-id and corresponding regular-document-no");
            }

        } else { // if property id does not exist
            throw new Error(uniquePropertyId + ' does not exist: Try with other propertyId.');
        }

        //} else {
        //    throw new Error('USER doesnt have required access to update POE transaction Id');
        //}

        console.info('============= Updating poe transaction id done =============');
    }

    /* Records a new regular document on the blockchain */
    /*Access Control: Writer*/
    async recordRegularDocument(stub, arg) {

        console.info('============= Recording a regular document ===========');

        let cid = new ClientIdentity(stub); // "stub" is the ChaincodeStub object passed to Init() and Invoke() methods

        //if (cid.assertAttributeValue('role', 'writer')) {

        console.info('===== The current user role is writer and can record the regular document =====');

        var record = JSON.parse(arg);
        console.log(record); // for debugging

        let checkslipRecordAsBytes = await stub.getState(record.checkslipNo + record.checkslipYear);
        if (!checkslipRecordAsBytes || checkslipRecordAsBytes.toString().length <= 0) {
            throw new Error('Checkslip ' + record.checkslipNo + record.checkslipYear + ' does not exist.');
        }

        let checkslipRecord = JSON.parse(checkslipRecordAsBytes);

        checkslipRecord.majorTable.registrationDate = record.registrationDate;
        checkslipRecord.regDocNo = record.regDocNo;
        checkslipRecord.regDocYear = record.regDocYear;
        checkslipRecord.poeTransactionId = 0;
        checkslipRecord.txId = stub.getTxID(); // update the transaction Id
        let uniqueId = checkslipRecord.regDocNo + checkslipRecord.regDocYear;

        await stub.putState(checkslipRecord.uniquePropertyId, Buffer.from(JSON.stringify(checkslipRecord)));
        await stub.putState(uniqueId, Buffer.from(JSON.stringify(checkslipRecord)));

        console.log('txid: ' + record.txId); // for ease of access during testing

        //} else {
        //    throw new Error('USER doesnt have required access for recording regular document');
        //}

        console.info('============= Recording regular document Done ===========');
    }

    /* Allows reverting back property record info to original in case of checkslip expiry */
    /*Access Control: Writer*/
    async revertbackCheckslip(stub, arg) {

        console.info('============= Revertback checkslip as it has expired ===========');

        let cid = new ClientIdentity(stub); // "stub" is the ChaincodeStub object passed to Init() and Invoke() methods

        //if (cid.assertAttributeValue('role', 'writer')) {

        var record = JSON.parse(arg);
        console.log(record); // for debugging    

        let checkslipRecordAsBytes = await stub.getState(record.checkslipNo + record.checkslipYear);
        if (!checkslipRecordAsBytes || checkslipRecordAsBytes.toString().length <= 0) {
            throw new Error('checkslip ' + args[0] + ' does not exist.');
        }

        //let checkslipRecord = JSON.parse(checkslipRecordAsBytes);

        //checkslipRecord.txId = stub.getTxID(); // Autofetch

        await stub.deleteState(record.checkslipNo + record.checkslipYear);

        console.log('txid: ' + record.txId); // for ease of access during testing

        //} else {
        //    throw new Error('USER doesnt have required access to record checkslip');
        //}

        console.info('============= Revertback checkslip Done ===========');
    }

    /* Implements logic to update information in checkslip */
    /*Access Control: Writer*/
    async updateCheckslip(stub, arg) {

        console.info('============= Updating checkslip data ===========');

        let cid = new ClientIdentity(stub); // "stub" is the ChaincodeStub object passed to Init() and Invoke() methods

        //if (cid.assertAttributeValue('role', 'writer')) {

        console.info('============= The current user role is Writer and can update the checkslip info ===========');

        var record = JSON.parse(arg);
        console.log(record); // for debugging

        let recordAsBytes = await stub.getState(record.checkslipNo + record.checkslipYear);
        if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
            throw new Error('Cant update checkslip as ' + record.checkslipNo + record.checkslipYear + ' does not exist.');
        }

        let checkslipRecord = JSON.parse(recordAsBytes);

        if (equal(record.excutant, checkslipRecord.excutant)) {
            record.txId = stub.getTxID(); // Autofetch

            await stub.putState(record.checkslipNo + record.checkslipYear, Buffer.from(JSON.stringify(record)));

            console.log('txid: ' + record.txId); // for ease of access during testing
        } else
            throw new Error('Executant validation failed');

        //} else {
        //    throw new Error('USER doesnt have required access to update checkslip data');
        //}

        console.info('============= Updating checkslip info Done ===========');
    }

    /* Implements logic to record checkslip. Only 1 checkslip on 1 property (UID) is allowed. */
    /*Access Control: Writer*/
    async recordCheckslip(stub, arg) {

        let cid = new ClientIdentity(stub); // "stub" is the ChaincodeStub object passed to Init() and Invoke() methods

        //if (cid.assertAttributeValue('role', 'writer')) {

        console.info('============= The current user role is Writer and can record the checkslip ===========');

        var record = JSON.parse(arg);
        console.log(record); // for debugging            

        record.txId = stub.getTxID(); // Autofetch
        await stub.putState(record.uniquePropertyId, Buffer.from(JSON.stringify(record)));
        await stub.putState(record.checkslipNo + record.checkslipYear, Buffer.from(JSON.stringify(record)));
        console.log('txid: ' + record.txId); // for ease of access during testing

	    //below code commented as we are checking at application level
/*        let recordAsBytes = await stub.getState(record.uniquePropertyId);
        if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
                record.txId = stub.getTxID(); // Autofetch
                await stub.putState(record.checkslipNo + record.checkslipYear, Buffer.from(JSON.stringify(record)));
            throw new Error('record with unique property Id ' + record.uniquePropertyId + ' does not exist: Try with other property ID.');
        }

        let savedRecord = JSON.parse(recordAsBytes);

        //if (equal(record.excutant, savedRecord.claiment)) { // changed because structure containing PAN, Aadhar while recording
        if (equal(record.excutant.name, savedRecord.claiment.name) && equal(record.excutant.rcode, savedRecord.claiment.rcode) &&
equal(record.excutant.rname, savedRecord.claiment.rname)) {

            let checkslipRecord = await stub.getState(record.checkslipNo + record.checkslipYear);
            if (!checkslipRecord || checkslipRecord.toString().length <= 0) {

                record.txId = stub.getTxID(); // Autofetch
                await stub.putState(record.checkslipNo + record.checkslipYear, Buffer.from(JSON.stringify(record)));
                console.log('txid: ' + record.txId); // for ease of access during testing

            } else
                throw new Error('checkslip' + record.checkslipNo + record.checkslipYear + ' exists.');
        } else
            throw new Error('Executant validation failed');

        //} else {
        //    throw new Error('USER doesnt have required access to record checkslip');
        //}
*/
        console.info('============= Recording checkslip Done ===========');
    }

    /* Will allow to record property on the blockchain */
    /*Access Control: Writer*/
    async recordProperty(stub, arg) {

        console.info('============= Recording property on blockchain ===========');

        let cid = new ClientIdentity(stub); // "stub" is the ChaincodeStub object passed to Init() and Invoke() methods

        //if (cid.assertAttributeValue('role', 'writer')) {

        var record = JSON.parse(arg);
        console.log(record); // for debugging

        /*record.ExecutantClaiment.forEach(function(element){
            console.log(element) ;
        });*/

        let recordAsBytes = await stub.getState(record.uniquePropertyId);
        if (!recordAsBytes || recordAsBytes.toString().length <= 0) {

            record.txId = stub.getTxID(); // Autofetch
            await stub.putState(record.uniquePropertyId, Buffer.from(JSON.stringify(record)));
            await stub.putState(record.regDocNo + record.regDocYear, Buffer.from(JSON.stringify(record)));
            
        } else {
            console.log('Property with UID ' + record.uniquePropertyId + ' is already recorded. Processing further.');

            //let savedRecord = JSON.parse(recordAsBytes);
            //if (equal(record.excutant, savedRecord.claiment)) {

                    record.txId = stub.getTxID(); // Autofetch
                    await stub.putState(record.uniquePropertyId, Buffer.from(JSON.stringify(record)));
                    await stub.putState(record.regDocNo + record.regDocYear, Buffer.from(JSON.stringify(record)));

            //} else
            //    throw new Error('recordProperty - Executant validation failed');
        }
        
        console.log('txid: ' + record.txId); // for ease of access during testing
        //}

        console.info('============= Recording property Done ===========');
    }
};

shim.start(new Chaincode());

// EOF
