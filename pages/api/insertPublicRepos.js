const pool = require("../../config/postgres-config");
const request = require("superagent")

export default async function insertPublicRepos(req, res) {
  const data = await request
    .get("https://api.github.com/users/avi4630/repos")
    .set({
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
      Accept: "application/vnd.github.v3+json"
    });
  data.body.map(async (item) => {
    const result = await pool.query(`select name from repositories where name = '${item.name}'`);
    if (result.rows[0] !== 0) {
      const insertRepos = await pool.query(`insert into repositories (name, description, is_forked, is_disabled, is_archived ) values ('${item.name}','${item.description}',${item.fork},${item.disabled},${item.archived}) returning *`);
      await pool.query(`insert into users_repositories (user_id,repository_id) values ('1',${insertRepos.rows[0].id}) `);
    }
  })
}
