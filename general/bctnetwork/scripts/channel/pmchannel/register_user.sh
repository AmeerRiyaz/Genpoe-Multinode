

export USER_NAME1="rajesh"
export USER_NAME2="suresh"
export USER_NAME3="ramesh"
export USER_NAME4="vinod"
export ORG_NAME1="SurveyOrg"
export ORG_NAME2="RegOrg"
export ORG_NAME3="RevOrg"
export ORG_NAME4="OtherOrg"

export IP_ADDRESS="127.0.0.1:5000"
export ADMIN="Admin"
export ADMINPASS="Admin123"

export PASS_USER1="cdac@123"
export PASS_USER2="cdac@123"
export PASS_USER3="cdac@123"
export PASS_USER4="cdac@123"

export ROLE1="survey"
export ROLE2="sro"
export ROLE3="tahsildar"
export ROLE4="other"

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


echo "Enroll $USER_NAME4 in $ORG_NAME4  ..."
#other user registration
RES=$(curl -s -X POST \
  http://$IP_ADDRESS/usersbct \
  -H "content-type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
	\"username\": \"$USER_NAME4\",
	\"orgName\":\"$ORG_NAME4\",
	\"password\":\"$PASS_USER4\",
	\"attr\":\"$ROLE4\"
}")

echo 
echo " "
echo -e "\033[31m user Registration Response of $ORG_NAME4 : $RES \e[0m"

exit 0

