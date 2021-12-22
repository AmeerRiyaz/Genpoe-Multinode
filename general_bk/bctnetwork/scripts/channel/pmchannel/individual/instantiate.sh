# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

######## configure specific to  pmchaincode ###########################
export CC_SRC_PATH="/home/cdac/Blockchain_Localgit/working/fabric-samples-1.4/chaincode/chaincode_example02/node"
export CC_SRC_PATH1="/home/cdac/Blockchain_Localgit/working/fabric-samples-1.4/pmchaincode/poe/node"

export CHANNEL_CODE_NAME="test"
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

export USER_NAME1="rajesh"
export USER_NAME2="suresh"
export USER_NAME3="ramesh"
export USER_NAME4="vinod"
export ORG_NAME1="SurveyOrg"
export ORG_NAME2="RegOrg"
export ORG_NAME3="RevOrg"
export ORG_NAME4="OtherOrg"


export PASS_USER1="cdac@123"
export PASS_USER2="cdac@123"
export PASS_USER3="cdac@123"
export PASS_USER4="cdac@123"

#user login .............
echo " Login $USER_NAME2 ....... "
ORG_TOKEN2=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
        \"username\": \"$USER_NAME2\",
        \"password\":\"cdac@123\"}")

echo " Response  : $ORG_TOKEN2"

ORG_TOKEN2=$(echo $ORG_TOKEN2 | jq ".token" | sed "s/\"//g")



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
  http://$IP_ADDRESS/channels/$CHANNEL_NAME/chaincodes \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -d "{
  \"peers\" : [\"peer0.$NODE.cdac.in\"],  
        \"chaincodeName\":\"$CHANNEL_CODE_NAME\",
        \"chaincodeVersion\":\"$CHANNEL_VERSION\",
        \"chaincodeType\": \"node\",
  \"fcn\" : \"init\",
        \"args\":[\"a\",\"100\",\"b\",\"200\"]
}")
echo
echo -e "\033[31m INSTANTIATE RESPONSE : $INSTANIATE_RESPONSE \e[0m"

