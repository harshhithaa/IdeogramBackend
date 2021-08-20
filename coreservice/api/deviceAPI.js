var databaseHelper = require("../helper/databasehelper");
var coreRequestModel = require("../models/coreServiceModel");
var constant = require("../common/constant");
var requestType = constant.RequestType;
var appLib = require("applib");
var momentTimezone = require("moment-timezone");

module.exports.registerDeviceToken = async (req, res) => {
  var logger = new appLib.Logger(req.originalUrl, res.apiContext.requestID);

  logger.logInfo(`registerDeviceToken invoked()!!`);

  var functionContext = {
    requestType: requestType.REGISTERDEVICETOKEN,
    requestID: res.apiContext.requestID,
    error: null,
    userType: res.apiContext.userType,
    res: res,
    logger: logger,
    userRef: res.apiContext.userRef,
    currentTs: momentTimezone
      .utc(new Date(), "YYYY-MM-DD HH:mm:ss.SSS")
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss.SSS"),
  };

  var registerDeviceTokenRequest = new coreRequestModel.RegisterDeviceTokenRequest(
    req
  );
  logger.logInfo(
    `registerDeviceToken() :: Request Object : ${registerDeviceTokenRequest}`
  );

  if (
    !registerDeviceTokenRequest.deviceToken ||
    !registerDeviceTokenRequest.appType
  ) {
    functionContext.error = new coreRequestModel.ErrorModel(
      constant.ErrorMessage.Invalid_Request,
      constant.ErrorCode.Invalid_Request
    );
    logger.logInfo(
      `registerDeviceToken() Error:: Invalid Request :: ${JSON.stringify(
        req.body
      )}`
    );
    registerDeviceTokenResponse(functionContext, null);
    return;
  }
  try {
    let registerDeviceTokenDBResult = await databaseHelper.registerDeviceTokenInDB(
      functionContext,
      registerDeviceTokenRequest
    );
    registerDeviceTokenResponse(functionContext, registerDeviceTokenDBResult);
  } catch (errRegisterDeviceToken) {
    if (
      !errRegisterDeviceToken.ErrorMessage &&
      !errRegisterDeviceToken.ErrorCode
    ) {
      logger.logInfo(
        `registerDeviceToken() :: Error :: ${errRegisterDeviceToken}`
      );
      functionContext.error = new coreRequestModel.ErrorModel(
        constant.ErrorMessage.ApplicationError,
        constant.ErrorCode.ApplicationError,
        JSON.stringify(errRegisterDeviceToken)
      );
    }
    logger.logInfo(
      `registerDeviceToken() :: Error :: ${JSON.stringify(
        errRegisterDeviceToken
      )}`
    );
    registerDeviceTokenResponse(functionContext, null);
  }
};

module.exports.userLogout = async (req, res) => {
  var logger = new appLib.Logger(req.originalUrl, res.apiContext.requestID);

  logger.logInfo(`userLogout invoked()!!`);

  var functionContext = {
    requestType: requestType.REGISTERDEVICETOKEN,
    requestID: res.apiContext.requestID,
    error: null,
    userType: res.apiContext.userType,
    res: res,
    logger: logger,
    userRef: null,
    currentTs: momentTimezone
      .utc(new Date(), "YYYY-MM-DD HH:mm:ss.SSS")
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss.SSS"),
  };

  var userLogoutRequest = new coreRequestModel.UserLogoutRequest(req);
  logger.logInfo(`userLogout() :: Request Object : ${req.body}`);

  if (!userLogoutRequest.userRef) {
    functionContext.error = new coreRequestModel.ErrorModel(
      constant.ErrorMessage.Invalid_Request,
      constant.ErrorCode.Invalid_Request
    );
    logger.logInfo(
      `userLogout() Error:: Invalid Request :: ${JSON.stringify(
        userLogoutRequest
      )}`
    );
    userLogoutResponse(functionContext, null);
    return;
  }
  try {
    functionContext.userRef = userLogoutRequest.userRef;
    let userLogoutInDBResult = await databaseHelper.userLogoutInDB(
      functionContext,
      userLogoutRequest
    );
    userLogoutResponse(functionContext, userLogoutInDBResult);
  } catch (errUserLogout) {
    if (!errUserLogout.ErrorMessage && !errUserLogout.ErrorCode) {
      logger.logInfo(`userLogout() :: Error :: ${errUserLogout}`);
      functionContext.error = new coreRequestModel.ErrorModel(
        constant.ErrorMessage.ApplicationError,
        constant.ErrorCode.ApplicationError,
        JSON.stringify(errUserLogout)
      );
    }
    logger.logInfo(`userLogout() :: Error :: ${JSON.stringify(errUserLogout)}`);
    userLogoutResponse(functionContext, null);
  }
};

