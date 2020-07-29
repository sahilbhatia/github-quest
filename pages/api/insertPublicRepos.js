var cron = require("node-cron");
const request = require("superagent");
const { headers } = require("../../constants/header");
const moment = require('moment');
let fetchReposAfterTime;
const dbConn = require("../../models/sequelize");
dbConn.sequelize;
const db = require("../../models/sequelize");
const Users = db.users;
const Repositories = db.repositories;
const Users_repositories = db.users_repositories;
const Fetch_repos_after_time_intervals = db.fetched_repos_time_intarvals;

export default async function insertPublicRepos(req, res) {
  try {
    await cron.schedule(process.env.INSERT_PUBLIC_REPOS_SCHEDULE, async () => {

      // fetchReposAfterTime = await Fetch_repos_after_time_intervals.findAll({
      //   limit: 1,
      //   order: [["last_time_fetched_at", "DESC"]]
      // })

      const usersList = await Users.findAll({
        attributes: ["id", "github_handle"],
        order: [["id", "ASC"]]
      });
      let iterator = 0;

      const getRepoForSpecificUser = async () => {
        let usersRepos;
        if (usersList[iterator].dataValues.last_fetched_at) {
          usersRepos = await request
            .get("https://api.github.com/users/" + usersList[iterator].dataValues.github_handle + "/repos?since=" + usersList[iterator].dataValues.last_fetched_at + "")
            .set(headers);
          return usersRepos;

        } else {
          usersRepos = await request
            .get("https://api.github.com/users/" + usersList[iterator].dataValues.github_handle + "/repos")
            .set(headers);
          return usersRepos;
        }

      }
      while (iterator < usersList.length) {

        const data = await getRepoForSpecificUser();
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
              is_disabled: item.disabled,
              is_archived: item.archived,
              is_private: item.private,
              created_at: item.created_at,
              updated_at: item.updated_at,
              review: "pending",
            })

            await Users_repositories.create({
              user_id: usersList[iterator].dataValues.id,
              repository_id: insertRepos.dataValues.id,
            })

          } else if (result.length === 0 && item.fork == true) {
            let insertParentRepositories;
            const parentRepo = await request
              .get(`https://api.github.com/repos/${usersList[iterator].dataValues.github_handle}/${item.name}`)
              .set(headers);

            insertParentRepositories = await Repositories.findOne({
              where: { github_repo_id: parentRepo.body.parent.id }
            })

            if (insertParentRepositories) {
              const insertRepos = await Repositories.create({
                github_repo_id: item.id,
                name: item.name,
                url: item.url,
                description: item.description,
                is_disabled: item.disabled,
                is_archived: item.archived,
                is_private: item.private,
                is_forked: false,
                created_at: item.created_at,
                updated_at: item.updated_at,
                parent_repo_id: insertParentRepositories.dataValues.id,
                is_suspicious: insertParentRepositories.dataValues.is_private || insertParentRepositories.dataValues.is_suspicious ? true : false,
                review: insertParentRepositories.dataValues.is_private || insertParentRepositories.dataValues.is_suspicious ? "suspicious auto" : "pending",
                reviewed_at: insertParentRepositories.dataValues.is_private || insertParentRepositories.dataValues.is_suspicious ? moment.utc().format() : null,
              })

              await Users_repositories.create({
                user_id: usersList[iterator].dataValues.id,
                repository_id: insertRepos.dataValues.id,
              })

              await Repositories.update({
                is_forked: true,
                review: "pending"
              }, {
                returning: true,
                where: { id: insertParentRepositories.dataValues.id },
              });

            } else {

              insertParentRepositories = await Repositories.create({
                github_repo_id: parentRepo.body.parent.id,
                name: parentRepo.body.name,
                url: parentRepo.body.parent.url,
                description: parentRepo.body.parent.description,
                is_private: parentRepo.body.parent.private,
                is_archived: parentRepo.body.archived,
                is_disabled: parentRepo.body.disabled,
                is_forked: true,
                created_at: parentRepo.body.parent.created_at,
                updated_at: parentRepo.body.parent.updated_at,
                review: "pending",
              })

              let userObject = await Users.findOne({
                where: { github_handle: parentRepo.body.parent.owner.login }
              })

              if (userObject) {
                await Users_repositories.create({
                  user_id: userObject.dataValues.id,
                  repository_id: insertParentRepositories.dataValues.id,
                })
              }

              const insertRepos = await Repositories.create({
                github_repo_id: item.id,
                name: item.name,
                url: item.url,
                description: item.description,
                is_disabled: item.disabled,
                is_archived: item.archived,
                is_private: item.private,
                created_at: item.created_at,
                updated_at: item.updated_at,
                parent_repo_id: insertParentRepositories.dataValues.id,
                is_suspicious: insertParentRepositories.dataValues.is_private,
                review: insertParentRepositories.dataValues.is_private ? "suspicious auto" : "pending",
                reviewed_at: insertParentRepositories.dataValues.is_private ? moment.utc().format() : null,
              })

              await Users_repositories.create({
                user_id: usersList[iterator].dataValues.id,
                repository_id: insertRepos.dataValues.id,
              })

            }
          }
        })
        await Promise.all(mapData)
        await Users.update({ last_fetched_at: moment.utc().format() }, {
          returning: true,
          plain: true,
          where: { id: usersList[iterator].dataValues.id}
        });
        iterator++;
      }
    });

    res.status(200).json({
      message: "cron Job Activated successfully"
    })

  } catch {
    res.status(500).json({
      message: "internal server error"
    })
  }
}
