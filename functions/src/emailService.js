const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize admin
admin.initializeApp();

// Configure mail transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password
  }
});

// Process email queue
exports.processEmailQueue = functions.firestore
  .document('emailQueue/{emailId}')
  .onCreate(async (snap, context) => {
    const emailData = snap.data();
    
    try {
      // Get user data
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(emailData.userId)
        .get();
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();

      // Send email
      await transporter.sendMail({
        from: '"AICCoin Team" <noreply@aiccoin.com>',
        to: userData.email,
        subject: emailData.subject,
        html: emailData.body,
        text: emailData.body.replace(/<[^>]*>/g, '')
      });

      // Update email status
      await snap.ref.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update campaign stats
      await admin.firestore()
        .collection('emailCampaigns')
        .doc(emailData.campaignId)
        .update({
          sentCount: admin.firestore.FieldValue.increment(1)
        });

    } catch (error) {
      console.error('Error sending email:', error);
      
      // Update email status with error
      await snap.ref.update({
        status: 'error',
        error: error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });