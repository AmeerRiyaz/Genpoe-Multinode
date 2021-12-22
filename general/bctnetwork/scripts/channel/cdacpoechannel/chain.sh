#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

######## configure specific to  pmchaincode ###########################
#export CC_SRC_PATH1="/home/cdac/BCT/pmchaincode/poe/node"
export CC_SRC_PATH1="/home/pmapp/latest_code/pmchaincode/poe/node"
export CHANNEL_NAME1="cdacpoechannel"
export CHANNEL_PATH1="../hyperledger/artifacts/channel/cdacpoechannel/cdacpoechannel.tx"
export CHANNEL_CODE_NAME1="cdacpoe"
export CHANNEL_VERSION1="v3"

export USER_NAME1="ravikishore11"
export USER_NAME2="saigopal11"
export USER_NAME3="sireesha11"
export ORG_NAME1="CdachOrg"
export ORG_NAME2="ActsOrg"
export ORG_NAME3="DemoOrg"
export PASS_USER1="Cdac@123"
export PASS_USER2="Cdac@123"
export PASS_USER3="Cdac@123"

export USER1_BASIC=`echo -n "${USER_NAME1}:${PASS_USER1}" | base64`
export USER2_BASIC=`echo -n "${USER_NAME2}:${PASS_USER2}" | base64`
export USER3_BASIC=`echo -n "${USER_NAME3}:${PASS_USER3}" | base64`

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


# following variables need to Edit




#------------------------------------------------


#user login .............
echo " Login $USER_NAME1 ....... "
#ORG_TOKEN1=$(curl -s -X POST \
#  http://$IP_ADDRESS/users/auth \
#  -H "content-type: application/json" \
#  -d "{
#	\"username\": \"$USER_NAME1\",
#	\"password\":\"$PASS_USER1\"}")

ORG_TOKEN1=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "Authorization: Basic ${USER1_BASIC}")


echo " Response  : $ORG_TOKEN1"

ORG_TOKEN1=$(echo $ORG_TOKEN1 | jq ".token" | sed "s/\"//g")



sleep 2


echo " Login $USER_NAME2 ....... "
#ORG_TOKEN2=$(curl -s -X POST \
#  http://$IP_ADDRESS/users/auth \
#  -H "content-type: application/json" \
#  -d "{
#	\"username\": \"$USER_NAME2\",
#	\"password\":\"$PASS_USER2\"}")

ORG_TOKEN2=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "Authorization: Basic ${USER2_BASIC}")

echo " Response  : $ORG_TOKEN2"

ORG_TOKEN2=$(echo $ORG_TOKEN2 | jq ".token" | sed "s/\"//g")


#user login .............
echo " Login $USER_NAME3 ....... "
#ORG_TOKEN3=$(curl -s -X POST \
#  http://$IP_ADDRESS/users/auth \
#  -H "content-type: application/json" \
#  -d "{
#	\"username\": \"$USER_NAME3\",
#	\"password\":\"$PASS_USER3\"}")

ORG_TOKEN3=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "Authorization: Basic ${USER3_BASIC}")

echo " Response  : $ORG_TOKEN3"

ORG_TOKEN3=$(echo $ORG_TOKEN3 | jq ".token" | sed "s/\"//g")



# echo "Creating $CHANNEL_NAME1 by $ORG_NAME1 "
# echo
# CHANNEL_RESPONSE=$(curl -s -X POST \
#   http://$IP_ADDRESS/channels \
#   -H "content-type: application/json" \
#   -H "authorization: Bearer $ORG_TOKEN1" \
#   -d "{ \"channelName\": \"$CHANNEL_NAME1\", \"channelConfigPath\": \"$CHANNEL_PATH1\"
# }")
# echo
# sleep 2
# echo -e "\033[31m CHANNEL CREATION RESPONSE : $CHANNEL_RESPONSE  \e[0m"

# echo " CHANNEL CREATION IS DONE "


# # second channel join

