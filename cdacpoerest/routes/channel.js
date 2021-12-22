module.exports = (app) => {
  const channel = require('../controllers/channel.controller.js');

  // Create a new channel
  app.post('/channels', channel.create);

  // Join channel
  app.post('/channels/:channelName/peers', channel.join);

  // Query for Channel Information
 // app.get('/channels/:channelName', channel.query);
 app.get('/channel/info', channel.query);

 app.get('/genpoechannel/info', channel.genpoequery);

  // Query to fetch channels
  app.get('/channels', channel.fetch)

  //Query for Channel instantiated chaincodes
  app.get('/channels/:channelName/chaincodes', channel.querychaincodes);

  // Query for peers of organization joined on channel
  // app.get('/channels/:channelName/:orgName/peers',channel.querypeers);

  // Get block information by block number
  app.get('/channels/:channelName/blocks/:blockId', channel.queryblocks);

  // Query transaction by transaction Id
  app.get('/channels/:channelName/transactions/:transactionId', channel.transactions);

  // Query transaction by sha256Hash
  //  app.get('/channels/:channelName/transactions/:sha256Hash', channel.querybyFilesha256Hash);

  // Query transaction by sha1Hash
  // app.get('/channels/:channelName/transactions/:sha1Hash', channel.quertybyFilesha1Hash);

  // Query block by hash
  app.get('/channels/:channelName/blocks', channel.queryblcokhash);

  // Query chaincode by Id(chaincodeName)

  //    app.get('/channels/:channelName/chaincodes/:id', channel.querychaincodesbyId);
}