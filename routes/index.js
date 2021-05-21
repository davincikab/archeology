var express = require('express');
var router = express.Router();
var path = require("path");

const { getResearchAreas, getArtefacts } = require("../controller/indexController");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.resolve("views/index.html"));
});

router.get("/research-areas/", async function(req, res) {
  let researchAreas = await getResearchAreas();

  return res.send({'research':researchAreas[0]});
});

router.get("/artefacts/", async function(req, res) {
  let artefacts = await getArtefacts();

  return res.send({'artefact':artefacts[0]});
});


module.exports = router;
