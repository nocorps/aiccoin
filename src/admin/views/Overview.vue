<template>
  <div class="overview-container">
    <div class="stats-grid">
      <!-- User Stats -->
      <div class="stat-card">
        <h3>Total Users</h3>
        <div class="stat-value">{{ stats.totalUsers }}</div>
        <div class="stat-icon">👥</div>
      </div>
      
      <!-- Task Stats -->
      <div class="stat-card">
        <h3>Active Tasks</h3>
        <div class="stat-value">{{ stats.activeTasks }}</div>
        <div class="stat-icon">📝</div>
      </div>
      
      <!-- Collaboration Stats -->
      <div class="stat-card">
        <h3>Total Collaborations</h3>
        <div class="stat-value">{{ stats.totalCollaborations }}</div>
        <div class="stat-icon">🤝</div>
      </div>
      
      <!-- Coin Stats -->
      <div class="stat-card">
        <h3>Coins Awarded</h3>
        <div class="stat-value">{{ stats.totalCoinsAwarded }}</div>
        <div class="stat-icon">🪙</div>
      </div>
    </div>

    <!-- Daily Statistics -->
    <div class="daily-stats-section">
      <h2>Daily Analytics</h2>
      <div class="date-controls">
        <button @click="changeDate(-1)" class="date-btn">◀</button>
        <span class="current-date">{{ formatDate(selectedDate) }}</span>
        <button @click="changeDate(1)" class="date-btn" :disabled="isToday">▶</button>
      </div>
      
      <div class="daily-stats-grid">
        <div class="stat-card">
          <h3>New Users</h3>
          <div class="stat-value">{{ dailyStats.newUsers }}</div>
          <div class="trend" :class="getTrendClass(dailyStats.newUsersTrend)">
            {{ formatTrend(dailyStats.newUsersTrend) }}
          </div>
        </div>
        
        <div class="stat-card">
          <h3>Tasks Completed</h3>
          <div class="stat-value">{{ dailyStats.tasksCompleted }}</div>
          <div class="trend" :class="getTrendClass(dailyStats.tasksTrend)">
            {{ formatTrend(dailyStats.tasksTrend) }}
          </div>
        </div>
        
        <div class="stat-card">
          <h3>Coins Distributed</h3>
          <div class="stat-value">{{ dailyStats.coinsAwarded }}</div>
          <div class="trend" :class="getTrendClass(dailyStats.coinsTrend)">
            {{ formatTrend(dailyStats.coinsTrend) }}
          </div>
        </div>

        <div class="stat-card">
          <h3>Active Users</h3>
          <div class="stat-value">{{ dailyStats.activeUsers }}</div>
          <div class="trend" :class="getTrendClass(dailyStats.activeUsersTrend)">
            {{ formatTrend(dailyStats.activeUsersTrend) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Monthly Statistics -->
    <div class="monthly-stats-section">
      <h2>Monthly Overview</h2>
      <div class="month-controls">
        <button @click="changeMonth(-1)" class="month-btn">◀</button>
        <span class="current-month">{{ formatMonth(selectedMonth) }}</span>
        <button @click="changeMonth(1)" class="month-btn" :disabled="isCurrentMonth">▶</button>
      </div>

      <div class="monthly-stats-grid">
        <div class="stat-card">
          <h3>Monthly Growth</h3>
          <div class="stat-value">{{ monthlyStats.totalUsers }}</div>
          <div class="monthly-chart">
            <div 
              v-for="(day, index) in monthlyStats.userGrowth" 
              :key="index"
              class="chart-bar"
              :style="{ height: `${(day/monthlyStats.maxGrowth) * 100}%` }"
              :title="`${day} users on day ${index + 1}`"
            ></div>
          </div>
        </div>

        <div class="stat-card">
          <h3>Task Completion Rate</h3>
          <div class="stat-value">{{ monthlyStats.completionRate }}%</div>
          <div class="trend" :class="getTrendClass(monthlyStats.completionTrend)">
            {{ formatTrend(monthlyStats.completionTrend) }}
          </div>
        </div>

        <div class="stat-card">
          <h3>Monthly Revenue</h3>
          <div class="stat-value">{{ formatNumber(monthlyStats.revenue) }}</div>
          <div class="trend" :class="getTrendClass(monthlyStats.revenueTrend)">
            {{ formatTrend(monthlyStats.revenueTrend) }}
          </div>
        </div>

        <div class="stat-card">
          <h3>User Retention</h3>
          <div class="stat-value">{{ monthlyStats.retention }}%</div>
          <div class="trend" :class="getTrendClass(monthlyStats.retentionTrend)">
            {{ formatTrend(monthlyStats.retentionTrend) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { db } from '../../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

export default {
  name: 'AdminOverview',
  setup() {
    const stats = ref({
      totalUsers: 0,
      activeTasks: 0,
      totalCollaborations: 0,
      totalCoinsAwarded: 0
    });

    const fetchStats = async () => {
      try {
        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        stats.value.totalUsers = usersSnapshot.size;

        // Fetch tasks count
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        stats.value.activeTasks = tasksSnapshot.size;

        // Fetch collaborations count
        const collabsSnapshot = await getDocs(collection(db, 'collaborationTasks'));
        stats.value.totalCollaborations = collabsSnapshot.size;

        // Calculate total coins awarded
        let totalCoins = 0;
        const completedTasks = await getDocs(collection(db, 'completedTasks'));
        completedTasks.forEach(doc => {
          totalCoins += doc.data().award || 0;
        });
        stats.value.totalCoinsAwarded = totalCoins;
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const selectedDate = ref(new Date());
    const dailyStats = ref({
      newUsers: 0,
      tasksCompleted: 0,
      coinsAwarded: 0,
      activeUsers: 0,
      newUsersTrend: 0,
      tasksTrend: 0,
      coinsTrend: 0,
      activeUsersTrend: 0
    });

    const isToday = computed(() => {
      const today = new Date();
      return selectedDate.value.toDateString() === today.toDateString();
    });

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }).format(date);
    };

    const getDayBounds = (date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    };

    const fetchDailyStats = async (date) => {
      try {
        const { start, end } = getDayBounds(date);
        const startTs = Timestamp.fromDate(start);
        const endTs = Timestamp.fromDate(end);

        // Fetch new users
        const newUsersQuery = query(
          collection(db, 'users'),
          where('joinDate', '>=', startTs),
          where('joinDate', '<=', endTs)
        );
        const newUsersSnap = await getDocs(newUsersQuery);
        dailyStats.value.newUsers = newUsersSnap.size;

        // Fetch completed tasks
        const tasksQuery = query(
          collection(db, 'completedTasks'),
          where('completedAt', '>=', startTs),
          where('completedAt', '<=', endTs)
        );
        const tasksSnap = await getDocs(tasksQuery);
        dailyStats.value.tasksCompleted = tasksSnap.size;
        
        // Calculate coins awarded
        let dailyCoins = 0;
        tasksSnap.forEach(doc => {
          dailyCoins += doc.data().award || 0;
        });
        dailyStats.value.coinsAwarded = dailyCoins;

        // Fetch active users
        const activeUsersQuery = query(
          collection(db, 'userActivity'),
          where('lastActive', '>=', startTs),
          where('lastActive', '<=', endTs)
        );
        const activeUsersSnap = await getDocs(activeUsersQuery);
        dailyStats.value.activeUsers = activeUsersSnap.size;

        // Calculate trends (comparing with previous day)
        await calculateTrends(date);
      } catch (error) {
        console.error('Error fetching daily stats:', error);
      }
    };

    const calculateTrends = async (currentDate) => {
      const previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - 1);
      
      const { start: prevStart, end: prevEnd } = getDayBounds(previousDate);
      const prevStartTs = Timestamp.fromDate(prevStart);
      const prevEndTs = Timestamp.fromDate(prevEnd);

      // Fetch previous day stats
      const [prevNewUsers, prevTasks, prevActiveUsers] = await Promise.all([
        getDocs(query(
          collection(db, 'users'),
          where('joinDate', '>=', prevStartTs),
          where('joinDate', '<=', prevEndTs)
        )),
        getDocs(query(
          collection(db, 'completedTasks'),
          where('completedAt', '>=', prevStartTs),
          where('completedAt', '<=', prevEndTs)
        )),
        getDocs(query(
          collection(db, 'userActivity'),
          where('lastActive', '>=', prevStartTs),
          where('lastActive', '<=', prevEndTs)
        ))
      ]);

      // Calculate percentage changes
      dailyStats.value.newUsersTrend = calculateTrendPercentage(
        prevNewUsers.size,
        dailyStats.value.newUsers
      );
      dailyStats.value.tasksTrend = calculateTrendPercentage(
        prevTasks.size,
        dailyStats.value.tasksCompleted
      );
      dailyStats.value.activeUsersTrend = calculateTrendPercentage(
        prevActiveUsers.size,
        dailyStats.value.activeUsers
      );
    };

    const calculateTrendPercentage = (previous, current) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const getTrendClass = (trend) => {
      return trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral';
    };

    const formatTrend = (trend) => {
      const sign = trend > 0 ? '↑' : trend < 0 ? '↓' : '−';
      return `${sign} ${Math.abs(trend).toFixed(1)}%`;
    };

    const changeDate = (days) => {
      const newDate = new Date(selectedDate.value);
      newDate.setDate(newDate.getDate() + days);
      if (newDate <= new Date()) {
        selectedDate.value = newDate;
        fetchDailyStats(newDate);
      }
    };

    const selectedMonth = ref(new Date());
    const monthlyStats = ref({
      totalUsers: 0,
      userGrowth: [],
      maxGrowth: 0,
      completionRate: 0,
      completionTrend: 0,
      revenue: 0,
      revenueTrend: 0,
      retention: 0,
      retentionTrend: 0
    });

    const isCurrentMonth = computed(() => {
      const now = new Date();
      return selectedMonth.value.getMonth() === now.getMonth() &&
             selectedMonth.value.getFullYear() === now.getFullYear();
    });

    const formatMonth = (date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long'
      }).format(date);
    };

    const formatNumber = (number) => {
      return new Intl.NumberFormat('en-US').format(number);
    };

    const fetchMonthlyStats = async (date) => {
      try {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Convert to Firestore timestamps
        const startTs = Timestamp.fromDate(firstDay);
        const endTs = Timestamp.fromDate(lastDay);

        // Fetch monthly user growth
        const usersQuery = query(
          collection(db, 'users'),
          where('joinDate', '>=', startTs),
          where('joinDate', '<=', endTs)
        );
        const usersSnap = await getDocs(usersQuery);
        
        // Calculate daily growth
        const dailyGrowth = Array(lastDay.getDate()).fill(0);
        usersSnap.forEach(doc => {
          const joinDate = doc.data().joinDate.toDate();
          dailyGrowth[joinDate.getDate() - 1]++;
        });

        // Calculate task completion rate
        const tasksQuery = query(
          collection(db, 'completedTasks'),
          where('completedAt', '>=', startTs),
          where('completedAt', '<=', endTs)
        );
        const tasksSnap = await getDocs(tasksQuery);
        const totalTasksQuery = await getDocs(collection(db, 'tasks'));
        
        const completionRate = (tasksSnap.size / (totalTasksQuery.size * usersSnap.size)) * 100;

        // Calculate revenue (from completed tasks and collaborations)
        let monthlyRevenue = 0;
        tasksSnap.forEach(doc => {
          monthlyRevenue += doc.data().award || 0;
        });

        // Calculate user retention
        const activeUsersQuery = query(
          collection(db, 'userActivity'),
          where('lastActive', '>=', startTs),
          where('lastActive', '<=', endTs)
        );
        const activeUsersSnap = await getDocs(activeUsersQuery);
        const retention = (activeUsersSnap.size / usersSnap.size) * 100;

        // Update monthly stats
        monthlyStats.value = {
          totalUsers: usersSnap.size,
          userGrowth: dailyGrowth,
          maxGrowth: Math.max(...dailyGrowth),
          completionRate: Math.round(completionRate),
          completionTrend: 0, // Calculate trend
          revenue: monthlyRevenue,
          revenueTrend: 0, // Calculate trend
          retention: Math.round(retention),
          retentionTrend: 0 // Calculate trend
        };

        // Calculate trends by comparing with previous month
        await calculateMonthlyTrends(date);

      } catch (error) {
        console.error('Error fetching monthly stats:', error);
      }
    };

    const calculateMonthlyTrends = async (currentDate) => {
      const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
      // ... implement previous month comparison logic
    };

    const changeMonth = (months) => {
      const newDate = new Date(selectedMonth.value);
      newDate.setMonth(newDate.getMonth() + months);
      if (newDate <= new Date()) {
        selectedMonth.value = newDate;
        fetchMonthlyStats(newDate);
      }
    };

    onMounted(async () => {
      await fetchStats();
      await fetchDailyStats(new Date());
      await fetchMonthlyStats(new Date());
    });

    return {
      stats,
      dailyStats,
      selectedDate,
      isToday,
      formatDate,
      changeDate,
      getTrendClass,
      formatTrend,
      selectedMonth,
      monthlyStats,
      isCurrentMonth,
      formatMonth,
      formatNumber,
      changeMonth
    };
  }
};
</script>

<style scoped>
.overview-container {
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: rgba(0, 102, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 102, 255, 0.1);
}

.stat-card h3 {
  margin: 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
  background: linear-gradient(45deg, #0066ff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-icon {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 2rem;
  opacity: 0.2;
}

@media (max-width: 768px) {
  .overview-container {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 2rem;
  }
}

.daily-stats-section {
  margin-top: 2rem;
  padding: 2rem;
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.date-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0 2rem;
}

.date-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.date-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-date {
  font-size: 1.2rem;
  color: white;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.daily-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.trend {
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin-top: 0.5rem;
}

.trend.positive {
  background: rgba(46, 213, 115, 0.1);
  color: #2ed573;
}

.trend.negative {
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
}

.trend.neutral {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.monthly-stats-section {
  margin-top: 2rem;
  padding: 2rem;
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.month-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0 2rem;
}

.month-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.month-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-month {
  font-size: 1.2rem;
  color: white;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.monthly-chart {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 100px;
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #0066ff, #00ccff);
  border-radius: 2px 2px 0 0;
  min-height: 1px;
  transition: height 0.3s ease;
}

.chart-bar:hover {
  background: #00ccff;
}
</style>