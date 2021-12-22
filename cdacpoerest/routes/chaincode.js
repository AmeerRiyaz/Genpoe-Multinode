module.exports = (app) => {
    const chaincode = require('../controllers/chaincode.controller.js');
    
    // Install chaincode
    app.post('/chaincodes', chaincode.install);

    // Instantiate chaincode
    app.post('/channels/:channelName/chaincodes', chaincode.instantiate);

    // Upgrade chaincode
    app.post('/channels/:channelName/chaincodes/upgrade', chaincode.upgrade);

    // Invoke a transaction
    app.post('/channels/:channelName/transactions', chaincode.invoke);

    // Query a chaincode
    app.get('/channels/:channelName/chaincodes/:chaincodeId', chaincode.query);

}