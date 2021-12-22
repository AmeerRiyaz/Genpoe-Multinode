#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

######## configure specific to  hmchaincode ###########################
export CC_SRC_PATH="/home/cdac/BCT/pmchaincode/node"
export CC_SRC_PATH1="/home/cdac/BCT/pmchaincode/poe/node"

export CHANNEL_CODE_NAME="pmbct"
export CHANNEL_NAME="pmbctchannel"
export CHANNEL_PATH="../hyperledger/artifacts/channel/pmbctchannel/pmbctchannel.tx"
export CHANNEL_VERSION="v0"

export CHANNEL_NAME1="pmpoechannel"
export CHANNEL_PATH1="../hyperledger/artifacts/channel/pmpoechannel/pmpoechannel.tx"
export CHANNEL_CODE_NAME1="pmpoe"
export CHANNEL_VERSION1="v0"


export IP_ADDRESS="127.0.0.1:5000"
export ADMIN="Admin"
export ADMINPASS="Admin123"

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
export USER_NAME1="sudha"
export USER_NAME2="karthik"
export ORG_NAME1="CdacOrg"
export ORG_NAME2="SecOrg"
#------------------------------------------------


#Admin login .............
ADMIN_TOKEN=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
	\"username\": \"$ADMIN\",
	\"password\":\"$ADMINPASS\"}")

	echo "adminstrator registration : $ADMIN_TOKEN"

ADMIN_TOKEN=$(echo $ADMIN_TOKEN | jq ".token" | sed "s/\"//g")


#survey user registration

echo " Enroll $USER_NAME1 in $ORG_NAME1  ..."
echo " "

ORG_TOKEN1=$(curl -s -X POST \
  http://$IP_ADDRESS/usersbct \
  -H "content-type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
	\"username\": \"$USER_NAME1\",
	\"orgName\":\"$ORG_NAME1\",
	\"password\":\"cdac@123\",
	\"attr\":\"survey\"
}")

echo -e "\033[31m user Registration Response of $ORG_NAME1 : $ORG_TOKEN1 \e[0m"
ORG_TOKEN1=$(echo $ORG_TOKEN1 | jq ".token" | sed "s/\"//g")
echo "$ORG_TOKEN1"

sleep 2

#echo
#echo "$ORG_NAME1 token is $ORG_TOKEN1"
#echo $ORG_TOKEN1 > token/survey.txt


#reg user registration
echo " Enroll $USER_NAME2 in $ORG_NAME2  ..."
echo " "
ORG_TOKEN2=$(curl -s -X POST \
  http://$IP_ADDRESS/usersbct \
  -H "content-type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
	\"username\": \"$USER_NAME2\",
	\"orgName\":\"$ORG_NAME2\",
	\"password\":\"cdac@123\",
	\"attr\":\"sro\"
}")

echo 
echo " "
echo -e "\033[31m user Registration Response of $ORG_NAME2 : $ORG_TOKEN2 \e[0m"

ORG_TOKEN2=$(echo $ORG_TOKEN2 | jq ".token" | sed "s/\"//g")


echo "Creating $CHANNEL_NAME1 by Survey  user ..."
echo
CHANNEL_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels \
  -H "content-type: application/json" \
  -H "authorization: Bearer $ORG_TOKEN1" \
  -d "{ \"channelName\": \"$CHANNEL_NAME1\", \"channelConfigPath\": \"$CHANNEL_PATH1\"
}")
echo

echo -e "\033[31m CHANNEL CREATION RESPONSE : $CHANNEL_RESPONSE  \e[0m"
echo " CHANNEL CREATION IS DONE "


echo "Join request from $ORG_NAME1"
echo
JOIN_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels/$CHANNEL_NAME/peers \
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
  http://$IP_ADDRESS/channels/$CHANNEL_NAME/peers \
  -H "authorization: Bearer $ORG_TOKEN2" \
  -H "content-type: application/json" \
  -d "{
	\"peers\": [\"peer0.regorg.cdac.in\",\"peer1.regorg.cdac.in\"]
}")
echo
echo -e "\033[31m JOIN RESPONSE : $JOIN_RESPONSE \e[0m"
sleep 2

echo "All PEERS Joined the Channel "


echo "Installing chaincode on $ORG_NAME1"
echo
INSTALL_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/chaincodes \
  -H "authorization: Bearer $ORG_TOKEN1" \
  -H "content-type: application/json" \
  -d "{
	\"peers\": [\"peer0.surveyorg.cdac.in\",\"peer1.surveyorg.cdac.in\"],
	\"chaincodeName\":\"$CHANNEL_CODE_NAME\",
	\"chaincodePath\":\"$CC_SRC_PATH\",
	\"chaincodeType\": \"node\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION\"
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
	\"chaincodeName\":\"$CHANNEL_CODE_NAME\",
	\"chaincodePath\":\"$CC_SRC_PATH\",
	\"chaincodeType\": \"node\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION\"
}")
echo
echo -e "\033[31m INSTALL RESPONSE : $INSTALL_RESPONSE \e[0m"

echo "Enter Organization number on which Instantiate has to be performed"
echo " 1.SurveyOrg "
echo " 2.RegOrg "

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
    *) echo "Wrong Input"
       exit 0
       ;; 
esac

sleep 2

echo
INSTANIATE_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels/$CHANNEL_NAME/chaincodes \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -d "{
  \"peers\" : [\"peer0.$NODE.cdac.in\"],  
	\"chaincodeName\":\"$CHANNEL_CODE_NAME\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION\",
	\"chaincodeType\": \"node\",
  \"fcn\" : \"initPropertyLedger\",
	\"args\":[\"\"]
}")
echo
echo -e "\033[31m INSTANTIATE RESPONSE : $INSTANIATE_RESPONSE \e[0m"

exit 0