# echo "Join request from $ORG_NAME1"
# echo
# JOIN_RESPONSE=$(curl -s -X POST \
#   http://$IP_ADDRESS/channels/$CHANNEL_NAME1/peers \
#   -H "authorization: Bearer $ORG_TOKEN1" \
#   -H "content-type: application/json" \
#   -d "{
# 	\"peers\": [\"peer0.cdachorg.cdac.in\",\"peer1.cdachorg.cdac.in\"]
# }")
# echo
# echo -e "\033[31m $ORG_NAME1: JOIN RESPONSE : $JOIN_RESPONSE \e[0m"
# sleep 2

# echo "Join request from $ORG_NAME2"
# echo
# JOIN_RESPONSE=$(curl -s -X POST \
#   http://$IP_ADDRESS/channels/$CHANNEL_NAME1/peers \
#   -H "authorization: Bearer $ORG_TOKEN2" \
#   -H "content-type: application/json" \
#   -d "{
# 	\"peers\": [\"peer0.actsorg.cdac.in\",\"peer1.actsorg.cdac.in\"]
# }")
# echo
# echo -e "\033[31m JOIN RESPONSE $ORG_NAME2 : $JOIN_RESPONSE \e[0m"
# sleep 2

# echo "Join request from $ORG_NAME3"
# echo
# JOIN_RESPONSE=$(curl -s -X POST \
#   http://$IP_ADDRESS/channels/$CHANNEL_NAME1/peers \
#   -H "authorization: Bearer $ORG_TOKEN3" \
#   -H "content-type: application/json" \
#   -d "{
# 	\"peers\": [\"peer0.demoorg.cdac.in\",\"peer1.demoorg.cdac.in\"]
# }")
# echo
# echo -e "\033[31m JOIN RESPONSE $ORG_NAME3 : $JOIN_RESPONSE \e[0m"

# echo "All PEERS Joined the Channel "

# sleep 2


echo "Installing chaincode on $ORG_NAME1"

# second chaincode install
echo "Installing chaincode on $ORG_NAME1"
echo
INSTALL_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/chaincodes \
  -H "authorization: Bearer $ORG_TOKEN1" \
  -H "content-type: application/json" \
  -d "{
	\"peers\": [\"peer0.cdachorg.cdac.in\",\"peer1.cdachorg.cdac.in\"],
	\"chaincodeName\":\"$CHANNEL_CODE_NAME1\",
	\"chaincodePath\":\"$CC_SRC_PATH1\",
	\"chaincodeType\": \"node\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION1\"
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
	\"peers\": [\"peer0.actsorg.cdac.in\",\"peer1.actsorg.cdac.in\"],
	\"chaincodeName\":\"$CHANNEL_CODE_NAME1\",
	\"chaincodePath\":\"$CC_SRC_PATH1\",
	\"chaincodeType\": \"node\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION1\"
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
	\"peers\": [\"peer0.demoorg.cdac.in\",\"peer1.demoorg.cdac.in\"],
	\"chaincodeName\":\"$CHANNEL_CODE_NAME1\",
	\"chaincodePath\":\"$CC_SRC_PATH1\",
	\"chaincodeType\": \"node\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION1\"
}")
echo
echo -e "\033[31m INSTALL RESPONSE : $INSTALL_RESPONSE \e[0m"
sleep 2

echo "Enter Organization number on which Instantiate has to be performed"
echo " 1.CdachOrg "
echo " 2.ActsOrg "
echo " 3.DemoOrg "

read num
case $num in
    "1" )
        NODE=cdachorg
        TOKEN=$ORG_TOKEN1
        ;;
    "2" )
        NODE=actsorg
        TOKEN=$ORG_TOKEN2
        ;;
    "3")
        NODE=demoorg
        TOKEN=$ORG_TOKEN3
        ;;
    *) echo "Wrong Input"
       exit 0
       ;; 
esac

sleep 2

echo
INSTANIATE_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels/$CHANNEL_NAME1/chaincodes \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -d "{
  \"peers\" : [\"peer0.$NODE.cdac.in\"],  
	\"chaincodeName\":\"$CHANNEL_CODE_NAME1\",
	\"chaincodeVersion\":\"$CHANNEL_VERSION1\",
	\"chaincodeType\": \"node\",
  \"fcn\" : \"initPoeLedger\",
	\"args\":[\"\"]
}")
echo
echo -e "\033[31m INSTANTIATE RESPONSE : $INSTANIATE_RESPONSE \e[0m"

exit 0

