// @flow
const uuidV1 = require('uuid/v1');
const fixtures = require('./fixtures'),
      firstNames = fixtures["firstNames"],
      lastNames = fixtures["lastNames"];

const username = 'awillett';

const emailAt = '@quartethealth.com',
      password = 'pbkdf2_sha256$24000$5fCrzejhti9K$79XrYIq99uJgEpgxYhCypDCgyCfkIHU6WrtsZUBl1sM=',
      collabRegistrationInst = '#inst "2015-06-06T15:31:29.331"',
      apps = ['bhp', 'admin', 'pcp'],
      roles = {
        bhp: '[:person.role/behavioralHealthProvider]',
        pcp: '[:person.role/medicalProvider]',
        admin: '[:person.role/admin]',
        patient: '[:person.role/patient]'
};

let dbIndex = 1;
let emails = [],
    persons = [],
    accounts = [],
    behavioralProviders = [],
    medicalProviders = [];

function assignDbId (index) {
  return ':db/id           #db/id[:db.part/user -'+ index +']';
}
function assignQuartetId (model) {
  return '\n:email/quartetId #uuid ' + uuidV1();
}
function assignCollabRegistrationInst (model) {
  return ':' + model + '/collabRegistrationInst ' + collabRegistrationInst;
}

const pickRandom = (arr) => {
  const position = Math.ceil(arr.length * Math.random()) - 1;
  return arr[position];
}
function randomName () {
  const first = pickRandom(firstNames);
  const last = pickRandom(lastNames);
  return first + ' ' + last;
}

function generateEmail (username, label='') {
  if (label) { label = '+' + label; }
  const dbId = dbIndex;
  emails.push ({
    dbId,
    quartetId: uuidV1(),
    address: username + label + emailAt
  });
  dbIndex++;
  return dbId
}

const generatePerson = (emailRef, appName) => {
  const dbId = dbIndex;
  persons.push({
    dbId,
    quartetId: uuidV1(),
    emailRef,
    fullName: randomName(),
    roles: roles[appName]
  });
  dbIndex++;
  return dbId
}

const generateAdminAccts = () => {
  apps.forEach((appName, i) => {
    const emailRef = generateEmail(username, appName);
    const personRef = generatePerson(emailRef, appName);
    accounts.push({
      dbId: dbIndex,
      quartetId: uuidV1(),
      password,
      emailRef,
      personRef,
      collabRegistrationInst
    });
    dbIndex++;
  });
}

generateAdminAccts();




console.log(accounts);
