var databaseHelper = require("../helper/databasehelper");
var coreRequestModel = require("../models/coreserviceModel");
var constant = require("../common/constant");
var requestType = constant.RequestType;
var appLib = require("applib");
var bcrypt = require("bcryptjs");
var settings = require("../common/settings").Settings;
var joiValidationModel = require("../models/validationModel");
const mailSettings = require("../common/settings").MailSettings;
var mailer = new appLib.Mailer(mailSettings);


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
  
    var validateRequest = joiValidationModel.monitorLoginRequest(monitorLoginRequest);
  
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
      logger.logInfo(`MonitorLogin() :: Error :: ${JSON.stringify(errMonitorLogin)}`);
      saveMonitorLoginResponse(functionContext, null);
    }
  };
  
module.exports.AdminLogout = async (req, res) => {
    var logger = new appLib.Logger(req.originalUrl, res.apiContext.requestID);
  
    logger.logInfo(`AdminLogout invoked()!!`);
  
    var functionContext = new coreRequestModel.FunctionContext(
      requestType.ADMINLOGOUT,
      null,
      res,
      logger
    );
   
   
    try {
      let userLogoutInDBResult = await databaseHelper.adminLogoutInDB(
        functionContext,
        null
      );
      adminLogoutResponse(functionContext, userLogoutInDBResult);
    } catch (errUserLogout) {
      if (!errUserLogout.ErrorMessage && !errUserLogout.ErrorCode) {
        logger.logInfo(`userLogout() :: Error :: ${errUserLogout}`);
        functionContext.error = new coreRequestModel.ErrorModel(
          constant.ErrorMessage.ApplicationError,
          constant.ErrorCode.ApplicationError
        );
      }
      logger.logInfo(`userLogout() :: Error :: ${JSON.stringify(errUserLogout)}`);
      adminLogoutResponse(functionContext, null);
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
  
    var fetchMonitorDetailsRequest = new coreRequestModel.MonitorDetailsRequest(req);
    logger.logInfo(`MonitorLogin() :: Request Object : ${fetchMonitorDetailsRequest}`);
  
    var validateRequest = joiValidationModel.monitorDetailsRequest(fetchMonitorDetailsRequest);
  
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
      let fetchMonitorDetailsResult = await databaseHelper.fetchMonitorDetailsRequest(
        functionContext,
        requestContext
      );
  
  
      fetchMonitorDetailsResponse(functionContext, fetchMonitorDetailsResult);
    } catch (errMonitorDetails) {
      if (!errMonitorDetails.ErrorMessage && !errMonitorDetails.ErrorCode) {
        logger.logInfo(`fetchMonitorDetailsResponse() :: Error :: ${errMonitorDetails}`);
        functionContext.error = new coreRequestModel.ErrorModel(
          constant.ErrorMessage.ApplicationError,
          constant.ErrorCode.ApplicationError
        );
      }
      logger.logInfo(`fetchMonitorDetailsResponse() :: Error :: ${JSON.stringify(errMonitorDetails)}`);
      fetchMonitorDetailsResponse(functionContext, null);
    }
  };

  var saveAdminLoginResponse = (functionContext, resolvedResult,adminDetails) => {
    var logger = functionContext.logger;
  
    logger.logInfo(`saveadminLoginResponse() invoked`);
  
    var adminLoginResponse = new coreRequestModel.AdminLoginResponse();
  
    adminLoginResponse.RequestID = functionContext.requestID;
    if (functionContext.error) {
      adminLoginResponse.Error = functionContext.error;
      adminLoginResponse.Details = null;
    } else {
      adminLoginResponse.Error = null;
  
  
      adminLoginResponse.Details.AuthToken = resolvedResult.AuthToken;
      adminLoginResponse.Details.UserRef = resolvedResult.UserReference;
      adminLoginResponse.Details.UserType = resolvedResult.UserType;      
      
    }
    appLib.SendHttpResponse(functionContext, adminLoginResponse);
    logger.logInfo(
      `saveadminLoginResponse  Response :: ${JSON.stringify(adminLoginResponse)}`
    );
    logger.logInfo(`saveadminLoginResponse completed`);
  };
  
  var adminLogoutResponse = (functionContext, resolvedResult) => {
    var logger = functionContext.logger;
  
    logger.logInfo(`adminLogoutResponse() invoked`);
  
    var adminLogoutResponseModel = new coreRequestModel.AdminLogoutResponse();
  
    adminLogoutResponseModel.RequestID = functionContext.requestID;
    if (functionContext.error) {
      adminLogoutResponseModel.Error = functionContext.error;
      adminLogoutResponseModel.Details = null;
    } else {
      adminLogoutResponseModel.Error = null;
      adminLogoutResponseModel.Details.UserRef = functionContext.userRef;
    }
    appLib.SendHttpResponse(functionContext, adminLogoutResponseModel);
    logger.logInfo(
      `adminLogoutResponse  Response :: ${JSON.stringify(adminLogoutResponseModel)}`
    );
    logger.logInfo(`adminLogoutResponse completed`);
  };
  
  var passwordAuthentication =async (
    functionContext,
    requestContext,
    resolvedResult
  ) => {
    var logger = functionContext.logger;
  
    logger.logInfo(`passwordAuthentication() invoked`);
  
    const result = bcrypt.compareSync(
      `${requestContext.password}`,
      resolvedResult.Password
    );
  
    if (result) {  
      return;
    } else {
      logger.logInfo(`passwordAuthentication() :: Authentication Failed`);
  
      functionContext.error = new coreRequestModel.ErrorModel(
        constant.ErrorMessage.Invalid_User_Name_Or_Password,
        constant.ErrorCode.Invalid_User_Name_Or_Password
      );
  
      throw functionContext.error;
    }
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
      `saveMonitorLoginResponse  Response :: ${JSON.stringify(MonitorLoginResponse)}`
    );
    logger.logInfo(`saveMonitorLoginResponse completed`);
  };

  var fetchMonitorDetailsResponse = (functionContext, resolvedResult) => {
    var logger = functionContext.logger;
  
    logger.logInfo(`fetchMonitorDetailsResponse() invoked`);
  
    var MonitorDetailsResponse = new coreRequestModel.MonitorDetailsResponse();
  
    MonitorDetailsResponse.RequestID = functionContext.requestID;
    if (functionContext.error) {  
      MonitorDetailsResponse.Error = functionContext.error;
      MonitorDetailsResponse.Details = null;
    } else {
      MonitorDetailsResponse.Error = null;

      MonitorDetailsResponse.Details.MediaList = resolvedResult[1];
      MonitorDetailsResponse.Details.ScheduleDetails = resolvedResult[2] ? resolvedResult[2][0] :null;
  
    
      
    }
    appLib.SendHttpResponse(functionContext, MonitorDetailsResponse);
    logger.logInfo(
      `fetchMonitorDetailsResponse  Response :: ${JSON.stringify(MonitorDetailsResponse)}`
    );
    logger.logInfo(`fetchMonitorDetailsResponse completed`);
  };

  

