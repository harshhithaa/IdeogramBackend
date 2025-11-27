var databaseHelper = require("../helper/databasehelper");
var coreRequestModel = require("../models/coreServiceModel");
var constant = require("../common/constant");
var requestType = constant.RequestType;
var appLib = require("applib");
var joiValidationModel = require("../models/validationModel");
var moment = require("moment-timezone");

module.exports.MonitorLogin = async (req, res) => {
  var logger = new appLib.Logger(req.originalUrl, res.apiContext.requestID);

  logger.logInfo(`MonitorLogin invoked()!!`);

  var functionContext = new coreRequestModel.FunctionContext(
    requestType.MONITORLOGIN,
    null,
    res,
    logger
  );

  var monitorLoginRequest = new coreRequestModel.MonitorLoginRequest(req);
  logger.logInfo(`MonitorLogin() :: Request Object : ${monitorLoginRequest}`);

  var validateRequest =
    joiValidationModel.monitorLoginRequest(monitorLoginRequest);

  if (validateRequest.error) {
    functionContext.error = new coreRequestModel.ErrorModel(
      constant.ErrorMessage.Invalid_Request,
      constant.ErrorCode.Invalid_Request,
      validateRequest.error.details
    );
    logger.logInfo(
      `MonitorLogin() Error:: Invalid Request :: ${JSON.stringify(
        monitorLoginRequest
      )}`
    );
    saveMonitorLoginResponse(functionContext, null);
    return;
  }

  var requestContext = {
    ...monitorLoginRequest,
  };

  try {
    var MonitorLoginDBResult = await databaseHelper.monitorLoginDB(
      functionContext,
      requestContext
    );

    saveMonitorLoginResponse(functionContext, MonitorLoginDBResult);
  } catch (errMonitorLogin) {
    if (!errMonitorLogin.ErrorMessage && !errMonitorLogin.ErrorCode) {
      logger.logInfo(`MonitorLogin() :: Error :: ${errMonitorLogin}`);
      functionContext.error = new coreRequestModel.ErrorModel(
        constant.ErrorMessage.ApplicationError,
        constant.ErrorCode.ApplicationError
      );
    }
    logger.logInfo(
      `MonitorLogin() :: Error :: ${JSON.stringify(errMonitorLogin)}`
    );
    saveMonitorLoginResponse(functionContext, null);
  }
};

module.exports.FetchMonitorDetails = async (req, res) => {
  var logger = new appLib.Logger(req.originalUrl, res.apiContext.requestID);

  logger.logInfo(`FetchMonitorDetails invoked()!!`);

  var functionContext = new coreRequestModel.FunctionContext(
    requestType.FETCHMONITORDETAILS,
    null,
    res,
    logger
  );

  var fetchMonitorDetailsRequest = new coreRequestModel.MonitorDetailsRequest(
    req
  );
  logger.logInfo(
    `MonitorLogin() :: Request Object : ${fetchMonitorDetailsRequest}`
  );

  var validateRequest = joiValidationModel.monitorDetailsRequest(
    fetchMonitorDetailsRequest
  );

  if (validateRequest.error) {
    functionContext.error = new coreRequestModel.ErrorModel(
      constant.ErrorMessage.Invalid_Request,
      constant.ErrorCode.Invalid_Request,
      validateRequest.error.details
    );
    logger.logInfo(
      `MonitorLogin() Error:: Invalid Request :: ${JSON.stringify(
        fetchMonitorDetailsRequest
      )}`
    );
    fetchMonitorDetailsResponse(functionContext, null);
    return;
  }

  var requestContext = {
    ...fetchMonitorDetailsRequest,
  };

  try {
    let fetchMonitorDetailsResult =
      await databaseHelper.fetchMonitorDetailsRequest(
        functionContext,
        requestContext
      );

    let processScheduleDetailsResult = await processScheduleDetails(
      functionContext,
      fetchMonitorDetailsResult
    );

    let orientation = await getOrientation(
      functionContext,
      fetchMonitorDetailsResult
    );

    let slideTime = await getSlideTime(
      functionContext,
      fetchMonitorDetailsResult
    );

    fetchMonitorDetailsResponse(
      functionContext,
      processScheduleDetailsResult,
      orientation,
      slideTime
    );
  } catch (errMonitorDetails) {
    if (!errMonitorDetails.ErrorMessage && !errMonitorDetails.ErrorCode) {
      logger.logInfo(
        `fetchMonitorDetailsResponse() :: Error :: ${errMonitorDetails}`
      );
      functionContext.error = new coreRequestModel.ErrorModel(
        constant.ErrorMessage.ApplicationError,
        constant.ErrorCode.ApplicationError
      );
    }
    logger.logInfo(
      `fetchMonitorDetailsResponse() :: Error :: ${JSON.stringify(
        errMonitorDetails
      )}`
    );
    fetchMonitorDetailsResponse(functionContext, null, null);
  }
};

