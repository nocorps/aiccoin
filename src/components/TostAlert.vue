<template>
    <transition-group name="toast" tag="div" class="toast-container">
        <div v-for="toast in toasts" :key="toast.id" :class="['toast', toast.type]">
            {{ toast.message }}
        </div>
    </transition-group>
</template>

<script>
export default {
    props: {
        toasts: {
            type: Array,
            required: true
        }
    }
}
</script>

<style scoped>
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
}

.toast {
    padding: 1rem 1.5rem;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    color: white;
    min-width: 250px;
    animation: slideIn 0.5s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(5px);
}

.success {
    background: rgba(46, 213, 115, 0.9);
    border: 1px solid rgba(46, 213, 115, 0.2);
}

.error {
    background: rgba(255, 71, 87, 0.9);
    border: 1px solid rgba(255, 71, 87, 0.2);
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.5s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>