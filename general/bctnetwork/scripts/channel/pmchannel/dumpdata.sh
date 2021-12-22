#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

######## configure specific to  pmchaincode ###########################


export IP_ADDRESS="127.0.0.1:5000"

export USER_NAME2="suresh"
export ORG_NAME2="RegOrg"
export PASS_USER2="cdac@123"




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
echo " Login $USER_NAME2 ....... "
ORG_TOKEN2=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
	\"username\": \"$USER_NAME2\",
	\"password\":\"$PASS_USER2\"}")

echo " Response  : $ORG_TOKEN2"

ORG_TOKEN2=$(echo $ORG_TOKEN2 | jq ".token" | sed "s/\"//g")


echo "dump data into pmbct $ORG_NAME2"
echo
sleep 2
INSTALL_RESPONSE=$(curl -s -X POST \
  http://$IP_ADDRESS/pms/dumpintobc \
  -H "authorization: Bearer $ORG_TOKEN2" \
  -H "content-type: application/json" \
  -d "{
}")
echo
echo -e "\033[31m INSTALL RESPONSE : $INSTALL_RESPONSE \e[0m"
sleep 2
