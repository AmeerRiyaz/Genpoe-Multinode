#
# Author: Sandeep Romana (sandeepr@cdac.in)
# Date: 27-06-2018
# Copyright(R) - 2018, Center For Development of Advanced Computing. Hyderabad.
#

###  commands and resources to test node chaincode (pms-chaincode) in developement environment via CLI using basic network on fabric v1.1

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
CORE_CHAINCODE_ID_NAME="mycc:v0" node inspect pms-chaincode.js --peer.address grpc://10.244.0.169:7052

# 4. inside debug prompt use 'cont' and '.exit' commands
# 5. modify node code and do steps 2 & 3 above as required 

###################################
# In terminal no. 3
###################################
# 1. install chaincode. adjust paths according to your system.
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer chaincode install -n mycc -v v0 -p /home/embd-sec/fabric/fabric-samples/chaincode/pms/node -l node

# 2. list installed chaincode
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer chaincode list --installed

# 3. Instantiate chaincode
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer chaincode instantiate -n mycc -l node -v v0 -C mychannel -c '{"args":[""]}' -o localhost:7050 

# 4. list instantiated chaincodes
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer chaincode list -C mychannel --instantiated

# 5. Admin user enrollment
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp fabric-ca-client enroll -u http://admin:adminpw@localhost:7054 --enrollment.attrs "" -M "/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"

# User2 register as role.creator
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp fabric-ca-client register --id.name user2 --id.secret user2pw --id.type user --id.affiliation org1 --id.attrs 'role.creator=true:ecert,email=user2@gmail.com' 

# enroll user2
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp fabric-ca-client enroll -u http://user2:user2pw@localhost:7054 --enrollment.attrs "role.creator,email,phone:opt" -M "/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/user2@org1.example.com/msp"

# User3 register as role.writer
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp fabric-ca-client register --id.name user3 --id.secret user3pw --id.type user --id.affiliation org1 --id.attrs 'role.writer=true:ecert,email=user3@gmail.com'

# enroll user3
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp fabric-ca-client enroll -u http://user3:user3pw@localhost:7054 --enrollment.attrs "role.writer,email,phone:opt" -M "/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/user3@org1.example.com/msp"

# User4 register as role.reader
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp fabric-ca-client register --id.name user4 --id.secret user4pw --id.type user --id.affiliation org1 --id.attrs 'role.reader=true:ecert,email=user4@gmail.com'

# enroll user4
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp fabric-ca-client enroll -u http://user4:user4pw@localhost:7054 --enrollment.attrs "role.reader,email,phone:opt" -M "/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/user4@org1.example.com/msp"

###################################
### copy admin cert directory from users/Admin to all the other users created above in case there is no admincert folder and certificate in each users msp folder
### if there is no admin certificate in users msp folder the below commands will give error.
###################################
# 1. cd ../../user3@org1.example.com/msp/
# 2. cp -r ../../Admin@org1.example.com/msp/admincerts/ ./

# initLedger with user2 i.e. role.creator
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/user2@org1.example.com/msp peer chaincode invoke -o localhost:7050 -C mychannel -n mycc -c '{"function":"initLedger","Args":[""]}'

# recordProperty with user2 i.e. role.creator
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/user2@org1.example.com/msp peer chaincode invoke -o localhost:7050 -C mychannel -n mycc -c '{"function":"recordProperty","Args":["11","112","Sample", "432143214321", "AQMPR1154B", "Some FatherName", "Some SurveryNo", " Some SubDivision", "Some District", "Some Mandal", "Some Village", "Some AreaExtent", "Some SROffice", "Some Category" ]}'

# changePropertyHolder with user3 i.e. role.writer
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/user3@org1.example.com/msp peer chaincode invoke -o localhost:7050 -C mychannel -n mycc -c '{"function":"changePropertyHolder","Args":["11", "Changed Owner", "432143214321", "SOMEPANNO", "Some FatherName" ]}'

# queryProperty with user4 i.e. role.reader
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/user4@org1.example.com/msp peer chaincode invoke -o localhost:7050 -C mychannel -n mycc -c '{"function":"queryProperty","Args":["11"]}'

# queryPropertiesByRange user4 i.e. role.reader
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/user4@org1.example.com/msp peer chaincode invoke -o localhost:7050 -C mychannel -n mycc -c '{"function":"queryPropertiesByRange","Args":["PROPERTY1","PROPERTY5"]}'

# getHistoryForPropID user4 i.e. role.reader
CORE_PEER_LOCALMSPID=Org1MSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/fabric/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/user4@org1.example.com/msp peer chaincode invoke -o localhost:7050 -C mychannel -n mycc -c '{"function":"getHistoryForPropID","Args":["PROPERTY1"]}'
