// Structured email service layer for future Nodemailer integration
// Currently logs emails to console in development

const emailService = {
  /**
   * Send an email notification
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - Email HTML body
   */
  async sendEmail({ to, subject, html }) {
    // Structured for future Nodemailer integration.
    // In production, set SMTP_* env vars and optionally enable real sending.
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.FROM_EMAIL &&
      process.env.SEND_EMAILS === 'true'
    ) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({ from: process.env.FROM_EMAIL, to, subject, html });
        console.log(`📧 [EMAIL SERVICE] Sent real email to ${to}.`);
        return true;
      } catch (error) {
        console.error('❌ [EMAIL SERVICE] Failed to send email:', error);
        return false;
      }
    }

    console.log(`📧 [EMAIL SERVICE - STUB] To: ${to} | Subject: ${subject}`);
    return true;
  },

  async sendApplicationUpdate(studentEmail, jobTitle, status) {
    return this.sendEmail({
      to: studentEmail,
      subject: `Application Update: ${jobTitle}`,
      html: `<p>Your application for <strong>${jobTitle}</strong> has been updated to: <strong>${status}</strong></p>`,
    });
  },

  async sendInterviewScheduled(studentEmail, jobTitle, date, location) {
    return this.sendEmail({
      to: studentEmail,
      subject: `Interview Scheduled: ${jobTitle}`,
      html: `<p>Your interview for <strong>${jobTitle}</strong> has been scheduled on <strong>${date}</strong> at <strong>${location}</strong>.</p>`,
    });
  },

  async sendJobApproval(recruiterEmail, jobTitle, approved) {
    return this.sendEmail({
      to: recruiterEmail,
      subject: `Job Posting ${approved ? 'Approved' : 'Rejected'}: ${jobTitle}`,
      html: `<p>Your job posting <strong>${jobTitle}</strong> has been <strong>${approved ? 'approved' : 'rejected'}</strong> by the placement cell.</p>`,
    });
  },

  async sendAnnouncement(emails, title, content) {
    // In production, use bulk email or queue
    for (const email of emails) {
      await this.sendEmail({
        to: email,
        subject: `Announcement: ${title}`,
        html: `<p>${content}</p>`,
      });
    }
  },
};

module.exports = emailService;
