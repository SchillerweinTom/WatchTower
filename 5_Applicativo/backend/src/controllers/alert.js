const nodemailer = require("nodemailer");
const { fetchLdapUsers } = require("../controllers/ldap");
const logger = require("../utils/apiLogger");
const prisma = require("../config/db");

async function createNotifications(type, value, timestamp) {
    try {
      const ldapUsers = await fetchLdapUsers(["CN=Docenti", "CN=Sistemisti"]);

      for (const user of ldapUsers) {
        let settings = await prisma.alert_setting.findUnique({
          where: { user: user.username[0] },
        });
  
        if (!settings) {
          settings = {
            temp_limit_max: 30,
            temp_limit_min: 18,
            hum_limit_max: 60,
            hum_limit_min: 30,
            co2_limit_max: 1000,
          };
        }
  
        const { severity, message, description } = getSeverityAndMessage(
          { type, value },
          settings
        );
  
        const lastAlert = await prisma.alert.findFirst({
          where: { user: user.username[0], type },
          orderBy: { timestamp: "desc" },
        });
  
        if (severity === "LOW") {
          if (!lastAlert || (lastAlert.severity !== "HIGH" && lastAlert.severity !== "MEDIUM")) {
            continue;
          }
        }
  
        await prisma.alert.create({
          data: {
            type,
            value,
            timestamp: new Date(timestamp),
            severity,
            message,
            description,
            user: user.username[0],
            status: "ACTIVE",
          },
        });
  
        logger.info(`Notification created for user ${user.username[0]}: ${message}`);
  
        if (severity === "HIGH") {
          if (user.email) {
            await sendAlertEmail(user.email[0], message, description);
          } else {
            logger.warn( `No email to send notification for user ${user.username[0]}: ${message}`);
          }
        }
      }
    } catch (error) {
      logger.error(`Error creating notifications: ${error.message}`);
    }
  }

async function sendAlertEmail(email, message, description) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Watch Tower Server Room Notification`,
      text: `${description}`,
      html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #d32f2f;">🚨 Alert Notification</h2>
              <p style="font-size: 16px; line-height: 1.5;">
              <strong>${message}</strong>
              </p>
              <p style="font-size: 14px; line-height: 1.5;">
              ${description}
              </p>
              <p style="font-size: 14px; color: #555;">
              Please take appropriate action if necessary.
              </p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; color: #777;">
              This is an automated message. Please do not reply to this email.s
              </p>
          </div>
          `,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Notification email sent to ${email}`);
  } catch (error) {
    logger.error(`Error sending email to ${email}: ${error}`);
  }
}

function getSeverityAndMessage(notification, user) {
  const type = notification.type.toLowerCase();

  if (type.includes("access")) {
    return {
      severity: "HIGH",
      message: "Unauthorized access attempt",
      description:
        "Someone entered the server room but didn't authenticate himselves.",
    };
  } else {
    const value = notification.value;

    if (type.includes("temperature") && value !== null) {
      if (value > user.temp_limit_max * 1.1) {
        return {
          severity: "HIGH",
          message: `Temperature at ${value}°C`,
          description: "The temperature is significantly higher than expected.",
        };
      } else if (value < user.temp_limit_min * 0.9) {
        return {
          severity: "HIGH",
          message: `Temperature at ${value}°C`,
          description: "The temperature is significantly lower than expected.",
        };
      } else if (value < user.temp_limit_max && value > user.temp_limit_min) {
        return {
          severity: "LOW",
          message: "Temperature normalized",
          description: "The temperature returned to normal conditions.",
        };
      }
      if (value > user.temp_limit_max) {
        return {
          severity: "MEDIUM",
          message: `Temperature at ${value}°C`,
          description: "The temperature is slightly higher than expected.",
        };
      } else {
        return {
          severity: "MEDIUM",
          message: `Temperature at ${value}°C`,
          description: "The temperature is slightly lower than expected.",
        };
      }
    }
    if (type.includes("humidity") && value !== null) {
      if (value > user.hum_limit_max * 1.1) {
        return {
          severity: "HIGH",
          message: `Humidity at ${value}%`,
          description: "The humidity is significantly higher than expected.",
        };
      } else if (value < user.hum_limit_min * 0.9) {
        return {
          severity: "HIGH",
          message: `Humidity at ${value}%`,
          description: "The humidity is significantly lower than expected.",
        };
      } else if (value < user.hum_limit_max && value > user.hum_limit_min) {
        return {
          severity: "LOW",
          message: "Humidity normalized",
          description: "The humidity returned to normal conditions.",
        };
      }
      if (value > user.hum_limit_max) {
        return {
          severity: "MEDIUM",
          message: `Humidity at ${value}%`,
          description: "The humidity is slightly higher than expected.",
        };
      } else {
        return {
          severity: "MEDIUM",
          message: `Humidity at ${value}%`,
          description: "The humidity is slightly lower than expected.",
        };
      }
    }
    if (type.includes("co2") && value !== null) {
      if (value > user.co2_limit_max * 1.1) {
        return {
          severity: "HIGH",
          message: `CO2 at ${value}ppm`,
          description: "The CO2 is significantly higher than expected.",
        };
      } else if (value < user.co2_limit_max && value > 0) {
        return {
          severity: "LOW",
          message: "CO2 normalized",
          description: "The CO2 returned to normal conditions.",
        };
      }
      return {
        severity: "MEDIUM",
        message: `CO2 at ${value}ppm`,
        description: "The CO2 is slightly higher than expected.",
      };
    }
  }
  return {
    severity: "MEDIUM",
    message: `Other Alert`,
    description: "No other information avaiable.",
  };
}

module.exports = { createNotifications };
