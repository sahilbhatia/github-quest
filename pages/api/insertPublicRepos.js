const pool = require("../../config/postgres-config");
const request = require("superagent");
const { headers } = require("../../constants/header");

export default async function insertPublicRepos(req, res) {

  const data = await request
    .get("https://api.github.com/users/onkar-josh/repos")
    .set(headers);

  await data.body.map(async (item) => {
    const result = await pool.query(`select * from repositories where name = '${item.name}'`);
    if (result.rowCount === 0 && item.fork === false) {
      const insertRepos = await pool.query(`insert into repositories (name, description, is_forked, is_disabled, is_archived ) values ('${item.name}','${item.description}',${item.fork},${item.disabled},${item.archived}) returning *`);
      await pool.query(`insert into users_repositories (user_id,repository_id) values ('1',${insertRepos.rows[0].id}) `);
    } else if (result.rowCount !== 0 && item.fork == true) {
      const parentRepo = await request
        .get(`https://api.github.com/repos/onkar-josh/${result.rows[0].name}`)
        .set(headers);
      const parentId = await pool.query(`select id from repositories where name = '${parentRepo.body.parent.name}'`);
      const insertRepos = await pool.query(`insert into repositories (name, description, is_forked, is_disabled, is_archived, parent_id ) values ('${item.name}','${item.description}',${item.fork},${item.disabled},${item.archived}, ${parentId.rows[0].id}) returning *`);
      await pool.query(`insert into users_repositories (user_id,repository_id) values ('1',${insertRepos.rows[0].id}) `);
    }
  })

  res.status(200).json({
    message: "data successfully inserted",
  });
}
