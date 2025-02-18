<template>
  <div class="task-container">
    <h2>📌 Available Tasks</h2>
    <ul class="task-list">
      <li v-for="task in availableTasks" :key="task.task_id" class="task-item">
        <h3>{{ task.title }}</h3>
        <p>{{ task.description }}</p>
        <p>🎁 Reward: <strong>{{ task.award }} coins</strong></p>
        <button v-if="!task.inProgress && !task.completed" @click="startTask(task)">🚀 Start</button>
        <button v-else-if="task.inProgress" @click="verifyTask(task)">✅ Verify</button>
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
  </div>
</template>

<script>
import { db, auth } from "@/firebase";
import { collection, getDocs, updateDoc, doc, arrayUnion, increment, getDoc } from "firebase/firestore";

export default {
  data() {
    return {
      tasks: [],
      userCompletedTasks: [],
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
    async verifyTask(task) {
      const userSecret = prompt("Enter the secret code:");
      if (userSecret === task.secret) {
        task.completed = true;
        task.inProgress = false;
        await this.updateUserTaskData(task);
        alert("Task verified! Reward added.");
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
</style>
