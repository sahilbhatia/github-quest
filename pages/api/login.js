
const data = (req, res) => {
  console.log(req);
  res.status(200).send(req.query.code);
};

export default data;