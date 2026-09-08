const Notification = require("../models/Notification");

module.exports = function createNotification({
  recipient,
  recipientModel,
  actor = null,
  actorModel = null,
  title,
  body,
  type,
  link = "",
  postId = null,
  opportunityId = null,
  applicationId = null,
}) {
  return Notification.create({
    recipient,
    recipientModel,
    actor,
    actorModel,
    title,
    body,
    type,
    link,
    postId,
    opportunityId,
    applicationId,
  });
};