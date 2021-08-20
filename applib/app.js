var logger = require("./logger").LoggerModel;
var mailer = require("./nodemail").MailModel;
var constant = require("./constant");
var uuid = require("node-uuid");
var amqp = require("amqplib/callback_api");
var request = require("request");

function UUID() {}

UUID.prototype.GetTimeBasedID = () => {
  return uuid.v1({
    node: [
      0x01,
      0x08,
      0x12,
      0x18,
      0x23,
      0x30,
      0x38,
      0x45,
      0x50,
      0x55,
      0x62,
      0x67,
      0x89,
      0xab,
    ],
    clockseq: 0x1234,
  });
};

exports.SendHttpResponse = async function (functionContext, response) {
  
  var logger = functionContext.logger;

  logger.logInfo(`SendHttpResponse() invoked`);
  
  let httpResponseType = constant.ErrorCode.Success;
  functionContext.res.writeHead(httpResponseType, {
    "Content-Type": "application/json",
  });
  var apiContext = functionContext.res.apiContext;
  if(response.Error && response.Error.ErrorDescription )
  {
    try
    {
      await apiContext.mailHelper.sendMail(functionContext,functionContext.requestID,apiContext.req.originalUrl,apiContext.environment,functionContext.error)
    }
    catch(errMailHelper)
    {
      logger.logInfo(`SendHttpResponse() :: errMailHelper :: ${JSON.stringify(errMailHelper)}`);
    }
    delete response.Error.ErrorDescription;
  }

  
  functionContext.responseText = JSON.stringify(response);
  functionContext.res.end(functionContext.responseText);

  

  try{
    await apiContext.databaseHelper.saveRequestLogsDB(functionContext,apiContext,response);
  }
  catch(err)
    {
      logger.logInfo(`SendHttpResponse() Error :${JSON.stringify(err)}`);

    }
};

exports.GetArrayValue = function (array, value, field) {
  return array.find(function (statusArray) {
    return statusArray[field] === value;
  });
};

exports.FilterArray = function (array, value, field) {
  return array.filter(function (item) {
    return item[field] === value;
  });
};

exports.PublishOrderToQueueLib = async function (
  functionContext,
  queueMsg,
  queuePath,
  queueName
) {
  var logger = functionContext.logger;
  logger.logInfo(`PublishOrderToQueueLib Invoked()`);

  try {
    return new Promise(function (resolve, reject) {
      amqp.connect(queuePath, function (error, connection) {
        if (error) {
          logger.logInfo(
            `PublishOrderToQueueLib() :: Error :: ${JSON.stringify(error)}`
          );
          reject(error);
        }
        connection.createChannel(function (error, channel) {
          if (error) {
            logger.logInfo(
              `PublishOrderToQueueLib() :: Error :: ${JSON.stringify(error)}`
            );
            reject(error);
          }

          channel.assertQueue(queueName, {
            durable: false,
          });
          channel.sendToQueue(queueName, new Buffer(JSON.stringify(queueMsg)), {
            persistent: true,
            durable: false,
          });

          logger.logInfo(
            `PublishOrderToQueueLib() :: Message Published to Queue :: Queue name : ${queueName} , :: Message :${JSON.stringify(
              queueMsg
            )}`
          );
          resolve({ PublishToQueue: true });
        });
        setTimeout(function () {
          connection.close();
        }, 500);
      });
    });
  } catch (err) {
    logger.logInfo(
      `PublishOrderToQueueLib() :: Error :: ${JSON.stringify(err)}`
    );
    reject(err);
  }
};

