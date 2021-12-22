import sys
from os import path
from ruamel.yaml import YAML

def createDockerPeerConfigFile(orgName,orgMSP,orgDominName,peerName,port1,port2,outputfile,orderDomainName,hport1,hport2):
    #orgDominName='cdacorg.cdac.in'
    #peerName='peer0'
    peerDomainName=peerName +'.'+ orgDominName
    #orgMSP='CdacMSP'
    #port=7051
    #orderDomainName='orderer.cdac.in'
    #port1=7053
    #gName='cdacOrg'
    peerMSP='../crypto-config/peerOrganizations/' + orgDominName  + '/peers/'+ peerDomainName + '/'

    peerData='/var/hyperledger/' + peerName +'-'+ orgName.lower() 

    sport1=str(port1) + ':' + str(hport1)
    sport2=str(port2) + ':' + str(hport2)

    peerDomainNamePort=peerDomainName +':'+ str(port1)

    #TODO: should not add version:2 if file already exist

    #data={1:{21:22,31:32,4:{51:52,61:62},7:[{81:82},{91:92},{101:102}],11:[{121:122},{131:132}],14:[{151:152},{161:162}],17:[18]}}
    
    #depends_on not commented
    #data={'version':'2' , 'services': {peerDomainName:{'container_name':peerDomainName,'env_file':'./.env','extends':{'file' :'base.yaml','service': 'peer-base'},'environment':['CORE_PEER_ID='+ peerDomainName,'CORE_PEER_LOCALMSPID=' + orgMSP,'CORE_PEER_ADDRESS=' + peerDomainNamePort],'ports':[sport1,sport2],'volumes':[peerData+':/var/hyperledger/production',peerMSP+':/etc/hyperledger/crypto/peer'],'depends_on':[orderDomainName]}}}

    data={'version':'2' , 'services': {peerDomainName:{'container_name':peerDomainName,'env_file':'./.env','extends':{'file' :'base.yaml','service': 'peer-base'},'environment':['CORE_PEER_ID='+ peerDomainName,'CORE_PEER_LOCALMSPID=' + orgMSP,'CORE_PEER_ADDRESS=' + peerDomainNamePort],'ports':[sport1,sport2],'volumes':[peerData+':/var/hyperledger/production',peerMSP+':/etc/hyperledger/crypto/peer']}}}


    #yaml.dump(data, sys.stdout)

    yaml = YAML()
    yaml.indent(sequence=4, offset=2)

    with open(outputfile, 'w') as outfile:
        yaml.dump(data, outfile)