module.exports.getNotificationlist = async (req, res) => {
  var logger = new appLib.Logger(req.originalUrl, res.apiContext.requestID);

  logger.logInfo(`getNotificationlist invoked()!!`);

  var functionContext = {
    requestType: requestType.GETNOTIFICATIONLIST,
    requestID: res.apiContext.requestID,
    error: null,
    userType: res.apiContext.userType,
    res: res,
    logger: logger,
    currentTs: momentTimezone
      .utc(new Date(), "YYYY-MM-DD HH:mm:ss.SSS")
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss.SSS"),
    userRef: res.apiContext.userRef,
  };
  var requestContext = {
    notificationList: [],
  };
  try {
    var getNotificationListFromDBResult = await databaseHelper.getNotificationListFromDBResult(
      functionContext
    );
    processNotificationListForUsers(
      functionContext,
      requestContext,
      getNotificationListFromDBResult
    );
    getNotificationlistResponse(
      functionContext,
      requestContext,
      getNotificationListFromDBResult
    );
  } catch (errGetNotificationList) {
    if (
      !errGetNotificationList.ErrorMessage &&
      !errGetNotificationList.ErrorCode
    ) {
      logger.logInfo(
        `getNotificationList() :: Error :: ${errGetNotificationList}`
      );
      functionContext.error = new coreRequestModel.ErrorModel(
        constant.ErrorMessage.ApplicationError,
        constant.ErrorCode.ApplicationError,
        JSON.stringify(errGetNotificationList)
      );
    }
    logger.logInfo(
      `getNotificationList() :: Error :: ${JSON.stringify(
        errGetNotificationList
      )}`
    );
    getNotificationlistResponse(functionContext, null);
  }
};

var registerDeviceTokenResponse = (functionContext, resolvedResult) => {
  var logger = functionContext.logger;

  logger.logInfo(`registerDeviceTokenResponse() invoked`);

  var registerDeviceTokenResponse = new coreRequestModel.RegisterDeviceTokenResponse();

  registerDeviceTokenResponse.RequestID = functionContext.requestID;
  if (functionContext.error) {
    registerDeviceTokenResponse.Error = functionContext.error;
    registerDeviceTokenResponse.Details = null;
  } else {
    registerDeviceTokenResponse.Error = null;
    registerDeviceTokenResponse.Details.UserRef = functionContext.userRef;
  }
  appLib.SendHttpResponse(functionContext, registerDeviceTokenResponse);
  logger.logInfo(
    `registerDeviceTokenResponse  Response :: ${JSON.stringify(
      registerDeviceTokenResponse
    )}`
  );
  logger.logInfo(`registerDeviceTokenResponse completed`);
};

var userLogoutResponse = (functionContext, resolvedResult) => {
  var logger = functionContext.logger;

  logger.logInfo(`userLogoutResponse() invoked`);

  var userLogoutResponse = new coreRequestModel.UserLogoutResponse();

  userLogoutResponse.RequestID = functionContext.requestID;
  if (functionContext.error) {
    userLogoutResponse.Error = functionContext.error;
    userLogoutResponse.Details = null;
  } else {
    userLogoutResponse.Error = null;
    userLogoutResponse.Details.UserRef = functionContext.userRef;
  }
  appLib.SendHttpResponse(functionContext, userLogoutResponse);
  logger.logInfo(
    `userLogoutResponse  Response :: ${JSON.stringify(userLogoutResponse)}`
  );
  logger.logInfo(`userLogoutResponse completed`);
};

var getNotificationlistResponse = (functionContext, resolvedResult) => {
  var logger = functionContext.logger;

  logger.logInfo(`getNotificationlistResponse() invoked`);

  var getNotificationlistResponse = new coreRequestModel.GetNotificationListResponse();

  getNotificationlistResponse.RequestID = functionContext.requestID;
  if (functionContext.error) {
    getNotificationlistResponse.Error = functionContext.error;
    getNotificationlistResponse.Details = null;
  } else {
    getNotificationlistResponse.Error = null;
    getNotificationlistResponse.Details.NotificationList =
      resolvedResult.notificationList;
  }
  appLib.SendHttpResponse(functionContext, getNotificationlistResponse);
  logger.logInfo(
    `getNotificationlistResponse  Response :: ${JSON.stringify(
      getNotificationlistResponse
    )}`
  );
  logger.logInfo(`getNotificationlistResponse completed`);
};

var processNotificationListForUsers = (
  functionContext,
  requestContext,
  resolvedResult
) => {
  var logger = functionContext.logger;

  logger.logInfo(`processNotificationListForUsers() invoked`);
  if (resolvedResult.notificationList.length > 0) {
    for (
      var count = 0;
      count < resolvedResult.notificationList.length;
      count++
    ) {
      var notificationMessageJSON = resolvedResult.notificationList[count]
        .Payload
        ? JSON.parse(resolvedResult.notificationList[count].Payload)
        : null;
      requestContext.notificationList.push({
        NotificationTitle: notificationMessageJSON.Title
          ? notificationMessageJSON.Title
          : null,
        NotificationMessage: notificationMessageJSON.Message
          ? notificationMessageJSON.Message
          : null,
        Reference: resolvedResult.notificationList[count].Reference
          ? resolvedResult.notificationList[count].Reference
          : null,
        ServiceType: resolvedResult.notificationList[count].ServiceType
          ? resolvedResult.notificationList[count].ServiceType
          : null,
      });
    }
  }
};
