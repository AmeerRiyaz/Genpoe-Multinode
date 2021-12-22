var util = require('util');
var path = require('path');
var hfc = require('fabric-client');

var file = 'network-config%s.yaml';

var env = process.env.TARGET_NETWORK;
if (env)
	file = util.format(file, '-' + env);
else
	file = util.format(file, '');
// indicate to the application where the setup file is located so it able
// to have the hfc load it to initalize the fabric client instance
hfc.setConfigSetting('network-connection-profile-path', path.join(__dirname, '../hyperledger', file));
hfc.setConfigSetting('RevOrg-connection-profile-path', path.join(__dirname, '../hyperledger/artifacts/orgProfile', 'RevOrg.yaml'));
//hfc.setConfigSetting(path.join(__dirname, 'artifacts' ,file));
//hfc.setConfigSetting(path.join(__dirname, 'artifacts', 'RevOrg.yaml'));
hfc.setConfigSetting('RegOrg-connection-profile-path', path.join(__dirname, '../hyperledger/artifacts/orgProfile', 'RegOrg.yaml'));
hfc.setConfigSetting('SurveyOrg-connection-profile-path', path.join(__dirname, '../hyperledger/artifacts/orgProfile', 'SurveyOrg.yaml'));
hfc.setConfigSetting('OtherOrg-connection-profile-path', path.join(__dirname, '../hyperledger/artifacts/orgProfile', 'OtherOrg.yaml'));
hfc.setConfigSetting('CdacOrg-connection-profile-path', path.join(__dirname, '../hyperledger/artifacts/orgProfile', 'CdacOrg.yaml'));
hfc.setConfigSetting('SecOrg-connection-profile-path', path.join(__dirname, '../hyperledger/artifacts/orgProfile', 'SecOrg.yaml'));
hfc.setConfigSetting('CdachOrg-connection-profile-path', path.join(__dirname, '../hyperledger/artifacts/orgProfile', 'CdachOrg.yaml'));
hfc.setConfigSetting('ActsOrg-connection-profile-path', path.join(__dirname, '../hyperledger/artifacts/orgProfile', 'ActsOrg.yaml'));
hfc.setConfigSetting('DemoOrg-connection-profile-path', path.join(__dirname, '../hyperledger/artifacts/orgProfile', 'DemoOrg.yaml'));
// some other settings the application might need to know
hfc.addConfigFile(path.join(__dirname, 'config.json'));
