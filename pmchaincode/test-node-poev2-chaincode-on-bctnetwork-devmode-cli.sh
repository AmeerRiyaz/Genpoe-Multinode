#
# Author: Sandeep Romana (sandeepr@cdac.in)
# Date: 03-07-2018
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

# 15. user5 register as role=writer
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client register --id.name user5 --id.secret user5pw --id.type user --id.affiliation revorg --id.attrs 'role=writer:ecert,email=user5@gmail.com'

# 16. enroll user5
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client enroll -u http://user5:user5pw@localhost:7054 --enrollment.attrs "role,email,phone:opt" -M "/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user5@revorg.cdac.in/msp"

# 17. user6 register as role=reader
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client register --id.name user6 --id.secret user6pw --id.type user --id.affiliation revorg --id.attrs 'role=reader:ecert,email=user6@gmail.com'

# 18. enroll user6
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/Admin@revorg.cdac.in/msp fabric-ca-client enroll -u http://user6:user6pw@localhost:7054 --enrollment.attrs "role,email,phone:opt" -M "/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user6@revorg.cdac.in/msp"

###################################
### copy admin cert directory from users/Admin to all the other users created above in case there is no admincert folder and certificate in each users msp folder as in point 19 below
### if there is no admin certificate in users msp folder the below commands will give error.
###################################

# 19. cd /home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user2@revorg.cdac.in/msp

# 20. cp -r ../../Admin@revorg.cdac.in/msp/admincerts/ ./

# 21. recordProofOfEx with user5 i.e. role=writer
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user5@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mypoe -c '{"function":"recordProofOfEx","Args":["d15707c02f0f90d4beabc59cd485dbccb217f2050d77ca079d77602da11d425d","990f6040e00920f2aa438d654711796a71862d25","import50.txt","TXT","Sale Deed","Some Person"]}'

# 22. queryProofOfEx with user5 i.e. role=writer for existing record created in previous step
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user5@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mypoe -c '{"function":"queryProofOfEx","Args":["d15707c02f0f90d4beabc59cd485dbccb217f2050d77ca079d77602da11d425d" ]}'

# 23. recordProofOfEx with user6 i.e. role=reader
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user6@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mypoe -c '{"function":"recordProofOfEx","Args":["97df0cad5170e190ec62aa292ffaed697df5bb0ef2307fd2a54e67eb381c5be7", "ba29fb766f0fd24bea57572e78295258e89e1f8c", "import51.txt", "PDF", "AOS", "Another Person"]}'

# 24. recordProofOfEx with user6 i.e. role=reader for non existent record
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user6@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mypoe -c '{"function":"queryProofOfEx","Args":["97df0cad5170e190ec62aa292ffaed697df5bb0ef2307fd2a54e67eb381c5be7"]}'

# 25. queryProofOfExByTxid wither user6 [Note: change the txid accordingly]
CORE_PEER_LOCALMSPID=RevMSP CORE_PEER_MSPCONFIGPATH=/home/embd-sec/general/hyperledger/pmbctnetwork/pmbctnetwork/artifacts/channel/crypto-config/peerOrganizations/revorg.cdac.in/users/user6@revorg.cdac.in/msp peer chaincode invoke -o localhost:7050 -C pmbctchannel -n mypoe -c '{"function":"queryProofOfExByTxid","Args":["52b3d84798b885b59e8e2dfbcebbb65b8bcc67a696a96633925af418f1287059"]}'

#EOF