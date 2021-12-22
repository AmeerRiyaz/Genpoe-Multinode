module.exports = (app) => {
    
    const poechaincode = require('../../controllers/training/poechaincode.controller.js');
    // Retrieve all poe details
    app.get('/poe', poechaincode.findAll);

    // Retrieve last 10 committed poe details
    app.get('/poe/lastcommits', poechaincode.findDocs);

     // Poe-Invoke a transaction
     app.post('/poe/transactions', poechaincode.invoke);

      // Poe- Query chaincode by rollNo
      app.post('/poe/transactions/rollNo', poechaincode.querybyrollNo);

      // Poe- Query by rollNo for verifier  
      app.post('/poe/verifier/rollNo', poechaincode.verifyrollNo);
      

     // Poe- Query chaincode by file hash
     app.post('/poe/transactions/fileHash', poechaincode.querybyhash);
 
     // Poe- Query chaincode by TxId
     app.post('/poe/transactions/TxId', poechaincode.querybytxId);
     app.get('/poe/transaction', poechaincode.getquerybytxId);
     app.get('/poe/query', poechaincode.getbytxId);
     app.get('/poe/pos', poechaincode.getquerybyposHash);

     // get records by batch No and course id
     app.post('/poe/fetchrecords', poechaincode.fetchrecords);

     // sendmail
     app.post('/poe/sendmail', poechaincode.sendmail);
    
     // share certificates
     app.post('/poe/certs/student/share', poechaincode.shareStudentRecords);

     // share certificates
     app.post('/poe/certs/share', poechaincode.shareRecords);

     // list certificates
     app.post('/poe/user/certs', poechaincode.fetchCertsbyUserName);

     // fetchcerts 
     app.post('/poe/users/certs',poechaincode.fetchAllcerts);

     // list certificates
    app.post('/poe/verifier/records', poechaincode.verifierRecords);
}
