import { db } from '../firebase';
import { doc, setDoc, updateDoc, arrayUnion, increment, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { addCoinHistory } from '../models/historyModel';
// Create a new user in Firestore
const createUserDocument = async (userId, userDetails) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      name: userDetails.name,
      email: userDetails.email,
      referralCode: userDetails.referralCode,  // User's unique referral code
      referralUsed: userDetails.referralUsed || '',  // Referral code used (if any)
      //referredUsers: [], // Store referred users
      coinBalance: userDetails.coinBalance || 0,
      tasksCompleted: userDetails.tasksCompleted || 0,
      //adsWatched: 0,
      country: userDetails.country || '', // Store country of the user
    });
  } catch (error) {
    console.error("Error creating user document: ", error);
  }
};
const updateReferralSystem = async (referralCode, newUserId, newUserEmail, newUserCoinBalance) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', referralCode));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const referrerDoc = querySnapshot.docs[0];
      const referrerId = referrerDoc.id;
      const referrerData = referrerDoc.data();
      const referrerDocRef = doc(db, 'users', referrerId);
      
      // Get total referred users count
      const referredUsersCount = referrerData.referredUsers ? referrerData.referredUsers.length : 0;
      
      // Determine bonus percentage based on referral count
      let bonusPercentage = 10; // Default 10% for < 10 referrals
      
      if (referredUsersCount > 100) {
        bonusPercentage = 45; // 45% for > 100 referrals
      } else if (referredUsersCount > 10) {
        bonusPercentage = 25; // 25% for > 10 referrals
      }
      
      // Calculate bonus amount
      const bonusAmount = Math.floor((bonusPercentage / 100) * newUserCoinBalance);
      
      // Update referrer's document
      await updateDoc(referrerDocRef, {
        referredUsers: arrayUnion({
          uid: newUserId,
          email: newUserEmail,
          coinBalance: newUserCoinBalance,
          bonusReceived: bonusAmount,
          bonusPercentage: bonusPercentage,
          timestamp: new Date()
        }),
        coinBalance: increment(bonusAmount)
      });

      // Add to coin history
      await addCoinHistory(
        referrerId, 
        bonusAmount, 
        'credit', 
        `Referral bonus (${bonusPercentage}%) from ${newUserEmail}`
      );

      // Log the referral bonus
      console.log(`Referral bonus of ${bonusAmount} coins (${bonusPercentage}%) awarded to referrer ${referrerId}`);
    }
  } catch (error) {
    console.error('Error updating referral system:', error);
    throw error; // Propagate error to handle it in the registration process
  }
};
// Update coin balance
const updateCoinBalance = async (userId, amount, reason) => {
  const userDocRef = doc(db, 'users', userId);
  const type = amount >= 0 ? 'credit' : 'debit';

  try {
    await updateDoc(userDocRef, {
      coinBalance: increment(amount)
    });
    await addCoinHistory(userId, Math.abs(amount), type, reason);
  } catch (error) {
    console.error("Error updating coin balance:", error);
  }
};
// Update ads watched
const updateAdsWatched = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      adsWatched: increment(1),
      coinBalance: increment(5) // Reward 5 coins per ad watched
    });
  } catch (error) {
    console.error("Error updating ads watched: ", error);
  }
};
const updateTasksCompleted = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, { tasksCompleted: increment(1) });  // Increment tasks count
  } catch (error) {
    console.error("❌ Error updating tasks completed: ", error);
  }
};
export const updateTaskCompletion = async (userId, taskId, coins) => {
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      coinBalance: increment(coins),
      tasksCompleted: increment(1),
      completedTasks: arrayUnion(taskId)
    });
  } catch (error) {
    console.error("Error updating task completion:", error);
    throw error;
  }
};
export { createUserDocument, updateReferralSystem, updateCoinBalance, updateAdsWatched };
