
echo "enter the path of import file"
read fpath
#fpath="/home/esce/Desktop/Blockchain/Course-Codes.csv"
mongoimport -d cdacpoe -c centres --type csv --file ${fpath} --headerline
