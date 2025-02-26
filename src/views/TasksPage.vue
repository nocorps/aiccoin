<template>
  <div class="task-container">
    <h2>📌 Available Tasks</h2>
    <ul class="task-list">
      <li v-for="task in availableTasks" :key="task.task_id" class="task-item">
        <h3>{{ task.title }}</h3>
        <p>{{ task.description }}</p>
        <p>🎁 Reward: <strong>{{ task.award }} coins</strong></p>
        <button v-if="!task.inProgress && !task.completed" @click="startTask(task)">🚀 Start</button>
        <button v-else-if="task.inProgress" @click="openVerifyModal(task)">✅ Verify</button>
        <span v-else class="completed-text">✔️ Completed</span>
      </li>
    </ul>

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
        this.currentTask.completed = true;
        this.currentTask.inProgress = false;
        await updateCoinBalance(auth.currentUser.uid, this.currentTask.award,
          `Completed task: ${this.currentTask.title}`);
        alert("Task verified! Reward added.");
        this.closeModal();
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
  background: #121212;
  color: #e0e0e0;
  padding: 20px;
  border-radius: 10px;
}

.task-list {
  list-style: none;
  padding: 0;
}

.task-item {
  background: #1e1e1e;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0px 0px 5px rgba(255, 255, 255, 0.1);
}

.task-item.completed {
  background: #2a2a2a;
  border-left: 5px solid #4caf50;
}

button {
  padding: 10px;
  margin-top: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background: #0056b3;
}

.completed-text {
  color: #4caf50;
  font-weight: bold;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 300px;
}

.modal-input {
  width: 80%;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.modal-actions button {
  background: #007bff;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-actions button:hover {
  background: #0056b3;
}
</style>
