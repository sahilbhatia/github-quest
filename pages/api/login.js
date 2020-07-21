const request = require("superagent");

const data = async (req, res) => {
  const { code } = req.query;
  if (!code) {
    res.status(401).send({
      message: "Error: no code"
    });
  }

  const data = await request
    .post("https://github.com/login/oauth/access_token")
    .send({
      "client_id": "6aa0ca2d884e040075c4",
      "client_secret": "4e2e9876c9ae01b600deb1d293a9418646b51fb9",
      "code": code
    })
    .set("Accept", "application/json");
  const access_token = data.body.access_token;
  res.status(200).send(access_token);
};

export default data;
