export default (req, res) => {
    console.log(req.body)
    res.send({"data": "1234"})
 }