// @flow
const uuidV1 = require('uuid/v1');
const fs = require('fs');

const fixt_file = fs.createWriteStream(__dirname + '/fixtures.edn', {flags : 'w'});
const dummy = require('./dummy'),
      firstNames = dummy["firstNames"],
      lastNames = dummy["lastNames"];

const username = process.argv[2] || 'test';

const emailAt = '@quartethealth.com',
      password = 'pbkdf2_sha256$24000$5fCrzejhti9K$79XrYIq99uJgEpgxYhCypDCgyCfkIHU6WrtsZUBl1sM=',
      collabRegistrationInst = '2015-06-06T15:31:29.331',
      apps = ['bhp', 'admin', 'pcp'],
      roles = {
        bhp: '[:person.role/behavioralHealthProvider]',
        pcp: '[:person.role/medicalProvider]',
        admin: '[:person.role/admin]',
        patient: '[:person.role/patient]'
};

const pickRandom = (arr) => {
  const position = Math.ceil(arr.length * Math.random()) - 1;
  return arr[position];
}
function randomName () {
  const first = pickRandom(firstNames);
  const last = pickRandom(lastNames);
  return first + ' ' + last;
}
// create data


function generateEmail (username, label='') {
  if (label) { label = '+' + label; }
  const dbId = dbIndex;
  email.push ({
    dbId,
    quartetId: uuidV1(),
    address: username + label + emailAt
  });
  dbIndex++;
  return dbId
}

const generatePerson = (emailRef, appName) => {
  const dbId = dbIndex;
  person.push({
    dbId,
    quartetId: uuidV1(),
    emailRef,
    fullName: randomName(),
    roles: roles[appName]
  });
  dbIndex++;
  return dbId
}

const generateAdminAcct = (appName) => {
  const emailRef = generateEmail(username, appName);
  const personRef = generatePerson(emailRef, appName);
  account.push({
    dbId: dbIndex,
    quartetId: uuidV1(),
    password,
    emailRef,
    personRef,
    collabRegistrationInst
  });
  dbIndex++;
}

// write to edn file
// helpers
const enums = ['roles'];
const refRegex = /Ref/;
const dateInstRegex = /\d{4}-\d{2}-\d{2}/;

const assignDbId = (dbid) => ':db/id           #db/id[:db.part/user -'+ dbid +']';
const assignUUIDAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' #uuid \"' + val + '\"';
const assignEnumAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' ' + val ;
const assignInstAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' #inst \"' + val + '\"';
const assignRefAttr = (model, attr, val) => {
  return '\n :' + model.replace('Ref', '') + '/' + attr + ' #db/id[:db.part/user -' + val + ']';
}
const assignStringAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' \"' + val + '\"';



let edn;
const recordAsEdn = (model, record) => {
  const attributes = Object.keys(record);
  edn = '{'

  attributes.forEach(attr => {
    if (attr === 'dbId') {
      edn += assignDbId(record[attr]);
    } else if (attr === 'quartetId') {
      edn += assignUUIDAttr(model, attr, record[attr]);
    } else if (enums.indexOf(attr) >= 0) {
      edn += assignEnumAttr(model, attr, record[attr]);
    } else if (refRegex.test(attr)) {
      edn += assignRefAttr(model, attr, record[attr]);
    } else if (dateInstRegex.test(record[attr])) {
      edn += assignInstAttr(model, attr, record[attr]);
    } else {
      edn += assignStringAttr(model, attr, record[attr]);
    }
  });
  return edn + '}\n';
}

const fixtures = [];
let dbIndex = 1;
let email = [],
    person = [],
    account = [],
    behavioralProvider = [],
    medicalProvider = [];


apps.forEach(appName => {
  generateAdminAcct(appName);
});

const models = { email, person, account },
      modelNames = Object.keys(models);
let data;
modelNames.forEach((modelName) => {
  data = models[modelName];
  fixt_file.write(';; ' + modelName + 's \n');
  data.forEach(record => {
    fixt_file.write(recordAsEdn(modelName, record));
  });
  fixt_file.write('\n');
});



console.log('done.');
