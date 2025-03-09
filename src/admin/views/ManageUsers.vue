<template>
  <div class="users-container">
    <!-- Header & Controls -->
    <div class="page-header">
      <h2>👥 Manage Users</h2>
      <div class="controls">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text"
            placeholder="Search by name or email..."
            class="search-input"
          />
        </div>
        <div class="filters">
          <select v-model="sortBy" class="filter-select">
            <option value="joinDate">Sort by Join Date</option>
            <option value="coinBalance">Sort by Coins</option>
            <option value="tasksCompleted">Sort by Tasks</option>
          </select>
          <button 
            @click="toggleSortOrder" 
            class="sort-button"
          >
            {{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>User Info</th>
            <th>Join Date</th>
            <th>Coins</th>
            <th>Tasks</th>
            <th>Referrals</th>
            <th>Last Active</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in sortedUsers" :key="user.uid" :class="{ 'banned': user.status === 'banned' }">
            <td class="user-info">
              <div class="user-details">
                <strong>{{ user.name || 'Anonymous' }}</strong>
                <span class="user-email">{{ user.email }}</span>
              </div>
            </td>
            <td>{{ formatDate(user.joinDate) }}</td>
            <td>{{ user.coinBalance || 0 }} 🪙</td>
            <td>{{ user.taskCount || 0 }} ✅</td>
            <td>{{ formatNumber(user.referralCount) }}</td>
            <td>{{ formatDate(user.lastActive) }}</td>
            <td>
              <span :class="['status-badge', user.status || 'active']">
                {{ user.status || 'active' }}
              </span>
            </td>
            <td class="actions-cell">
              <button 
                @click="toggleUserStatus(user)"
                :class="['status-toggle', user.status === 'banned' ? 'unban' : 'ban']"
              >
                {{ user.status === 'banned' ? '🔓' : '🔒' }}
              </button>
              <button 
                @click="showTransactionModal(user)"
                class="adjust-coins"
              >
                💰
              </button>
              <button 
                @click="viewReferrals(user.uid)"
                class="view-referrals"
                v-if="user.referralCount > 0"
              >
                👥
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Transaction Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>Adjust Coins</h3>
        <p class="selected-user-info">
          {{ selectedUser?.displayName || 'Anonymous' }} ({{ selectedUser?.email }})
        </p>
        <div class="input-group">
          <label>Amount:</label>
          <input 
            v-model.number="coinAmount" 
            type="number" 
            class="coin-input"
            placeholder="Enter amount"
          />
        </div>
        <div class="input-group">
          <label>Reason:</label>
          <textarea 
            v-model="transactionReason" 
            class="reason-input"
            placeholder="Enter reason for adjustment"
            rows="3"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button @click="closeModal" class="cancel-button">Cancel</button>
          <button 
            @click="adjustCoins" 
            class="confirm-button"
            :disabled="!coinAmount || !transactionReason"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { db, auth } from '../../firebase';
import { collection, getDocs, updateDoc, doc, increment, addDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { updateCoinBalance } from '../../models/userModel';

export default {
  name: 'ManageUsers',
  
  setup() {
    const users = ref([]);
    const searchQuery = ref('');
    const sortBy = ref('joinDate');
    const sortOrder = ref('desc');
    const showModal = ref(false);
    const selectedUser = ref(null);
    const coinAmount = ref(0);
    const transactionReason = ref('');

    // Enhanced user stats
    const userStats = ref({
      totalUsers: 0,
      totalCoins: 0,
      averageTasksCompleted: 0,
      bannedUsers: 0
    });

    // Fetch users with enhanced data
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        let totalCoins = 0;
        let totalTasks = 0;
        let bannedCount = 0;

        const fetchedUsers = [];

        usersSnapshot.forEach(doc => {
          const userData = doc.data();
          totalCoins += userData.coinBalance || 0;
          totalTasks += userData.tasksCompleted || 0;
          if (userData.status === 'banned') bannedCount++;
          
          fetchedUsers.push({
            uid: doc.id,
            ...userData,
            referralCount: userData.referredUsers?.length || 0,
            lastActive: userData.lastActive?.toDate() || null,
            joinDate: userData.joinDate?.toDate() || null,
            status: userData.status || 'active'
          });
        });

        users.value = fetchedUsers;

        // Update stats
        userStats.value = {
          totalUsers: users.value.length,
          totalCoins,
          averageTasksCompleted: totalTasks / users.value.length || 0,
          bannedUsers: bannedCount
        };

        console.log('Fetched users:', users.value); // Debug log
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    // Enhanced sorting and filtering
    const sortedUsers = computed(() => {
      return users.value
        .filter(user => {
          const searchLower = searchQuery.value.toLowerCase();
          return (
            user.email?.toLowerCase().includes(searchLower) ||
            user.displayName?.toLowerCase().includes(searchLower) ||
            user.referralCode?.toLowerCase().includes(searchLower)
          );
        })
        .sort((a, b) => {
          const modifier = sortOrder.value === 'asc' ? 1 : -1;
          
          switch (sortBy.value) {
            case 'referralCount':
              return modifier * ((a.referralCount || 0) - (b.referralCount || 0));
            case 'lastActive':
              if (!a.lastActive) return 1;
              if (!b.lastActive) return -1;
              return modifier * (a.lastActive - b.lastActive);
            default:
              return modifier * ((a[sortBy.value] || 0) - (b[sortBy.value] || 0));
          }
        });
    });

    const toggleSortOrder = () => {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    };

    // Enhanced user status management
    const toggleUserStatus = async (user) => {
      const newStatus = user.status === 'banned' ? 'active' : 'banned';
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          status: newStatus,
          lastStatusUpdate: new Date(),
          statusUpdateReason: newStatus === 'banned' ? 'Admin action' : 'Unbanned by admin'
        });
        
        user.status = newStatus;
        await fetchUsers(); // Refresh stats
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    };

    const showTransactionModal = (user) => {
      selectedUser.value = user;
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      selectedUser.value = null;
      coinAmount.value = 0;
      transactionReason.value = '';
    };

    // Enhanced coin adjustment
    const adjustCoins = async () => {
      if (!selectedUser.value || !coinAmount.value) return;

      try {
        // Use userModel function
        await updateCoinBalance(
          selectedUser.value.uid,
          coinAmount.value,
          transactionReason.value
        );

        // Add admin log
        await addDoc(collection(db, 'adminLogs'), {
          action: 'adjust_coins',
          userId: selectedUser.value.uid,
          amount: coinAmount.value,
          reason: transactionReason.value,
          adminId: auth.currentUser.uid,
          timestamp: new Date()
        });

        closeModal();
        await fetchUsers();
      } catch (error) {
        console.error('Error adjusting coins:', error);
      }
    };

    // New function to view user referrals
    const viewReferrals = async (userId) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const referrals = userDoc.data().referredUsers || [];
        
        // Process referrals here or show in modal
        console.log('User referrals:', referrals);
      } catch (error) {
        console.error('Error fetching referrals:', error);
      }
    };

    // Enhanced date formatting
    const formatDate = (date) => {
      if (!date) return 'Never';
      
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return new Date(date).toLocaleDateString('en-US', options);
    };

    // Format numbers
    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-US').format(num);
    };

    // Initialize on component mount
    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      searchQuery,
      sortBy,
      sortOrder,
      showModal,
      selectedUser,
      coinAmount,
      transactionReason,
      sortedUsers,
      toggleSortOrder,
      toggleUserStatus,
      showTransactionModal,
      closeModal,
      adjustCoins,
      formatDate,
      userStats,
      viewReferrals,
      formatNumber
    };
  }
};
</script>

