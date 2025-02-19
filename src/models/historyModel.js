import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

const addCoinHistory = async (userId, amount, reason) => {
  try {
    const userDocRef = doc(db, 'users', userId);

    await updateDoc(userDocRef, {
      coinHistory: arrayUnion({
        amount,
        reason,
        timestamp: serverTimestamp(),
      }),
    });

    console.log(`✅ History recorded in user document: ${amount} coins for ${reason}`);
  } catch (error) {
    console.error("❌ Error storing coin history: ", error);
  }
};

export { addCoinHistory };
