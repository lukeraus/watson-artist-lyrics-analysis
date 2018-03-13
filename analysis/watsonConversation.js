/* Module used to get intent classification of input event */

const watson = require('watson-developer-cloud');
const config = require('../credentials.json').watsonConversation;

// initliaze WCS module
const conversation = new watson.ConversationV1({
  username: config.username,
  password: config.password,
  version_date: config.version_date
});

// wcs message parameters
const params = (txt) => {
  return {
    workspace_id: config.workspace_id,
    input: {
      text: txt
    }
  };
};

// promisify wcs message send, resolve intents
const getIntentsPromise = async (event) => {
  return new Promise((resolve, reject) => {
    conversation.message(params(event), (err, res) => {
      if(err) reject(err);
      resolve(res.intents);
    });    
  });   
};

// export intents getter
exports.getIntents = getIntentsPromise;

/* for local sanity debug only */
// (async function() {
//   const intents = await getIntentsPromise('I am very joyful');
//   console.log(JSON.stringify(intents));
// })();
