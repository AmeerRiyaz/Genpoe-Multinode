// used to get the private key from the mongo db
const MongoClient = require('mongodb').MongoClient;
var key;
const url = 'mongodb://localhost:27017' ;

async function findOne() {

    const client = await MongoClient.connect(url, { useNewUrlParser: true })
        .catch(err => { console.log(err); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("cdacpoe");

        let collection = db.collection('bctkeys');

        let query = { id: '2' }

        let res = await collection.findOne(query);
        key=res.cipherkey;
        // console.log(res);

    } catch (err) {

        console.log(err);
    } finally {

        client.close();
        console.log(key)
        return key
    }
}



// async function executeGetkey(){
//     var x=  await findOne();
//      console.log("x is",x)
//      return x;
//  }
// console.log( executeGetkey())
exports.findOne = findOne;