module.exports.FetchMedia = async (req, res) => {
  var logger = new appLib.Logger(req.originalUrl, res.apiContext.requestID);

  logger.logInfo(`FetchMedia invoked()!!`);

  var functionContext = new coreRequestModel.FunctionContext(
    requestType.FETCHMEDIA,
    null,
    res,
    logger
  );

  var fetchMediaRequest = new coreRequestModel.FetchMediaRequest(req);
  logger.logInfo(`MonitorLogin() :: Request Object : ${fetchMediaRequest}`);

  var validateRequest = joiValidationModel.fetchMediaRequest(fetchMediaRequest);

  if (validateRequest.error) {
    functionContext.error = new coreRequestModel.ErrorModel(
      constant.ErrorMessage.Invalid_Request,
      constant.ErrorCode.Invalid_Request,
      validateRequest.error.details
    );
    logger.logInfo(
      `MonitorLogin() Error:: Invalid Request :: ${JSON.stringify(
        fetchMediaRequest
      )}`
    );
    fetchMediaResponse(functionContext, null);
    return;
  }

  try {
    let fetchMediaFromDb = await databaseHelper.fetchMediaFromDB(
      functionContext,
      fetchMediaRequest
    );

    fetchMediaResponse(functionContext, fetchMediaFromDb);
  } catch (errFetchMedia) {
    if (!errFetchMedia.ErrorMessage && !errFetchMedia.ErrorCode) {
      logger.logInfo(
        `fetchMonitorDetailsResponse() :: Error :: ${errFetchMedia}`
      );
      functionContext.error = new coreRequestModel.ErrorModel(
        constant.ErrorMessage.ApplicationError,
        constant.ErrorCode.ApplicationError
      );
    }
    logger.logInfo(
      `fetchMonitorDetailsResponse() :: Error :: ${JSON.stringify(
        errFetchMedia
      )}`
    );
    fetchMediaResponse(functionContext, null, null);
  }
};

var fetchMediaResponse = (functionContext, resolvedResult) => {
  var logger = functionContext.logger;

  logger.logInfo(`fetchMediaResponse() invoked`);

  var fetchMediaResponse = new coreRequestModel.FetchMediaResponse();

  fetchMediaResponse.RequestID = functionContext.requestID;

  if (functionContext.error) {
    fetchMediaResponse.Error = functionContext.error;
    fetchMediaResponse.Details = null;
  } else {
    fetchMediaResponse.Error = null;
    fetchMediaResponse.Details = resolvedResult;
  }

  appLib.SendHttpResponse(functionContext, fetchMediaResponse);

  logger.logInfo(`fetchMediaResponse :: ${JSON.stringify(fetchMediaResponse)}`);

  logger.logInfo(`fetchMediaResponse completed`);
};

var saveMonitorLoginResponse = (functionContext, resolvedResult) => {
  var logger = functionContext.logger;

  logger.logInfo(`saveMonitorLoginResponse() invoked`);

  var MonitorLoginResponse = new coreRequestModel.MonitorLoginResponse();

  MonitorLoginResponse.RequestID = functionContext.requestID;
  if (functionContext.error) {
    MonitorLoginResponse.Error = functionContext.error;
    MonitorLoginResponse.Details = null;
  } else {
    MonitorLoginResponse.Error = null;

    MonitorLoginResponse.Details.AuthToken = resolvedResult.Token;
    MonitorLoginResponse.Details.MonitorRef = resolvedResult.MonitorRef;
    MonitorLoginResponse.Details.MonitorName = resolvedResult.MonitorName;
  }
  appLib.SendHttpResponse(functionContext, MonitorLoginResponse);
  logger.logInfo(
    `saveMonitorLoginResponse  Response :: ${JSON.stringify(
      MonitorLoginResponse
    )}`
  );
  logger.logInfo(`saveMonitorLoginResponse completed`);
};

