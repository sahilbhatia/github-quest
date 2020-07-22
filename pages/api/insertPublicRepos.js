var cron = require("node-cron");
const pool = require("../../config/postgres-config");
const request = require("superagent");
const { headers } = require("../../constants/header");
const moment = require('moment');
let fetchReposAfterTime = process.env.INSERT_REPOS_AFTER_TIME;

export default async function insertPublicRepos(req, res) {

  await cron.schedule("* * * * *", async () => {
    const data = await request
      .get("https://api.github.com/users/onkar-josh/repos?since=" + fetchReposAfterTime + "&sort=created&direction=asc")
      .set(headers);
    await data.body.map(async (item) => {

      const result = await pool.query(`select * from repositories where github_repo_id = '${item.id}'`);

      if (result.rowCount === 0 && item.fork === false) {

        const insertRepos = await pool.query(`insert into repositories (github_repo_id, name, url, description, is_forked, is_disabled, is_archived, created_at, updated_at ) values (${item.id},'${item.name}','${item.url}','${item.description}',${item.fork},${item.disabled},${item.archived},'${item.created_at}','${item.updated_at}') returning *`);
        await pool.query(`insert into users_repositories (user_id,repository_id) values ('1',${insertRepos.rows[0].id})`);

      } else if (result.rowCount === 0 && item.fork == true) {

        const parentRepo = await request
          .get(`https://api.github.com/repos/onkar-josh/${result.rows[0].name}`)
          .set(headers);

        const insertRepos = await pool.query(`insert into repositories (github_repo_id, name, url, description, is_forked, is_disabled, is_archived, created_at, updated_at ) values (${item.id},'${item.name}','${item.url}','${item.description}',${item.fork},${item.disabled},${item.archived},'${item.created_at}','${item.updated_at}') returning *`);
        await pool.query(`insert into users_repositories (user_id,repository_id) values ('1',${insertRepos.rows[0].id})`);
        await pool.query(`insert into forked_repositories (repo_id ,github_parent_repo_id,is_private_parent_repo) values (${insertRepos.rows[0].id},${parentRepo.body.parent.id},${parentRepo.body.parent.private})`)
      }
    })
    fetchReposAfterTime = moment.utc().format();
  });
  res.status(200).json({
    message: "data inserted successfully"
  })
}
