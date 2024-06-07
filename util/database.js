const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;

const mongoConnect=(callback)=>{
  MongoClient.connect('mongodb+srv://milunchik:newpassword1234@firstcluster.lu1iyrt.mongodb.net/?retryWrites=true&w=majority&appName=FirstCluster')
.then(client=>{
  console.log('Connected to db')
  _db = client.db();
  callback();
})
.catch(err=>{
  console.log(err);
  throw err;
});
};

const getDb = ()=>{
  if(_db){
    return _db;
  }else{
    throw 'No database found'
  }
};


exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
