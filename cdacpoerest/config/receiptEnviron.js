
var domainConfig = require('./domain');
var PoeUrl = "http://" + domainConfig.GenPoeIP + ":" + domainConfig.GenPoePORT + "/transaction/"
var ACTSUrl = "http://" + domainConfig.ACTSPoeIP + ":" + domainConfig.ACTSPoePORT + "/poe/transaction/"
//var OrgUrl = "http://" + domainConfig.GenPoeIP + ":" + domainConfig.GenPoePORT + "/org/transaction/"
var OrgUrl = "http://" + domainConfig.GenPoeIP + ":" + domainConfig.GenPoePORT + "/org/file/"
module.exports = {
    "qrcodeUrl" : PoeUrl, //General POE
    //"qrcodeUrl" : "http://10.244.1.122:4222/transaction/", //General POE
    //"qrcodeUrlACTS" : "http://10.244.1.122:4211/poe/transaction/", //ACTS POE
    "qrcodeUrlACTS" : ACTSUrl, //ACTS POE
    "qrcodeUrlOrg" : OrgUrl

}


