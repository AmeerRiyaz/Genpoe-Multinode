var domainConfig = require('./domain');
var rtUrl = "http://" + domainConfig.rteserverIP + ":" + domainConfig.rtServerPORT
module.exports = {
    'rteserverIP': rtUrl
    //'rteserverIP': 'http://10.244.1.137:3000'
};