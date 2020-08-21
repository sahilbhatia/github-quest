const faker = require("faker");

const data = {};
data.user = {
  org_user_id: faker.random.alphaNumeric(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  role_id: 1,
};



module.exports = data;
