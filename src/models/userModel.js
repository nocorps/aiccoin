import { db } from '../firebase';
import { doc, setDoc, updateDoc, arrayUnion, increment, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
// Create a new user in Firestore
const createUserDocument = async (userId, userDetails) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      name: userDetails.name,
      email: userDetails.email,
      referralCode: userDetails.referralCode,  // User's unique referral code
      referralUsed: userDetails.referralUsed || '',  // Referral code used (if any)
      referredUsers: [], // Store referred users
      coinBalance: 0,  
      tasksCompleted: 0,  
      adsWatched: 0,
      country: userDetails.country || '', // Store country of the user
    });
  } catch (error) {
    console.error("Error creating user document: ", error);
  }
};

// Update referral system
// const updateReferralSystem = async (referralCode, newUserId, newUserEmail) => {
//   try {
//     const referrerDocRef = doc(db, 'users', referralCode);
//     const referrerDocSnap = await getDoc(referrerDocRef);

//     if (referrerDocSnap.exists()) {
//       // Add the new user to the referrer's referredUsers list with more details
//       await updateDoc(referrerDocRef, {
//         referredUsers: arrayUnion({
//           uid: newUserId,
//           email: newUserEmail,
//           coinBalance: 0,  // New user starts with 0 coins, can be updated later
//         }),
//         coinBalance: increment(25)  // Reward referrer with 25 coins for the referral
//       });
//     } else {
//       console.error("Referrer not found with code: ", referralCode);
//     }
//   } catch (error) {
//     console.error("Error updating referral: ", error);
//   }
// };

const updateReferralSystem = async (referralCode, newUserId, newUserEmail) => {
  try {
    // Query to find the referrer based on the referralCode
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', referralCode));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming referralCode is unique, take the first matching document
      const referrerDoc = querySnapshot.docs[0];
      const referrerDocRef = doc(db, 'users', referrerDoc.id);

      // Add the new user to the referrer's referredUsers list
      await updateDoc(referrerDocRef, {
        referredUsers: arrayUnion({
          uid: newUserId,
          email: newUserEmail,
          coinBalance: 0, // New user starts with 0 coins
        }),
        coinBalance: increment(25) // Reward referrer with 25 coins
      });

      console.log('Referral system updated successfully.');
    } else {
      console.error('No user found with the provided referral code.');
    }
  } catch (error) {
    console.error('Error updating referral system:', error);
  }
};


// Update coin balance
const updateCoinBalance = async (userId, amount) => {
  const userDocRef = doc(db, 'users', userId);
  try {
    await updateDoc(userDocRef, {
      coinBalance: increment(amount)
    });
  } catch (error) {
    console.error("Error updating coin balance: ", error);
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

export { createUserDocument, updateReferralSystem, updateCoinBalance, updateAdsWatched };
