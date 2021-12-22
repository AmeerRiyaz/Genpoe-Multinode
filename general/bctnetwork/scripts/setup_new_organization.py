#!/usr/bin/python3

from crypto_key import createFolder,createPeerCryptoConfigFile, renameAdminPrivateKey
from docker_ca import createCAConfigFile,EditCAConfigFile
from docker_peer import createDockerPeerConfigFile
from ruamel.yaml import YAML
from ruamel.yaml.scalarstring import DoubleQuotedScalarString
import xlrd 
import subprocess 
import sys

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

#open EXcel File
# sheet-0 template. Therefore, start from index=1

#ExcelFileName= input('Path to ExcelFile : ') #todo
n = len(sys.argv)
if(n < 2):
    print("Enter the path to ExcelFIle")
    sys.exit(1)
elif(n > 2):
    print("Too many arguments")
    sys.exit(1)

ExcelFileName = sys.argv[1]

workbook = xlrd.open_workbook(ExcelFileName)
nsheets=workbook.nsheets  # first sheet template
#print(f'sheets {nsheets}')

count=0
while count < nsheets:
    # open sheet 
    worksheet = workbook.sheet_by_index(count)

    # retreive values from excel
    appName=worksheet.row(0)[1].value
    description=worksheet.row(1)[1].value
    orgName=worksheet.row(4)[2].value
    orgDomain=worksheet.row(5)[2].value
    orgMSP=worksheet.row(6)[2].value
    orderDomainName=worksheet.row(8)[2].value

    # Docker CA & host ports
    DcaPort=int(worksheet.row(11)[2].value)
    hcaPort=int(worksheet.row(12)[2].value)
    peerNo=int(worksheet.row(14)[2].value)


    # docker ports for each organization
    dport1=int(worksheet.row(17)[2].value)
    dport2=int(worksheet.row(18)[2].value)

    #print(f'appName {appName}')
    #print(f'Description {description}')
    #print(f'orgName  {orgName}')
    #print(f'orgDomain  {orgDomain}')
    #print(f'orgMSP  {orgMSP}')
    #print(f'orderDomainName  {orderDomainName}')
    #print(f'Docker port No  {DcaPort}')
    #print(f'hcaPort  {hcaPort}')
    #print(f'peerNo  {peerNo}')
    #print(f'Dport1 {dport1}')
    #print(f'Dport1 {dport2}')


    fabricBinary='../fabric-binaries'


    # Derived from above
    caHostName='ca'
    caDomainName=caHostName+'.'+orgDomain
    caContainerName='ca_peer' + orgName
    orgProfilePath='../artifacts/orgProfile/'

    # create a folder with organization name in the current working directory
    orgPath='../artifacts/organizations/' + orgName

    docker_conf_folder = orgPath +'/docker-config'

    createFolder(orgPath)
    createFolder(docker_conf_folder)

    #create crypto configuration file for the organization
    cryptfile= orgPath + '/crypto-config.yaml'
    createPeerCryptoConfigFile('./samples/crypto-template.yaml',cryptfile,orgName,orgDomain,caHostName,peerNo)

    # Generate crypto material for the peers
    # cryptogen generate --config=crypto-config.yaml --output=crypto-config
    cmd=fabricBinary + '/' + 'cryptogen' + ' ' + 'generate' + ' ' + '--config=' + cryptfile + ' ' + '--output=' + orgPath + '/crypto-config' 
    #print(cmd)
    stdoutdata = subprocess.getoutput(cmd)
    #print("stdoutdata: " + stdoutdata.split()[0])   

    #create organisation folder
    # rename admin private key store to admin_sk which will be used in network.yaml
    # /ActsOrg/crypto-config/peerOrganizations/actsorg.cdac.in/users/Admin@actsorg.cdac.in/msp/keystore
    AdminPrivateKeyFolder=orgPath + '/crypto-config/peerOrganizations/'+ orgDomain + '/users/Admin@' + orgDomain + '/msp/keystore/'
    renameAdminPrivateKey(AdminPrivateKeyFolder)


    caoutputfile=docker_conf_folder+'/docker-ca.yaml'

    #print(color.BLUE + color.BOLD + 'CA Details : '+ color.END)


    # create Docker CA Configuration File
    createCAConfigFile(orgName ,orgDomain,caDomainName,caContainerName,hcaPort, caoutputfile,DcaPort)

    # copy base.yaml from ../samples/docker-config to docker folder
    cmd='cp ./samples/base.yaml ' + docker_conf_folder
    stdoutdata = subprocess.getoutput(cmd)
    #print("stdoutdata: " + stdoutdata.split()[0]) 

    #copy Fabric CA File
    caFolder=orgPath + '/crypto-config/peerOrganizations/' + orgDomain + '/ca'
    cmd='cp ./samples/fabric-ca-server-config-template.yaml ' + caFolder
    stdoutdata = subprocess.getoutput(cmd)

    Infile=caFolder + '/fabric-ca-server-config-template.yaml'
    Outfile=caFolder + '/fabric-ca-server-config.yaml'
    EditCAConfigFile(Infile,Outfile,orgName)

    print(color.BLUE + color.BOLD + 'Peer Details : '+ color.END)

    #(x,y) --(row,column) indicate the port numbers of each docker in xls sheet
    x=[21,22,25,26,28,29,31,32]
    y=2

    i=0
    j=0

    while i < int(peerNo) :
    # create peer Docker Configuration File
        hport1=int(worksheet.row(x[j])[y].value)
        j+=1
        hport2=int(worksheet.row(x[j])[y].value)
        j+=1    

    
        peerName='peer' + str(i) 
        #print(f'port of {peerName} : {hport1}')
        #print(f'port of {peerName} : {hport2}')

        peeroutputfile=docker_conf_folder+'/docker-' + peerName + '.yaml'
        createDockerPeerConfigFile(orgName,orgMSP,orgDomain,peerName,hport1,hport2,peeroutputfile,orderDomainName,dport1,dport2)
        i +=1

    #print(color.BLUE + color.BOLD + 'Organization Profile used in RESTAPI : ' + color.END)

    S = DoubleQuotedScalarString

    Certficatepath='./hyperledger/crypto-material/certs/fabric-client-kv-' + orgName
    keyValueStorePath='./hyperledger/crypto-material/keystore/fabric-client-kv-' + orgName

        #data={1:{21:22,31:32,4:{51:52,61:62},7:[{81:82},{91:92},{101:102}],11:[{121:122},{131:132}],14:[{151:152},{161:162}],17:[18]}}
    data={'name': S(appName),'x-type': S('hlfv1'),'description': S(description),'version': S('1.0'),'client':{'organization': orgName,'credentialStore':\
    {'path': S(Certficatepath),'cryptoStore':{'path': S(keyValueStorePath)},'wallet': 'wallet-name'}}}


    yaml = YAML()
    yaml.indent(sequence=4, offset=2)
    #yaml.dump(data, sys.stdout)
    outfile=orgProfilePath + orgName + '.yaml'
    with open(outfile, 'w') as outfile:
        yaml.dump(data, outfile)

    #print('Summary Info \n')
    #print(f'Organization Name: {orgName}')
    #print(f'Fabric Binaries Path: {fabricBinary}')
    count +=1
