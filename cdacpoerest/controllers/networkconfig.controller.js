var hfc = require('fabric-client');
var helper = require('../hyperledger/helper.js');
var util = require('util')
YAML = require('yamljs');

let client = helper.getNetworkConfigClient();

exports.getNetworkName = async (req, res) => {
    let networkName = util.inspect(client._network_config._network_config.name);
    res.json(YAML.parse(networkName));
};

exports.getOrganizations = async (req, res) => {
    let organizations = util.inspect(client._network_config._network_config.organizations);
    res.json(YAML.parse(organizations));
};

exports.getOrderers = async (req, res) => {
    let orderers = util.inspect(client._network_config._network_config.orderers);
    res.json(YAML.parse(orderers));
};

exports.getAllPeers = async (req, res) => {
    let peers = util.inspect(client._network_config._network_config.peers);
    res.json(YAML.parse(peers));
};