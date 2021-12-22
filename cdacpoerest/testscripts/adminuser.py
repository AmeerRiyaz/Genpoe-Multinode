import pymongo
import bcrypt
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["cdacpoe"]
mycol = mydb["cdacusers"]
password = "Admin123"
hashed = bcrypt.hashpw(password, bcrypt.gensalt())

data = {
    	"fullname": "Administrator",
	"username": "Admin",
    	"password": hashed,
    	"role":	"admin",
	"orgname": "C-DAC",
	"enable": "true",
	"token": "",
	"regDate": ""	
    
}
x = mycol.insert_one(data)

mycol = mydb["bctusers"]
x = mycol.insert_one(data)
