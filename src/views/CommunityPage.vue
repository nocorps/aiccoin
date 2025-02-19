<template>
  <div class="social-container">
    <h1>Join our Socials to get the latest updates</h1>
    
    <div class="social-link" @click="openLink(instagramLink)">
      <img :src="instagramIcon" alt="Instagram" class="icon" />
      <span>Follow us on Instagram</span>
    </div>

    <div class="social-link" @click="openLink(telegramLink)">
      <img :src="telegramIcon" alt="Telegram" class="icon" />
      <span>Join our Telegram Group</span>
    </div>

    <div class="social-link" @click="openLink(discorddLink)">
      <img :src="discordIcon" alt="Telegram" class="icon" />
      <span>Join our Discord Channel</span>
    </div>
    <div class="social-link" @click="openLink(youtubeLink)">
      <img :src="youtubeIcon" alt="Telegram" class="icon" />
      <span>Join our Youtube Channel</span>
    </div>
    <div class="social-link" @click="openLink(xLink)">
      <img :src="xIcon" alt="Telegram" class="icon" />
      <span>Follow us on X Page</span>
    </div>


    <div class="support">
  <span>Support Email: </span>
  <a href="mailto:aiccoin-support@nocorps.org">aiccoin-support@nocorps.org</a>
</div>
  </div>
</template>

<script>
import instagramIcon from "@/assets/insta.png"; // ✅ Correct way to import static assets
import telegramIcon from "@/assets/tg.png"; // ✅ Add more socials dynamically
import discordIcon from "@/assets/gg.png";
import youtubeIcon from "@/assets/yt.png";
import xIcon from "@/assets/x.png";

export default {
  data() {
    return {
      instagramLink: "https://www.instagram.com/yourprofile",
      telegramLink: "https://t.me/yourchannel",
      discordLink: "https://t.me/yourchannel",
      youtubeLink: "https://t.me/yourchannel",
      xLink: "https://t.me/yourchannel",
      instagramIcon,
      telegramIcon,
      discordIcon,
      youtubeIcon,
      xIcon

    };
  },
  methods: {
    openLink(url) {
      window.open(url, "_blank");
    }
  }
};
</script>

<style scoped>
.social-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #1d1d1d, #363636);
  color: #fff;
  font-family: "Roboto", sans-serif;
}

h1 {
  font-size: 22px;
  text-align: center;
}

.support a {
  color: #ffd700;
  text-decoration: none;
  font-weight: bold;
}
.support a:hover {
  text-decoration: underline;
}


.social-link {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 12px 15px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  transition: transform 0.2s, background 0.3s;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.icon {
  width: 35px;
  height: 35px;
  filter: drop-shadow(0 0 5px #ffd700);
}
</style>
