#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

######## configure specific to  pmchaincode ###########################
export CC_SRC_PATH2="/home/cdac/Blockchain_Localgit/working/pmchaincode/clog"

export CHANNEL_CODE_NAME2="clog"
export CHANNEL_NAME2="cloudbctchannel"
export CHANNEL_PATH2="../hyperledger/artifacts/channel/cloudbctchannel/cloudbctchannel.tx"
export CHANNEL_VERSION2="v0"

export IP_ADDRESS="127.0.0.1:5000"
export ADMIN="Admin"
export ADMINPASS="Admin123"

export USER_NAME1="sireesha"
export USER_NAME2="saigopal"
export USER_NAME3="ravikishore"
export USER_NAME4="sandeep"
export ORG_NAME1="SurveyOrg"
export ORG_NAME2="RegOrg"
export ORG_NAME3="RevOrg"
export ORG_NAME4="OtherOrg"

export PASS_USER1="cdac@123"
export PASS_USER2="cdac@123"
export PASS_USER3="cdac@123"
export PASS_USER4="cdac@123"




#######################################################################

jq --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
	echo "Please Install 'jq' https://stedolan.github.io/jq/ to execute this script"
	echo
	exit 1
fi

starttime=$(date +%s)

# Print the usage message
function printHelp () {
  echo "Usage: "
  echo "  ./testAPIs.sh -l golang|node"
  echo "    -l <language> - chaincode language (defaults to \"golang\")"
}


# following variables need to Edit




#------------------------------------------------

#user login .............
echo " Login $USER_NAME1 ....... "
ORG_TOKEN1=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
	\"username\": \"$USER_NAME1\",
	\"password\":\"$PASS_USER1\"}")

echo " Response  : $ORG_TOKEN1"

ORG_TOKEN1=$(echo $ORG_TOKEN1 | jq ".token" | sed "s/\"//g")


#user login .............
echo " Login $USER_NAME2 ....... "
ORG_TOKEN2=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
	\"username\": \"$USER_NAME2\",
	\"password\":\"$PASS_USER2\"}")

echo " Response  : $ORG_TOKEN2"

ORG_TOKEN2=$(echo $ORG_TOKEN2 | jq ".token" | sed "s/\"//g")

#user login .............
echo " Login $USER_NAME3 ....... "
ORG_TOKEN3=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
	\"username\": \"$USER_NAME3\",
	\"password\":\"$PASS_USER3\"}")

echo " Response  : $ORG_TOKEN3"

ORG_TOKEN3=$(echo $ORG_TOKEN3 | jq ".token" | sed "s/\"//g")

#user login .............
echo " Login $USER_NAME2 ....... "
ORG_TOKEN4=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
	\"username\": \"$USER_NAME4\",
	\"password\":\"$PASS_USER4\"}")

echo " Response  : $ORG_TOKEN4"

ORG_TOKEN4=$(echo $ORG_TOKEN4 | jq ".token" | sed "s/\"//g")

echo "Creating $CHANNEL_NAME2 by Survey  user ..."
echo
CHANNEL_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels \
  -H "content-type: application/json" \
  -H "authorization: Bearer $ORG_TOKEN1" \
  -d "{ \"channelName\": \"$CHANNEL_NAME2\", \"channelConfigPath\": \"$CHANNEL_PATH2\"
}")
echo
sleep 2
echo -e "\033[31m CHANNEL CREATION RESPONSE : $CHANNEL_RESPONSE  \e[0m"

echo " CHANNEL CREATION IS DONE "


echo "Join request from $ORG_NAME1"
echo
JOIN_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels/$CHANNEL_NAME2/peers \
  -H "authorization: Bearer $ORG_TOKEN1" \
  -H "content-type: application/json" \
  -d "{
	\"peers\": [\"peer0.surveyorg.cdac.in\",\"peer1.surveyorg.cdac.in\"]
}")
echo
echo -e "\033[31m JOIN RESPONSE : $JOIN_RESPONSE \e[0m"
sleep 2

echo "Join request from $ORG_NAME2"
echo
JOIN_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels/$CHANNEL_NAME2/peers \
  -H "authorization: Bearer $ORG_TOKEN2" \
  -H "content-type: application/json" \
  -d "{
	\"peers\": [\"peer0.regorg.cdac.in\",\"peer1.regorg.cdac.in\"]
}")
echo
echo -e "\033[31m JOIN RESPONSE : $JOIN_RESPONSE \e[0m"
sleep 2

echo "Join request from $ORG_NAME3"
echo
JOIN_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels/$CHANNEL_NAME2/peers \
  -H "authorization: Bearer $ORG_TOKEN3" \
  -H "content-type: application/json" \
  -d "{
	\"peers\": [\"peer0.revorg.cdac.in\",\"peer1.revorg.cdac.in\"]
}")
echo
echo -e "\033[31m JOIN RESPONSE : $JOIN_RESPONSE \e[0m"
sleep 2