<style scoped>
/* Base Styles */
.users-container {
  padding: 2rem;
  color: #fff;
}

.page-header h2 {
  color: #fff;
  margin-bottom: 2rem;
}

/* Table Styles */
.table-container {
  background: rgba(16, 20, 24, 0.95);
  border-radius: 12px;
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  color: #fff;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.users-table th {
  background: rgba(0, 0, 0, 0.2);
  font-weight: 500;
}

.users-table tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* User Info Styles */
.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-email {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

/* Status Badge */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.status-badge.active {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
}

.status-badge.banned {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
}

/* Action Buttons */
.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.status-toggle,
.adjust-coins,
.view-referrals {
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-toggle.ban {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.2);
  color: #ff4757;
}

.status-toggle.unban {
  background: rgba(46, 213, 115, 0.1);
  border: 1px solid rgba(46, 213, 115, 0.2);
  color: #2ed573;
}

.adjust-coins {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.view-referrals {
  background: rgba(0, 102, 255, 0.1);
  border: 1px solid rgba(0, 102, 255, 0.2);
  color: #0066ff;
}

/* Controls */
.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-input,
.filter-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.75rem;
  border-radius: 8px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  color: #fff;
}

.selected-user-info {
  margin: 1rem 0;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.coin-input,
.reason-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.75rem;
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .users-container {
    padding: 1rem;
  }

  .controls {
    flex-direction: column;
  }

  .actions-cell {
    flex-direction: column;
  }
}

/* Stats Header */
.stats-header {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0066ff;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}
</style>