module.exports.fetchDBSettings = async function (
  logger,
  settings,
  pushNotificationSettings,
  databaseModule
) {
  try {
    logger.logInfo("fetchDBSettings()");
    let rows = await databaseModule.knex.raw(`CALL usp_get_app_settings()`);
    var dbSettingsValue = rows[0][0];
    settings.APP_KEY = getValue(dbSettingsValue, "APP_KEY");
    settings.APP_SECRET = getValue(dbSettingsValue, "APP_SECRET");
    pushNotificationSettings.Rider_Delivery_Request_Msg = getValue(
      dbSettingsValue,
      "Rider_Delivery_Request_Msg"
    );
    pushNotificationSettings.Rider_Delivery_Request_Title = getValue(
      dbSettingsValue,
      "Rider_Delivery_Request_Title"
    );
    pushNotificationSettings.Customer_Delivery_On_Accept_By_Restaurant_Msg = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Accept_By_Restaurant_Msg"
    );
    pushNotificationSettings.Customer_Delivery_On_Accept_By_Restaurant_Title = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Accept_By_Restaurant_Title"
    );

    pushNotificationSettings.Rider_Delivery_On_Reject_By_Restaurant_Msg = getValue(
      dbSettingsValue,
      "Rider_Delivery_On_Reject_By_Restaurant_Msg"
    );
    pushNotificationSettings.Rider_Delivery_On_Reject_By_Restaurant_Title = getValue(
      dbSettingsValue,
      "Rider_Delivery_On_Reject_By_Restaurant_Title"
    );
    pushNotificationSettings.Customer_Delivery_On_Reject_By_Restaurant_Msg = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Reject_By_Restaurant_Msg"
    );
    pushNotificationSettings.Customer_Delivery_On_Reject_By_Restaurant_Title = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Reject_By_Restaurant_Title"
    );

    pushNotificationSettings.Restaurant_Delivery_Request_Msg = getValue(
      dbSettingsValue,
      "Restaurant_Delivery_Request_Msg"
    );
    pushNotificationSettings.Restaurant_Delivery_Request_Title = getValue(
      dbSettingsValue,
      "Restaurant_Delivery_Request_Title"
    );

    pushNotificationSettings.Restaurant_Pickup_Request_Msg = getValue(
      dbSettingsValue,
      "Restaurant_Pickup_Request_Msg"
    );
    pushNotificationSettings.Restaurant_Pickup_Request_Title = getValue(
      dbSettingsValue,
      "Restaurant_Pickup_Request_Title"
    );

    pushNotificationSettings.Customer_Request_Not_Fulfilled_Title = getValue(
      dbSettingsValue,
      "Customer_Request_Not_Fulfilled_Title"
    );
    pushNotificationSettings.Customer_Request_Not_Fulfilled_Msg = getValue(
      dbSettingsValue,
      "Customer_Request_Not_Fulfilled_Msg"
    );

    pushNotificationSettings.Restaurant_No_Riders_Available_Msg = getValue(
      dbSettingsValue,
      "Restaurant_No_Riders_Available_Msg"
    );
    pushNotificationSettings.Restaurant_No_Riders_Available_Title = getValue(
      dbSettingsValue,
      "Restaurant_No_Riders_Available_Title"
    );
    pushNotificationSettings.Customer_Delivery_On_Accept_By_Rider_Msg = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Accept_By_Rider_Msg"
    );
    pushNotificationSettings.Customer_Delivery_On_Accept_By_Rider_Title = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Accept_By_Rider_Title"
    );

    pushNotificationSettings.Customer_Delivery_On_Rider_Complete_Order_Title = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Rider_Complete_Order_Title"
    );
    pushNotificationSettings.Customer_Delivery_On_Rider_Complete_Order_Msg = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Rider_Complete_Order_Msg"
    );
    
    pushNotificationSettings.Customer_Delivery_On_Rider_Pickup_Order_Title = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Rider_Pickup_Order_Title"
    );
    pushNotificationSettings.Customer_Delivery_On_Rider_Pickup_Order_Msg = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Rider_Pickup_Order_Msg"
    );

     pushNotificationSettings.Customer_Delivery_On_Restaurant_Prepared_Order_Msg = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Restaurant_Prepared_Order_Msg"
    );
    pushNotificationSettings.Customer_Delivery_On_Restaurant_Prepared_Order_Title = getValue(
      dbSettingsValue,
      "Customer_Delivery_On_Restaurant_Prepared_Order_Title"
    );

 pushNotificationSettings.Rider_Delivery_On_Restaurant_Prepared_Order_Title = getValue(
  dbSettingsValue,
  "Rider_Delivery_On_Restaurant_Prepared_Order_Title"
);
pushNotificationSettings.Rider_Delivery_On_Restaurant_Prepared_Order_Msg = getValue(
  dbSettingsValue,
  "Rider_Delivery_On_Restaurant_Prepared_Order_Msg"
);

