import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Fetch Global Rankings for CoinBalance or TasksCompleted
const getGlobalRanking = async (sortBy) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy(sortBy, 'desc'), limit(499)); // Limit to 499 users
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  }));
};

// Fetch Country Rankings for CoinBalance or TasksCompleted
const getCountryRanking = async (country, sortBy) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('country', '==', country), orderBy(sortBy, 'desc'), limit(499));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  }));
};

export { getGlobalRanking, getCountryRanking };
