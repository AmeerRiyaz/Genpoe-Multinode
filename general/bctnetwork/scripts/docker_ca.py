
import sys
import os
from ruamel.yaml import YAML
from ruamel.yaml import round_trip_dump
from ruamel.yaml.scalarstring import DoubleQuotedScalarString


def findPrivateKey(dirName):
    for file in os.listdir(dirName):
        if "_sk" in file:
            #print(file)
            return file

def createCAConfigFile(orgName,orgDomainName,caDomainName,caContainerName,port, outputfile,hcaport):

    #caDomainName='ca.revorg.cdac.in'
    #orgDomainName='revorg.cdac.in'
    caKey="_sk"
    caPrivateKeyPath='../artifacts/organizations/' + orgName + '/crypto-config/peerOrganizations/'+ orgDomainName + '/ca/'
    caFolder= '../crypto-config/peerOrganizations/'+orgDomainName+ '/ca/'
    caKey=findPrivateKey(caPrivateKeyPath)

    fabricCaImage='hyperledger/fabric-ca:${TAG}'
    #caContainerName='ca_peerCdacOrg'
    sport=str(port) + ':' + str(hcaport)
   # caFolder='../../artifacts/artifacts/channel/crypto-config/peerOrganizations/'+orgDomainName +'/ca/'

    S = DoubleQuotedScalarString

    fabric_ca_home='/etc/hyperledger/fabric-ca-server'
    fabric_ca_server_ca_name='ca-' +  orgName.lower()
    fabric_ca_server_certfile='/etc/hyperledger/fabric-ca-server-config/' + caDomainName + '-cert.pem'
    fabric_ca_server_ca_keyfile='/etc/hyperledger/fabric-ca-server-config/' + caKey 
    fabric_ca_server_tls_enabled='true'
    fabric_ca_server_tls_certfile='/etc/hyperledger/fabric-ca-server-config/' + caDomainName + '-cert.pem'
    fabric_ca_server_tls_keyfile='/etc/hyperledger/fabric-ca-server-config/' + caKey
    cmd="sh -c 'fabric-ca-server start -b admin:adminpw -d'"
    ca_server_config='/etc/hyperledger/fabric-ca-server-config'
    ca_fabric_server='/etc/hyperledger/fabric-ca-server'

    data = {'version':'2' , 'services': {caDomainName:{'env_file': './.env','image':fabricCaImage,'environment': \
    [ 'FABRIC_CA_HOME=' + fabric_ca_home,
    'FABRIC_CA_SERVER_CA_NAME=' + fabric_ca_server_ca_name,
    'FABRIC_CA_SERVER_CA_CERTFILE=' + fabric_ca_server_certfile ,
    'FABRIC_CA_SERVER_CA_KEYFILE=' + fabric_ca_server_ca_keyfile,
    'FABRIC_CA_SERVER_TLS_ENABLED=' + fabric_ca_server_tls_enabled,
    'FABRIC_CA_SERVER_TLS_CERTFILE=' + fabric_ca_server_tls_certfile,
    'FABRIC_CA_SERVER_TLS_KEYFILE=' + fabric_ca_server_tls_keyfile], 'ports' :[S(sport)] \
     , 'command' : cmd,'volumes': [caFolder + ':' + ca_server_config,caFolder + ':' + ca_fabric_server], 'container_name' : caContainerName
    }}}

    yaml = YAML()
    yaml.indent(sequence=4, offset=2)
    
    with open(outputfile, 'w') as outfile:
        yaml.dump(data, outfile)

# Replaces org1 in CA config file with corresponding orgNAme

def EditCAConfigFile(InFile,Outfile,orgName):
    with open(InFile, "rt") as fin:
        with open(Outfile, "wt") as fout:
            for line in fin:
                fout.write(line.replace('org1', orgName))
    # remove the CA template file
    os.remove(InFile)


