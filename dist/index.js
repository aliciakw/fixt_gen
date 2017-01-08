'use strict';

var _babelCore = require('babel-core');

var _babelCore2 = _interopRequireDefault(_babelCore);

var _dummy = require('../dummy.json');

var _dummy2 = _interopRequireDefault(_dummy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var uuidV1 = require('uuid/v1');
var fs = require('fs');

var fixt_file = fs.createWriteStream(__dirname + '/../fixtures.edn', { flags: 'w' });

var firstNames = _dummy2.default["firstNames"],
    lastNames = _dummy2.default["lastNames"];

var username = process.argv[2] || 'test';

var emailAt = '@quartethealth.com',
    apps = ['bhp', 'admin', 'pcp'],
    abbrevs = {
  bhp: 'behavioralHealthProvider',
  pcp: 'medicalProvider',
  admin: 'admin',
  patient: 'patient'
};

var models = {
  'email': [],
  'person': [],
  'account': [],
  'account.login': [],
  'behavioralProvider': [],
  'medicalProvider': [],
  'patient': []
};

var getDbId = function getDbId() {
  var dbId = dbIndex;
  dbIndex++;
  return dbId;
};
var pickRandom = function pickRandom(arr) {
  var position = Math.ceil(arr.length * Math.random()) - 1;
  return arr[position];
};
function randomName() {
  var first = pickRandom(firstNames);
  var last = pickRandom(lastNames);
  return first + ' ' + last;
}

//                            //
//        create data         //
//                            //

function generateEmail(username) {
  var label = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  if (label) {
    label = '+' + label;
  }
  var dbId = getDbId();
  models['email'].push({
    dbId: dbId,
    quartetId: uuidV1(),
    address: username + label + emailAt
  });

  return dbId;
}

var generatePerson = function generatePerson(emailRef, appName) {
  var dbId = getDbId();
  models['person'].push({
    dbId: dbId,
    quartetId: uuidV1(),
    emailRef: emailRef,
    fullName: randomName(),
    roles: '[:person.role/' + abbrevs[appName] + ']'
  });

  return dbId;
};

var password = 'pbkdf2_sha256$24000$5fCrzejhti9K$79XrYIq99uJgEpgxYhCypDCgyCfkIHU6WrtsZUBl1sM=',
    collabRegistrationInst = '2015-06-06T15:31:29.331',
    clientId = 'fancy_and_definitely_real_client_id';

var generateAccount = function generateAccount(emailRef, personRef) {
  var accountDbId = getDbId();
  var accountLoginDbId = getDbId();
  models['account'].push({
    dbId: accountDbId,
    quartetId: uuidV1(),
    password: password,
    emailRef: emailRef,
    personRef: personRef,
    collabRegistrationInst: collabRegistrationInst
  });

  models['account.login'].push({
    dbId: accountLoginDbId,
    quartetId: uuidV1(),
    accountRef: accountDbId,
    clientId: clientId
  });

  return;
};

var generateBhp = function generateBhp(personRef) {
  var dbId = getDbId();
  models['behavioralProvider'].push({
    dbId: dbId,
    quartetId: uuidV1(),
    personRef: personRef
  });
};

var generateAppAcct = function generateAppAcct(appName) {
  var emailRef = generateEmail(username, appName);
  var personRef = generatePerson(emailRef, appName);
  generateAccount(emailRef, personRef);

  // switch (appName) {
  //   case 'bhp':
  //     generateBhp(personRef);
  //     break;
  //   case 'pcp':
  //     generatePcp(personRef);
  //     break;
  //   case 'patient':
  //     generatePatient(personRef);
  //     break;
  // }

  return;
};

//                             //
//        write as edn         //
//                             //


// helpers
var enums = ['roles'];
var refRegex = /Ref/;
var dateInstRegex = /\d{4}-\d{2}-\d{2}/;

var assignDbId = function assignDbId(dbid) {
  return ':db/id           #db/id[:db.part/user -' + dbid + ']';
};
var assignUUIDAttr = function assignUUIDAttr(model, attr, val) {
  return '\n :' + model + '/' + attr + ' #uuid \"' + val + '\"';
};
var assignEnumAttr = function assignEnumAttr(model, attr, val) {
  return '\n :' + model + '/' + attr + ' ' + val;
};
var assignInstAttr = function assignInstAttr(model, attr, val) {
  return '\n :' + model + '/' + attr + ' #inst \"' + val + '\"';
};
var assignRefAttr = function assignRefAttr(model, attr, val) {
  return '\n :' + model.replace('Ref', '') + '/' + attr + ' #db/id[:db.part/user -' + val + ']';
};
var assignStringAttr = function assignStringAttr(model, attr, val) {
  return '\n :' + model + '/' + attr + ' \"' + val + '\"';
};

var edn = void 0;
var recordAsEdn = function recordAsEdn(model, record) {
  var attributes = Object.keys(record);
  edn = '{';

  attributes.forEach(function (attr) {
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
};

var finalFixtures = [];
var dbIndex = 1;
var modelNames = Object.keys(models);

apps.forEach(function (appName) {
  generateAppAcct(appName);
});

var data = void 0;
modelNames.forEach(function (modelName) {
  data = models[modelName];
  fixt_file.write(';; ' + modelName + 's \n');
  data.forEach(function (record) {
    fixt_file.write(recordAsEdn(modelName, record));
  });
  fixt_file.write('\n');
});

console.log('done.');