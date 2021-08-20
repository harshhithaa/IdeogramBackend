var polyline = require("polyline");
var settings = require("../common/settings").Settings;
var Razorpay = require("razorpay");
var multer = require("multer");
var constant = require("../common/constant");
var momentTimezone = require("moment-timezone");
var databaseHelper = require("../helper/databasehelper");
var fileConfiguration = require("../common/settings").FileConfiguration;

exports.createGeofenceUsingPolyline = function (polylineDataArray, logger) {
  logger.logInfo("createGeofenceUsingPolyline invoked");

  var geofenceJSONArray = [];
  var coordinateJSONArray = [];

  var polylineDataArrayLength = polylineDataArray.length;

  for (
    var polylineDataArrayCount = 0;
    polylineDataArrayCount < polylineDataArrayLength;
    polylineDataArrayCount++
  ) {
    coordinateJSONArray = [];
    var geofenceArray = polyline.decode(
      polylineDataArray[polylineDataArrayCount].Polyline
    );
    for (
      var geofenceCount = 0;
      geofenceCount < geofenceArray.length;
      geofenceCount++
    ) {
      coordinateJSONArray.push({
        latitude: geofenceArray[geofenceCount][0],
        longitude: geofenceArray[geofenceCount][1],
      });
    }

    geofenceJSONArray.push(coordinateJSONArray);
  }

  return geofenceJSONArray;
};

exports.getValue = function (requestArray, key) {
  var requestArrayLength = requestArray ? requestArray.length : 0;

  for (
    var requestArrayCount = 0;
    requestArrayCount < requestArrayLength;
    requestArrayCount++
  ) {
    if (requestArray[requestArrayCount].key === key) {
      return requestArray[requestArrayCount].value;
    }
  }
  return null;
};

exports.initializeRefund = async function (functionContext, requestContext) {
  var logger = functionContext.logger;

  logger.logInfo(`initializeRefund() invoked`);
  //Fetch key and secret from settigns;
  var instance = new Razorpay({
    key_id: settings.PAYMENT_GATEWAY_KEY,
    key_secret: settings.PAYMENT_GATEWAY_SECRET,
  });

  var paymentId = requestContext.paymentId;
  var amount = requestContext.amountToBeRefunded;
  var notes = requestContext.refundNotes;
  requestContext.currentTimestamp = momentTimezone
    .utc(new Date(), "YYYY-MM-DD HH:mm:ss.SSS")
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DD HH:mm:ss.SSS");

  if (requestContext.serviceType == constant.ServiceType.Delivery) {
    requestContext.refundStatus =
      constant.DeliveryStatus.DELIVERY_PAYMENT_REFUND_BY_RESTAURANT;
  }
  if (requestContext.serviceType == constant.ServiceType.Pickup) {
    requestContext.refundStatus =
      constant.PickupStatus.PICKUP_PAYMENT_REFUND_BY_RESTAURANT;
  }

  try {
    let refundResult = await instance.payments.refund(paymentId, {
      amount,
      notes,
    });

    let updateRefundStatusDB = await databaseHelper.updateRefundStatus(
      functionContext,
      requestContext
    );
    logger.logInfo(
      `initializeRefund() : Refund initialization executed successfully`
    );

    return requestContext;
  } catch (errInitializeRefund) {
    logger.logInfo(
      `initializeRefund() Error : ${JSON.stringify(errInitializeRefund)}`
    );

    return requestContext;
  }
};

exports.getFileUploadConfig = multer({
  storage: multer.diskStorage({
    destination: fileConfiguration.LocalStorage,
    filename: function (req, file, cb) {
      cb(null, new Date().toDateString() + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
   
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/bmp"||
      file.mimetype === "video/mp4"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid File"), false);
    }
  },
  // limits: {
  //   fileSize: parseInt(fileConfiguration.FileSize) * 1024 * 1024,
  // },
});
