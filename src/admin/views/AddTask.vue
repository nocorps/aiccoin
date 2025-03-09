<template>
  <div class="task-container">
    <Toast :toasts="toasts" />
    
    <!-- Task Type Selector -->
    <div class="tabs">
      <button 
        :class="{ active: selectedTab === 'tasks' }" 
        @click="selectedTab = 'tasks'"
      >
        📝 Regular Tasks
      </button>
      <button 
        :class="{ active: selectedTab === 'collaborations' }" 
        @click="selectedTab = 'collaborations'"
      >
        🤝 Collaboration Tasks
      </button>
    </div>

    <!-- Add/Edit Task Form -->
    <div class="task-form" :class="{ 'editing': isEditing }">
      <h2>{{ isEditing ? '✏️ Edit Task' : '➕ Add New Task' }}</h2>
      <form @submit.prevent="handleSubmit" class="admin-form">
        <div class="input-group">
          <label>Title</label>
          <input 
            v-model="taskData.title" 
            type="text"
            placeholder="Enter task title"
            required
            class="admin-input"
          />
        </div>

        <div class="input-group">
          <label>Description</label>
          <textarea 
            v-model="taskData.description"
            placeholder="Enter task description"
            required
            class="admin-input"
            rows="4"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>Reward (coins)</label>
            <input 
              v-model.number="taskData.award"
              type="number"
              placeholder="Enter reward amount"
              required
              class="admin-input"
              min="0"
            />
          </div>

          <div class="input-group">
            <label>Secret Code</label>
            <input 
              v-model="taskData.secret"
              type="text"
              placeholder="Enter verification code"
              required
              class="admin-input"
            />
          </div>
        </div>

        <div class="input-group">
          <label>Task URL</label>
          <input 
            v-model="taskData.url_redirect"
            type="url"
            placeholder="Enter task URL"
            required
            class="admin-input"
          />
        </div>

        <div class="form-actions">
          <button 
            v-if="isEditing"
            @click="resetForm" 
            class="cancel-button"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="submit-button"
          >
            {{ isEditing ? 'Update Task' : 'Add Task' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Task List -->
    <div class="task-list">
      <h2>{{ selectedTab === 'tasks' ? '📋 Existing Tasks' : '📋 Existing Collaborations' }}</h2>
      <div v-if="filteredTasks.length" class="tasks-grid">
        <div v-for="task in filteredTasks" :key="task.id" class="task-item">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
          <div class="task-meta">
            <span class="award">🎁 {{ task.award }} coins</span>
            <span class="secret">🔑 {{ task.secret }}</span>
          </div>
          <div class="task-actions">
            <button @click="editTask(task)" class="edit-button">✏️ Edit</button>
            <button @click="deleteTask(task.id)" class="delete-button">🗑️ Delete</button>
          </div>
        </div>
      </div>
      <div v-else class="no-tasks">
        <p>No {{ selectedTab }} found</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Toast from '../../components/TostAlert.vue';

export default {
  name: 'AddTask',
  components: { Toast },
  
  setup() {
    const selectedTab = ref('tasks');
    const isEditing = ref(false);
    const tasks = ref([]);
    const collaborations = ref([]);
    const toasts = ref([]);

    const taskData = ref({
      title: '',
      description: '',
      award: 0,
      secret: '',
      url_redirect: '',
      task_id: ''
    });

    const filteredTasks = computed(() => {
      return selectedTab.value === 'tasks' ? tasks.value : collaborations.value;
    });

    const fetchTasks = async () => {
      try {
        const tasksSnapshot = await getDocs(collection(db, 'tasks'));
        const collabsSnapshot = await getDocs(collection(db, 'collaborationTasks'));
        
        tasks.value = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        collaborations.value = collabsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        showToast('Error fetching tasks', 'error');
      }
    };

    const handleSubmit = async () => {
      try {
        const collectionName = selectedTab.value === 'tasks' ? 'tasks' : 'collaborationTasks';
        const data = {
          ...taskData.value,
          task_id: taskData.value.task_id || `task_${Date.now()}`
        };

        if (isEditing.value && taskData.value.id) {
          await updateDoc(doc(db, collectionName, taskData.value.id), data);
          showToast('Task updated successfully! 🎉');
        } else {
          await addDoc(collection(db, collectionName), data);
          showToast('Task added successfully! 🎉');
        }

        await fetchTasks();
        resetForm();
      } catch (error) {
        showToast('Error saving task', 'error');
      }
    };

    const editTask = (task) => {
      taskData.value = { ...task };
      isEditing.value = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteTask = async (taskId) => {
      if (confirm('Are you sure you want to delete this task?')) {
        try {
          const collectionName = selectedTab.value === 'tasks' ? 'tasks' : 'collaborationTasks';
          await deleteDoc(doc(db, collectionName, taskId));
          await fetchTasks();
          showToast('Task deleted successfully! 🗑️');
        } catch (error) {
          showToast('Error deleting task', 'error');
        }
      }
    };

    const resetForm = () => {
      taskData.value = {
        title: '',
        description: '',
        award: 0,
        secret: '',
        url_redirect: '',
        task_id: ''
      };
      isEditing.value = false;
    };

    const showToast = (message, type = 'success') => {
      const id = Date.now();
      toasts.value.push({ id, message, type });
      setTimeout(() => {
        toasts.value = toasts.value.filter(toast => toast.id !== id);
      }, 3000);
    };

    // Initialize
    fetchTasks();

    return {
      selectedTab,
      isEditing,
      taskData,
      filteredTasks,
      toasts,
      handleSubmit,
      editTask,
      deleteTask,
      resetForm
    };
  }
};
</script>

<style scoped>
.task-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tabs button {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tabs button.active {
  background: rgba(0, 102, 255, 0.2);
  border-color: rgba(0, 102, 255, 0.3);
}

.task-form {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.task-form.editing {
  border-color: rgba(255, 193, 7, 0.3);
  box-shadow: 0 0 30px rgba(255, 193, 7, 0.1);
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(0, 255, 255, 0.9);
}

.admin-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.submit-button, .cancel-button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button {
  background: linear-gradient(135deg, #0066ff, #2e7bff);
  color: white;
  border: none;
}

.cancel-button {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.tasks-grid {
  display: grid;
  gap: 1rem;
}

.task-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.task-meta {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-button, .delete-button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-button {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.delete-button {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.no-tasks {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .task-container {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .task-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>