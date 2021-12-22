const networkconfig = require('../controllers/networkconfig.controller');

module.exports = (app) => {

    // Query to fetch network name from networkconfig
    app.get('/networkconfig/networkname', networkconfig.getNetworkName);

    // Query to fetch organizations from networkconfig
    app.get('/networkconfig/organizations', networkconfig.getOrganizations);

    // Query to fetch orderers from networkconfig
    app.get('/networkconfig/orderers', networkconfig.getOrderers);

    // Query to fetch peers from networkconfig
    app.get('/networkconfig/peers', networkconfig.getAllPeers);
}