var fetchMonitorDetailsResponse = (
  functionContext,
  resolvedResult,
  orientation,
  slideTime
) => {
  var logger = functionContext.logger;

  logger.logInfo(`fetchMonitorDetailsResponse() invoked`);

  var MonitorDetailsResponse = new coreRequestModel.MonitorDetailsResponse();

  MonitorDetailsResponse.RequestID = functionContext.requestID;
  if (functionContext.error) {
    MonitorDetailsResponse.Error = functionContext.error;
    MonitorDetailsResponse.Details = null;
  } else {
    MonitorDetailsResponse.Error = null;
    MonitorDetailsResponse.Details.Orientation = orientation;
    MonitorDetailsResponse.Details.MediaList = resolvedResult;
    MonitorDetailsResponse.Details.SlideTime = slideTime;
    // MonitorDetailsResponse.Details.ScheduleDetails = resolvedResult[2] ? resolvedResult[2][0] :null;
  }
  appLib.SendHttpResponse(functionContext, MonitorDetailsResponse);
  logger.logInfo(
    `fetchMonitorDetailsResponse  Response :: ${JSON.stringify(
      MonitorDetailsResponse
    )}`
  );
  logger.logInfo(`fetchMonitorDetailsResponse completed`);
};

var processScheduleDetails = (functionContext, resolvedResult) => {
  var logger = functionContext.logger;

  logger.logInfo(`processScheduleDetails() invoked`);

  var finalPlaylist = [];

  let day = moment()
    .utc(new Date(), "YYYY-MM-DD HH:mm:ss")
    .tz("Asia/Kolkata")
    .day();
  day = day.toString();

  console.log(day);
  // console.log(resolvedResult.slice(-2)[0]);

  for (let i = 0; i < resolvedResult.length; i++) {
    if (
      resolvedResult[i][0] &&
      resolvedResult[i][0].hasOwnProperty("ScheduleRef")
    ) {
      var scheduledPlaylist = resolvedResult[i - 1]
        ? resolvedResult[i - 1]
        : [];
      var scheduleDetails = resolvedResult[i][0] ? resolvedResult[i][0] : [];
      var defaultPlaylist = resolvedResult.slice(-2)[0]
        ? resolvedResult.slice(-2)[0]
        : [];

      var days = JSON.parse(scheduleDetails.Days);
      break;
    } else {
      var defaultPlaylist = resolvedResult.slice(-2)[0]
        ? resolvedResult.slice(-2)[0]
        : [];
      finalPlaylist = defaultPlaylist;
    }
  }

  // if (resolvedResult.length == 5) {
  //   var scheduledPlaylist = resolvedResult[1] ? resolvedResult[1] : [];
  //   var scheduleDetails = resolvedResult[2] ? resolvedResult[2][0] : [];
  //   var defaultPlaylist = resolvedResult[3] ? resolvedResult[3] : [];

  //   var days = JSON.parse(scheduleDetails.Days);
  // } else {
  //   var defaultPlaylist = resolvedResult[1] ? resolvedResult[1] : [];
  //   finalPlaylist = defaultPlaylist;
  // }

  if (days && days.length > 0) {
    finalPlaylist = days.includes(day) ? scheduledPlaylist : defaultPlaylist;
  } else {
    finalPlaylist = defaultPlaylist;
  }

  return finalPlaylist;
};

var getOrientation = (functionContext, resolvedResult) => {
  var logger = functionContext.logger;

  logger.logInfo(`getOrientation() invoked`);

  return resolvedResult[0][0].Orientation;
};

var getSlideTime = (functionContext, resolvedResult) => {
  var logger = functionContext.logger;

  logger.logInfo(`getSlideTime() invoked`);

  return resolvedResult[0][0].SlideTime;
};

