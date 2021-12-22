export IP_ADDRESS="127.0.0.1:5000"
export ADMIN="Admin"
export ADMINPASS="Admin123"

export ROLE1="cdacadmin"
export ROLE2="training"
export ROLE3="guest"


export PASS_USER1="cdac@123"
export PASS_USER2="cdac@123"
export PASS_USER3="cdac@123"



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

