#!/usr/bin/python3

import os
import sys
import subprocess
import xlrd 

from crypto_key import createFolder,createOrdererCryptoConfigFile,createFolder
from ruamel.yaml import round_trip_dump
from ruamel.yaml.util import load_yaml_guess_indent
from ruamel.yaml import YAML

class color:
   PURPLE = '\033[95m'
   CYAN = '\033[96m'
   DARKCYAN = '\033[36m'
   BLUE = '\033[94m'
   GREEN = '\033[92m'
   YELLOW = '\033[93m'
   RED = '\033[91m'
   BOLD = '\033[1m'
   UNDERLINE = '\033[4m'
   END = '\033[0m'


fabricBinary='../fabric-binaries'

print(color.BLUE + color.BOLD + 'Orderer Details : '+ color.END)

#open EXcel File
# sheet-0 template. Therefore, start from index=1

ExcelFileName= input('Path to ExcelFile : ')
workbook = xlrd.open_workbook(ExcelFileName)
nsheets=workbook.nsheets  # first sheet template
print( {nsheets} )
ordererPath= '../artifacts/orderer-org/' 
ordererPath1= '../artifacts/orderer-org'
createFolder(ordererPath)
cmd='cp ./crypto-config.yaml ' + '../artifacts/orderer-org'
stdoutdata = subprocess.getoutput(cmd)
cryptfile= ordererPath1 + '/crypto-config.yaml'
 # Generate keys for orderer
