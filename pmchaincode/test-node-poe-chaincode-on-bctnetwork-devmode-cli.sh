#
# Author: Sandeep Romana (sandeepr@cdac.in)
# Date: 27-06-2018
# Copyright(R) - 2018, Center For Development of Advanced Computing. Hyderabad.
#

# list of cli commands to test poe-chaincode on bctnetwork in dev-mode om pmsbctchannel

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
CORE_CHAINCODE_ID_NAME="mypoe:v0" node inspect poe-chaincode.js --peer.address grpc://10.244.0.169:7052

# 8. inside debug prompt use 'cont' and '.exit' commands

# 9. modify node code and do steps 2 & 3 above as required 

###################################
# In terminal no. 3
###################################

# 10. install chaincode. adjust paths according to your system. by Admin of RevOrg
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp peer chaincode install -n mypoe -v v0 -p /home/embd-sec/Desktop/pmchaincode/node -l node

# 11. List installed chaincode by Admin of RevOrg
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp peer chaincode list --installed

# 12. Instantiate chaincode by Admin of RevOrg
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp peer chaincode instantiate -n mypoe -l node -v v0 -C pmbctchannel -c '{"args":[""]}' -o localhost:7050 

# 13. List instantiated chaincodes by Admin of RevOrg
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp peer chaincode list -C pmbctchannel --instantiated

# 14. Admin user enrollment
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client enroll -u http://admin:adminpw@localhost:7054 --enrollment.attrs "" -M "/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp"

# 15. User3 register as role.writer
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client register --id.name user3 --id.secret user3pw --id.type user --id.affiliation revorg --id.attrs 'role.writer=true:ecert,email=user3@gmail.com'

# user5 register as role=writer
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client register --id.name user5 --id.secret user5pw --id.type user --id.affiliation revorg --id.attrs 'role=writer:ecert,email=user5@gmail.com'

# 16. enroll user3
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client enroll -u http://user3:user3pw@localhost:7054 --enrollment.attrs "role.writer,email,phone:opt" -M "/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user3@revorg.cdac.in/msp"

# 17. User4 register as role.reader
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client register --id.name user4 --id.secret user4pw --id.type user --id.affiliation revorg --id.attrs 'role.reader=true:ecert,email=user4@gmail.com'

# 18. enroll user4
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client enroll -u http://user4:user4pw@localhost:7054 --enrollment.attrs "role.reader,email,phone:opt" -M "/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user4@revorg.cdac.in/msp"

###################################
### copy admin cert directory from users/Admin to all the other users created above in case there is no admincert folder and certificate in each users msp folder as in point 19 below
### if there is no admin certificate in users msp folder the below commands will give error.
###################################

# 19. cd /home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user2@revorg.cdac.in/msp

# 20. cp -r ../../Admin@revorg.cdac.in/msp/admincerts/ ./

# 21. recordProofOfEx with user3 i.e. role.writer
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user3@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mypoe -c '{"function":"recordProofOfEx","Args":["5961E3B753351A1D0B44B19007DD1B227D5DF8A32E45F3C5E0FA1BCAC1EA6CA8","prop.txt","porp@someone.com"]}'

# 22. queryProofOfEx with user3 i.e. role.writer for existing record created in previous step
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user3@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mypoe -c '{"function":"queryProofOfEx","Args":["5961E3B753351A1D0B44B19007DD1B227D5DF8A32E45F3C5E0FA1BCAC1EA6CA8" ]}'

# 23. recordProofOfEx with user4 i.e. role.reader
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user4@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mypoe -c '{"function":"recordProofOfEx","Args":["5C4EB5FB5DED8602BCBC56705E94E8CE645A1486F037B842C31F42149936F062", "import.txt", "import@someone.com" ]}'

# 24. recordProofOfEx with user4 i.e. role.reader for non existent record
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user4@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mypoe -c '{"function":"queryProofOfEx","Args":[ "5C4EB5FB5DED8602BCBC56705E94E8CE645A1486F037B842C31F42149936F064" ]}'
