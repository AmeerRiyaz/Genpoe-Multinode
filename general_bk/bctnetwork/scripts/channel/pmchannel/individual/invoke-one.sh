echo "Invoke chaincode on peers of $Org_NAME1"
#read TOKEN
export USER_NAME1="sireesha"
export ORG_NAME1="SurveyOrg"
export IP_ADDRESS="127.0.0.1:5000"


#survey user registration
#user login .............
echo " Login $USER_NAME1 ....... "
TOKEN1=$(curl -s -X POST \
  http://$IP_ADDRESS/users/auth \
  -H "content-type: application/json" \
  -d "{
        \"username\": \"$USER_NAME1\",
        \"password\":\"cdac@123\"}")

echo " Response  : $ORG_TOKEN1"

TOKEN1=$(echo $TOKEN1 | jq ".token" | sed "s/\"//g")
echo


TRX_ID=$(curl -vis -X POST \
  http://127.0.0.1:5000/pms/channels/pmbctchannel/transactions \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -d @data/data13.json)
echo $TRX_ID

