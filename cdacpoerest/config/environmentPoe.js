var domainConfig = require('./domain');
var vUrl = "http://" + domainConfig.GenPoeIP + ":" + domainConfig.GenPoePORT
module.exports = {
    "username": 'admin',
    "verificationURL": vUrl //for general poe
    //"verificationURL":"http://10.244.1.122:4222" //for general poe
}