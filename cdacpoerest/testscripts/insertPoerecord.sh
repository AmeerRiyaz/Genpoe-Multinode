#read TOKEN
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NDM4NjAzOTUsInVzZXJuYW1lIjoiZGVtb3VzZXIiLCJvcmdOYW1lIjoiRGVtb09yZyIsInJvbGUiOiJ3cml0ZXIiLCJpYXQiOjE1NDM4NTg1OTV9.jXfECqUSl_rCerGFSfjHytZ3Hd-muTYQhGLHUIui3oQ"
echo "token .....$TOKEN"
echo

#for x in 1 2 3 4 5 6 7 8 
for (( x=0 ; x<=100 ; x++ ))
do
TRX_ID=$(curl -vis -X POST \
  http://10.244.1.137:5000/poe/channels/cdacpoechannel/transactions \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -d @data${x}.txt)
echo $TRX_ID
sleep 1
done

