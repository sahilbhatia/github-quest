const faker = require("faker");

const data = {};
data.user = {
  org_user_id: faker.random.alphaNumeric(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  role_id: 1,
};

data.project = {
  org_project_id: faker.random.alphaNumeric(),
  name: faker.name.firstName(),
};

data.project_repository = {
  repository_url: faker.internet.url(),
  host: faker.internet.domainName(),
};

data.user_repository = {
  source_repo_id: faker.random.number(),
  url: faker.internet.url(),
  is_forked: false,
  is_archived: false,
  is_disabled: false,
  is_suspicious: false,
  manual_review: false,
  is_private: false,
};

module.exports = data;
