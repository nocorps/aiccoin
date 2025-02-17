<template>
  <div class="task-container">
    <h2>Available Tasks</h2>
    <ul class="task-list">
      <li v-for="task in availableTasks" :key="task.task_id" class="task-item">
        <h3>{{ task.title }}</h3>
        <p>{{ task.description }}</p>
        <p>Reward: <strong>{{ task.award }} coins</strong></p>
        <button v-if="!task.inProgress && !task.completed" @click="startTask(task)">Go</button>
        <button v-else-if="task.inProgress" @click="verifyTask(task)">Verify</button>
        <span v-else class="completed-text">✅ Completed</span>
      </li>
    </ul>

    <h2>Completed Tasks</h2>
    <ul class="task-list">
      <li v-for="task in completedTasks" :key="task.task_id" class="task-item">
        <h3>{{ task.title }}</h3>
        <p>{{ task.description }}</p>
        <p>Reward: <strong>{{ task.award }} coins</strong></p>
        <span class="completed-text">✅ Completed</span>
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
  max-width: 600px;
  margin: auto;
}
.task-list {
  list-style: none;
  padding: 0;
}
.task-item {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
.completed-text {
  color: green;
  font-weight: bold;
}
</style>
