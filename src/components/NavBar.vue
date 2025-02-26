<template>
    <nav class="bottom-nav">
        <router-link to="/" class="nav-item">
            <i class="mdi mdi-home"></i>
            <span>Home</span>
        </router-link>
        
        <router-link to="/ranking" class="nav-item">
            <i class="mdi mdi-trophy"></i>
            <span>Ranking</span>
        </router-link>
        
        <router-link to="/tasks" class="nav-item">
            <i class="mdi mdi-clipboard-check"></i>
            <span>Tasks</span>
        </router-link>
        
        <router-link to="/referral" class="nav-item">
            <i class="mdi mdi-account-multiple"></i>
            <span>Referral</span>
        </router-link>
        
        <router-link to="/profile" class="nav-item">
            <i class="mdi mdi-account-circle"></i>
            <span>Profile</span>
        </router-link>
    </nav>
</template>

<script>
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref } from "vue";
import { useRouter } from "vue-router";
import '@mdi/font/css/materialdesignicons.css';

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
            isAuthenticated.value = false; // Ensures immediate UI update
            router.push("/login");
            closeMenu(); // Close menu on mobile after logout
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
/* Navbar Styles */


.bottom-nav {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: space-evenly;
    align-items: center; /* Add this to center items vertically */
    background: linear-gradient(
        145deg,
        rgba(16, 20, 24, 0.85),  /* Reduced opacity from 0.95 to 0.85 */
        rgba(0, 0, 0, 0.256)       /* Reduced opacity from 0.9 to 0.8 */
    );
    backdrop-filter: blur(15px);  /* Increased blur for better readability */
    padding: 14px 28px;
    border-radius: 25px;
    box-shadow: 
        0 10px 25px rgba(0, 0, 0, 0.2),  /* Reduced shadow opacity */
        0 0 20px rgba(0, 255, 255, 0.1),  /* Reduced glow opacity */
        inset 0 0 20px rgba(255, 255, 255, 0.03);  /* Reduced inner glow */
    border: 1px solid rgba(255, 255, 255, 0.08);   /* Reduced border opacity */
    z-index: 1000;
    width: 420px;
    margin: 0 auto; /* Add this to ensure horizontal centering */
}

/* Add padding to prevent content from being hidden behind bottom nav */
:deep(body) {
    padding-bottom: 120px; /* Adjust based on your bottom nav height */
    min-height: 100vh;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: rgba(0, 255, 255, 0.8);  /* Increased text opacity for better visibility */
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    padding: 8px 16px;
    position: relative;
}

.nav-item:hover,
.nav-item.router-link-active {
    color: rgba(0, 255, 255, 1);  /* Full opacity on hover/active */
    text-shadow: 0 0 15px rgba(0, 255, 255, 0.3);  /* Adjusted glow */
    transform: translateY(-3px);
}

.nav-item i {
    font-size: 26px;
    margin-bottom: 6px;
    filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.3));
}

.nav-item span {
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.nav-item::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: 0;
    height: 2px;
    background: #0ff;
    transition: all 0.3s ease;
    transform: translateX(-50%);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.nav-item:hover::after,
.nav-item.router-link-active::after {
    width: 70%;
}

@media (max-width: 768px) {
    .bottom-nav {
        width: 90%;
        max-width: 420px;
        bottom: 15px;
        padding: 12px 15px;
        margin: 0 auto;
        background: linear-gradient(
            145deg,
            rgba(16, 20, 24, 0),  /* Slightly higher opacity for mobile */
            rgba(0, 0, 0, 0)
        );
        backdrop-filter: blur(12px);
    }

    .nav-item {
        padding: 6px 8px;
    }

    .nav-item i {
        font-size: 22px;
    }

    .nav-item span {
        font-size: 10px;
    }
}
</style>