pushNotificationSettings.Customer_Pickup_On_Accept_By_Restaurant_Title = getValue(
  dbSettingsValue,
  "Customer_Pickup_On_Accept_By_Restaurant_Title"
);

pushNotificationSettings.Customer_Pickup_On_Accept_By_Restaurant_Msg = getValue(
  dbSettingsValue,
  "Customer_Pickup_On_Accept_By_Restaurant_Msg"
);

pushNotificationSettings.Customer_Pickup_On_Cancel_By_Restaurant_Title = getValue(
  dbSettingsValue,
  "Customer_Pickup_On_Cancel_By_Restaurant_Title"
);

pushNotificationSettings.Customer_Pickup_On_Cancel_By_Restaurant_Msg = getValue(
  dbSettingsValue,
  "Customer_Pickup_On_Cancel_By_Restaurant_Msg"
);

pushNotificationSettings.Customer_Pickup_On_Pickup_Prepared_By_Restaurant_Title = getValue(
  dbSettingsValue,
  "Customer_Pickup_On_Pickup_Prepared_By_Restaurant_Title"
);

pushNotificationSettings.Customer_Pickup_On_Pickup_Prepared_By_Restaurant_Msg = getValue(
  dbSettingsValue,
  "Customer_Pickup_On_Pickup_Prepared_By_Restaurant_Msg"
);

pushNotificationSettings.Customer_Pickup_On_Complete_By_Restaurant_Title = getValue(
  dbSettingsValue,
  "Customer_Pickup_On_Complete_By_Restaurant_Title"
);

pushNotificationSettings.Customer_Pickup_On_Complete_By_Restaurant_Msg = getValue(
  dbSettingsValue,
  "Customer_Pickup_On_Complete_By_Restaurant_Msg"
);

//
pushNotificationSettings.Customer_Push_Notification_Icon = getValue(
  dbSettingsValue,
  "Customer_Push_Notification_Icon"
);

pushNotificationSettings.Restaurant_Push_Notification_Icon = getValue(
  dbSettingsValue,
  "Restaurant_Push_Notification_Icon"
);

pushNotificationSettings.Rider_Push_Notification_Icon = getValue(
  dbSettingsValue,
  "Rider_Push_Notification_Icon"
);

settings.Delivery_Complete_Amount_To_Wallet_Conv_Percentage = parseInt(getValue(
  dbSettingsValue,
  "Delivery_Complete_Amount_To_Wallet_Conv_Percentage"
));

settings.Pickup_Complete_Amount_To_Wallet_Conv_Percentage = parseInt(getValue(
  dbSettingsValue,
  "Pickup_Complete_Amount_To_Wallet_Conv_Percentage"
));

settings.Delivery_Wallet_Bonus_Per_X_Rupees = parseInt(getValue(
  dbSettingsValue,
  "Delivery_Wallet_Bonus_Per_X_Rupees"
));

settings.Pickup_Wallet_Bonus_Per_X_Rupees = parseInt( getValue(
  dbSettingsValue,
  "Pickup_Wallet_Bonus_Per_X_Rupees"
));

pushNotificationSettings.Customer_Post_Complete_Delivery_Cancel_By_Restaurant_Title = getValue(
  dbSettingsValue,
  "Customer_Post_Complete_Delivery_Cancel_By_Restaurant_Title"
);
pushNotificationSettings.Customer_Post_Complete_Delivery_Cancel_By_Restaurant_Msg = getValue(
  dbSettingsValue,
  "Customer_Post_Complete_Delivery_Cancel_By_Restaurant_Msg"
);
pushNotificationSettings.Customer_Post_Complete_Pickup_Cancel_By_Restaurant_Title = getValue(
  dbSettingsValue,
  "Customer_Post_Complete_Pickup_Cancel_By_Restaurant_Title"
);
pushNotificationSettings.Customer_Post_Complete_Pickup_Cancel_By_Restaurant_Msg = getValue(
  dbSettingsValue,
  "Customer_Post_Complete_Pickup_Cancel_By_Restaurant_Msg"
);

