var express = require("express");
var router = express.Router();

var monitorApi = require("../api/monitorAPI");

router.post("/login", monitorApi.MonitorLogin);
router.post("/fetchmonitordetails", monitorApi.FetchMonitorDetails);
router.get("/fetchmedia", monitorApi.FetchMedia);

// new: update monitor status (heartbeat) and fetch admin monitors status
router.post("/updatemonitorstatus", monitorApi.UpdateMonitorStatus);
router.get("/fetchadminmonitorsstatus", monitorApi.FetchAdminMonitorsStatus);

module.exports = router;
