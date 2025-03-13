import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export const useTicketStore = {
  async getTicketData(userId) {
    try {
      const ticketRef = doc(db, 'tickets', userId);
      const ticketDoc = await getDoc(ticketRef);
      
      if (!ticketDoc.exists()) {
        // Initialize ticket data for new user
        await setDoc(ticketRef, {
          tickets: 0,
          consecutiveDays: 0,
          lastClaimDate: null,
          nextClaimDate: null
        });
        return {
          tickets: 0,
          consecutiveDays: 0,
          lastClaimDate: null,
          nextClaimDate: null
        };
      }
      
      return ticketDoc.data();
    } catch (error) {
      console.error('Error getting ticket data:', error);
      return null;
    }
  },

  async claimDailyTicket(userId) {
    try {
      const ticketRef = doc(db, 'tickets', userId);
      const ticketDoc = await getDoc(ticketRef);
      const now = new Date();
      
      if (!ticketDoc.exists()) {
        // First time claim
        await setDoc(ticketRef, {
          tickets: 1,
          consecutiveDays: 1,
          lastClaimDate: serverTimestamp(),
          nextClaimDate: new Date(now.setDate(now.getDate() + 1))
        });
        return { success: true, tickets: 1, consecutiveDays: 1 };
      }

      const data = ticketDoc.data();
      const lastClaim = data.lastClaimDate?.toDate();
      
      if (!lastClaim) {
        // First claim after initialization
        const updateData = {
          tickets: 1,
          consecutiveDays: 1,
          lastClaimDate: serverTimestamp(),
          nextClaimDate: new Date(now.setDate(now.getDate() + 1))
        };
        await updateDoc(ticketRef, updateData);
        return { success: true, ...updateData };
      }

      // Check if this is a consecutive day claim
      const dayDiff = Math.floor((now - lastClaim) / (1000 * 60 * 60 * 24));
      
      if (dayDiff < 1) {
        return { success: false, message: 'Already claimed today' };
      }
      
      if (dayDiff > 1) {
        // Streak broken, reset to day 1
        const updateData = {
          tickets: data.tickets + 1,
          consecutiveDays: 1,
          lastClaimDate: serverTimestamp(),
          nextClaimDate: new Date(now.setDate(now.getDate() + 1))
        };
        await updateDoc(ticketRef, updateData);
        return { success: true, ...updateData };
      }

      // Consecutive day claim
      const newConsecutiveDays = Math.min(data.consecutiveDays + 1, 7);
      const ticketsToAdd = newConsecutiveDays === 7 ? 10 : 1;
      
      const updateData = {
        tickets: data.tickets + ticketsToAdd,
        consecutiveDays: newConsecutiveDays,
        lastClaimDate: serverTimestamp(),
        nextClaimDate: new Date(now.setDate(now.getDate() + 1))
      };
      
      await updateDoc(ticketRef, updateData);
      return { success: true, ...updateData };

    } catch (error) {
      console.error('Error claiming daily ticket:', error);
      return { success: false, message: 'Error claiming ticket' };
    }
  }
};