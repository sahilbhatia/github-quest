var cron = require("node-cron");
const request = require("superagent");
const { headers } = require("../../constants/header");
const moment = require('moment');
let fetchReposAfterTime = process.env.INSERT_REPOS_AFTER_TIME;

const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Users = db.users;
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Parent_repositories = db.parent_repositories;

export default async function insertPublicRepos(req, res) {

  await cron.schedule(process.env.INSERT_PUBLIC_REPOS_SCHEDULE, async () => {

    const usersList = await Users.findAll({
      attributes: ["id", "github_handle"],
      order: [["id", "ASC"]]
    });
    let iterator = 0;
    while (iterator < usersList.length) {

      const data = await request
        .get("https://api.github.com/users/" + usersList[iterator].dataValues.github_handle + "/repos?since=" + fetchReposAfterTime + "")
        .set(headers);
      const mapData = await data.body.map(async (item) => {

        const result = await Repositories.findAll({
          where: { github_repo_id: item.id },
          order: [["id", "ASC"]]
        });

        if (result.length === 0 && item.fork === false) {
          const insertRepos = await Repositories.create({
            github_repo_id: item.id,
            name: item.name,
            url: item.url,
            description: item.description,
            is_forked: item.fork,
            is_disabled: item.disabled,
            is_archived: item.archived,
            created_at: item.created_at,
            updated_at: item.updated_at,
          })
          await Users_repositories.create({
            user_id: usersList[iterator].dataValues.id,
            repository_id: insertRepos.dataValues.id,
          })

        } else if (result.length === 0 && item.fork == true) {

          const parentRepo = await request
            .get(`https://api.github.com/repos/${usersList[iterator].dataValues.github_handle}/${item.name}`)
            .set(headers);
          const insertParentRepositories = await Parent_repositories.create({
            github_repo_id: parentRepo.body.parent.id,
            url: parentRepo.body.parent.url,
            is_private: parentRepo.body.parent.private,
          })

          const insertRepos = await Repositories.create({
            github_repo_id: item.id,
            name: item.name,
            url: item.url,
            description: item.description,
            is_forked: item.fork,
            is_disabled: item.disabled,
            is_archived: item.archived,
            created_at: item.created_at,
            updated_at: item.updated_at,
            parent_repo_id: insertParentRepositories.dataValues.id,
          })
          await Users_repositories.create({
            user_id: usersList[iterator].dataValues.id,
            repository_id: insertRepos.dataValues.id,
          })
        }
      })
      await Promise.all(mapData)
      iterator++;
    }
    fetchReposAfterTime = moment.utc().format();
  });
  res.status(200).json({
    message: "data inserted successfully"
  })
}
