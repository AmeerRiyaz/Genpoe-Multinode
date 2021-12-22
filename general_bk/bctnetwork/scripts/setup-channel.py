# 1. create a folder with channel-name in ../artifacts/channel
# 2. create configtx.yaml file manual and copy to ../artifacts/channel/channel-name folder
# 3. configtxgen environment variable 
# 4. Creating genesis file
# 5. Creating channel
# 6. updating anchor peer's of each organisation

#!/usr/bin/python3
from crypto_key import createFolder
import subprocess 
import os

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

print(color.BLUE + color.BOLD + 'Channel Details : '+ color.END)
channelName=input('\t Name of the Channel : ')
profileName=input('\t Profile Name for orderer and genesis mentioned in configtx.yaml file : ')
profileChannel=input('\t Profile Name mentioned for channel mentioned in configtx.yam fie : ')

x = input('\t List all the organizations part of channel with space as delimiter : ')
orgList = list(map(str, x.split()))


#copy configtxPath to ../artifacts/channel/channelname/
channelPath='../artifacts/channel/' + channelName
fabricBinary='../fabric-binaries'
createFolder(channelPath)

# configtxgen tool reads  configtx.yaml using FABRIC_CFG_PATH
os.environ['FABRIC_CFG_PATH'] = '../artifacts/channel/'

#copy configtx.yaml to channel folder
cmd='cp ./samples/configtx.yaml ' + '../artifacts/channel/'
stdoutdata = subprocess.getoutput(cmd)
#print("stdoutdata: " + stdoutdata.split()[0])

# Genesis block creation per channel
# genesis block should not be overwritten...it will create problem for single orderer with
# multiple channel
#configtxgen -profile FourOrgsOrdererGenesis -outputBlock ../artifacts/channel/genesis.block
genesisFile='../artifacts/channel/' + 'genesis.block'
if not os.path.isfile(genesisFile):
    print("genesis block file doesn't exist")
    cmd=fabricBinary + '/configtxgen -profile  ' + profileName + ' -outputBlock ' + '../artifacts/channel'+ '/genesis.block'
    print(cmd)

    stdoutdata = subprocess.getoutput(cmd)
    print("stdoutdata: " + stdoutdata)

# channel.tx file creation for PM
#$FABRIC_BIN/configtxgen -profile FourOrgsChannel -outputCreateChannelTx ../artifacts/channel/$CHANNEL_NAME/pmbctchannel.tx -channelID $CHANNEL_NAME
cmd=fabricBinary + '/configtxgen -profile  ' + profileChannel + ' -outputCreateChannelTx ' + channelPath +'/' + channelName + '.tx' + ' -channelID' + ' ' + channelName
#print(cmd)
stdoutdata = subprocess.getoutput(cmd)
#print("stdoutdata: " + stdoutdata.split()[0])

#updating Anchor Peer
for eachOrg in orgList:
#$FABRIC_BIN/configtxgen -profile FourOrgsChannel -outputAnchorPeersUpdate ../artifacts/channel/$CHANNEL_NAME/RevMSPanchors.tx -channelID pmbctchannal.tx -asOrg RevMSP
    orgMSP=eachOrg[:-3]+'MSP'
    cmd=fabricBinary + '/configtxgen -profile ' + profileChannel + ' -outputAnchorPeersUpdate ' +channelPath + '/'+ orgMSP + 'anchors.tx' +' ' + '-channelID  ' +  channelName + '.tx' + ' -asOrg ' + orgMSP
    #print(cmd)
    stdoutdata = subprocess.getoutput(cmd)
    print("stdoutdata: " + stdoutdata)


# update the channel information in the orderer