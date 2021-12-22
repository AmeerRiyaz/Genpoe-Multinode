var domainConfig = require('./domain');
var vUrl = "http://" + domainConfig.ACTSPoeIP + ":" + domainConfig.ACTSPoePORT + "/poe/transaction"
module.exports = {
    "username": 'admin',
    "verificationURL":vUrl   //for acts poe
    //"verificationURL":"http://10.244.1.122:4211/poe/transaction"   //for acts poe
    // "verificationURL" : "http://10.244.1.122/poe/transaction", //ACTS POE
}