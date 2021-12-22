#
# Author: Sandeep Romana (sandeepr@cdac.in)
# Date: 27-06-2018
# Copyright(R) - 2018, Center For Development of Advanced Computing. Hyderabad.
#

###  commands and resources to test node chaincode in developement environment via CLI using basic network on fabric v1.1

###################################
## 'https://www.youtube.com/watch?v=dzwR0dwzXNs'
###################################

###################################
# In terminal no. 1
###################################
# 1. start basic network in debug and developer mode as instrauctions from above video
# 2. list the channel. make sure the right path is given.
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer channel list

# 3. view peer0 docker logs in continious mode
docker logs -f peer0.org1.example.com

##################################
# In terminal no. 2
##################################
# 1. Browse to location of node chaincode
# 2. npm install
# 3. Start node chaincode in debug . replace the ip with your local systems IP Address
CORE_CHAINCODE_ID_NAME="mycc:v0" node inspect poe-chaincode.js --peer.address grpc://10.244.0.169:7052

# 4. inside debug prompt use 'cont' and '.exit' commands
# 5. modify node code and do steps 2 & 3 above as required 

###################################
# In terminal no. 3
###################################
# 1. install chaincode. adjust paths according to your system.
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer chaincode install -n mycc -v v0 -p /home/embd-sec/fabric/poe/chaincode/node -l node

# 2. list installed chaincode
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer chaincode list --installed

# 3. Instantiate chaincode
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer chaincode instantiate -n mycc -l node -v v0 -C mychannel -c '{"args":[""]}' -o localhost:7050 

# 4. list instantiated chaincodes
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer chaincode list -C mychannel --instantiated

# 5. Admin user enrollment
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp fabric-ca-client enroll -u http://admin:adminpw@localhost:7054 --enrollment.attrs "" -M "/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"

###################################
### copy admin cert directory from users/Admin to all the other users created above in case there is no admincert folder and certificate in each users msp folder
### if there is no admin certificate in users msp folder the below commands will give error.
###################################
# 0. /home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/user2@org1.example.com/msp
# 1. cd ../../user3@org1.example.com/msp/
# 2. cp -r ../../Admin@org1.example.com/msp/admincerts/ ./

# recordProofOfEx with Admin user 
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer chaincode invoke -o localhost:7050 -C mychannel -n mycc -c '{"function":"recordProofOfEx","Args":["AADF327C8267C09D6FFFD87A1A80AD3C798469FF332B7A57B9E8C045D46B2AF7","file.txt","some@someone.com" ]}'

# queryProofOfEx with Admin user 
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer chaincode invoke -o localhost:7050 -C mychannel -n mycc -c '{"function":"queryProofOfEx","Args":["AADF327C8267C09D6FFFD87A1A80AD3C798469FF332B7A57B9E8C045D46B2AF7"]}'

