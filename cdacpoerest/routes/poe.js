module.exports = (app) => {
    
    const poechaincode = require('../controllers/poechaincode.controller.js');
    const genpdf = require('../controllers/generate-pdf');
    

    // Poe-Invoke a transaction
    app.post('/poe/bct/transactions', poechaincode.invoke);

    //app.post('/poe/bct/generic/transactions', poechaincode.invoke_generic);
    app.post('/genericinvoke', poechaincode.invoke_generic)

    // Poe- Query chaincode by file hash
    app.post('/poe/bct/transactions/fileHash', poechaincode.querybyhash);

    app.post('/poe/bct/generic/transactions/fileHash', poechaincode.querybyhash_generic);
    

    // Poe- Query chaincode by TxId
    app.post('/poe/bct/transactions/TxId', poechaincode.querybytxId);
    app.get('/poe/bct/transaction', poechaincode.getquerybytxId);
    app.post('/poe/bct/generic/transactions/TxId', poechaincode.querybytxId_generic);

    // Retrieve all poe details
    app.get('/poe/bct/transactions', poechaincode.findAll);

    // Retrieve last 10 committed poe details
    app.get('/poe/bct/recenttransactions', poechaincode.findDocs);
    app.get('/poepos/file', poechaincode.getquerybyposHash);

    //Retrieving User Specific documents in General PoE
    app.post('/genpoe/user/docs', poechaincode.fetchDocsbyUserName)

    app.get('/generic/fetchDocs', poechaincode.fetchDocsbyUserName_Generic)
    

    //Sending email to cdacchain.in when getcallback request is received from cdacchain.in 
    app.post('/getcallback', poechaincode.getCallBack);

    app.post('/getpdfreceipt', genpdf.generateReceipt)
 
    
}