cmd=fabricBinary + '/' + 'cryptogen' + ' ' + 'generate' + ' ' + '--config=' + cryptfile + ' ' + '--output=' + ordererPath1 + '/crypto-config' 
print(cmd)
stdoutdata = subprocess.getoutput(cmd)
#print("stdoutdata: " + stdoutdata.split()[0])
count=0
while count < nsheets:
        worksheet = workbook.sheet_by_index(count)

        
        ordererName=worksheet.row(2)[1].value
        ordererDomain=worksheet.row(3)[1].value
        hostName=worksheet.row(4)[1].value
        #outputDir='../artifacts'
        port1='7050'
        port=int(worksheet.row(5)[1].value)

        #  print(' ordererName     {ordererName}')
        #   print(' ordererDomain     {ordererDomain}')
        #    print(' hostName     {hostName}')
        #   print(' port     {port}')

        ordererPath= '../artifacts/orderer-org/' + ordererName 
        ordererPath1= '../artifacts/orderer-org'
        #channel=artifacts + '/channel'
        dockerfolder=ordererPath+'/docker-config'

        # create artifacts and channel folder 
        createFolder(ordererPath)
        #createFolder(channel)
        createFolder(dockerfolder)
        #caFolder=channel + '/crypto-config/peerOrganizations/'+orgDomain+ '/ca/'
        #create crypto configuration file for the organization
        cryptfile= ordererPath1 + '/crypto-config.yaml'
        sample_file='./samples/crypto-template-orderer.yaml'

        #create crypto config file 
	#cmd='cp ./crypto-config.yaml ' + ordererPath
        
        #        createOrdererCryptoConfigFile(sample_file,cryptfile,ordererName,ordererDomain,hostName)
       
        #function for creating orderer Config File
        def createOrdererDockerConfigFile(outputfile,orderDomainName,port,oFolder):

                print('....orderer folder...{oFolder}')
                #Folder='/home/saigopal/newBCT/general/hyperledger/pmbctnetwork/pyscripts/Orderer/channel/crypto-config/ordererOrganizations/cdac.in/orderers/orderer.cdac.in'
                sport= str(port) + ':'+ str(port1)
                #data={1:{21:22,31:32,4:{51:52,61:62},7:[{81:82},{91:92},{101:102}],11:[{121:122},{131:132}],14:[{151:152},{161:162}],17:[18]}}
                #data={'version':'2' , 'services': {orderDomainName:{'env_file':'./.env','container_name': orderDomainName,'image':'hyperledger/fabric-orderer','environment':\
                #['ORDERER_GENERAL_LOGLEVEL=debug','ORDERER_GENERAL_LISTENADDRESS=0.0.0.0','ORDERER_GENERAL_GENESISMETHOD=file','ORDERER_GENERAL_GENESISFILE=/etc/hyperledger/configtx/genesis.block','ORDERER_GENERAL_LOCALMSPID=OrdererMSP','ORDERER_GENERAL_LOCALMSPDIR=/etc/hyperledger/crypto/orderer/msp'\
                #,'ORDERER_GENERAL_TLS_ENABLED=true','ORDERER_GENERAL_TLS_PRIVATEKEY=/etc/hyperledger/crypto/orderer/tls/server.key','ORDERER_GENERAL_TLS_CERTIFICATE=/etc/hyperledger/crypto/orderer/tls/server.crt','ORDERER_GENERAL_TLS_ROOTCAS=[]'],'working_dir':'/opt/gopath/src/github.com/hyperledger/fabric/orderers','command': 'orderer',\
                #'ports':[sport],'volumes':[{'/var/hyperledger/ordererorg':'/var/hyperledger/production'},{oFolder:'/etc/hyperledger/crypto/orderer'},{configtx:'/etc/hyperledger/configtx'}]}}}

                
                data={'version':'2' , 'services': {orderDomainName:{'env_file':'./.env','container_name': orderDomainName,'image':'hyperledger/fabric-orderer','environment':\
                ['ORDERER_GENERAL_LOGLEVEL=debug','ORDERER_GENERAL_LISTENADDRESS=0.0.0.0','ORDERER_GENERAL_GENESISMETHOD=file','ORDERER_GENERAL_GENESISFILE=/etc/hyperledger/configtx/genesis.block','ORDERER_GENERAL_LOCALMSPID=OrdererMSP','ORDERER_GENERAL_LOCALMSPDIR=/etc/hyperledger/crypto/orderer/msp'\
                ,'ORDERER_GENERAL_TLS_ENABLED=true','ORDERER_GENERAL_TLS_PRIVATEKEY=/etc/hyperledger/crypto/orderer/tls/server.key','ORDERER_GENERAL_TLS_CERTIFICATE=/etc/hyperledger/crypto/orderer/tls/server.crt','ORDERER_GENERAL_TLS_ROOTCAS=[/etc/hyperledger/crypto/orderer/tls/ca.crt]','ORDERER_KAFKA_TOPIC_REPLICATIONFACTOR=1'\
                ,'ORDERER_KAFKA_VERBOSE=true','ORDERER_GENERAL_CLUSTER_CLIENTCERTIFICATE=/etc/hyperledger/crypto/orderer/tls/server.crt','ORDERER_GENERAL_CLUSTER_CLIENTPRIVATEKEY=/etc/hyperledger/crypto/orderer/tls/server.key','ORDERER_GENERAL_CLUSTER_ROOTCAS=[/etc/hyperledger/crypto/orderer/tls/ca.crt]'],'working_dir':'/opt/gopath/src/github.com/hyperledger/fabric/orderers','command': 'orderer',\
                'ports':[sport],'volumes':['/var/hyperledger/ordererorg/'+orderDomainName+':/var/hyperledger/production',oFolder+':/etc/hyperledger/crypto/orderer','../../../channel/:/etc/hyperledger/configtx']}}}
                
                yaml = YAML()
                yaml.indent(sequence=4, offset=2)
                yaml.dump(data, sys.stdout)

                with open(outputfile, 'w') as outfile:
                        yaml.dump(data, outfile)


       

        outputfile=dockerfolder+'/docker-orderer.yaml'
        ordererFolder='../../crypto-config/ordererOrganizations/'+ordererDomain+'/orderers' + '/' + hostName + '.' + ordererDomain
        print(outputfile)
        print(ordererFolder)
        #ordererFolder='tests'
        print(ordererFolder)
        createOrdererDockerConfigFile(outputfile,hostName+'.'+ordererDomain,port,ordererFolder)
        count += 1

