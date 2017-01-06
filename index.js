// @flow
const uuidV1 = require('uuid/v1');

const emailAt = '@quartethealth.com',
      apps = ['bhp', 'admin', 'pcp'];

const username = 'awillett';
let dbidIndex = 1;


function assignDbId (index) {
  return ':db/id           #db/id[:db.part/user -'+ index +']';
}
function assignQuartetId (model) {
  return '\n:email/quartetId #uuid ' + uuidV1();
}



function generateAcct (username, emailAt, label='') {
  if (label) { label = '+' + label; }
  var email = username + label + emailAt;
}

function generateAdminAcct () {
  // generate account
  // generate person
}


console.log(username, emailAt, apps, dbidIndex);
