const Notification = require("../models/Notification");

module.exports = function createNotification({ recipient, recipientModel, title, body, type, link = "", opportunityId = null, applicationId = null }) {
  return Notification.create({ recipient, recipientModel, title, body, type, link, opportunityId, applicationId });
};