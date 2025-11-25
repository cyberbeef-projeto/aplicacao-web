var express = require("express");
var router = express.Router();
var jiraController = require("../controllers/jiraController");

router.get("/kpis", jiraController.getKpis);
router.get("/status", jiraController.getStatus);
router.get("/tipos", jiraController.getIncidentsByType);

module.exports = router;