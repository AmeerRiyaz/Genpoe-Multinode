# to store the private key int the mongo db 
import pymongo
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["cdacpoe"]
mycol = mydb["bctkeys"]

# data=None
with open('private.pem', 'r') as myfile:
  keydata = myfile.read()
import base64
data = open("private.pem", "r").read()
encoded = base64.b64encode(data)
# print(data)

data = {
        "id":"2",
    	"cipherkey": encoded
    
}
x = mycol.insert_one(data)
