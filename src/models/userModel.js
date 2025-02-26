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
    // Query to find the referrer based on the referralCode
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', referralCode));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Get referrer's data
      const referrerDoc = querySnapshot.docs[0];
      const referrerId = referrerDoc.id;
      const referrerData = referrerDoc.data();
      const referrerDocRef = doc(db, 'users', referrerId);
      // Get total referred users count
      const referredUsersCount = referrerData.referredUsers ? referrerData.referredUsers.length : 0;
      // Determine bonus percentage based on referral count
      let bonusPercentage = 10;
      if (referredUsersCount > 10) {
        bonusPercentage = 20;
      }
      if (referredUsersCount >= 142) {
        bonusPercentage = 45;
      }
      // Calculate the bonus amount
      const bonusAmount = Math.floor((bonusPercentage / 100) * newUserCoinBalance);
      // Update referrer’s document
      await updateDoc(referrerDocRef, {
        referredUsers: arrayUnion({
          uid: newUserId,
          email: newUserEmail,
          coinBalance: newUserCoinBalance,
        }),
        coinBalance: increment(bonusAmount) // Add referral bonus
      });
      // const bonusAmount = Math.floor((bonusPercentage / 100) * newUserCoinBalance);
      await updateCoinBalance(referrerId, bonusAmount,
        `Referral bonus from ${newUserEmail}`);
      console.log(`Referral bonus of ${bonusAmount} coins given to ${referrerData.email}`);
    } else {
      console.error('No user found with the provided referral code.');
    }
  } catch (error) {
    console.error('Error updating referral system:', error);
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
export { createUserDocument, updateReferralSystem, updateCoinBalance, updateAdsWatched };