pushNotificationSettings.Restaurant_Initiate_Refund_Title = getValue(
  dbSettingsValue,
  "Restaurant_Initiate_Refund_Title"
);

pushNotificationSettings.Restaurant_Initiate_Refund_Msg = getValue(
  dbSettingsValue,
  "Restaurant_Initiate_Refund_Msg"
);

pushNotificationSettings.Customer_On_New_Driver_Assigned_Title = getValue(
  dbSettingsValue,
  "Customer_On_New_Driver_Assigned_Title"
);
pushNotificationSettings.Customer_On_New_Driver_Assigned_Msg = getValue(
  dbSettingsValue,
  "Customer_On_New_Driver_Assigned_Msg"
);

pushNotificationSettings.Customer_On_Replaced_Driver_Title = getValue(
  dbSettingsValue,
  "Customer_On_Replaced_Driver_Title"
);
pushNotificationSettings.Customer_On_Replaced_Driver_Msg = getValue(
  dbSettingsValue,
  "Customer_On_Replaced_Driver_Msg"
);
pushNotificationSettings.New_Rider_On_Assigned_Delivery_Title = getValue(
  dbSettingsValue,
  "New_Rider_On_Assigned_Delivery_Title"
);
pushNotificationSettings.New_Rider_On_Assigned_Delivery_Msg = getValue(
  dbSettingsValue,
  "New_Rider_On_Assigned_Delivery_Msg"
);

pushNotificationSettings.Prev_Rider_On_Delivery_Unassinged_Delivery_Title = getValue(
  dbSettingsValue,
  "Prev_Rider_On_Delivery_Unassinged_Delivery_Title"
);
pushNotificationSettings.Prev_Rider_On_Delivery_Unassinged_Delivery_Msg = getValue(
  dbSettingsValue,
  "Prev_Rider_On_Delivery_Unassinged_Delivery_Msg"
);

pushNotificationSettings.Restaurant_New_Booking_Request_Msg = getValue(
  dbSettingsValue,
  "Restaurant_New_Booking_Request_Msg"
);
pushNotificationSettings.Restaurant_New_Booking_Request_Title = getValue(
  dbSettingsValue,
  "Restaurant_New_Booking_Request_Title"
);

pushNotificationSettings.Customer_Booking_Request_Not_Fulfilled_Title = getValue(
  dbSettingsValue,
  "Customer_Booking_Request_Not_Fulfilled_Title"
);
pushNotificationSettings.Customer_Booking_Request_Not_Fulfilled_Msg = getValue(
  dbSettingsValue,
  "Customer_Booking_Request_Not_Fulfilled_Msg"
);
settings.Customer_On_Booking_Placed_App_Msg = getValue(
  dbSettingsValue,
  "Customer_On_Booking_Placed_App_Msg"
);
settings.Customer_Booking_On_Accepted_App_Msg = getValue(
  dbSettingsValue,
  "Customer_Booking_On_Accepted_App_Msg"
);
settings.Customer_Booking_On_Visit_To_Restaurant_App_Msg = getValue(
  dbSettingsValue,
  "Customer_Booking_On_Visit_To_Restaurant_App_Msg"
);
settings.Customer_Booking_On_Complete_App_Msg = getValue(
  dbSettingsValue,
  "Customer_Booking_On_Complete_App_Msg"
);
settings.Customer_Booking_On_Cancelled_App_Msg = getValue(
  dbSettingsValue,
  "Customer_Booking_On_Cancelled_App_Msg"
);
settings.Customer_Booking_On_Req_NotFulfilled_App_Msg = getValue(
  dbSettingsValue,
  "Customer_Booking_On_Req_NotFulfilled_App_Msg"
);
pushNotificationSettings.Customer_Booking_Request_Accepted_Title = getValue(
  dbSettingsValue,
  "Customer_Booking_Request_Accepted_Title"
);
pushNotificationSettings.Customer_Booking_Request_Accepted_Msg = getValue(
  dbSettingsValue,
  "Customer_Booking_Request_Accepted_Msg"
);

pushNotificationSettings.Customer_Booking_Visit_Restaurant_Title = getValue(
  dbSettingsValue,
  "Customer_Booking_Visit_Restaurant_Title"
);
pushNotificationSettings.Customer_Booking_Visit_Restaurant_Msg = getValue(
  dbSettingsValue,
  "Customer_Booking_Visit_Restaurant_Msg"
);

