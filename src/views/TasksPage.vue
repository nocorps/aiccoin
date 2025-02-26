<template>
  <div class="task-container">
    <h2>📌 Available Tasks</h2>
    <div class="task-list">
      <template v-if="availableTasks.length">
        <li v-for="task in availableTasks" :key="task.task_id" class="task-item">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
          <p>🎁 Reward: <strong>{{ task.award }} coins</strong></p>
          <button v-if="!task.inProgress && !task.completed" @click="startTask(task)">🚀 Start</button>
          <button v-else-if="task.inProgress" @click="openVerifyModal(task)">✅ Verify</button>
          <span v-else class="completed-text">✔️ Completed</span>
        </li>
      </template>
      <div v-else class="no-tasks">
        <div class="loading-icon">
          <i class="mdi mdi-clock-outline"></i>
        </div>
        <h3>New Tasks Coming Soon!</h3>
        <p>Stay tuned for exciting opportunities to earn more coins.</p>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <h2>🏆 Completed Tasks</h2>
    <ul class="task-list">
      <li v-for="task in completedTasks" :key="task.task_id" class="task-item completed">
        <h3>{{ task.title }}</h3>
        <p>{{ task.description }}</p>
        <p>🎁 Reward: <strong>{{ task.award }} coins</strong></p>
        <span class="completed-text">✔️ Completed</span>
      </li>
    </ul>

    <!-- Modal for Secret Code Verification -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>Enter the Secret Code</h3>
        <input v-model="enteredSecret" type="text" placeholder="Secret Code" class="modal-input" />
        <div class="modal-actions">
          <button @click="verifyTaskWithModal">Verify</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, auth } from "@/firebase";
import { collection, getDocs, updateDoc, doc, arrayUnion, increment, getDoc } from "firebase/firestore";
import { updateCoinBalance } from '../models/userModel';

export default {
  data() {
    return {
      tasks: [],
      userCompletedTasks: [],
      isModalOpen: false, // Controls the visibility of the modal
      enteredSecret: '',  // Holds the entered secret code
      currentTask: null,  // The task that is being verified
    };
  },
  async created() {
    await this.fetchTasks();
    await this.fetchUserData();
  },
  computed: {
    availableTasks() {
      return this.tasks.filter(task => !this.userCompletedTasks.includes(task.task_id));
    },
    completedTasks() {
      return this.tasks.filter(task => this.userCompletedTasks.includes(task.task_id));
    },
  },
  methods: {
    async fetchTasks() {
      const querySnapshot = await getDocs(collection(db, "tasks"));
      this.tasks = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        inProgress: false,
        completed: false,
      }));
    },
    async fetchUserData() {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          this.userCompletedTasks = userDoc.data().completedTasks || [];
        }
      }
    },
    startTask(task) {
      task.inProgress = true;
      window.open(task.url_redirect, "_blank");
    },
    openVerifyModal(task) {
      this.currentTask = task;  // Set the current task to be verified
      this.isModalOpen = true;   // Open the modal
    },
    closeModal() {
      this.isModalOpen = false;
      this.enteredSecret = ''; // Clear the entered secret
    },
    async verifyTaskWithModal() {
      if (this.enteredSecret === this.currentTask.secret) {
        try {
          // Update the UI state
          this.currentTask.completed = true;
          this.currentTask.inProgress = false;

          // Update the backend with task completion data
          await this.updateUserTaskData(this.currentTask);

          // Update coin balance
          await updateCoinBalance(
            auth.currentUser.uid, 
            this.currentTask.award,
            `Completed task: ${this.currentTask.title}`
          );

          // Close modal and show success message
          this.closeModal();
          alert("Task verified! Reward added.");
        } catch (error) {
          console.error("Error updating task status:", error);
          alert("Error updating task status. Please try again.");
        }
      } else {
        alert("Incorrect secret. Please try again.");
      }
    },
    async updateUserTaskData(task) {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          coinBalance: increment(task.award),
          taskCount: increment(1),
          completedTasks: arrayUnion(task.task_id),
        });
        this.userCompletedTasks.push(task.task_id);
      }
    },
  },
};
</script>

<style scoped>
.task-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  padding-bottom: 100px;
}

h2 {
  color: #fff;
  font-size: 1.5rem;
  margin: 1.5rem 0;
  text-align: center;
}

.task-list {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 1.5rem;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  list-style: none;
  margin-bottom: 2rem;
}

.task-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.task-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.1);
}

.task-item h3 {
  color: rgba(0, 255, 255, 0.9);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.task-item p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0;
}

.task-item strong {
  color: rgba(0, 255, 255, 0.9);
  font-weight: 600;
}

button {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  color: rgba(0, 255, 255, 0.7);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  margin-top: 1rem;
}

button:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.1);
}

.completed-text {
  color: rgba(0, 255, 255, 0.9);
  font-weight: 500;
  display: inline-block;
  margin-top: 1rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  padding: 2rem;
  border-radius: 25px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.15);
}

.modal-content h3 {
  color: rgba(0, 255, 255, 0.9);
  margin-bottom: 1.5rem;
}

.modal-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 15px;
  color: #fff;
  margin: 1rem 0;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions button {
  flex: 1;
  margin: 0;
}

.no-tasks {
  text-align: center;
  padding: 3rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.no-tasks h3 {
  color: rgba(0, 255, 255, 0.9);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  background: linear-gradient(45deg, #0ff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.no-tasks p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .task-container {
    padding: 0.75rem;
  }

  h2 {
    font-size: 1.25rem;
    margin: 1rem 0;
  }

  .task-list {
    padding: 1rem;
    border-radius: 20px;
  }

  .task-item {
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .task-item h3 {
    font-size: 1.1rem;
  }

  button {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  .modal-input {
    padding: 0.6rem;
  }

  .no-tasks {
    padding: 2rem 1rem;
  }

  .no-tasks h3 {
    font-size: 1.25rem;
  }

  .no-tasks p {
    font-size: 0.95rem;
  }
}
</style>
