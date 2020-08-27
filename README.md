### Github Quest

## Prerequisites

1. Require github access token for fetching githunb repos.

## Getting Started

# Prerequisites for running the server:

Need postgres connection.

Environment variables are required to run server refer .env.sample file for respective environment variables.

1. For running development server give environment variables of development database and select NODE_ENV=development.

2. For running production server give environment variables of production database and select NODE_ENV=production.

# Running the server:

1. run command npm install ("it will install the required dependencies necessary for running the server").

2. run command npx sequelize db:create ("this command create database with the name given in .env file").
3. run command npx sequelize db:migrate ("this command will migrate all the database").

4. run command npx sequelize db:seed:all ("this command is for seeding roles into database").

5. for starting server run command npm run dev or yarn dev.

6. insert all the users in users table by calling API "http://localhost:3000/api/insertUsers" ("this API will activate a cron job for fetching users from intranet and insert them into database").

7. for starting cron job call API "http://localhost:3000/api/insertPublicRepos" ("this API will activate cron job for fetching repos from github with corresponding users and store them into database").

8. for starting cron job call API "http://localhost:3000/api/insertProjects" ("this API will activate cron job for fetching projects from intranet-stage and store them into database").

9. Open [http://localhost:3000] with your browser to see the result.

# Run Api Test Cases:

1. add SERVER env variable in .env file put current running server for that.

2. start the server using npm run dev command.

3. open new terminal and run mocha command.