pushNotificationSettings.Customer_Booking_Complete_Title = getValue(
  dbSettingsValue,
  "Customer_Booking_Complete_Title"
);
pushNotificationSettings.Customer_Booking_Complete_Msg = getValue(
  dbSettingsValue,
  "Customer_Booking_Complete_Msg"
);

pushNotificationSettings.Customer_Booking_Rejected_Title = getValue(
  dbSettingsValue,
  "Customer_Booking_Rejected_Title"
);
pushNotificationSettings.Customer_Booking_Rejected_Msg = getValue(
  dbSettingsValue,
  "Customer_Booking_Rejected_Msg"
);
  logger.logInfo(
      "fetchDBSettings() :: Primary Database settings fetched successfully"
    );
    return;
  } catch (errGetSettingsFromDB) {
    logger.logInfo(
      `fetchDBSettings() :: ${JSON.stringify(errGetSettingsFromDB)}`
    );
    throw errGetSettingsFromDB;
  }
};

module.exports.SendPushNotification = async function (
  logger,
  pushNotificationData,
  userInfo,
  cred,
  pnType = null
) {
  return new Promise(function (resolve, reject) {
    logger.logInfo(
      `SendPushNotification() Invoked for Delivery Reference : ${pushNotificationData.deliveryRef}`
    );
    try {
      var requestJSON = {
        to: userInfo.Token ? userInfo.Token : "",
        notification: {
          body: pushNotificationData.pushNotificationMsg,
          title: pushNotificationData.pushNotificationTitle
        },
        data: {
          DeliveryRef: pushNotificationData.deliveryRef,
          ServiceType: constant.ServiceType.Delivery,
          PushnotificationType : pnType
        },
      };

      var headerJSON = {
        authorization: "key=" + cred,
      };

      var options = {
        url: "https://fcm.googleapis.com/fcm/send", //firebase android send push notification
        method: "POST",
        headers: headerJSON,
        json: requestJSON,
      };

      function fnPushNotifyUser(error, response, firebasePushNotificationData) {
        try {
          logger.logInfo("Error : " + JSON.stringify(error) + ", response : " + JSON.stringify(response) + ", firebasePushNotificationData : " + JSON.stringify(firebasePushNotificationData ));

          if (!error && response.statusCode == constant.ErrorCode.Success) {
            logger.logInfo(
              "Push Notification sent " +
                userInfo.Token +
                " for user device with Payload : " +
                JSON.stringify(pushNotificationData)
            );
            resolve(response);
          } else {
            logger.logInfo(
              "error while sending push notification on " +
                userInfo.Token +
                " :: Error: " +
                JSON.stringify(error)
            );

            resolve(constant.ErrorCode.ApplicationError);
          }
        } catch (e) {
          myLogger.logInfo(
            "(try-catch) error while sending push notification on " +
              userInfo.Token +
              " :: Error: " +
              e
          );

          resolve(constant.ErrorCode.ApplicationError);
        }
      }

      request(options, fnPushNotifyUser);
    } catch (err) {
      logger.logInfo(
        `Global Catch-err :: Error String :: ${Json.stringify(err)}`
      );
      resolve(constant.ErrorCode.ApplicationError);
    }
  });
};

function getValue(requestArray, key) {
  var requestArrayLength = requestArray ? requestArray.length : 0;

  for (
    var requestArrayCount = 0;
    requestArrayCount < requestArrayLength;
    requestArrayCount++
  ) {
    if (
      requestArray[requestArrayCount].key.toLowerCase() === key.toLowerCase()
    ) {
      return requestArray[requestArrayCount].value;
    }
  }
  return null;
}

exports.sortArray = function (array, field, sortBy) {
  if (sortBy.toLowerCase() === "ascending") {
    array.sort(function (a, b) {
      return a[field] - b[field];
    });
  } else {
    array.sort(function (a, b) {
      return b[field] - a[field];
    });
  }
};

