/*
Chaincode for Property Management System - checkslip based.
Author: Sandeep Romana
Date: 13-11-2018
Code based on sample chaincodes from hyperledger fabric-samples repo.
Copyright(R) - 2018, Center For Development of Advanced Computing. Hyderabad.
PMSC VERSION 1.0
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

let Chaincode = class {

    // initialize the chaincode
    async Init(stub){
        console.info('=========== Instantiated property management chaincode ===========');
        return shim.success();
    }

    /* Will invoke a specific function requested by the user. All the supported functions can be invoked from here.*/
    /*Access Control: None*/
    async Invoke(stub){

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
    async initPropertyLedger(stub, args){
        
        if( args.length != 1 ){
            throw new Error('Invalid args. Expects no args');
        }
        
        console.info('============= Initializing Ledger Done===========');
    }

    /* Allows to query a specific property based on the unique property id. Will return all the values recorded in the key:value pair
    for a specific property. This function could be invoked by a Citizen or SRO/MRO. */
    /*Access Control: Reader, Writer, Creator*/
    async queryByPropertyId(stub, args){

        // No need to check attribute based access permissions as all roles can call this function

        console.info('=========== Quering Specific Property ===========');

        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting unique property id');
        }

        let cid = new ClientIdentity(stub);

        if (cid.assertAttributeValue('role', 'reader') || 
            cid.assertAttributeValue('role', 'writer') || 
            cid.assertAttributeValue('role', 'creator')) {  // explicit role validation

            let uniquePropertyId = args[0];
        
            let recordAsBytes = await stub.getState(uniquePropertyId); //get the property record from chaincode state
            
            if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
                throw new Error(uniquePropertyId + ' does not exist: Try with other property id.');
            }

            console.log(recordAsBytes.toString());
            console.info('=========== Quering Specific Property Done ===========');
        
            return recordAsBytes;
        }
        else {
            throw new Error('USER doesnt have required access for query by property id');
        }
    }

    /* Will retrieve the history of the property based on the unique property id. This means that the function returns all the 
    transactions that has been committed on particular property. Helpfull for Encumbrance Certificate/Search. This
    function could be allowed to be invoked by a Citizen or SRO/MRO. */
    /*Access Control: Reader, Writer, Creator */
    async getHistoryForPropID(stub, args){

        // No need to check attribute based access permissions as all roles can call this function

        console.info('============= Getting History for Property ===========');

        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting 1 : uniquePropertyId');
        }

        let cid = new ClientIdentity(stub);

        if (cid.assertAttributeValue('role', 'reader') || 
            cid.assertAttributeValue('role', 'writer') || 
            cid.assertAttributeValue('role', 'creator')) {      // explicit role vaildation

            let uniquePropertyId = args[0];

            let recordAsBytes = await stub.getState(uniquePropertyId); //get the property from chaincode state

            if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
                throw new Error(uniquePropertyId + ' does not exist: Try with other property id.');
            }

            let resultsIterator = await stub.getHistoryForKey(uniquePropertyId);          

            let allResults = []; // this list will contain results
            
            while(true)
            {
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
        }
        else {
            throw new Error('USER doesnt have required access to query property history');
        }
    }

    /* Will allow updating the poe transaction id to property record */
    /* Access Control: writer and Creator */
    async updatePoeTxId(stub, args){

        console.log('============= updating poe transaction id =============');

        if (args.length != 3) {
            throw new Error('Incorrect number of arguments. Expecting 3 : uniquePropertyId, checkslipId, poeTransactionId');
        }

        let cid = new ClientIdentity(stub); 

        if (cid.assertAttributeValue('role', 'writer') ||
            cid.assertAttributeValue('role', 'creator')) { 

                console.info('writer or creator is updating poe transaction id');

                let uniquePropertyId = args[0];
                     
                let jsonRecord = {}; // empty object

                let recordAsBytes = await stub.getState(uniquePropertyId); //get the property from chaincode state
                if (recordAsBytes.toString().length > 0) { // property id exists

                    jsonRecord = JSON.parse(recordAsBytes.toString());

                    //validate if poe transaction id is already updated 
                    if( jsonRecord.poeTransactionId === '0')
                    {
                        console.log('recording poe transaction id for first time for this record');
                    }
                    else {
                        console.log('updating poe transaction id for this record');
                    }

                        jsonRecord.poeTransactionId = args[2]; // update poe transaction id in property id
                        jsonRecord.txId = stub.getTxID(); // update the transaction id also

                        //console.log(JSON.stringify(jsonRecord)); // for ease of debugging
                        console.log(jsonRecord.assetVersion);
                        console.log(jsonRecord.uniquePropertyId);
                        console.log(jsonRecord.holderFullName);
                        console.log(jsonRecord.holderAadhaar);
                        console.log(jsonRecord.holderPan);
                        console.log(jsonRecord.holderFathersName);
                        console.log(jsonRecord.district);
                        console.log(jsonRecord.sro);
                        console.log(jsonRecord.subDivision);
                        console.log(jsonRecord.mandal);
                        console.log(jsonRecord.village);
                        console.log(jsonRecord.surveyNo);
                        console.log(jsonRecord.areaExtent);
                        console.log(jsonRecord.propertyCategory);
                        console.log(jsonRecord.landUse);
                        console.log(jsonRecord.witness1Name);
                        console.log(jsonRecord.witness1Aadhaar);
                        console.log(jsonRecord.witness1Address);
                        console.log(jsonRecord.witness2Name);
                        console.log(jsonRecord.witness2Aadhaar);
                        console.log(jsonRecord.witness2Address);
                        console.log(jsonRecord.poeTransactionId);
                        console.log(jsonRecord.txId);

                        await stub.putState(args[0], Buffer.from(JSON.stringify(jsonRecord)));
                    
                }else { // if property id does not exist
                    throw new Error(uniquePropertyId + ' does not exist: Try with other propertyId.');
                }
             
                //return Buffer.from(JSON.stringify(allResults));                
        }
        else {
            throw new Error('USER doesnt have required access to update POE transaction Id');
        }

        console.info('============= Updating poe transaction id done =============');
    }

    /* Will allow to record a new regular document on the blockchain */
    /*Access Control: Writer*/
    async recordRegularDocument(stub, args){
                
        console.info('============= Recording a regular document ===========');

        if (args.length != 10) {
            throw new Error('Incorrect number of arguments. Expecting 10: uniquePropertyId, chkslipId, witness1Name, witness1Aadhaar,' +
             'witness1Address, witness2Name, witness2Aadhaar, witness2Address, registrationDate, poeTransactionId');
        }

        let cid = new ClientIdentity(stub); // "stub" is the ChaincodeStub object passed to Init() and Invoke() methods
                        
        if (cid.assertAttributeValue('role', 'writer')) {   
            
            console.info('============= The current user role is writer and can record the regular document ===========');
 
            if( validator.isHash(args[0], 'sha256') &&       // uniquePropertyId
                (args[1].length <= 15) &&       // chkslipId
                (args[2].length <= 30) &&       // witness1Name
                (args[3].length === 12) &&      // witness1Aadhaar
                (args[4].length <= 150) &&      // witness1Address
                (args[5].length <= 30) &&       // witness2Name
                (args[6].length === 12) &&       // witness2Aadhaar
                (args[7].length <= 150) &&      // witness2Address
                (args[8].length === 10)          // registrationDate                //modified by sirisha
            ) {
                let poeTransactionId = '0';

                if(args[9] === '0') // poeTransactionId NOT available at time of recording regular document
                    poeTransactionId = '0';                                          
                else if(args[9].length === 64) // poeTransactionId IS available at time of recording regular document
                    poeTransactionId = args[9];
                else {
                    throw new Error('Inavlid POE trsanction ID supplied ' + args[9]);
                }

                let recordAsBytes = await stub.getState(args[0]);
                
                if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
                    throw new Error('unique property with Id ' + args[0] + ' does not exist: Try with other unique property ID.');
                }

                let record = JSON.parse(recordAsBytes);

		console.log(record);
                if( record.uniquePropertyId === args[0] &&
                    record.chkslipId === args[1] )
                    {
                        record.witness1Name = args[2];
                        record.witness1Aadhaar = args[3];
                        record.witness1Address = args[4];
                        record.witness2Name = args[5];
                        record.witness2Aadhaar = args[6];
                        record.witness2Address = args[7];
                        record.registrationDate = args[8];
                        record.poeTransactionId = poeTransactionId;
                        record.txId = stub.getTxID();           // update the transaction Id
                    
                        await stub.putState(args[0], Buffer.from(JSON.stringify(record)));

                        console.log('txid: ' + record.txId); // for ease of access during testing
                }
                else
                    throw new Error('Unable to find record with unique property id' + args[0] + 'and checkslip id' + args[1] + 'combination.');
                
            } else{ 
                throw new Error('Invalid arguments passed. Try Again');
            }
        }
        else { 
            throw new Error('USER doesnt have required access for recording regular document');
        }
               
        console.info('============= Recording regular document Done ===========');
    }

    /* Will implement logic to update information in checkslip */
    /*Access Control: Writer*/
    async updateCheckslip(stub, args) {

        console.info('============= Generating new checkslip ===========');

        if (args.length != 10) {
            throw new Error('Incorrect number of arguments. Expecting 10 : uniquePropertyId, checkslipId, VendorFullName,' +
                'VendorAadhaar, VendorPan, VendorFatherName, VendeeFullName, VendeeAadhaar, VendeePan, VendeeFatherName');
        }

        let cid = new ClientIdentity(stub); // "stub" is the ChaincodeStub object passed to Init() and Invoke() methods

        if (cid.assertAttributeValue('role', 'writer')) {

            console.info('============= The current user role is Writer and can update the checkslip info ===========');

            if (
                validator.isHash(args[0], 'sha256') &&  // uniquePropertyId
                (args[1].length <= 15) &&        // checkslipId
                (args[2].length <= 30) &&       // vendorFullName
                (args[3].length === 12) &&      // vendorAadhaar
                (args[4].length === 10) &&      // vendorPan
                (args[5].length <= 30) &&       // vendorFathersName
                (args[6].length <= 30) &&       // vendeeFullName
                (args[7].length === 12) &&      // vendeeAadhaar
                (args[8].length === 10) &&      // vendeePan
                (args[9].length <= 30)          // vendeeFathersName
            ) {

                let recordAsBytes = await stub.getState(args[0]);

                if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
                    throw new Error('record with unique property Id ' + args[0] + ' does not exist: Try with other property ID.');
                }

                let record = JSON.parse(recordAsBytes);

                // validate if vendor is the holder of the property
                if (
                    (record.holderFullName === args[2]) &&
                    (record.holderAadhaar === args[3]) &&
                    (record.holderPan === args[4]) &&
                    (record.holderFathersName === args[5])
                ) {
                    if (record.chkslipId === args[1] )  // checkslip id is valid so go ahead
                    {
                        if(record.poeTransactionId.length === 64) {
                            throw new Error('cant update checkslip info as the POE of property is already recorded');
                        }
                        else {    
                            record.holderFullName = args[6];
                            record.holderAadhaar = args[7];
                            record.holderPan = args[8];
                            record.holderFathersName = args[9];
                            //record.poeTransactionId = '0';    // already zero from initial checkslip generation.
                            record.txId = stub.getTxID();   // Autofetch

                            await stub.putState(args[0], Buffer.from(JSON.stringify(record)));

                            console.log('txid: ' + record.txId); // for ease of access during testing
                        }
                    }
                    else {
                        throw new Error('checkslip with id ' + args[1] + 'does not exist');
                    }
                } else {
                    throw new Error('Vendor validation failed');
                }
            } else {
                throw new Error('Invaid arguments passed. Try Again');
            }
        }
        else {
            throw new Error('USER doesnt have required access to update checkslip info');
        }

        console.info('============= Updating checkslip info Done ===========');
    }

    /* Will implement logic to record checkslip */
    /*Access Control: Writer*/
    async recordCheckslip(stub, args){
        
        console.info('============= Generating new checkslip ===========');

        if (args.length != 10) {
            throw new Error('Incorrect number of arguments. Expecting 10 : uniquePropertyId, newcheckslipId, VendorFullName,' +
            'VendorAadhaar, VendorPan, VendorFatherName, VendeeFullName, VendeeAadhaar, VendeePan, VendeeFatherName');
        }

        let cid = new ClientIdentity(stub); // "stub" is the ChaincodeStub object passed to Init() and Invoke() methods

        if (cid.assertAttributeValue('role', 'writer')) { 
            
            console.info('============= The current user role is Writer and can record the checkslip ===========');
              
            if(
                validator.isHash(args[0], 'sha256') &&  // uniquePropertyId
                (args[1].length <= 15) &&        // checkslipId
                (args[2].length <= 30) &&       // vendorFullName
                (args[3].length === 12) &&      // vendorAadhaar
                (args[4].length === 10) &&      // vendorPan
                (args[5].length <= 30) &&       // vendorFathersName
                (args[6].length <= 30) &&       // vendeeFullName
                (args[7].length === 12) &&      // vendeeAadhaar
                (args[8].length === 10) &&      // vendeePan
                (args[9].length <= 30)          // vendeeFathersName
            ) {               
                
                let recordAsBytes = await stub.getState(args[0]);

                if (!recordAsBytes || recordAsBytes.toString().length <= 0) {
                    throw new Error('record with unique property Id ' + args[0] + ' does not exist: Try with other property ID.');
                }
            
                let record = JSON.parse(recordAsBytes);
                
                // validate if vendor is the holder of the property
                if(
                    (record.holderFullName === args[2]) &&
                    (record.holderAadhaar === args[3]) &&
                    (record.holderPan === args[4]) &&
                    (record.holderFathersName === args[5]) &&
                    (record.poeTransactionId != '0' )     // if poe transaction id is not valid dont allow initiating checkslip for this property id
                ) {
		record.uniquePropertyId = args[0];	// added by sirisha
                    record.chkslipId = args[1];
                    record.holderFullName = args[6];
                    record.holderAadhaar = args[7];
                    record.holderPan = args[8];
                    record.holderFathersName = args[9];
                    record.poeTransactionId = '0';    // zero down the poe transaction id as this is new checkslip.
                    record.txId = stub.getTxID();   // Autofetch

                    await stub.putState(args[0], Buffer.from(JSON.stringify(record)));

                    console.log('txid: ' + record.txId); // for ease of access during testing

                }else { 
                    throw new Error('Vendor validation failed');
                }
            } else {
                throw new Error('Invaid arguments passed. Try Again');
            }                     
        }
        else {
            throw new Error('USER doesnt have required access to record checkslip');
        }           
       
        console.info('============= Recording checkslip Done ===========');
    }

    /* Will allow to record property on the blockchain */
    /*Access Control: Writer*/
    async recordProperty(stub, args){
                
         console.info('============= Recording new property ===========');

        if (args.length != 14) {
            throw new Error('Incorrect number of arguments. Expecting 14: PropId, Holder, holderAadhaar, holderPan,' + 
            'holderFathersName, District, sro, subDivision, mandal, village, surveyNo, areaExtent, propertyCategory, poeTransactionId');
        }

        let cid = new ClientIdentity(stub); // "stub" is the ChaincodeStub object passed to Init() and Invoke() methods
                        
        if (cid.assertAttributeValue('role', 'creator') ||
            cid.assertAttributeValue('role', 'writer')) {   // giving access to writer as POE doesn't have creator role.
            
            console.info('============= The current user role is Creator and can record the Property ===========');

            if(
                validator.isHash(args[0], 'sha256') &&  // propertyId
                (args[1].length <= 30) &&       // holderFullName
                (args[2].length === 12) &&      // holderAadhaar
                (args[3].length === 10) &&      // holderPan
                (args[4].length <= 30) &&       // holderFathersName
                (args[5].length <= 30) &&       // district
                (args[6].length <= 30) &&       // sro
                (args[7].length <= 30) &&       // subDivision
                (args[8].length <= 30) &&       // mandal
                (args[9].length <= 30) &&       // village
                (args[10].length <= 30) &&      // surveyNo
                (args[11].length <= 15) &&      // areaExtent
                (args[12].length <= 30)         // propertyCategory
            ) {
                let poeTransactionId = '0';

                if(args[13] === '0') // poeTransactionId NOT available at recordProperty time
                    poeTransactionId = '0';                                          
                else if(args[13].length === 64) // poeTransactionId IS available at recordProperty time
                    poeTransactionId = args[13];
                else {
                    throw new Error('Inavlid POE trsanction ID supplied ' + args[13]);
                }
// modified by sirisha
                let property = {
                    //docType: 'property',
                    assetVersion: '2.0',                // prefilled
                    propertyId: args[0],                // unique id constructed by application
                    holderFullName: args[1],            // max length 30
                    holderAadhaar: args[2],             // length 12
                    holderPan: args[3],                 // length 10
                    holderFathersName: args[4],         // max length 30
                    district: args[5],                  // max length 30
                    sro: args[6],                       // max length 30
                    subDivision: args[7],               // max length 30
                    mandal: args[8],                    // max length 30
                    village: args[9],                   // max length 30
                    surveyNo: args[10],                 // max length 30
                    areaExtent: args[11],               // max length 15
                    propertyCategory: args[12],         // max length 30
                    poeTxId: poeTransactionId,          // length = 64
                    txId: stub.getTxID()			    // Auto fetch
                };
              
                await stub.putState(args[0], Buffer.from(JSON.stringify(property)));

                console.log('txid: ' + property.txId); // for ease of access during testing

            } else{ 
                throw new Error('Invalid arguments passed. Try Again');
            }
        }
        else { 
            throw new Error('USER doesnt have required access for recording property');
        }
               
        console.info('============= Recording property Done ===========');
    }
};

shim.start(new Chaincode());

// EOF
