var momentTimezone = require("moment-timezone");

class functionContext {
  constructor(requestType, error, res, logger) {
    (this.requestType = requestType),
      (this.requestID = res.apiContext.requestID),
      (this.userRef = res.apiContext.userRef),
      (this.userType = res.apiContext.userType),
      (this.userFirebaseAuth = res.apiContext.userFirebaseAuth),
      (this.error = null),
      (this.res = res),
      (this.logger = logger),
      (this.currentTs = momentTimezone
        .utc(new Date(), "YYYY-MM-DD HH:mm:ss")
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss"));
  }
}

class apiContext {
  constructor(requestID, mailer) {
    (this.requestID = requestID),
      (this.userRef = null),
      (this.userType = null),
      (this.userID = null),
      (this.currentTs = momentTimezone
        .utc(new Date(), "YYYY-MM-DD HH:mm:ss")
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss"));
  }
}

class errorModel {
  constructor(errorMessage, errorCode, errorDescription) {
    this.ErrorCode = errorCode;
    this.ErrorMessage = errorMessage;
    this.ErrorDescription = errorDescription;
  }
}

class validateRequest {
  constructor(req) {
    (this.apiUri = req.path),
      (this.authToken = req.headers.authtoken),
      (this.authorization = req.headers.authorization),
      (this.appVersion = req.headers.appversion);
  }
}

class validateResponse {
  constructor() {
    (this.Error = null), (this.RequestID = null), (this.Details = null);
  }
}

class isAdminPresentRequest {
  constructor(req) {
    this.phone = req.body.Phone ? req.body.Phone : null;
    this.email = req.body.Email ? req.body.Email : null;
    this.loginType = req.body.LoginType ? req.body.LoginType : null;
    this.currentTimestamp = momentTimezone
      .utc(new Date(), "YYYY-MM-DD HH:mm:ss")
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss ");
  }
}

class isAdminPresentResponse {
  constructor() {
    this.Details = {
      CustomerRef: null,
      VerificationStatus: null,
      AuthToken: null,
    };
    (this.RequestID = null), (this.Error = null);
  }
}

class adminLoginRequest {
  constructor(req) {
    this.email = req.body.Email ? req.body.Email : null;
    this.password = req.body.Password ? req.body.Password : null;
  }
}

class adminLoginResponse {
  constructor() {
    (this.Error = {}),
      (this.Details = {
        AuthToken: null,
        UserRef: null,
        UserType: null,
      }),
      (this.RequestID = null);
  }
}

class adminLogoutResponse {
  constructor() {
    (this.Error = {}),
      (this.Details = {
        UserRef: null,
      }),
      (this.RequestID = null);
  }
}

class saveSystemUserRequest {
  constructor(req) {
    this.adminRef = req.body.AdminRef ? req.body.AdminRef : null;
    this.userName = req.body.UserName ? req.body.UserName : null;
    this.email = req.body.Email ? req.body.Email : null;
    this.phone = req.body.Phone ? req.body.Phone : null;
    this.password = req.body.Password ? req.body.Password : null;
    this.isActive = req.body.IsActive ? req.body.IsActive : 0;
  }
}

class saveSystemUserResponse {
  constructor() {
    (this.Error = null), (this.Details = {}), (this.RequestID = null);
  }
}

class getAdminComponentRequest {
  constructor(req) {
    this.componentType = req.query.componenttype
      ? req.query.componenttype
      : null;
  }
}

class getAdminComponentResponse {
  constructor() {
    (this.Error = null), (this.Details = {}), (this.RequestID = null);
  }
}

class getAdminComponentDetailsRequest {
  constructor(req) {
    this.componentType = req.body.ComponentType ? req.body.ComponentType : null;
    this.componentRef = req.body.ComponentRef ? req.body.ComponentRef : null;
  }
}

class getAdminComponentDetailsResponse {
  constructor() {
    (this.Error = null), (this.Details = {}), (this.RequestID = null);
  }
}

class saveMediaRequest {
  constructor(req) {
    this.userReference = req.body.UserReference ? req.body.UserReference : null;
    this.currentTs = momentTimezone
      .utc(new Date(), "YYYY-MM-DD HH:mm:ss")
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss ");
  }
}

class saveMediaResponse {
  constructor() {
    (this.Error = null),
      (this.Details = {
        Media: [],
      }),
      (this.RequestID = null);
  }
}

class saveMonitorRequest {
  constructor(req) {
    this.monitorRef = req.body.MonitorRef ? req.body.MonitorRef : null;
    this.monitorName = req.body.MonitorName ? req.body.MonitorName : null;
    this.description = req.body.Description ? req.body.Description : null;
    this.defaultPlaylistRef = req.body.DefaultPlaylistRef
      ? req.body.DefaultPlaylistRef
      : null;
    this.schedules = req.body.Schedules ? req.body.Schedules : null;
    this.isActive = req.body.IsActive ? req.body.IsActive : null;
    this.orientation = req.body.Orientation ? req.body.Orientation : null;
    this.slideTime = req.body.SlideTime ? req.body.SlideTime : null;
    this.currentTs = momentTimezone
      .utc(new Date(), "YYYY-MM-DD HH:mm:ss")
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss ");
  }
}

class saveMonitorResponse {
  constructor() {
    (this.Error = null), (this.Details = {}), (this.RequestID = null);
  }
}

class savePlaylistRequest {
  constructor(req) {
    // accept either PascalCase or lowercase keys (backwards compatible)
    this.playlistRef =
      (req.body && (req.body.PlaylistRef || req.body.playlistRef)) || null;
    this.playlistName =
      (req.body && (req.body.PlaylistName || req.body.playlistName)) || null;
    this.description =
      (req.body && (req.body.Description || req.body.description)) || null;
    this.playlist =
      (req.body && (req.body.Playlist || req.body.playlist)) || null;
    this.isActive =
      (typeof (req.body && (req.body.IsActive || req.body.isActive)) !== "undefined"
        ? (req.body.IsActive || req.body.isActive)
        : null);
    this.currentTs = momentTimezone
      .utc(new Date(), "YYYY-MM-DD HH:mm:ss")
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss ");
  }
}

class savePlaylistResponse {
  constructor() {
    (this.Error = null),
      (this.Details = {
        PlaylistReference: null,
      }),
      (this.RequestID = null);
  }
}

class saveScheduleRequest {
  constructor(req) {
    // accept both PascalCase and lowercase; normalize types
    const body = req.body || {};

    this.scheduleRef =
      (body.ScheduleRef || body.scheduleRef) !== undefined
        ? (body.ScheduleRef || body.scheduleRef)
        : null;

    this.scheduleTitle =
      (body.ScheduleTitle || body.scheduleTitle) || null;

    this.description =
      (body.Description || body.description) || null;

    // playlistRef is required by Joi (but allowed null) — ensure key exists (null if absent)
    this.playlistRef =
      (typeof (body.PlaylistRef || body.playlistRef) !== "undefined"
        ? (body.PlaylistRef || body.playlistRef)
        : null);

    this.monitorRef =
      (body.MonitorRef || body.monitorRef) || null;

    // normalize schedule object (accept Schedule or schedule and accept either casing for inner keys)
    const schedRaw = body.Schedule || body.schedule || null;
    if (schedRaw) {
      this.schedule = {
        StartTime: schedRaw.StartTime || schedRaw.startTime || null,
        EndTime: schedRaw.EndTime || schedRaw.endTime || null,
        StartDate: schedRaw.StartDate || schedRaw.startDate || null,
        EndDate: schedRaw.EndDate || schedRaw.endDate || null,
        Days: Array.isArray(schedRaw.Days)
          ? schedRaw.Days
          : Array.isArray(schedRaw.days)
          ? schedRaw.days
          : [],
      };
    } else {
      this.schedule = null;
    }

    // fixedTimePlayback: accept boolean/string/number, normalize to 0|1 (required)
    const ftpRaw =
      typeof body.FixedTimePlayback !== "undefined"
        ? body.FixedTimePlayback
        : body.fixedTimePlayback;
    if (typeof ftpRaw === "boolean") this.fixedTimePlayback = ftpRaw ? 1 : 0;
    else if (typeof ftpRaw === "number") this.fixedTimePlayback = Number(ftpRaw) ? 1 : 0;
    else if (typeof ftpRaw === "string")
      this.fixedTimePlayback = ftpRaw.toLowerCase() === "true" || ftpRaw === "yes" ? 1 : 0;
    else this.fixedTimePlayback = 0;

    const isActiveRaw =
      typeof body.IsActive !== "undefined"
        ? body.IsActive
        : body.isActive;
    this.isActive =
      typeof isActiveRaw !== "undefined" && isActiveRaw !== null
        ? (typeof isActiveRaw === "boolean" ? (isActiveRaw ? 1 : 0) : Number(isActiveRaw))
        : null;

    this.currentTs = momentTimezone
      .utc(new Date(), "YYYY-MM-DD HH:mm:ss")
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss ");
  }
}
class saveScheduleResponse {
  constructor() {
    (this.Error = null), (this.Details = {}), (this.RequestID = null);
  }
}

class deleteAdminComponentsRequest {
  constructor(req) {
    this.componentType = req.body.ComponentType ? req.body.ComponentType : null;
    this.componentList = req.body.ComponentList ? req.body.ComponentList : null;
    this.currentTs = momentTimezone
      .utc(new Date(), "YYYY-MM-DD HH:mm:ss")
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss ");
  }
}

class deleteAdminComponentsResponse {
  constructor() {
    (this.Error = null),
      (this.Details = {
        IsDeleted: false,
      }),
      (this.RequestID = null);
  }
}

class validateDeleteAdminComponentsRequest {
  constructor(req) {
    this.componentType = req.body.ComponentType ? req.body.ComponentType : null;
    this.componentList = req.body.ComponentList ? req.body.ComponentList : null;
    this.currentTs = momentTimezone
      .utc(new Date(), "YYYY-MM-DD HH:mm:ss")
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss ");
  }
}

class validateDeleteAdminComponentsResponse {
  constructor() {
    (this.Error = null), (this.Details = {}), (this.RequestID = null);
  }
}

class monitorDetailsRequest {
  constructor(req) {
    this.monitorRef = req.body.MonitorRef ? req.body.MonitorRef : null;
  }
}

class monitorDetailsResponse {
  constructor() {
    (this.Error = null), (this.Details = {}), (this.RequestID = null);
  }
}

class monitorLoginRequest {
  constructor(req) {
    this.monitorUser = req.body.MonitorUser ? req.body.MonitorUser : null;
    this.password = req.body.Password ? req.body.Password : null;
  }
}

class monitorLoginResponse {
  constructor() {
    (this.Error = null), (this.Details = {}), (this.RequestID = null);
  }
}

class updateAllMonitorsRequest {
  constructor(req) {
    this.monitorList = req.body.MonitorList ? req.body.MonitorList : null;
    this.playlistRef = req.body.PlaylistRef ? req.body.PlaylistRef : null;
  }
}

class updateAllMonitorsResponse {
  constructor() {
    (this.Error = null), (this.Details = null), (this.RequestID = null);
  }
}

class fetchMediaRequest {
  constructor(req) {
    this.mediaRef = req.query.MediaRef ? req.query.MediaRef : null;
  }
}

class fetchMediaResponse {
  constructor() {
    (this.Error = null), (this.Details = null), (this.RequestID = null);
  }
}

class updateMonitorStatusRequest {
  constructor(req) {
    this.monitorRef = req.body.MonitorRef ? req.body.MonitorRef : null;
    this.playlistRef = req.body.PlaylistRef ? req.body.PlaylistRef : null;
    this.isPlaylistRunning = (typeof req.body.IsPlaylistRunning !== 'undefined') ? req.body.IsPlaylistRunning : null;
    this.errorMessage = req.body.ErrorMessage ? req.body.ErrorMessage : null;
  }
}

class updateMonitorStatusResponse {
  constructor() {
    this.Error = null;
    this.Details = null;
    this.RequestID = null;
  }
}

class fetchAdminMonitorsStatusRequest {
  constructor(req) {
    this.adminRef = req.query.AdminRef ? req.query.AdminRef : (req.body && req.body.AdminRef ? req.body.AdminRef : null);
  }
}

class fetchAdminMonitorsStatusResponse {
  constructor() {
    this.Error = null;
    this.Details = null;
    this.RequestID = null;
  }
}

// export
module.exports.UpdateMonitorStatusRequest = updateMonitorStatusRequest;
module.exports.UpdateMonitorStatusResponse = updateMonitorStatusResponse;
module.exports.FetchAdminMonitorsStatusRequest = fetchAdminMonitorsStatusRequest;
module.exports.FetchAdminMonitorsStatusResponse = fetchAdminMonitorsStatusResponse;

module.exports.ErrorModel = errorModel;
module.exports.AdminLoginRequest = adminLoginRequest;
module.exports.AdminLoginResponse = adminLoginResponse;
module.exports.ValidateRequest = validateRequest;
module.exports.ValidateResponse = validateResponse;
module.exports.FunctionContext = functionContext;
module.exports.ApiContext = apiContext;
module.exports.IsAdminPresentRequest = isAdminPresentRequest;
module.exports.IsAdminPresentResponse = isAdminPresentResponse;
module.exports.SaveSystemUserRequest = saveSystemUserRequest;
module.exports.SaveSystemUserResponse = saveSystemUserResponse;
module.exports.SaveMediaRequest = saveMediaRequest;
module.exports.SaveMediaResponse = saveMediaResponse;
module.exports.GetAdminComponentRequest = getAdminComponentRequest;
module.exports.GetAdminComponentResponse = getAdminComponentResponse;
module.exports.GetAdminComponentDetailsRequest =
  getAdminComponentDetailsRequest;
module.exports.GetAdminComponentDetailsResponse =
  getAdminComponentDetailsResponse;
module.exports.SavePlaylistRequest = savePlaylistRequest;
module.exports.SavePlaylistResponse = savePlaylistResponse;
module.exports.SaveScheduleRequest = saveScheduleRequest;
module.exports.SaveScheduleResponse = saveScheduleResponse;
module.exports.SaveMonitorRequest = saveMonitorRequest;
module.exports.SaveMonitorResponse = saveMonitorResponse;
module.exports.DeleteAdminComponentsRequest = deleteAdminComponentsRequest;
module.exports.DeleteAdminComponentsResponse = deleteAdminComponentsResponse;
module.exports.ValidateDeleteAdminComponentsRequest =
  validateDeleteAdminComponentsRequest;
module.exports.ValidateDeleteAdminComponentsResponse =
  validateDeleteAdminComponentsResponse;
module.exports.AdminLogoutResponse = adminLogoutResponse;
module.exports.MonitorDetailsRequest = monitorDetailsRequest;
module.exports.MonitorDetailsResponse = monitorDetailsResponse;
module.exports.MonitorLoginRequest = monitorLoginRequest;
module.exports.MonitorLoginResponse = monitorLoginResponse;
module.exports.UpdateAllMonitorsRequest = updateAllMonitorsRequest;
module.exports.UpdateAllMonitorsResponse = updateAllMonitorsResponse;
module.exports.FetchMediaRequest = fetchMediaRequest;
module.exports.FetchMediaResponse = fetchMediaResponse;
