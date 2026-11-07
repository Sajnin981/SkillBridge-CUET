const Admin = require("../models/Admin");
const createNotification = require("./createNotification");

module.exports = async function notifyAdminsOfEvent({ title, body, link, actor, actorModel }) {
  let admins;
  try {
    admins = await Admin.find().select("_id").lean();
  } catch (err) {
    console.error("Could not load Admin accounts for notifications:", err);
    return;
  }

  const results = await Promise.allSettled(
    admins.map((admin) => createNotification({
      recipient: admin._id,
      recipientModel: "Admin",
      actor,
      actorModel,
      title,
      body,
      type: "system",
      link,
    }))
  );
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("Could not create an Admin notification:", result.reason);
    }
  });
};
