<template>
    <div v-if="isVisible" class="alert-modal">
      <div class="modal-content">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <button @click="closeAlert">Close</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isVisible: false,
        title: "",
        message: ""
      };
    },
    methods: {
      showAlert(title, message) {
        this.title = title;
        this.message = message;
        this.isVisible = true;
      },
      closeAlert() {
        this.isVisible = false;
      }
    }
  };
  </script>
  
  <style scoped>
  .alert-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    text-align: center;
  }
  button {
    background-color: #007bff;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  </style>
  