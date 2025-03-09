<template>
  <div class="email-system">
    <h2 class="page-title">📧 Promotional Emails</h2>

    <!-- Target Users Selection -->
    <div class="section">
      <h3>Select Target Users</h3>
      <div class="filters">
        <label class="filter-item">
          <input 
            type="radio" 
            v-model="targetType" 
            value="all"
          > All Users ({{ userStats.total || 0 }})
        </label>
        <label class="filter-item">
          <input 
            type="radio" 
            v-model="targetType" 
            value="active"
          > Active Users ({{ userStats.active || 0 }})
        </label>
        <label class="filter-item">
          <input 
            type="radio" 
            v-model="targetType" 
            value="coins"
          > By Coin Balance
        </label>
        <div v-if="targetType === 'coins'" class="coin-filter">
          <input 
            type="number" 
            v-model.number="minCoins" 
            placeholder="Minimum coins"
            class="coin-input"
          >
        </div>
      </div>
    </div>

    <!-- Email Content -->
    <div class="section">
      <h3>Email Content</h3>
      <div class="templates">
        <button 
          v-for="template in templates" 
          :key="template.id"
          @click="loadTemplate(template)"
          class="template-btn"
        >
          {{ template.name }}
        </button>
      </div>

      <div class="email-form">
        <input 
          v-model="emailContent.subject"
          placeholder="Email Subject"
          class="subject-input"
        >
        <div class="editor-controls">
          <button @click="addVariable('userName')" class="var-btn">Add User Name</button>
          <button @click="addVariable('coinBalance')" class="var-btn">Add Coin Balance</button>
          <button @click="addVariable('referralCode')" class="var-btn">Add Referral Code</button>
        </div>
        <textarea 
          v-model="emailContent.body"
          placeholder="Email Body"
          rows="10"
          class="body-input"
        ></textarea>
      </div>
    </div>

    <!-- Preview -->
    <div v-if="emailContent.body" class="section">
      <h3>Preview</h3>
      <div class="preview-box">
        <h4>{{ emailContent.subject }}</h4>
        <div v-html="previewContent"></div>
      </div>
    </div>

    <!-- Send Controls -->
    <div class="send-controls">
      <div class="target-info">
        Target Recipients: {{ targetUserCount }}
      </div>
      <button 
        @click="sendEmails"
        :disabled="!canSend || isSending"
        class="send-btn"
      >
        {{ isSending ? 'Sending...' : 'Send Campaign' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore'

export default {
  name: 'EmailToUsers',

  setup() {
    const users = ref([])
    const userStats = ref({ total: 0, active: 0 })
    const targetType = ref('active')
    const minCoins = ref(100)
    const isSending = ref(false)

    const emailContent = ref({
      subject: '',
      body: ''
    })

    const templates = [
      {
        id: 'welcome',
        name: '👋 Welcome',
        subject: 'Welcome to AICCoin!',
        body: 'Hello {userName},\n\nWelcome to our community! Start earning with {coinBalance} coins.'
      },
      {
        id: 'promotion',
        name: '🎉 Special Offer',
        subject: 'Limited Time Offer!',
        body: 'Hi {userName},\n\nWe have a special promotion for you! Complete tasks now to earn double coins!'
      },
      {
        id: 'referral',
        name: '🤝 Referral Bonus',
        subject: 'Earn More with Referrals',
        body: 'Hello {userName},\n\nShare your referral code: {referralCode} with friends and earn bonus coins!'
      }
    ]

    // Fetch users
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'))
        users.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        userStats.value = {
          total: users.value.length,
          active: users.value.filter(u => u.status === 'active').length
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    // Computed properties
    const targetUserCount = computed(() => {
      if (!users.value.length) return 0

      switch (targetType.value) {
        case 'all':
          return users.value.length
        case 'active':
          return users.value.filter(u => u.status === 'active').length
        case 'coins':
          return users.value.filter(u => (u.coinBalance || 0) >= minCoins.value).length
        default:
          return 0
      }
    })

    const previewContent = computed(() => {
      if (!emailContent.value.body) return ''
      
      const demoUser = {
        userName: 'John Doe',
        coinBalance: '1,000',
        referralCode: 'JOHN123'
      }

      return emailContent.value.body
        .replace(/{userName}/g, demoUser.userName)
        .replace(/{coinBalance}/g, demoUser.coinBalance)
        .replace(/{referralCode}/g, demoUser.referralCode)
    })

    const canSend = computed(() => {
      return emailContent.value.subject &&
             emailContent.value.body &&
             targetUserCount.value > 0
    })

    // Methods
    const loadTemplate = (template) => {
      emailContent.value = {
        subject: template.subject,
        body: template.body
      }
    }

    const addVariable = (variable) => {
      const variables = {
        userName: '{userName}',
        coinBalance: '{coinBalance}',
        referralCode: '{referralCode}'
      }
      
      emailContent.value.body += variables[variable]
    }

    const sendEmails = async () => {
      if (!canSend.value) return
      isSending.value = true

      try {
        const targetUsers = users.value.filter(user => {
          if (targetType.value === 'all') return true
          if (targetType.value === 'active') return user.status === 'active'
          return (user.coinBalance || 0) >= minCoins.value
        })

        // Create email campaign record
        const campaign = await addDoc(collection(db, 'emailCampaigns'), {
          subject: emailContent.value.subject,
          body: emailContent.value.body,
          targetType: targetType.value,
          minCoins: targetType.value === 'coins' ? minCoins.value : null,
          totalRecipients: targetUsers.length,
          createdAt: new Date()
        })

        // Queue emails for each user
        await Promise.all(targetUsers.map(user => 
          addDoc(collection(db, 'emailQueue'), {
            campaignId: campaign.id,
            userId: user.id,
            subject: emailContent.value.subject,
            body: emailContent.value.body
              .replace(/{userName}/g, user.displayName || 'User')
              .replace(/{coinBalance}/g, user.coinBalance || 0)
              .replace(/{referralCode}/g, user.referralCode || 'N/A'),
            status: 'pending',
            createdAt: new Date()
          })
        ))

        alert(`Campaign queued for ${targetUsers.length} users!`)
        emailContent.value = { subject: '', body: '' }
      } catch (error) {
        console.error('Error sending campaign:', error)
        alert('Failed to send campaign. Please try again.')
      } finally {
        isSending.value = false
      }
    }

    onMounted(fetchUsers)

    return {
      userStats,
      targetType,
      minCoins,
      emailContent,
      templates,
      isSending,
      targetUserCount,
      previewContent,
      canSend,
      loadTemplate,
      addVariable,
      sendEmails
    }
  }
}
</script>

<style scoped>
.email-system {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: white;
}

.section {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filters {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.coin-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 8px;
  color: white;
  width: 120px;
}

.templates {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.template-btn {
  padding: 0.5rem 1rem;
  background: rgba(0, 102, 255, 0.1);
  border: 1px solid rgba(0, 102, 255, 0.2);
  color: #0066ff;
  border-radius: 8px;
  cursor: pointer;
}

.email-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subject-input,
.body-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
}

.editor-controls {
  display: flex;
  gap: 0.5rem;
}

.var-btn {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

.preview-box {
  background: white;
  color: black;
  padding: 1.5rem;
  border-radius: 8px;
}

.send-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
}

.send-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #0066ff, #2e7bff);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.send-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .email-system {
    padding: 1rem;
  }

  .filters {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>