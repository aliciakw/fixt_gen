import babel from 'babel-core';

const uuidV1 = require('uuid/v1');
const fs = require('fs');

const fixt_file = fs.createWriteStream(__dirname + '/../fixtures.edn', {flags : 'w'});
import dummy from '../dummy.json';
const firstNames = dummy["firstNames"],
      lastNames = dummy["lastNames"];

const username = process.argv[2] || 'test';

const emailAt = '@quartethealth.com',
      apps = ['bhp', 'admin', 'pcp'],
      abbrevs = {
        bhp: 'behavioralHealthProvider',
        pcp: 'medicalProvider',
        admin: 'admin',
        patient: 'patient'
};

const models = {
        'email': [],
        'person': [],
        'account': [],
        'account.login': [],
        'behavioralProvider': [],
        'medicalProvider': [],
        'patient': []
      };

const getDbId = () => {
  const dbId = dbIndex;
  dbIndex++;
  return dbId;
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


//                            //
//        create data         //
//                            //

function generateEmail (username, label='') {
  if (label) { label = '+' + label; }
  const dbId = getDbId();
  models['email'].push ({
    dbId,
    quartetId: uuidV1(),
    address: username + label + emailAt
  });

  return dbId
}

const generatePerson = (emailRef, appName) => {
  const dbId = getDbId();
  models['person'].push({
    dbId,
    quartetId: uuidV1(),
    emailRef,
    fullName: randomName(),
    roles: '[:person.role/' + abbrevs[appName] + ']'
  });

  return dbId
}

const password = 'pbkdf2_sha256$24000$5fCrzejhti9K$79XrYIq99uJgEpgxYhCypDCgyCfkIHU6WrtsZUBl1sM=',
      collabRegistrationInst = '2015-06-06T15:31:29.331',
      clientId = 'fancy_and_definitely_real_client_id';

const generateAccount = (emailRef, personRef) => {
  const accountDbId = getDbId();
  const accountLoginDbId = getDbId();
  models['account'].push({
    dbId: accountDbId,
    quartetId: uuidV1(),
    password,
    emailRef,
    personRef,
    collabRegistrationInst
  });

  models['account.login'].push({
    dbId: accountLoginDbId,
    quartetId: uuidV1(),
    accountRef: accountDbId,
    clientId
  });

  return;
}

const generateBhp = (personRef) => {
  const dbId = getDbId();
  models['behavioralProvider'].push({
    dbId,
    quartetId: uuidV1(),
    personRef,
    // practicesRefs: Array<number>,
    // addressesRefs: Array<number>,
    // NPI: string,
    // bio: string,
    // providerType: enum,
    // specialties: Arrray<enum>,
    // acceptedInsurance: Array<enum>,
    // ageSpecialties: Arrray<enum>,
    // languages: Arrray<enum>,
    // licenseNumber: string,
    // licenseExpirationDate: string,
    // tier: number,
    // includeInSmartMatch: boolean,
    // isQHVerified: boolean,
    // acceptedTOSVersion: string,
    // acceptedInsurancePlansRef: number
  });

}

const generateAppAcct = (appName) => {
  const emailRef = generateEmail(username, appName);
  const personRef = generatePerson(emailRef, appName);
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
}




//                             //
//        write as edn         //
//                             //



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

const finalFixtures = [];
let dbIndex = 1;
const modelNames = Object.keys(models);



apps.forEach(appName => {
  generateAppAcct(appName);
});

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
