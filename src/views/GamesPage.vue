<template>
    <div class="games-container">
        <h1 class="games-title">Mini Games</h1>
        <div class="games-grid">
            <div v-for="game in games" :key="game.id" class="game-card">
                <div class="game-icon">
                    <i :class="game.icon"></i>
                </div>
                <h3>{{ game.name }}</h3>
                <p>{{ game.description }}</p>
                <div class="game-stats" v-if="gameStats[game.statsKey]">
                    <span class="stat">
                        <i class="mdi mdi-trophy"></i>
                        {{ gameStats[game.statsKey].wins || 0 }}
                    </span>
                    <span class="stat">
                        <i class="mdi mdi-coin"></i>
                        {{ gameStats[game.statsKey].earnings || 0 }}
                    </span>
                </div>
                <button @click="playGame(game.id)" class="play-button">
                    Play Now
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, onMounted } from 'vue';

export default {
    name: 'GamesPage',
    setup() {
        const router = useRouter();
        const gameStats = ref({
            coinFlip: { wins: 0, losses: 0, earnings: 0 },
            numberGuess: { wins: 0, losses: 0, earnings: 0 },
            scratchCard: { wins: 0, losses: 0, earnings: 0 },
            spinWheel: { wins: 0, losses: 0, earnings: 0 }
        });

        const loadGameStats = async () => {
            const userId = auth.currentUser?.uid;
            if (userId) {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists() && userDoc.data().gameStats) {
                    gameStats.value = userDoc.data().gameStats;
                }
            }
        };

        onMounted(() => {
            loadGameStats();
        });

        return {
            router,
            gameStats
        };
    },
    data() {
        return {
            games: [
                {
                    id: 1,
                    name: 'Coin Flip',
                    description: 'Double your coins with this classic game of chance',
                    icon: 'mdi mdi-coin',
                    route: '/games/coin-flip',
                    statsKey: 'coinFlip'
                },
                // {
                //     id: 2,
                //     name: 'Number Guess',
                //     description: 'Guess the correct number to win coins',
                //     icon: 'mdi mdi-numeric',
                //     route: '/games/number-guess',
                //     statsKey: 'numberGuess'
                // },
                // {
                //     id: 3,
                //     name: 'Scratch Card',
                //     description: 'Scratch and win instant coins',
                //     icon: 'mdi mdi-card',
                //     route: '/games/scratch-card',
                //     statsKey: 'scratchCard'
                // },
                {
                    id: 2,
                    name: 'Spin Wheel',
                    description: 'Spin the wheel for a chance to win big',
                    icon: 'mdi mdi-wheel-fast',
                    route: '/games/spin-wheel',
                    statsKey: 'spinWheel'
                }
            ]
        }
    },
    methods: {
        playGame(gameId) {
            const game = this.games.find(g => g.id === gameId);
            if (game) {
                this.router.push(game.route);
            }
        }
    }
}
</script>

<style scoped>
.games-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.games-title {
    text-align: center;
    color: #0ff;
    margin-bottom: 30px;
    font-size: 2rem;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
    padding: 20px;
}

.game-card {
    background: linear-gradient(145deg, rgba(16, 20, 24, 0.85), rgba(0, 0, 0, 0.256));
    backdrop-filter: blur(15px);
    border-radius: 20px;
    padding: 25px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.game-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #0ff, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.game-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.game-card:hover::before {
    opacity: 1;
}

.game-icon {
    background: rgba(0, 255, 255, 0.1);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
}

.game-card i {
    font-size: 40px;
    color: #0ff;
}

.game-card h3 {
    color: #0ff;
    margin-bottom: 10px;
    font-size: 1.4rem;
}

.game-card p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 20px;
    font-size: 0.9rem;
    line-height: 1.4;
}

.game-stats {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
}

.stat {
    display: flex;
    align-items: center;
    gap: 5px;
    color: rgba(0, 255, 255, 0.8);
    font-size: 0.9rem;
}

.play-button {
    background: linear-gradient(45deg, #0ff, #00b3b3);
    border: none;
    border-radius: 25px;
    padding: 12px 30px;
    color: #000;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.9rem;
}

.play-button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

@media (max-width: 768px) {
    .games-grid {
        grid-template-columns: 1fr;
        padding: 10px;
        gap: 15px;
    }

    .games-title {
        font-size: 1.5rem;
    }

    .game-card {
        padding: 20px;
    }

    .game-icon {
        width: 60px;
        height: 60px;
    }

    .game-card i {
        font-size: 30px;
    }
}
</style>