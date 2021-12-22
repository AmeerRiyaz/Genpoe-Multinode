

export USER_NAME1="ravikishore11"
export USER_NAME2="saigopal11"
export USER_NAME3="sireesha11"

export ORG_NAME1="CdachOrg"
export ORG_NAME2="ActsOrg"
export ORG_NAME3="DemoOrg"

export IP_ADDRESS="127.0.0.1:5000"
export ADMIN="Admin"
export ADMINPASS="Admin123"
export ADMINBASIC=`echo -n "${ADMIN}:${ADMINPASS}" | base64`
echo ${ADMINBASIC}

export ROLE1="cdacadmin"
export ROLE2="training"
export ROLE3="guest"


export PASS_USER1="Cdac@123"
export PASS_USER2="Cdac@123"
export PASS_USER3="Cdac@123"



#------------------------------------------------


#Admin login .............
#ADMIN_TOKEN=$(curl -s -X POST \
#  http://$IP_ADDRESS/users/auth \
#  -H "content-type: application/json" \
#  -d "{
#	\"username\": \"$ADMIN\",
#	\"password\":\"$ADMINPASS\"}")

ADMIN_TOKEN=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "Authorization: Basic ${ADMINBASIC}")


echo "adminstrator registration : $ADMIN_TOKEN"

ADMIN_TOKEN=$(echo $ADMIN_TOKEN | jq ".token" | sed "s/\"//g")


#survey user registration

echo " Enroll $USER_NAME1 in $ORG_NAME1  ..."
echo " "

RES=$(curl -s -X POST \
  http://$IP_ADDRESS/usersbct \
  -H "content-type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
	\"username\": \"$USER_NAME1\",
	\"orgName\":\"$ORG_NAME1\",
	\"password\":\"$PASS_USER1\",
	\"attr\":\"$ROLE1\"
}")

echo -e "\033[31m user Registration Response of $ORG_NAME1 : $RES \e[0m"

sleep 2


#reg user registration
echo " Enroll $USER_NAME2 in $ORG_NAME2  ..."
echo " "
RES=$(curl -s -X POST \
  http://$IP_ADDRESS/usersbct \
  -H "content-type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
	\"username\": \"$USER_NAME2\",
	\"orgName\":\"$ORG_NAME2\",
	\"password\":\"$PASS_USER2\",
	\"attr\":\"$ROLE2\"
}")

echo 
echo " "
echo -e "\033[31m user Registration Response of $ORG_NAME2 : $RES  \e[0m"


echo "Enroll $USER_NAME3 in $ORG_NAME3  ..."
#revenue user registration
RES=$(curl -s -X POST \
  http://$IP_ADDRESS/usersbct \
  -H "content-type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
	\"username\": \"$USER_NAME3\",
	\"orgName\":\"$ORG_NAME3\",
	\"password\":\"$PASS_USER3\",
	\"attr\":\"$ROLE3\"
}")

echo 
echo " "
echo -e "\033[31m user Registration Response of $ORG_NAME3 : $RES \e[0m"



exit 0

