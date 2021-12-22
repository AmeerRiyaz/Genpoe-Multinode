#
# Author: Sandeep Romana (sandeepr@cdac.in)
# Date: 27-06-2018
# Copyright(R) - 2018, Center For Development of Advanced Computing. Hyderabad.
# VERSION 2.0
#

# list of cli commands to test pms-chaincode on bctnetwork in devmode

# 1. list the channels joined by peer
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp peer channel list

# 2. Create the channel pmbctchannel
docker exec -e "CORE_PEER_LOCALMSPID=RevMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@revorg.cdac.in/msp" peer0.revorg.cdac.in peer channel create -o orderer.cdac.in:7050 -c pmbctchannel -f /etc/hyperledger/configtx/pmbctchannel.tx

# 3. peer0.revorg.cdac.in Join the channel
docker exec -e "CORE_PEER_LOCALMSPID=RevMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@revorg.cdac.in/msp" peer0.revorg.cdac.in peer channel join -b pmbctchannel.block

# 4. view peer0 docker logs in continious mode
docker logs -f peer0.revorg.cdac.in

##################################
# In terminal no. 2
##################################

# 5. Browse to location of node chaincode

# 6. npm install

# 7. Start node chaincode in debug . replace the ip with your local systems IP Address
CORE_CHAINCODE_ID_NAME="mycc:v0" node inspect pms-chaincode.js --peer.address grpc://10.244.0.169:7052

# 8. inside debug prompt use 'cont' and '.exit' commands

# 9. modify node code and do steps 2 & 3 above as required 

###################################
# In terminal no. 3
###################################

# 10. install chaincode. adjust paths according to your system. by Admin of RevOrg
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp peer chaincode install -n mycc -v v0 -p /home/embd-sec/Desktop/pmchaincode/node -l node

# 11. List installed chaincode by Admin of RevOrg
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp peer chaincode list --installed

# 12. Instantiate chaincode by Admin of RevOrg
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp peer chaincode instantiate -n mycc -l node -v v0 -C pmbctchannel -c '{"args":[""]}' -o localhost:7050 

# 13. List instantiated chaincodes by Admin of RevOrg
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp peer chaincode list -C pmbctchannel --instantiated

# 14. Admin user enrollment
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client enroll -u http://admin:adminpw@localhost:7054 --enrollment.attrs "" -M "/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp"

# 15. User2 register as role.creator
#CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client register --id.name user2 --id.secret user2pw --id.type user --id.affiliation revorg --id.attrs 'role=creator:ecert,email=user2@gmail.com' 

# 16. enroll user2
#CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client enroll -u http://user2:user2pw@localhost:7054 --enrollment.attrs "role.creator,email,phone:opt" -M "/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user2@revorg.cdac.in/msp"

# 17. User3 register as role.writer
#CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client register --id.name user3 --id.secret user3pw --id.type user --id.affiliation revorg --id.attrs 'role.writer=true:ecert,email=user3@gmail.com'

# 18. enroll user3
#CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client enroll -u http://user3:user3pw@localhost:7054 --enrollment.attrs "role.writer,email,phone:opt" -M "/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user3@revorg.cdac.in/msp"

# 19. User4 register as role.reader
#CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client register --id.name user4 --id.secret user4pw --id.type user --id.affiliation revorg --id.attrs 'role.reader=true:ecert,email=user4@gmail.com'

# 20. enroll user4
#CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client enroll -u http://user4:user4pw@localhost:7054 --enrollment.attrs "role.reader,email,phone:opt" -M "/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user4@revorg.cdac.in/msp"

# use user5=writer and user6=reader from poev2

# 17. user7 register as role=creator
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client register --id.name user7 --id.secret user7pw --id.type user --id.affiliation revorg --id.attrs 'role=creator:ecert,email=user7@gmail.com'

# 18. enroll user7
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client enroll -u http://user7:user7pw@localhost:7054 --enrollment.attrs "role,email,phone:opt" -M "/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user7@revorg.cdac.in/msp"


###################################
### copy admin cert directory from users/Admin to all the other users created above in case there is no admincert folder and certificate in each users msp folder as in point 14 below
### if there is no admin certificate in users msp folder the below commands will give error.
###################################

# 21. cd /home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user2@revorg.cdac.in/msp

# 22. cp -r ../../Admin@revorg.cdac.in/msp/admincerts/ ./

# 23. initLedger with user2 i.e. role.creator
#CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user2@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mycc -c '{"function":"initLedger","Args":[""]}'

# 24. recordProperty with user7 i.e. role=creator
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user7@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mycc -c '{"function":"recordProperty","Args":["80e0d3101d785e1f011863666cf649e2cc1003c7089e68fa3c9bfc163d9db152", "Sample", "432143214321", "AQMPR1154B", "Some FatherName", "Some District", "Some SRO", "Some SubDivision", "Some Mandal", "Some Village", "Some SurveryNo", "AreaExtent", "Some Category", "" ]}'

# 25. changePropertyHolder with user5 i.e. role=writer
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user5@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mycc -c '{"function":"changePropertyHolder","Args":["80e0d3101d785e1f011863666cf649e2cc1003c7089e68fa3c9bfc163d9db152", "Sample", "432143214321", "AQMPR1154B", "Some FatherName", "New Owner", "432143214311", "AQMPR1154A", "New Father Name"]}'

# 26. queryByPropertyId with user6 i.e. role=reader
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user6@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mycc -c '{"function":"queryByPropertyId","Args":["80e0d3101d785e1f011863666cf649e2cc1003c7089e68fa3c9bfc163d9db152"]}'

#queryByTxId
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user6@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mycc -c '{"function":"queryByTxId","Args":["1e7945ccd36539dc64cf86061eb25b10e6b08672c436322b6ed5af10bac7a17e"]}'


# 27. queryPropertiesByRange user4 i.e. role.reader
#CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user4@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mycc -c '{"function":"queryPropertiesByRange","Args":["PROPERTY1","PROPERTY5"]}'

# 28. getHistoryForPropID user6 i.e. role=reader
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user6@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mycc -c '{"function":"getHistoryForPropID","Args":["80e0d3101d785e1f011863666cf649e2cc1003c7089e68fa3c9bfc163d9db152"]}'

# updatePoeTxId by writer - user5
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user5@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mycc -c '{"function":"updatePoeTxId","Args":["80e0d3101d785e1f011863666cf649e2cc1003c7089e68fa3c9bfc163d9db152", "1e7945ccd36539dc64cf86061eb25b10e6b08672c436322b6ed5af10bac7a17e", "poetxid1234567890"]}'