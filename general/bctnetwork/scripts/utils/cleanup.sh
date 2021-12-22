cd ..
python3 stop_network.py

# remove docker peer,orderer data
sudo rm -rf /var/hyperledger

# remove fabric
sudo rm ../artifacts/organizations/CdacOrg/crypto-config/peerOrganizations/cdacorg.cdac.in/ca/fabric-ca-server.db 
sudo rm ../artifacts/organizations/RegOrg/crypto-config/peerOrganizations/regorg.cdac.in/ca/fabric-ca-server.db 
sudo rm ../artifacts/organizations/RevOrg/crypto-config/peerOrganizations/revorg.cdac.in/ca/fabric-ca-server.db 
sudo rm ../artifacts/organizations/SurveyOrg/crypto-config/peerOrganizations/surveyorg.cdac.in/ca/fabric-ca-server.db 
sudo rm ../artifacts/organizations/OtherOrg/crypto-config/peerOrganizations/otherorg.cdac.in/ca/fabric-ca-server.db 
sudo rm ../artifacts/organizations/SecOrg/crypto-config/peerOrganizations/secorg.cdac.in/ca/fabric-ca-server.db 



# remove all users from mongodb
MONGODBPATH="/home/saigopal/softwares/mongodb-linux-x86_64-ubuntu1604-3.6.3"
killall mongod
rm -rf  $MONGODBPATH/data/* 

#remove crypto-material from restAPI
#Assume that pmbctrest and general are in same folder
sudo rm -rf ../../../../pmbctrest/hyperledger/crypto-material/

# Delete all containers
#remove only the chaincode not the fabric CA, peers
docker rmi -f $(docker images | grep 'dev-peer')



