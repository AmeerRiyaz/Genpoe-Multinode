echo "Invoke chaincode on peers of $Org_NAME1"
#read TOKEN
echo "token .....$TOKEN"
NODE=surveyorg
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNpcmVlc2hhIiwib3JnTmFtZSI6IlN1cnZleU9yZyIsInJvbGUiOiJjcmVhdG9yIiwiaWF0IjoxNTM3Mjg5OTUxfQ.lCZmDMe-UAMdRury72WOXj_70tNO58alRaX-IcveRrw"
echo

for x in 1 2 3 4 5 6 7 8
do
TRX_ID=$(curl -vis -X POST \
  http://127.0.0.1:5000/pms/channels/pmbctchannel/transactions \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -d @data/data${x}.json)
echo $TRX_ID
done
