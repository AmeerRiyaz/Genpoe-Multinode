var os = require('os');
module.exports = {
    keystore_path: os.homedir() + '/' + '.pm-key-store', //keystore location
    ca_server_url: 'http://localhost:7054',
    ca_server_name: 'ca.org1.example.com',
    msp_id: 'Org1MSP',
    dept_affiliation: 'org1.department1',
    role: 'client',
}