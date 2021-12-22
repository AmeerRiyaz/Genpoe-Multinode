# Python program to find SHA256 hexadecimal hash string of a file
import hashlib
import glob
import json
i=55
#for file in glob.glob("/home/cdac/Pictures/*.png"):
for file in glob.glob("/home/cdac/Downloads/*.pdf"):
	print(file)
	filename = 'data'+str(i)+'.txt'
	i=i+1
#print(glob.glob("/home/cdac/Pictures/*.png"))
#filename = input("Enter the input file name: ")
	with open(file,"rb") as f:
		bytes = f.read() # read entire file as bytes
		readable_sha256hash = hashlib.sha256(bytes).hexdigest();
		print(readable_sha256hash)
		readable_sha1hash = hashlib.sha1(bytes).hexdigest();
		print(readable_sha1hash)
		
		data = {  
				"peers": ["peer0.cdachorg.cdac.in"],
  				"chaincodeName": "cdacpoe",
  				"fileName":"file.pdf",
  				"fileType":"pdf",
  				"documentType":"test",
  				"sha256Hash":readable_sha256hash,
  				"sha1Hash":readable_sha1hash,
  				"issuedTo":"akshaya"			
		}
		with open(filename, 'w') as outfile:  
		    json.dump(data, outfile)		
