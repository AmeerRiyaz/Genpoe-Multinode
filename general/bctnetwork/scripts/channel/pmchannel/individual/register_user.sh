

export USER_NAME1="sireesha"
export USER_NAME2="saigopal"
export USER_NAME3="ravikishore"
export USER_NAME4="sandeep"
export ORG_NAME1="SurveyOrg"
export ORG_NAME2="RegOrg"
export ORG_NAME3="RevOrg"
export ORG_NAME4="OtherOrg"

export IP_ADDRESS="127.0.0.1:5000"
export ADMIN="Admin"
export ADMINPASS="Admin123"



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
	\"password\":\"cdac@123\",
	\"attr\":\"survey\"
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
	\"password\":\"cdac@123\",
	\"attr\":\"sro\"
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
	\"password\":\"cdac@123\",
	\"attr\":\"tahsildar\"
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
	\"password\":\"cdac@123\",
	\"attr\":\"other\"
}")

echo 
echo " "
echo -e "\033[31m user Registration Response of $ORG_NAME4 : $RES \e[0m"

exit 0

