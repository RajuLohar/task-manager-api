const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "raju.lohar@thinkitive.com",
    subject: "You have joined us!",
    text: `Welcome ${name} to the test`,
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "raju.lohar@thinkitive.com",
    subject: "Are you goin?",
    text: `Bye bye ${name} from the test`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
