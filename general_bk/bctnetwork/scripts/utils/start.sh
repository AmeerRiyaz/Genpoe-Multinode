
MONGODBPATH="/home/saigopal/softwares/mongodb-linux-x86_64-ubuntu1604-3.6.3"

cd ..
python3 start_network.py

# start mongodb
$MONGODBPATH/bin/mongod --dbpath=$MONGODBPATH/data &

cd ../../../../pmbctrest
node .
