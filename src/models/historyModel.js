// src/models/historyModel.js
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const addCoinHistory = async (userId, amount, type, reason = '') => {
  try {
    const coinHistoryRef = collection(db, "coinHistory");
    await addDoc(coinHistoryRef, {
      userId,
      amount,
      type, // 'credit' or 'debit'
      reason,
      timestamp: serverTimestamp()
    });
    console.log(`✅ Transaction recorded: ${type} of ${amount} coins`);
  } catch (error) {
    console.error("❌ Error recording transaction:", error);
  }
};

export { addCoinHistory };