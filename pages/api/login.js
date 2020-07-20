const data = (req, res) => {
  res.status(200).send(req.query.code);
};

export default data;
