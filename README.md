### Github Quest

## Prerequisites

1. Firstly we need users and organizations information in users table as name, email, github_handle.
2. Require github access token for fetching githunb repos.

## Getting Started

# Prerequisites for running the server:

Need postgres connection.

1. For running development server give environment variables of development database and select NODE_ENV as development.

2. For running production server give environment variables of production database and select NODE_ENV as production.

# Running the server:

1. run command npm install ("it will install the required dependencies necessary for running the server").

2. run command npx sequelize db:migrate ("this command will migrate all the").

3. insert all the users in users table along with their name, email and github_handle.

4. for starting server run command npm run dev or yarn dev.

5. for starting cron job call API "http://localhost:3000/api/insertPublicRepos" (" API id /api/insertPublicRepos").

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.