echo "Join request from $ORG_NAME4"
echo
JOIN_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels/$CHANNEL_NAME2/peers \
  -H "authorization: Bearer $ORG_TOKEN4" \
  -H "content-type: application/json" \
  -d "{
	\"peers\": [\"peer0.otherorg.cdac.in\",\"peer1.otherorg.cdac.in\"]
}")

echo
sleep 2

echo -e "\033[31m JOIN RESPONSE : $JOIN_RESPONSE \e[0m"


echo "All PEERS Joined the Channel "



echo "Installing chaincode on $ORG_NAME1"
echo
INSTALL_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/chaincodes \
  -H "authorization: Bearer $ORG_TOKEN1" \
  -H "content-type: application/json" \
  -d "{
	\"peers\": [\"peer0.surveyorg.cdac.in\",\"peer1.surveyorg.cdac.in\"],
	\"chaincodeName\":\"$CHANNEL_CODE_NAME2\",
	\"chaincodePath\":\"$CC_SRC_PATH2\",
	\"chaincodeType\": \"node\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION2\"
}")
echo
echo -e "\033[31m INSTALL RESPONSE : $INSTALL_RESPONSE \e[0m"

echo "Installing chaincode on $ORG_NAME2"
echo
sleep 2
INSTALL_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/chaincodes \
  -H "authorization: Bearer $ORG_TOKEN2" \
  -H "content-type: application/json" \
  -d "{
	\"peers\": [\"peer0.regorg.cdac.in\",\"peer1.regorg.cdac.in\"],
	\"chaincodeName\":\"$CHANNEL_CODE_NAME2\",
	\"chaincodePath\":\"$CC_SRC_PATH2\",
	\"chaincodeType\": \"node\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION2\"
}")
echo
echo -e "\033[31m INSTALL RESPONSE : $INSTALL_RESPONSE \e[0m"
sleep 2
echo "Installing chaincode on $ORG_NAME3"
echo
INSTALL_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/chaincodes \
  -H "authorization: Bearer $ORG_TOKEN3" \
  -H "content-type: application/json" \
  -d "{
	\"peers\": [\"peer0.revorg.cdac.in\",\"peer1.revorg.cdac.in\"],
	\"chaincodeName\":\"$CHANNEL_CODE_NAME2\",
	\"chaincodePath\":\"$CC_SRC_PATH2\",
	\"chaincodeType\": \"node\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION2\"
}")
echo
echo -e "\033[31m INSTALL RESPONSE : $INSTALL_RESPONSE \e[0m"
sleep 2
echo "Installing chaincode on $ORG_NAME4"
echo
INSTALL_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/chaincodes \
  -H "authorization: Bearer $ORG_TOKEN4" \
  -H "content-type: application/json" \
  -d "{
	\"peers\": [\"peer0.otherorg.cdac.in\",\"peer1.otherorg.cdac.in\"],
	\"chaincodeName\":\"$CHANNEL_CODE_NAME2\",
	\"chaincodePath\":\"$CC_SRC_PATH2\",
	\"chaincodeType\": \"node\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION2\"
}")

echo
echo -e "\033[31m INSTALL RESPONSE : $INSTALL_RESPONSE \e[0m"
sleep 2

echo "Enter Organization number on which Instantiate has to be performed"
echo " 1.SurveyOrg "
echo " 2.RegOrg "
echo " 3.RevOrg "
echo " 4.OtherOrg " 
      

read num
case $num in
    "1" )
        NODE=surveyorg
        TOKEN=$ORG_TOKEN1
        ;;
    "2" )
        NODE=regorg
        TOKEN=$ORG_TOKEN2
        ;;
    "3")
        NODE=revorg
        TOKEN=$ORG_TOKEN3
        ;;
    "4")
        NODE=otherorg
        TOKEN=$ORG_TOKEN4
        ;;
    *) echo "Wrong Input"
       exit 0
       ;; 
esac

sleep 2

echo
INSTANIATE_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels/$CHANNEL_NAME2/chaincodes \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -d "{
  \"peers\" : [\"peer0.$NODE.cdac.in\"],  
	\"chaincodeName\":\"$CHANNEL_CODE_NAME2\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION2\",
	\"chaincodeType\": \"node\",
  \"fcn\" : \"initPropertyLedger\",
	\"args\":[\"\"]
}")
echo
echo -e "\033[31m INSTANTIATE RESPONSE : $INSTANIATE_RESPONSE \e[0m"


exit 0

