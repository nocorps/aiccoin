<template>
    <nav>
        <div class="nav-container">
            <!-- Logo or App Name -->
            <router-link to="/" class="logo">AIC Coin</router-link>

            <!-- Hamburger Icon -->
            <div class="hamburger" @click="toggleMenu">
                <span :class="{ 'open': isMenuOpen }"></span>
                <span :class="{ 'open': isMenuOpen }"></span>
                <span :class="{ 'open': isMenuOpen }"></span>
            </div>

            <!-- Navigation Links -->
            <!-- <div :class="['nav-links', { 'active': isMenuOpen }]">
          <router-link to="/" @click="closeMenu">Home</router-link>
          <router-link to="/ranking" @click="closeMenu">Ranking</router-link>
          <router-link to="/community" @click="closeMenu">Community</router-link>
          <router-link to="/tasks" @click="closeMenu">Tasks</router-link>
          <router-link to="/profile" @click="closeMenu">Profile</router-link>
          <router-link to="/referral" @click="closeMenu">Referral</router-link>
          <button @click="logout" class="logout-btn">Logout</button>
        </div> -->
            <div :class="['nav-links', { 'active': isMenuOpen }]">
                <router-link to="/" @click="closeMenu">Home</router-link>
                <router-link to="/ranking" @click="closeMenu">Ranking</router-link>
                <router-link to="/community" @click="closeMenu">Community</router-link>
                <router-link to="/tasks" @click="closeMenu">Tasks</router-link>
                <router-link to="/profile" @click="closeMenu">Profile</router-link>
                <router-link to="/referral" @click="closeMenu">Referral</router-link>

                <!-- Conditionally render login/logout based on authentication state -->
                <button v-if="isAuthenticated" @click="logout" class="logout-btn">Logout</button>
                <router-link v-else to="/login" @click="closeMenu">Login</router-link>
            </div>
        </div>
    </nav>
</template>

<script>
// import { auth } from "../firebase";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { ref, onMounted } from "vue";
// import { useRouter } from "vue-router";

// export default {
//     setup() {
//         const isAuthenticated = ref(false);
//         const isMenuOpen = ref(false);
//         const router = useRouter();

//         onMounted(() => {
//             onAuthStateChanged(auth, (user) => {
//                 isAuthenticated.value = !!user;
//             });
//         });

//         const logout = async () => {
//             await signOut(auth);
//             router.push("/login");
//         };

//         const toggleMenu = () => {
//             isMenuOpen.value = !isMenuOpen.value;
//         };

//         const closeMenu = () => {
//             isMenuOpen.value = false;
//         };

//         return { isAuthenticated, logout, isMenuOpen, toggleMenu, closeMenu };
//     },
// };

import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const isAuthenticated = ref(false);
    const isMenuOpen = ref(false);
    const router = useRouter();

    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
      isAuthenticated.value = !!user;
    });

    const logout = async () => {
      await signOut(auth);
      isAuthenticated.value = false; // Ensure it updates immediately
      router.push("/login");
    };

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    const closeMenu = () => {
      isMenuOpen.value = false;
    };

    return { isAuthenticated, logout, isMenuOpen, toggleMenu, closeMenu };
  },
};
</script>

<style scoped>
/* General Navbar Styles */
nav {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(15px);
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
    /* position: fixed; */
    width: 100%;
    top: 0;
    left: 0;
    z-index: 1000;
}

.nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.logo {
    color: #0ff;
    font-size: 1.8rem;
    font-weight: bold;
    text-decoration: none;
    text-shadow: 0 0 10px #0ff;
}

/* Navigation Links */
.nav-links {
    display: flex;
    gap: 20px;
    align-items: center;
}

.nav-links a,
.logout-btn {
    color: #0ff;
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 5px;
    font-weight: bold;
    transition: all 0.3s ease-in-out;
}

.nav-links a:hover,
.logout-btn:hover {
    background: rgba(0, 255, 255, 0.2);
    text-shadow: 0 0 10px #0ff;
}

.logout-btn {
    background: linear-gradient(135deg, #ff416c, #ff4b2b);
    color: white;
    border: none;
    cursor: pointer;
}

/* Hamburger Icon */
.hamburger {
    display: none;
    flex-direction: column;
    cursor: pointer;
    gap: 5px;
}

.hamburger span {
    width: 25px;
    height: 3px;
    background: #0ff;
    border-radius: 2px;
    transition: all 0.3s ease-in-out;
}

/* Hamburger Animation */
.hamburger span.open:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
}

.hamburger span.open:nth-child(2) {
    opacity: 0;
}

.hamburger span.open:nth-child(3) {
    transform: rotate(-45deg) translate(5px, -5px);
}

/* Responsive Styles */
@media (max-width: 768px) {
    .hamburger {
        display: flex;
    }

    .nav-links {
        position: absolute;
        top: 60px;
        right: 0;
        background: rgba(0, 0, 0, 0.9);
        flex-direction: column;
        width: 200px;
        padding: 20px;
        gap: 15px;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
        border-radius: 10px 0 0 10px;
    }

    .nav-links.active {
        transform: translateX(0);
    }
}
</style>