module.exports.UpdateMonitorStatus = async (req, res) => {
  var logger = new appLib.Logger(req.originalUrl, res.apiContext.requestID);
  logger.logInfo(`UpdateMonitorStatus invoked()!!`);

  var functionContext = new coreRequestModel.FunctionContext(
    requestType.UPDATE_MONITOR_STATUS || 'UPDATE_MONITOR_STATUS',
    null,
    res,
    logger
  );

  var updateRequest = new coreRequestModel.UpdateMonitorStatusRequest
    ? new coreRequestModel.UpdateMonitorStatusRequest(req)
    : new coreRequestModel.UpdateMonitorStatusRequest(req);
  // validation
  var validateRequest = joiValidationModel.updateMonitorStatusRequest(updateRequest);

  if (validateRequest.error) {
    functionContext.error = new coreRequestModel.ErrorModel(
      constant.ErrorMessage.Invalid_Request,
      constant.ErrorCode.Invalid_Request,
      validateRequest.error.details
    );
    logger.logInfo(`UpdateMonitorStatus() Error:: Invalid Request :: ${JSON.stringify(updateRequest)}`);
    updateMonitorStatusResponse(functionContext, null);
    return;
  }

  try {
    let dbResult = await databaseHelper.updateMonitorStatusDB(functionContext, {
      monitorRef: updateRequest.monitorRef,
      playlistRef: updateRequest.playlistRef,
      isPlaylistRunning: updateRequest.isPlaylistRunning,
      errorMessage: updateRequest.errorMessage,
    });

    updateMonitorStatusResponse(functionContext, dbResult);
  } catch (err) {
    logger.logInfo(`UpdateMonitorStatus() :: Error :: ${JSON.stringify(err)}`);
    updateMonitorStatusResponse(functionContext, null);
  }
};

var updateMonitorStatusResponse = (functionContext, resolvedResult) => {
  var logger = functionContext.logger;
  logger.logInfo(`updateMonitorStatusResponse() invoked`);

  var resp = new coreRequestModel.UpdateMonitorStatusResponse();
  resp.RequestID = functionContext.requestID;

  if (functionContext.error) {
    resp.Error = functionContext.error;
    resp.Details = null;
  } else {
    resp.Error = null;
    // resolvedResult may be result set; return minimal useful info
    resp.Details = resolvedResult && resolvedResult[0] ? resolvedResult[0] : resolvedResult;
  }
  appLib.SendHttpResponse(functionContext, resp);
  logger.logInfo(`updateMonitorStatusResponse completed`);
};

module.exports.FetchAdminMonitorsStatus = async (req, res) => {
  var logger = new appLib.Logger(req.originalUrl, res.apiContext.requestID);
  logger.logInfo(`FetchAdminMonitorsStatus invoked()!!`);

  var functionContext = new coreRequestModel.FunctionContext(
    requestType.FETCH_ADMIN_MONITORS_STATUS || 'FETCH_ADMIN_MONITORS_STATUS',
    null,
    res,
    logger
  );

  var fetchRequest = new coreRequestModel.FetchAdminMonitorsStatusRequest(req);

  var validateRequest = joiValidationModel.fetchAdminMonitorsStatusRequest(fetchRequest);
  if (validateRequest.error) {
    functionContext.error = new coreRequestModel.ErrorModel(
      constant.ErrorMessage.Invalid_Request,
      constant.ErrorCode.Invalid_Request,
      validateRequest.error.details
    );
    logger.logInfo(`FetchAdminMonitorsStatus() Error:: Invalid Request :: ${JSON.stringify(fetchRequest)}`);
    fetchAdminMonitorsStatusResponse(functionContext, null);
    return;
  }

  try {
    let dbResult = await databaseHelper.fetchAdminMonitorsStatusDB(functionContext, { adminRef: fetchRequest.adminRef });
    fetchAdminMonitorsStatusResponse(functionContext, dbResult);
  } catch (err) {
    logger.logInfo(`FetchAdminMonitorsStatus() :: Error :: ${JSON.stringify(err)}`);
    fetchAdminMonitorsStatusResponse(functionContext, null);
  }
};

var fetchAdminMonitorsStatusResponse = (functionContext, resolvedResult) => {
  var logger = functionContext.logger;
  logger.logInfo(`fetchAdminMonitorsStatusResponse() invoked`);

  var resp = new coreRequestModel.FetchAdminMonitorsStatusResponse();
  resp.RequestID = functionContext.requestID;

  if (functionContext.error) {
    resp.Error = functionContext.error;
    resp.Details = null;
  } else {
    resp.Error = null;
    // normalized details: return first result set or empty array
    resp.Details = resolvedResult && resolvedResult[0] ? resolvedResult[0] : resolvedResult;
  }
  appLib.SendHttpResponse(functionContext, resp);
  logger.logInfo(`fetchAdminMonitorsStatusResponse completed`);
};
