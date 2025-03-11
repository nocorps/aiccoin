import nodemailer from 'nodemailer';

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: import.meta.env.VITE_GMAIL_USER,
        pass: import.meta.env.VITE_GMAIL_APP_PASSWORD
      }
    });
  }

  async sendMail({ to, subject, html }) {
    try {
      const mailOptions = {
        from: `"AICCoin" <${import.meta.env.VITE_GMAIL_USER}>`,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendBulkMail(recipients, batchSize = 50) {
    const results = [];
    const batches = this.splitIntoBatches(recipients, batchSize);

    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(recipient => this.sendMail(recipient))
      );

      results.push(...batchResults.map((result, index) => ({
        success: result.status === 'fulfilled',
        email: batch[index].to,
        messageId: result.status === 'fulfilled' ? result.value.messageId : null,
        error: result.status === 'rejected' ? result.reason.message : null
      })));

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  splitIntoBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
}

export const mailService = new MailService();