module.exports.SendPickupPushNotification = async function (
  logger,
  pushNotificationData,
  userInfo,
  cred,
  pnType = null
) {
  return new Promise(function (resolve, reject) {
    logger.logInfo(
      `SendPickupPushNotification() Invoked for Pickup Reference : ${pushNotificationData.pickupRef}`
    );
    try {
      var requestJSON = {
        to: userInfo.Token ? userInfo.Token : "",
        notification: {
          body: pushNotificationData.pushNotificationMsg,
          title: pushNotificationData.pushNotificationTitle
        },
        data: {
          PickupRef: pushNotificationData.pickupRef,
          ServiceType: constant.ServiceType.Pickup,
          PushnotificationType : pnType
        },
      };

      var headerJSON = {
        authorization: "key=" + cred,
      };

      var options = {
        url: "https://fcm.googleapis.com/fcm/send", //firebase android send push notification
        method: "POST",
        headers: headerJSON,
        json: requestJSON,
      };

      function fnPushNotifyUser(error, response, firebasePushNotificationData) {
        try {
          if (!error && response.statusCode == constant.ErrorCode.Success) {
            logger.logInfo(
              "Push Notification sent " +
                userInfo.Token +
                " for user device with Payload : " +
                JSON.stringify(pushNotificationData)
            );
            resolve(response);
          } else {
            logger.logInfo(
              "error while sending push notification on " +
                userInfo.Token +
                " :: Error: " +
                JSON.stringify(error)
            );

            resolve(constant.ErrorCode.ApplicationError);
          }
        } catch (e) {
          myLogger.logInfo(
            "(try-catch) error while sending push notification on " +
              userInfo.Token +
              " :: Error: " +
              e
          );

          resolve(constant.ErrorCode.ApplicationError);
        }
      }

      request(options, fnPushNotifyUser);
    } catch (err) {
      logger.logInfo(
        `Global Catch-err :: Error String :: ${Json.stringify(err)}`
      );
      resolve(constant.ErrorCode.ApplicationError);
    }
  });
};

module.exports.SendBookingPushNotification = async function (
  logger,
  pushNotificationData,
  userInfo,
  cred,
  pnType = null
) {
  return new Promise(function (resolve, reject) {
    logger.logInfo(
      `SendPushNotification() Invoked for Booking Reference : ${pushNotificationData.bookingRef}`
    );
    try {
      var requestJSON = {
        to: userInfo.Token ? userInfo.Token : "",
        notification: {
          body: pushNotificationData.pushNotificationMsg,
          title: pushNotificationData.pushNotificationTitle
        },
        data: {
          BookingRef: pushNotificationData.bookingRef,
          ServiceType: constant.ServiceType.BookATable,
          PushnotificationType : pnType
        },
      };

      var headerJSON = {
        authorization: "key=" + cred,
      };

      var options = {
        url: "https://fcm.googleapis.com/fcm/send", //firebase android send push notification
        method: "POST",
        headers: headerJSON,
        json: requestJSON,
      };

      function fnPushNotifyUser(error, response, firebasePushNotificationData) {
        try {
          logger.logInfo("Error : " + JSON.stringify(error) + ", response : " + JSON.stringify(response) + ", firebasePushNotificationData : " + JSON.stringify(firebasePushNotificationData ));

          if (!error && response.statusCode == constant.ErrorCode.Success) {
            logger.logInfo(
              "Push Notification sent " +
                userInfo.Token +
                " for user device with Payload : " +
                JSON.stringify(pushNotificationData)
            );
            resolve(response);
          } else {
            logger.logInfo(
              "error while sending push notification on " +
                userInfo.Token +
                " :: Error: " +
                JSON.stringify(error)
            );

            resolve(constant.ErrorCode.ApplicationError);
          }
        } catch (e) {
          myLogger.logInfo(
            "(try-catch) error while sending push notification on " +
              userInfo.Token +
              " :: Error: " +
              e
          );

          resolve(constant.ErrorCode.ApplicationError);
        }
      }

      request(options, fnPushNotifyUser);
    } catch (err) {
      logger.logInfo(
        `Global Catch-err :: Error String :: ${Json.stringify(err)}`
      );
      resolve(constant.ErrorCode.ApplicationError);
    }
  });
};

module.exports.Logger = logger;
module.exports.Mailer = mailer;
module.exports.UUID = UUID;
