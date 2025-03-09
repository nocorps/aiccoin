import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

export class EmailService {
  static async createCampaign(campaignData) {
    try {
      // Create campaign record
      const campaign = await addDoc(collection(db, 'emailCampaigns'), {
        ...campaignData,
        status: 'queued',
        sentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return campaign.id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  static async queueEmails(campaignId, users, template) {
    try {
      // Queue emails in batches of 500
      const batches = [];
      const batchSize = 500;

      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize).map(user => ({
          campaignId,
          userId: user.id,
          email: user.email,
          subject: template.subject,
          body: this.processTemplate(template.body, user),
          status: 'pending',
          createdAt: new Date()
        }));

        const queuePromises = batch.map(email => 
          addDoc(collection(db, 'emailQueue'), email)
        );
        
        batches.push(Promise.all(queuePromises));
      }

      await Promise.all(batches);
    } catch (error) {
      console.error('Error queueing emails:', error);
      throw error;
    }
  }

  static processTemplate(template, userData) {
    return template
      .replace(/{userName}/g, userData.displayName || 'User')
      .replace(/{coinBalance}/g, userData.coinBalance?.toLocaleString() || '0')
      .replace(/{referralCode}/g, userData.referralCode || 'N/A')
      .replace(/{taskCount}/g, userData.tasksCompleted || '0');
  }

  static async getCampaignStats(campaignId) {
    try {
      const emailsQuery = query(
        collection(db, 'emailQueue'),
        where('campaignId', '==', campaignId)
      );

      const snapshot = await getDocs(emailsQuery);
      
      return snapshot.docs.reduce((stats, doc) => {
        const status = doc.data().status;
        stats[status] = (stats[status] || 0) + 1;
        return stats;
      }, {});
    } catch (error) {
      console.error('Error getting campaign stats:', error);
      throw error;
    }
  }
}