import babel from 'babel-core';

const uuidV1 = require('uuid/v1');
const fs = require('fs');

const fixt_file = fs.createWriteStream(__dirname + '/../fixtures.edn', {flags : 'w'});
import text from './text';

// utilize enums endpoint if one becomes available
import providerEnums from './provider-enums';
import personEnums from './person-enums';
import referralEnums from './referral-enums';
import stateEnums from './us-state-enums';

const username = process.argv[2] || 'test';

const emailAt = '@quartethealth.com',
      apps = ['bhp', 'admin', 'pcp', 'patient'],
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
        'app.PCP.userProfile': [],
        'patient': [],
        'practice': [],
        'address': [],
        'quartetRegion': []
      };

const getDbId = () => {
  const dbId = dbIndex;
  dbIndex++;
  return dbId;
};
const pickRandom = arr => {
  if (arr) {
    const position = Math.ceil(arr.length * Math.random()) - 1;
    return arr[position];
  }
};

const pickRandomGroup = (arr, max) => {
  let groupSize = Math.ceil(Math.random() * max);
  let pick, randomGroup = [];
  for (var i = 0; i < groupSize; i++) {
    pick = pickRandom(arr);
    arr.splice(arr.indexOf(pick), 1);
    randomGroup.push(pick);
  }
  return randomGroup;
};
const randomName = () => {
  const first = pickRandom(text.firstNames);
  const last = pickRandom(text.lastNames);
  return first + ' ' + last;
};
const randomDigit = () => Math.floor(Math.random() * 10);
const randomNumberString = len => new Array(len).fill(1).map(i => randomDigit()).toString().replace(/\,/g, '');



//                            //
//        create data         //
//                            //

const generateEmail = (username, label='') => {
  if (label) { label = '+' + label; }
  const dbId = getDbId();
  models['email'].push ({
    dbId,
    quartetId: uuidV1(),
    address: username + label + emailAt
  });

  return dbId
};

const generatePerson = (emailRef, appName) => {
  const dbId = getDbId();
  models['person'].push({
    dbId,
    quartetId: uuidV1(),
    emailRef,
    fullName: randomName(),
    gender: pickRandom(personEnums.genders),
    phoneNumber: randomNumberString(10),
    roles: [('person.role/' + abbrevs[appName])]
  });
  return dbId;
};

const generateRegion = name => {
  const dbId = getDbId();
  models['quartetRegion'].push({
    dbId,
    quartetId: uuidV1(),
    name
  });
  return dbId;
};

const generateAddress = () => {
  const dbId = getDbId();
  models['address'].push({
    dbId,
    quartetId: uuidV1(),
    city: pickRandom(text.cities),
    lineOne: Math.ceil(Math.random() * 1000).toString() + ' ' + pickRandom(text.streets),
    state: pickRandom(Object.keys(stateEnums))
  });
  return dbId;
};

const generatePractice = addressRef => {
  const dbId = getDbId();
  models['practice'].push({
    dbId,
    quartetId: uuidV1(),
    NPI: randomNumberString(5),
    name: pickRandom(text.practiceNames),
    addresses: [addressRef],
    //quartetRegion: number
  });
  return dbId;
};

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

  return accountDbId;
};

const generateBhp = personRef => {
  const dbId = getDbId();
  const addressRef = generateAddress();
  const practiceRef = generatePractice(addressRef);

  models['behavioralProvider'].push({
    dbId,
    quartetId: uuidV1(),
    personRef,
    addressesRefs: [addressRef],
    practicesRefs: [practiceRef],
    NPI: randomNumberString(10),
    bio: pickRandom(text.bios),
    providerType: pickRandom(providerEnums.providerTypes),
    specialties: pickRandomGroup(providerEnums.conditions, 3),
    acceptedInsurance: pickRandomGroup(providerEnums.insurances, 5),
    ageSpecialties: pickRandomGroup(providerEnums.ageSpecialties, 2),
    languages: pickRandomGroup(providerEnums.languages, 3),
    licenseNumber: '1234-567-89000',
    licenseExpirationDate: '2020-01-01T00:00:00.000',
    tier: Math.ceil(Math.random() * 3),
    includeInSmartMatch: true,
    isQHVerified: true,
    acceptedTOSVersion: '0.0.0',
    // acceptedInsurancePlansRef: number
  });
}

const generatePcp = (personRef, accountRef) => {
  const pcpDbId = getDbId();
  const userProfileDbId = getDbId();
  const addressRef = generateAddress();
  const practiceRef = generatePractice(addressRef);

  models['medicalProvider'].push({
    dbId: pcpDbId,
    quartetId: uuidV1(),
    personRef,
    NPI: randomNumberString(10),
    addressesRefs: [addressRef],
    practicesRefs: [practiceRef]
  });

  models['app.PCP.userProfile'].push({
    dbId: userProfileDbId,
    quartetId: uuidV1(),
    accountRef,
    practiceRef,
    isAdmin: true,
    practiceTitle: pickRandom(providerEnums.practiceTitle),
    permissions: providerEnums.pcpPermissions
  });
};

const generatePatient = personRef => {
  const dbId = getDbId();
  const addressRef = generateAddress();
  models['patient'].push({
    dbId,
    quartetId: uuidV1(),
    personRef,
    addressRef,
    memberId: randomNumberString(5),
    //primaryInsurancePlanRef: number,
    //secondaryInsurancePlanRef: number,
    conditions: pickRandomGroup(providerEnums.conditions, 3)
  });
};

const generateAppAcct = (appName) => {
  const emailRef = generateEmail(username, appName);
  const personRef = generatePerson(emailRef, appName);
  const accountRef = generateAccount(emailRef, personRef);
  let addressRef, practiceRef;

  switch (appName) {
    case 'bhp':
      generateBhp(personRef, addressRef, practiceRef);
      break;
    case 'pcp':
      generatePcp(personRef, accountRef);
      break;
    case 'patient':
      generatePatient(personRef);
      break;
  }

  return;
}

const generateAppAccounts = () => {
  apps.forEach(appName => {
    generateAppAcct(appName);
  });
};



//                             //
//        write as edn         //
//                             //

// helpers
const enums = ['roles'];
const refRegex = /Ref/;
const dateInstRegex = /\d{4}-\d{2}-\d{2}/;
const enumRegex = /\w+\/\w+/;

const assignDbId = (dbid) => ':db/id           #db/id[:db.part/user -'+ dbid +']';
const assignUUIDAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' #uuid \"' + val + '\"';
const assignEnumAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' :' + val ;
const assignMultiEnumAttr = (model, attr, val) => {
  let ednVal = val.map(i => ':' + i).toString().replace(/\,/g, ' ');
  return '\n :' + model + '/' + attr + ' [' + ednVal + ']';
}
const assignInstAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' #inst \"' + val + '\"';
const assignRefAttr = (model, attr, val) => {
  return '\n :' + model.replace('Ref', '') + '/' + attr + ' #db/id[:db.part/user -' + val + ']';
}
const assignNumberAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' ' + val;
const assignStringAttr = (model, attr, val) => '\n :' + model + '/' + attr + ' \"' + val + '\"';

const printAttrAsEdn = (model, attr, data) => {
  if (attr === 'dbId') {
    return assignDbId(data);
  } else if (attr === 'quartetId') {
    return assignUUIDAttr(model, attr, data);
  } else if (typeof data === 'object' && enumRegex.test(data)) {
    return assignMultiEnumAttr(model, attr, data);
  } else if (enumRegex.test(data)) {
    return assignEnumAttr(model, attr, data);
  } else if (refRegex.test(attr)) {
    return assignRefAttr(model, attr, data);
  } else if (dateInstRegex.test(data)) {
    return assignInstAttr(model, attr, data);
  } else if (typeof data === 'number') {
    return assignNumberAttr(model, attr, data);
  } else {
    return assignStringAttr(model, attr, data);
  }
  return '';
}

let edn;
const recordAsEdn = (model, record) => {
  const attributes = Object.keys(record);
  edn = '{';

  attributes.forEach(attr => {
    edn += printAttrAsEdn(model, attr, record[attr]);
  });

  return edn + '}\n';
}

let data;
const generateFinalFixtures = () => {
  modelNames.forEach((modelName) => {
    data = models[modelName];
    fixt_file.write(';; ' + modelName + 's \n');
    data.forEach(record => {
      fixt_file.write(recordAsEdn(modelName, record));
    });
    fixt_file.write('\n');
  });
};

const finalFixtures = [];
let dbIndex = 1;
const modelNames = Object.keys(models);


//                             //
//           execute           //
//                             //

providerEnums.regions.forEach(region => generateRegion(region));
generateAppAccounts();

let emailRef, personRef;
// additional patients
for (var i = 1; i <= 3; i++) {
  emailRef = generateEmail('patient' + i);
  personRef = generatePerson(emailRef, 'patient');
  generatePerson(personRef);
}



generateFinalFixtures();

console.log('done.');
