/*
Chaincode for recording checkslip and regular registration document.
Author: Sandeep Romana
Date: 02-11-2018
Code based on sample chaincodes from hyperledger fabric-samples repo, pms-chaincode and poe-chaincode.
Copyright(R) - 2018, Center For Development of Advanced Computing. Hyderabad.
VERSION 1.0
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

    /* Allows to query a specific property based on the Key value. Will return all the values recorded in the key:value pair
    for a specific property. This function could be invoked by a Citizen or SRO/MRO. */
    /*Access Control: Reader, Writer, Creator*/
    async queryByPropertyId(stub, args){

        // No need to check attribute based access permissions as all roles can call this function

        console.info('=========== Quering Specific Property ===========');

        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting Key ex: 2');
        }

        let cid = new ClientIdentity(stub);

        if (cid.assertAttributeValue('role', 'reader') || 
            cid.assertAttributeValue('role', 'writer') || 
            cid.assertAttributeValue('role', 'creator')) {  // explicit role validation

            let propertyId = args[0];
        
            let propertyAsBytes = await stub.getState(propertyId); //get the property from chaincode state
            
            if (!propertyAsBytes || propertyAsBytes.toString().length <= 0) {
                throw new Error(propertyId + ' does not exist: Try with other property id.');
            }

            console.log(propertyAsBytes.toString());
            console.info('=========== Quering Specific Property Done ===========');
        
            return propertyAsBytes;
        }
        else {
            throw new Error('USER doesnt have required access for query by property id');
        }
    }

    /* Allows to perform complex query based on the txid value. Returns record for specific txid */
    /* Access Control: Reader, Writer and Creator */
    async queryByTxId(stub, args){

        console.info('=========== Quering records by TXID ===========');

        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting TXID');
        }else if(args[0].length != 64 ) // loose validation of txid
        {
            throw new Error('Invaid txid passed. Try again.');
        }

        let cid = new ClientIdentity(stub);

        if (cid.assertAttributeValue('role', 'reader') || 
            cid.assertAttributeValue('role', 'writer') || 
            cid.assertAttributeValue('role', 'creator')) {      // explicit role vaildation

                console.info('============= Reader, Writer or Creator is querying ===========');
      
                let txId = args[0];

                let resultsIterator = await stub.getStateByPartialCompositeKey('txid~ver~hfl~huid~hp~hfn~dist~sro~sd~ma~vil~sn~ae~pc~poetx', [txId]);
            
                let allResults = [];
                let jsonRes = {}; // empty object

                // default value indicating not found
                jsonRes.txId = 0;
                jsonRes.assetVersion = 0;
                jsonRes.holderFullName = 0;
                jsonRes.holderAadhaar = 0;
                jsonRes.holderPan = 0;
                jsonRes.holderFathersName = 0;
                jsonRes.district = 0;
                jsonRes.sro = 0; 
                jsonRes.subDivision = 0;
                jsonRes.mandal = 0;
                jsonRes.village = 0;
                jsonRes.surveyNo = 0;
                jsonRes.areaExtent = 0;
                jsonRes.propertyCategory = 0;
                jsonRes.poeTxId = 0;
                jsonRes.found = false;

                allResults.push(jsonRes); // push default JSON object to list
                
                while(true){

                    let res = await resultsIterator.next();
                    if (res.value ) { 
                                    
                        console.info(' ========== Quering Object ============ ');

                        // pop the default object indicating not found case
                        allResults.pop(jsonRes); // pop JSON object to list

                        let keyParts = await stub.splitCompositeKey(res.value.key)
                               
                        jsonRes.txId = keyParts.attributes[0];
                        jsonRes.assetVersion = keyParts.attributes[1];
                        jsonRes.holderFullName = keyParts.attributes[2];
                        jsonRes.holderAadhaar = keyParts.attributes[3];
                        jsonRes.holderPan = keyParts.attributes[4];
                        jsonRes.holderFathersName = keyParts.attributes[5];
                        jsonRes.district = keyParts.attributes[6];
                        jsonRes.sro = keyParts.attributes[7];
                        jsonRes.subDivision = keyParts.attributes[8];
                        jsonRes.mandal = keyParts.attributes[9];
                        jsonRes.village = keyParts.attributes[10];
                        jsonRes.surveyNo = keyParts.attributes[11]; 
                        jsonRes.areaExtent = keyParts.attributes[12];
                        jsonRes.propertyCategory = keyParts.attributes[13]; 
                        jsonRes.poeTxId = keyParts.attributes[14]; 
                        jsonRes.found = true;
                        
                        allResults.push(jsonRes); // push JSON object to list
                    }

                    if (res.done) { // when iterator res is past end of iterated sequence
    
                        console.info(' ========== end of data ============ ');
                        
                        await resultsIterator.close();
                        console.info(allResults);
                        break;
                    }  
                }
              
                return Buffer.from(JSON.stringify(allResults));

        }// if cid
        else {
            throw new Error('USER doesnt have required access for querity by transaction id');
        }
    }  

    /* Will retrieve the history of the property based on the Key. This means that the function returns all the 
    transactions that has been committed on particular property (key). Helpfull for Encumbrance Certificate/Search. This
    function could be allowed to be invoked by a Citizen or SRO/MRO. */
    /*Access Control: Reader, Writer, Creator */
    async getHistoryForPropID(stub, args, thisClass){

        // No need to check attribute based access permissions as all roles can call this function

        console.info('============= Getting History for Property ===========');

        if (args.length != 1) {
            throw new Error('Incorrect number of arguments. Expecting 1 : PropertyId');
        }

        let cid = new ClientIdentity(stub);

        if (cid.assertAttributeValue('role', 'reader') || 
            cid.assertAttributeValue('role', 'writer') || 
            cid.assertAttributeValue('role', 'creator')) {      // explicit role vaildation

            let propertyid = args[0];

            let propertyAsBytes = await stub.getState(propertyid); //get the property from chaincode state

            if (!propertyAsBytes || propertyAsBytes.toString().length <= 0) {
                throw new Error(propertyid + ' does not exist: Try with other property id.');
            }

            let resultsIterator = await stub.getHistoryForKey(propertyid);          

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
            
        //console.info('============= Getting History for Property Done ===========');
    }

    /* Will allow updating the poe transaction id to property asset. */
    /* Access Control: writer and Creator */
    async updatePoeTxId(stub, args){

        if (args.length != 3) {
            throw new Error('Incorrect number of arguments. Expecting 3 : PropId, TxId (during recordProperty), poeTransactionId');
        }

        let cid = new ClientIdentity(stub); 

        if (cid.assertAttributeValue('role', 'writer') ||
            cid.assertAttributeValue('role', 'creator')) { 

                console.info('writer or creator is updating poe transaction id');

                let propertyId = args[0];
                let transactionId = args[1];
                     
                //-----------------
                // 1/2. update poe transaction id in property id based index

                let jsonRecord = {}; // empty object

                let propertyAsBytes = await stub.getState(propertyId); //get the property from chaincode state
                if (propertyAsBytes.toString().length > 0) { // property id exists

                    jsonRecord = JSON.parse(propertyAsBytes.toString());

                    //validate if poe transaction id is already updated 
                    if( jsonRecord.poeTxId === '0')
                    {
                        jsonRecord.poeTxId = args[2]; // update poe transaction id in property id
                        jsonRecord.txId = stub.getTxID(); // update the transaction id also

                        //console.log(JSON.stringify(jsonRecord)); // for ease of debugging
                        console.log(jsonRecord.assetVersion);
                        console.log(jsonRecord.propertyId);
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
                        console.log(jsonRecord.poeTxId);
                        console.log(jsonRecord.txId);

                        await stub.putState(args[0], Buffer.from(JSON.stringify(jsonRecord)));
                    }
                    else {// if validate
                        throw new Error('poe transaction id exists for: ' + args[0]);
                    }
                    
                }else { // if property id does not exist
                    throw new Error(propertyId + ' does not exist: Try with other propertyId.');
                }

                //-----------------
                // 1(b)/2. As updating POE transaction id will create a new transaction in itself lets create an index for it.
 
                let indexName = 'txid~ver~hfl~huid~hp~hfn~dist~sro~sd~ma~vil~sn~ae~pc~poetx';

                let txidNameIndexKey = await stub.createCompositeKey(indexName, [jsonRecord.txId, 
                                                                                jsonRecord.assetVersion,
                                                                                jsonRecord.propertyId, 
                                                                                jsonRecord.holderFullName,
                                                                                jsonRecord.holderAadhaar, 
                                                                                jsonRecord.holderPan,
                                                                                jsonRecord.holderFathersName,
                                                                                jsonRecord.district, 
                                                                                jsonRecord.sro,
                                                                                jsonRecord.subDivision,
                                                                                jsonRecord.mandal,
                                                                                jsonRecord.village,
                                                                                jsonRecord.surveyNo,
                                                                                jsonRecord.areaExtent,
                                                                                jsonRecord.propertyCategory,
                                                                                jsonRecord.poeTxId]);                                                                            
                if(!txidNameIndexKey.length <= 0 )
                {                    
                    console.log(txidNameIndexKey);

                    let value = 'xx'; // dummy value

                    await stub.putState(txidNameIndexKey, Buffer.from(value));
                }
                else {
                    throw new Error(txidNameIndexKey + 'error creating compositekey');
                }         

                //-----------------
                // 2/2. update poe transaction id in transaction id based index

                let txId = args[0];
                let resultsIterator = await stub.getStateByPartialCompositeKey('txid~ver~hfl~huid~hp~hfn~dist~sro~sd~ma~vil~sn~ae~pc~poetx', [txId]);
            
                let allResults = [];
                let jsonRes = {}; // empty object
               
                while(true){

                    let res = await resultsIterator.next();
                    if (res.value ) { 
                                    
                        console.info(' ========== Quering Object ============ ');

                        // pop the default object indicating not found case
                        allResults.pop(jsonRes); // pop JSON object to list

                        let keyParts = await stub.splitCompositeKey(res.value.key)
                               
                        jsonRes.txId = keyParts.attributes[0];
                        jsonRes.assetVersion = keyParts.attributes[1];
                        jsonRes.holderFullName = keyParts.attributes[2];
                        jsonRes.holderAadhaar = keyParts.attributes[3];
                        jsonRes.holderPan = keyParts.attributes[4];
                        jsonRes.holderFathersName = keyParts.attributes[5];
                        jsonRes.district = keyParts.attributes[6];
                        jsonRes.sro = keyParts.attributes[7];
                        jsonRes.subDivision = keyParts.attributes[8];
                        jsonRes.mandal = keyParts.attributes[9];
                        jsonRes.village = keyParts.attributes[10];
                        jsonRes.surveyNo = keyParts.attributes[11]; 
                        jsonRes.areaExtent = keyParts.attributes[12];
                        jsonRes.propertyCategory = keyParts.attributes[13]; 
                        jsonRes.poeTxId = keyParts.attributes[14]; 

                        jsonRes.poeTxId = args[2]; // replace the old poeTxId with new 

                        // commit the updated record back
                        await stub.putState(jsonRes.txId, Buffer.from(JSON.stringify(jsonRes)));
                        
                        allResults.push(jsonRes); // push JSON object to list
                    }

                    if (res.done) { // when iterator res is past end of iterated sequence
    
                        console.info(' ========== end of data ============ ');
                        
                        await resultsIterator.close();
                        console.info(allResults);
                        break;
                    }  
                }
              
                //return Buffer.from(JSON.stringify(allResults));
                
        }
        else {
            throw new Error('USER doesnt have required access to update POE transaction Id');
        }
    }

    /* Will implement logic to change the current owner of the property in the Key to new owner. Only SRO/MRO should be able
    to invoke this function */
    /*Access Control: Writer*/
    async changePropertyHolder(stub, args){
        
        console.info('============= Changing Property Holder ===========');

        if (args.length != 10) {
            throw new Error('Incorrect number of arguments. Expecting 10 : PropId, VendorFullName,' +
            'VendorAadhaar, VendorPan, VendorFatherName, VendeeFullName, VendeeAadhaar, VendeePan, VendeeFatherName', 'poeTransactionId');
        }

        let cid = new ClientIdentity(stub); // "stub" is the ChaincodeStub object passed to Init() and Invoke() methods

        if (cid.assertAttributeValue('role', 'writer')) { 
            
            console.info('============= The current user role is Writer and can change the Property Holder ===========');
              
            if(
                validator.isHash(args[0], 'sha256') &&  // propertyId
                (args[1].length <= 30) &&       // vendorFullName
                (args[2].length === 12) &&      // vendorAadhaar
                (args[3].length === 10) &&      // vendorPan
                (args[4].length <= 30) &&       // vendorFathersName
                (args[5].length <= 30) &&       // vendeeFullName
                (args[6].length === 12) &&      // vendeeAadhaar
                (args[7].length === 10) &&      // vendeePan
                (args[8].length <= 30) &&       // vendeeFathersName
                ((args[9] === '0') ||
                (args[9].length === 64))         // poeTransactionId either '0' or length = 64
            ) {               
                
                let propertyAsBytes = await stub.getState(args[0]);

                if (!propertyAsBytes || propertyAsBytes.toString().length <= 0) {
                    throw new Error('property with Id ' + args[0] + ' does not exist: Try with other property ID.');
                }
            
                let property = JSON.parse(propertyAsBytes);
                
                // validate if vendor is the holder of the property
                if(
                    (property.holderFullName === args[1]) &&
                    (property.holderAadhaar === args[2]) &&
                    (property.holderPan === args[3]) &&
                    (property.holderFathersName === args[4]) &&
                    (property.poeTxId != '0' )     // if poe transaction id is not valid dont allow transfer of ownership 
                ) {
                    property.holderFullName = args[5];
                    property.holderAadhaar = args[6];
                    property.holderPan = args[7];
                    property.holderFathersName = args[8];
                    property.poeTxId = args[9];    // update old poe transaction id with new poe transaction id
                    property.txId = stub.getTxID();   // Autofetch

                    await stub.putState(args[0], Buffer.from(JSON.stringify(property)));

                    console.log('txid: ' + property.txId); // for ease of access during testing

                    let indexName = 'txid~ver~hfl~huid~hp~hfn~dist~sro~sd~ma~vil~sn~ae~pc~poetx';                                 

                    // create a key for txid based searches
                    let txidNameIndexKey = await stub.createCompositeKey(indexName, [property.txId, 
                                                                                        property.assetVersion,
                                                                                        property.propertyId, 
                                                                                        property.holderFullName,
                                                                                        property.holderAadhaar, 
                                                                                        property.holderPan,
                                                                                        property.holderFathersName,
                                                                                        property.district, 
                                                                                        property.sro,
                                                                                        property.subDivision,
                                                                                        property.mandal,
                                                                                        property.village,
                                                                                        property.surveyNo,
                                                                                        property.areaExtent,
                                                                                        property.propertyCategory,
                                                                                        property.poeTxId]);                                                                            
                    if(!txidNameIndexKey.length <= 0 )
                    {                    
                        console.log(txidNameIndexKey);

                        let value = 'xx'; // dummy value
                        
                        await stub.putState(txidNameIndexKey, Buffer.from(value));
                    }
                    else {
                        throw new Error(txidNameIndexKey + 'error creating compositekey');
                    }    

                }else { 
                    throw new Error('Vendor validation failed');
                }
            } else {
                throw new Error('Invaid arguments passed. Try Again');
            }                     
        }
        else {
            throw new Error('USER doesnt have required access to change the Property Holder');
        }           
       
        console.info('============= Changing Property Holder Done ===========');
    }

    /* Will allow to record new checkslip on the blockchain. */
    /* Access Control: Writer */
    async generateCheckSlip(stub, arg){
                
        console.info('============= Recording new checkslip ===========');

        if (args.length != 14) {
            throw new Error('Incorrect number of arguments. Expecting 14: PropId, Holder, holderAadhaar, holderPan,' + 
            'holderFathersName, District, sro, subDivision, mandal, village, surveyNo, areaExtent, propertyCategory, poeTransactionId');
        }

        let cid = new ClientIdentity(stub); // "stub" is the ChaincodeStub object passed to Init() and Invoke() methods
                        
        if (cid.assertAttributeValue('role', 'writer')) { 
            
            console.info('============= The current user role is writer and can record the document ===========');

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

                let checkSlip = {
                    assetVersion: '1.0',                // prefilled
                    documentDetails:{
                        citizenTransactionNumber: arg[],
                        regnYear: arg[],
                        transaction: arg[],
                        stampsPurchaseDate: arg[],
                        executionDate: arg[],
                        presentationDate: arg[],
                    },
                    executantDetails:{
                        code: arg[],
                        name: arg[],
                        age: arg[],
                        occupation: arg[],
                        relationName: arg[],
                        address: arg[],
                        townCity: arg[],
                        mobileNo: arg[],
                        email: arg[],
                        aadhaar: arg[],
                        panNoORForm60Submitted: arg[],    
                    },
                    claimantDetails:{
                        code: arg[],
                        name: arg[],
                        age: arg[],
                        occupation: arg[],
                        relationName: arg[],
                        address: arg[],
                        townCity: arg[],
                        mobileNo: arg[],
                        email: arg[],
                        aadhaar: arg[],
                        panNoORForm60Submitted: arg[],
                    },
                    propertyDetails:{
                        scheduleNo: arg[],
                        localBody: arg[],
                        landUse: arg[],
                        district: arg[],
                        sroName: arg[],
                        juridiction: arg[],
                        villageTown: arg[],
                        locality: arg[],
                        surveryNo: arg[],
                        plotNo: arg[],
                        flatDetails: {
                            flat: arg[],
                            flatNo: arg[],
                            wardBlock: arg[],
                            doorNo: arg[],
                        },
                        appartmentDetails: {
                            apptName: arg[],
                            apptExtent: arg[],
                            metric: arg[],
                        },
                        propertyBoundry: {
                            east: arg[],
                            west: arg[],
                            north: arg[],
                            south: arg[],
                            extendUDShare: arg[],
                            metric: arg[],    
                        },
                        structureDetails: {
                            totalFloor: arg[],
                            floorNo: arg[],
                            structureType: arg[],
                            plinthArea: arg[],
                            metric: arg[],
                            stageOfContruction: arg[],
                            age: arg[]
                        },
                        marketValue: {
                            landCost: arg[],
                            structureCost: arg[],
                            considerationValue: arg[],
                            advAmt: arg[],
                            annualRent: arg[],
                            marketValue: arg[]
                        },                                                
                    },                    
                    dutyFee: {
                        finalChargableValue: arg[],
                        stampDutyPayable: arg[],
                        stampDutyBorneByDocuments: arg[],
                        transferDutyPayable: arg[],
                        registrationFeePayable: arg[],
                        userCharges: arg[],
                    },
                    propertyId: args[0],                // unique id constructed by application
                    txId: stub.getTxID()			    // Auto fetch
                };
              
                await stub.putState(args[0], Buffer.from(JSON.stringify(property)));

                console.log('txid: ' + property.txId); // for ease of access during testing

                let indexName = 'txid~ver~hfl~huid~hp~hfn~dist~sro~sd~ma~vil~sn~ae~pc~poetx';

                // create a key for txid based searches
                let txidNameIndexKey = await stub.createCompositeKey(indexName, [property.txId, 
                                                                                    property.assetVersion,
                                                                                    property.propertyId, 
                                                                                    property.holderFullName,
                                                                                    property.holderAadhaar, 
                                                                                    property.holderPan,
                                                                                    property.holderFathersName,
                                                                                    property.district, 
                                                                                    property.sro,
                                                                                    property.subDivision,
                                                                                    property.mandal,
                                                                                    property.village,
                                                                                    property.surveyNo,
                                                                                    property.areaExtent,
                                                                                    property.propertyCategory,
                                                                                    property.poeTxId]);                                                                            
                if(!txidNameIndexKey.length <= 0 )
                {                    
                    console.log(txidNameIndexKey);

                    let value = 'xx'; // dummy value
                    
                    await stub.putState(txidNameIndexKey, Buffer.from(value));
                }
                else {
                    throw new Error(txidNameIndexKey + 'error creating compositekey');
                }               
            } else{ 
                throw new Error('Invalid arguments passed. Try Again');
            }
        }
        else { 
            throw new Error('USER doesnt have required access for recording Property');
        }
               
        console.info('============= Recording new property Done ===========');
    }
};

shim.start(new Chaincode());

// EOF