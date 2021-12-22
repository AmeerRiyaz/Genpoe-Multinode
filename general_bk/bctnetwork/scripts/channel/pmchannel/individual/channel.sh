#!/bin/bash

######## configure specific to  pmchaincode ###########################
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


# following variables need to Edit


export USER_NAME1="sireesha3"
export USER_NAME2="saigopal3"
export USER_NAME3="ravikishore3"
export USER_NAME4="sandeep3"
export ORG_NAME1="SurveyOrg"
export ORG_NAME2="RegOrg"
export ORG_NAME3="RevOrg"
export ORG_NAME4="OtherOrg"


#------------------------------------------------



#survey user registration
#user login .............
echo " Login $USER_NAME1 ....... "
ORG_TOKEN1=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
	\"username\": \"$USER_NAME1\",
	\"password\":\"cdac@123\"}")

echo " Response  : $ORG_TOKEN1"

ORG_TOKEN1=$(echo $ORG_TOKEN1 | jq ".token" | sed "s/\"//g")



sleep 2


#reg user registration
echo " Login $USER_NAME2 ....... "
ORG_TOKEN2=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
	\"username\": \"$USER_NAME2\",
	\"password\":\"cdac@123\"}")

echo " Response  : $ORG_TOKEN2"

ORG_TOKEN2=$(echo $ORG_TOKEN2 | jq ".token" | sed "s/\"//g")


#user login .............
echo " Login $USER_NAME3 ....... "
ORG_TOKEN3=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
	\"username\": \"$USER_NAME3\",
	\"password\":\"cdac@123\"}")

echo " Response  : $ORG_TOKEN3"

ORG_TOKEN3=$(echo $ORG_TOKEN3 | jq ".token" | sed "s/\"//g")


#user login .............
echo " Login $USER_NAME4 ....... "
ORG_TOKEN4=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
	\"username\": \"$USER_NAME4\",
	\"password\":\"cdac@123\"}")

echo " Response  : $ORG_TOKEN4"

ORG_TOKEN4=$(echo $ORG_TOKEN4 | jq ".token" | sed "s/\"//g")
## channel created by administrator 

echo "Creating $CHANNEL_NAME by surevey  user ..."
echo
CHANNEL_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels \
  -H "authorization: Bearer $ORG_TOKEN1" \
  -H "content-type: application/json" \
  -d "{ \"channelName\": \"$CHANNEL_NAME\", \"channelConfigPath\": \"$CHANNEL_PATH\"
}")
echo
echo -e "\033[31m CHANNEL CREATION RESPONSE : $CHANNEL_RESPONSE  \e[0m"


sleep 4 

echo "Creating $CHANNEL_NAME1 by Survey  user ..."
echo
CHANNEL_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/channels \
  -H "content-type: application/json" \
  -H "authorization: Bearer $ORG_TOKEN1" \
  -d "{ \"channelName\": \"$CHANNEL_NAME1\", \"channelConfigPath\": \"$CHANNEL_PATH1\"
}")
echo
sleep 2
echo -e "\033[31m CHANNEL CREATION RESPONSE : $CHANNEL_RESPONSE  \e[0m"

echo " CHANNEL CREATION IS DONE "


exit 0

