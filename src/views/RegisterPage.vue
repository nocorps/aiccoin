<template>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="validateAndRegister" class="register-form">
      <div v-if="errors.length" class="error-container">
        <div v-for="error in errors" :key="error" class="error-message">
          {{ error }}
        </div>
      </div>
      <div class="input-group">
        <input v-model="name" type="text" placeholder="Your Name" required class="input-field" />
      </div>

      <div class="input-group">
        <input v-model="email" type="email" placeholder="Your Email" required class="input-field" />
      </div>

      <div class="input-group">
        <input v-model="password" type="password" placeholder="Password" required class="input-field" />
      </div>

      <div class="input-group">
        <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required class="input-field" />
      </div>

      <div class="input-group">
        <select v-model="country" required class="input-field">
          <option value="" disabled>Select Your Country</option>
          <option value="Afghanistan">Afghanistan 🇦🇫</option>
          <option value="Albania">Albania 🇦🇱</option>
          <option value="Algeria">Algeria 🇩🇿</option>
          <option value="Andorra">Andorra 🇦🇩</option>
          <option value="Angola">Angola 🇦🇴</option>
          <option value="Antigua and Barbuda">Antigua and Barbuda 🇦🇬</option>
          <option value="Argentina">Argentina 🇦🇷</option>
          <option value="Armenia">Armenia 🇦🇲</option>
          <option value="Australia">Australia 🇦🇺</option>
          <option value="Austria">Austria 🇦🇹</option>
          <option value="Azerbaijan">Azerbaijan 🇦🇿</option>
          <option value="Bahamas">Bahamas 🇧🇸</option>
          <option value="Bahrain">Bahrain 🇧ḧ</option>
          <option value="Bangladesh">Bangladesh 🇧🇩</option>
          <option value="Barbados">Barbados 🇧🇧</option>
          <option value="Belarus">Belarus 🇧🇾</option>
          <option value="Belgium">Belgium 🇧🇪</option>
          <option value="Belize">Belize 🇧🇿</option>
          <option value="Benin">Benin 🇧ḯ</option>
          <option value="Bhutan">Bhutan 🇧ṯ</option>
          <option value="Bolivia">Bolivia 🇧ṏ</option>
          <option value="Bosnia and Herzegovina">Bosnia and Herzegovina 🇧ḁ</option>
          <option value="Botswana">Botswana 🇧ẃ</option>
          <option value="Brazil">Brazil 🇧ṙ</option>
          <option value="Brunei">Brunei 🇧ṉ</option>
          <option value="Bulgaria">Bulgaria 🇧ḡ</option>
          <option value="Burkina Faso">Burkina Faso 🇧ḟ</option>
          <option value="Burundi">Burundi 🇧ḯ</option>
          <option value="Cabo Verde">Cabo Verde 🇨ṽ</option>
          <option value="Cambodia">Cambodia 🇰ḣ</option>
          <option value="Cameroon">Cameroon 🇨ḿ</option>
          <option value="Canada">Canada 🇨ḁ</option>
          <option value="Central African Republic">Central African Republic 🇨ḟ</option>
          <option value="Chad">Chad 🇹ḏ</option>
          <option value="Chile">Chile 🇨ḷ</option>
          <option value="China">China 🇨ṉ</option>
          <option value="Colombia">Colombia 🇨ṏ</option>
          <option value="Comoros">Comoros 🇰ḿ</option>
          <option value="Congo (Congo-Brazzaville)">Congo 🇨ḡ</option>
          <option value="Congo (Democratic Republic)">Congo (Democratic Republic) 🇨ḏ</option>
          <option value="Costa Rica">Costa Rica 🇨ṙ</option>
          <option value="Croatia">Croatia 🇭ṙ</option>
          <option value="Cuba">Cuba 🇨ṳ</option>
          <option value="Cyprus">Cyprus 🇨ẏ</option>
          <option value="Czech Republic (Czechia)">Czech Republic 🇨ẓ</option>
          <option value="Denmark">Denmark 🇩ḳ</option>
          <option value="Djibouti">Djibouti 🇩ḯ</option>
          <option value="Dominica">Dominica 🇩ḿ</option>
          <option value="Dominican Republic">Dominican Republic 🇩ḯ</option>
          <option value="Ecuador">Ecuador 🇪ḉ</option>
          <option value="Egypt">Egypt 🇪ḡ</option>
          <option value="El Salvador">El Salvador 🇸ṽ</option>
          <option value="Equatorial Guinea">Equatorial Guinea 🇬ṳ</option>
          <option value="Eritrea">Eritrea 🇪ṙ</option>
          <option value="Estonia">Estonia 🇪ḝ</option>
          <option value="Eswatini">Eswatini 🇸ẓ</option>
          <option value="Ethiopia">Ethiopia 🇪ṯ</option>
          <option value="Fiji">Fiji 🇫ḯ</option>
          <option value="Finland">Finland 🇫ḯ</option>
          <option value="France">France 🇫ṙ</option>
          <option value="Gabon">Gabon 🇬ḁ</option>
          <option value="Gambia">Gambia 🇬ḿ</option>
          <option value="Georgia">Georgia 🇬ḛ</option>
          <option value="Germany">Germany 🇩ḛ</option>
          <option value="Ghana">Ghana 🇬ḧ</option>
          <option value="Greece">Greece 🇬ṙ</option>
          <option value="Grenada">Grenada 🇬ḏ</option>
          <option value="Guatemala">Guatemala 🇬ṯ</option>
          <option value="Guinea">Guinea 🇬ḯ</option>
          <option value="Guinea-Bissau">Guinea-Bissau 🇬ẃ</option>
          <option value="Guyana">Guyana 🇬ẏ</option>
          <option value="Haiti">Haiti 🇭ḯ</option>
          <option value="Honduras">Honduras 🇭ḯ</option>
          <option value="Hungary">Hungary 🇭ṳ</option>
          <option value="Iceland">Iceland 🇮ṡ</option>
          <option value="India">India 🇮ṉ</option>
          <option value="Indonesia">Indonesia 🇮ḏ</option>
          <option value="Iran">Iran 🇮ṟ</option>
          <option value="Iraq">Iraq 🇮ṯ</option>
          <option value="Ireland">Ireland 🇮ḛ</option>
          <option value="Israel">Israel 🇮ḷ</option>
          <option value="Italy">Italy 🇮ṯ</option>
          <option value="Jamaica">Jamaica 🇯ḿ</option>
          <option value="Japan">Japan 🇯ṗ</option>
          <option value="Jordan">Jordan 🇯ṏ</option>
          <option value="Kazakhstan">Kazakhstan 🇰ẓ</option>
          <option value="Kenya">Kenya 🇰ḛ</option>
          <option value="Kiribati">Kiribati 🇰ḯ</option>
          <option value="Korea (North)">Korea (North) 🇰ṗ</option>
          <option value="Korea (South)">Korea (South) 🇰ṙ</option>
          <option value="Kuwait">Kuwait 🇰ẃ</option>
          <option value="Kyrgyzstan">Kyrgyzstan 🇰ḡ</option>
          <option value="Laos">Laos 🇱ṡ</option>
          <option value="Latvia">Latvia 🇱ṽ</option>
          <option value="Lebanon">Lebanon 🇱ḇ</option>
          <option value="Lesotho">Lesotho 🇱ṡ</option>
          <option value="Liberia">Liberia 🇱ṟ</option>
          <option value="Libya">Libya 🇱ẏ</option>
          <option value="Liechtenstein">Liechtenstein 🇱ḯ</option>
          <option value="Lithuania">Lithuania 🇱ṯ</option>
          <option value="Luxembourg">Luxembourg 🇱ṳ</option>
          <option value="Madagascar">Madagascar 🇲ḡ</option>
          <option value="Malawi">Malawi 🇲ẃ</option>
          <option value="Malaysia">Malaysia 🇲ẏ</option>
          <option value="Maldives">Maldives 🇲ṽ</option>
          <option value="Mali">Mali 🇲ḯ</option>
          <option value="Malta">Malta 🇲ṯ</option>
          <option value="Marshall Islands">Marshall Islands 🇲ḣ</option>
          <option value="Mauritania">Mauritania 🇲ṟ</option>
          <option value="Mauritius">Mauritius 🇲ṳ</option>
          <option value="Mexico">Mexico 🇲ẋ</option>
          <option value="Micronesia">Micronesia 🇫ḿ</option>
          <option value="Moldova">Moldova 🇲ḏ</option>
          <option value="Monaco">Monaco 🇲ḉ</option>
          <option value="Mongolia">Mongolia 🇲ṉ</option>
          <option value="Montenegro">Montenegro 🇲ḛ</option>
          <option value="Morocco">Morocco 🇲ḁ</option>
          <option value="Mozambique">Mozambique 🇲ẓ</option>
          <option value="Myanmar (Burma)">Myanmar (Burma) 🇲ḿ</option>
          <option value="Namibia">Namibia 🇳ḁ</option>
          <option value="Nauru">Nauru 🇳ṟ</option>
          <option value="Nepal">Nepal 🇳ṗ</option>
          <option value="Netherlands">Netherlands 🇳ḷ</option>
          <option value="New Zealand">New Zealand 🇳ẓ</option>
          <option value="Nicaragua">Nicaragua 🇳ḯ</option>
          <option value="Niger">Niger 🇳ḛ</option>
          <option value="Nigeria">Nigeria 🇳ḡ</option>
          <option value="North Macedonia">North Macedonia 🇲ḳ</option>
          <option value="Norway">Norway 🇳ṏ</option>
          <option value="Oman">Oman 🇴🇲</option>
          <option value="Pakistan">Pakistan 🇵ḳ</option>
          <option value="Palau">Palau 🇵ẃ</option>
          <option value="Panama">Panama 🇵ḁ</option>
          <option value="Papua New Guinea">Papua New Guinea 🇵ḡ</option>
          <option value="Paraguay">Paraguay 🇵ẏ</option>
          <option value="Peru">Peru 🇵ḗ</option>
          <option value="Philippines">Philippines 🇵ḣ</option>
          <option value="Poland">Poland 🇵ḷ</option>
          <option value="Portugal">Portugal 🇵ṯ</option>
          <option value="Qatar">Qatar 🇶ḁ</option>
          <option value="Romania">Romania 🇷ṑ</option>
          <option value="Russia">Russia 🇷ṙ</option>
          <option value="Rwanda">Rwanda 🇷ẃ</option>
          <option value="Saint Kitts and Nevis">Saint Kitts and Nevis 🇰ṉ</option>
          <option value="Saint Lucia">Saint Lucia 🇱ḉ</option>
          <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines 🇻ḉ</option>
          <option value="Samoa">Samoa 🇼ṡ</option>
          <option value="San Marino">San Marino 🇸ḿ</option>
          <option value="Sao Tome and Principe">Sao Tome and Principe 🇸ṯ</option>
          <option value="Saudi Arabia">Saudi Arabia 🇸ḁ</option>
          <option value="Senegal">Senegal 🇸ḿ</option>
          <option value="Serbia">Serbia 🇷ṡ</option>
          <option value="Seychelles">Seychelles 🇸ḉ</option>
          <option value="Sierra Leone">Sierra Leone 🇸ḷ</option>
          <option value="Singapore">Singapore 🇸ḡ</option>
          <option value="Slovakia">Slovakia 🇸ḳ</option>
          <option value="Slovenia">Slovenia 🇸ḯ</option>
          <option value="Solomon Islands">Solomon Islands 🇸ḇ</option>
          <option value="Somalia">Somalia 🇸ṏ</option>
          <option value="South Africa">South Africa 🇿ḁ</option>
          <option value="South Sudan">South Sudan 🇸ṡ</option>
          <option value="Spain">Spain 🇪ṡ</option>
          <option value="Sri Lanka">Sri Lanka 🇱ḳ</option>
          <option value="Sudan">Sudan 🇸ḏ</option>
          <option value="Suriname">Suriname 🇸ṙ</option>
          <option value="Sweden">Sweden 🇸ḛ</option>
          <option value="Switzerland">Switzerland 🇨ḭ</option>
          <option value="Syria">Syria 🇸ẏ</option>
          <option value="Taiwan">Taiwan 🇹ẃ</option>
          <option value="Tajikistan">Tajikistan 🇹ẏ</option>
          <option value="Tanzania">Tanzania 🇹ẓ</option>
          <option value="Thailand">Thailand 🇹ḣ</option>
          <option value="Timor-Leste">Timor-Leste 🇹ḷ</option>
          <option value="Togo">Togo 🇹ḡ</option>
          <option value="Tonga">Tonga 🇹ṏ</option>
          <option value="Trinidad and Tobago">Trinidad and Tobago 🇹ṯ</option>
          <option value="Tunisia">Tunisia 🇹ṉ</option>
          <option value="Turkey">Turkey 🇹ṙ</option>
          <option value="Turkmenistan">Turkmenistan 🇹ḿ</option>
          <option value="Tuvalu">Tuvalu 🇹ṽ</option>
          <option value="Uganda">Uganda 🇺ḡ</option>
          <option value="Ukraine">Ukraine 🇺ḁ</option>
          <option value="United Arab Emirates">United Arab Emirates 🇦ḛ</option>
          <option value="United Kingdom">United Kingdom 🇬ḇ</option>
          <option value="United States of America">United States 🇺🇸</option>
          <option value="Uruguay">Uruguay 🇺ṳ</option>
          <option value="Uzbekistan">Uzbekistan 🇺ẓ</option>
          <option value="Vanuatu">Vanuatu 🇻ṳ</option>
          <option value="Vatican City">Vatican City 🇻ḁ</option>
          <option value="Venezuela">Venezuela 🇻ḛ</option>
          <option value="Vietnam">Vietnam 🇻ṉ</option>
          <option value="Yemen">Yemen 🇾ḛ</option>
          <option value="Zambia">Zambia 🇿ḿ</option>
          <option value="Zimbabwe">Zimbabwe 🇿ẃ</option>
        </select>
      </div>

      <div class="input-group">
        <input v-model="referralCode" type="text" placeholder="Referral Code (Optional)" class="input-field" />
      </div>

      <div class="button-container">
        <button type="submit" class="submit-button" :disabled="isSubmitting">Register</button>
      </div>

      <div class="login-link">
        Already have an account?
        <router-link to="/login" class="link">Login here</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserDocument, updateReferralSystem, updateCoinBalance } from '../models/userModel';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const referralCode = ref('');
    const country = ref('');
    const router = useRouter();

    // Generate Unique Referral Code
    const generateReferralCode = () => 'REF' + Math.random().toString(36).substring(2, 12).toUpperCase();

    // Auto-fill referral code from URL or Telegram WebApp
    onMounted(() => {
      // Check URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const urlRef = urlParams.get('ref');

      // Check Telegram WebApp data
      const tgWebApp = window.Telegram?.WebApp;
      if (tgWebApp) {
        try {
          const startParam = tgWebApp.initDataUnsafe?.start_param;
          if (startParam) {
            referralCode.value = startParam;
          } else if (urlRef) {
            referralCode.value = urlRef;
          }
        } catch (error) {
          console.error('Error getting Telegram start parameter:', error);
          if (urlRef) referralCode.value = urlRef;
        }
      } else {
        // Fallback to URL parameter if Telegram WebApp is not available
        if (urlRef) referralCode.value = urlRef;
      }
    });

    // Add new refs for validation
    const errors = ref([]);
    const isSubmitting = ref(false);

    const validateForm = () => {
      errors.value = [];

      // Name validation
      if (!name.value.trim()) {
        errors.value.push('Name is required');
      } else if (name.value.length < 2) {
        errors.value.push('Name must be at least 2 characters long');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value) {
        errors.value.push('Email is required');
      } else if (!emailRegex.test(email.value)) {
        errors.value.push('Please enter a valid email address');
      }

      // Password validation
      if (!password.value) {
        errors.value.push('Password is required');
      } else if (password.value.length < 8) {
        errors.value.push('Password must be at least 8 characters long');
      } else if (!/(?=.*[A-Z])/.test(password.value)) {
        errors.value.push('Password must contain at least one uppercase letter');
      } else if (!/(?=.*[0-9])/.test(password.value)) {
        errors.value.push('Password must contain at least one number');
      }

      // Confirm password validation
      if (password.value !== confirmPassword.value) {
        errors.value.push('Passwords do not match');
      }

      // Country validation
      if (!country.value) {
        errors.value.push('Please select your country');
      }

      return errors.value.length === 0;
    };

    const validateAndRegister = async () => {
      if (isSubmitting.value) return;
      
      if (!validateForm()) {
        // Add timeout to clear errors after 10 seconds
        setTimeout(() => {
          errors.value = [];
        }, 10000);
        return;
      }

      isSubmitting.value = true;
      errors.value = [];

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const userId = userCredential.user.uid;
        const newReferralCode = generateReferralCode();

        console.log("User Registered:", userId, email.value);
        console.log("Referral Code Used:", referralCode.value);

        // Generate a random initial coin balance (e.g., 80,000)
        const randomCoinBalance = Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;

        // Store user data in Firebase
        await createUserDocument(userId, {
          name: name.value,
          email: email.value,
          country: country.value,
          referralCode: newReferralCode,
          referralUsed: referralCode.value || '',
          coinBalance: randomCoinBalance
        });

        // Handle Referral System
        if (referralCode.value) {
          console.log("Updating Referral System for", referralCode.value);
          await updateReferralSystem(referralCode.value, userId, email.value, randomCoinBalance);
        }
        await updateCoinBalance(userId, 1000, 'Welcome bonus');
        // Redirect after successful registration
        router.push('/');
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          errors.value.push('This email address is already registered. Please login instead.');
        } else if (error.code === 'auth/weak-password') {
          errors.value.push('Password is too weak. Please choose a stronger password.');
        } else {
          errors.value.push('Registration failed. Please try again later.', error.message);
        }
        // Add timeout to clear errors after 10 seconds
        setTimeout(() => {
          errors.value = [];
        }, 10000);
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      name,
      email,
      password,
      confirmPassword,
      country,
      referralCode,
      validateAndRegister, // Changed from register to validateAndRegister
      errors,
      isSubmitting
    };
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  /* Change from center to flex-start */
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(145deg, #1d1d1d, #2d2d2d);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  /* Add position relative */
}

h2 {
  font-size: 2.2rem;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(45deg, #0ff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  font-weight: 600;
  letter-spacing: 1px;
}

.register-form {
  background: linear-gradient(145deg, rgba(16, 20, 24, 0.95), rgba(0, 0, 0, 0.9));
  backdrop-filter: blur(15px);
  border-radius: 30px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(0, 255, 255, 0.1),
    inset 0 0 30px rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: formAppear 0.6s ease-out;
}

.input-group {
  margin-bottom: 1.25rem;
  /* Increased margin between input groups */
  position: relative;
  width: 100%;
}

.input-group:last-of-type {
  margin-bottom: 1.5rem;
  /* Extra space before the submit button */
}

.input-field {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.15);
  border-radius: 16px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  margin: 0;
  /* Reset any default margins */
}

.input-field:focus {
  outline: none;
  border-color: rgba(0, 255, 255, 0.4);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(45deg,
      rgba(0, 255, 255, 0.1),
      rgba(0, 200, 255, 0.15));
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 16px;
  color: rgba(0, 255, 255, 0.9);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  margin-top: 1.5rem;
  letter-spacing: 1px;
}

.submit-button:hover {
  background: linear-gradient(45deg,
      rgba(0, 255, 255, 0.15),
      rgba(0, 200, 255, 0.2));
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 255, 255, 0.15);
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.link {
  color: rgba(0, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-left: 0.5rem;
  position: relative;
}

.link:after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 0;
  background: rgba(0, 255, 255, 0.8);
  transition: width 0.3s ease;
}

.link:hover:after {
  width: 100%;
}

@keyframes formAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
    height: auto;
    /* Change min-height to height: auto */
    justify-content: flex-start;
    padding-top: 2rem;
    /* Add some top padding */
  }

  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    margin-top: 1rem;
    /* Add top margin */
  }

  .register-form {
    width: 100%;
    max-width: 100%;
    /* Ensure form takes full width on mobile */
    padding: 1.5rem;
    margin: 0 auto;
    border-radius: 20px;
    overflow-y: auto;
    /* Add scroll for long forms */
    -webkit-overflow-scrolling: touch;
  }

  .input-field {
    width: 100%;
    font-size: 16px;
    /* Prevent iOS zoom on focus */
    padding: 12px 14px;
    font-size: 0.95rem;
  }

  .submit-button {
    padding: 12px;
    font-size: 1rem;
  }

  .input-group {
    margin-bottom: 1rem;
    /* Slightly reduced spacing on mobile */
  }

  .input-group:last-of-type {
    margin-bottom: 1.25rem;
  }

  select.input-field {
    background-size: 16px;
    padding-right: 40px;
    /* Space for dropdown arrow */
    font-size: 0.95rem;
  }
}

::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset;
  transition: background-color 5000s ease-in-out 0s;
}

select.input-field {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.15);
  border-radius: 16px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='rgba(0, 255, 255, 0.7)'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 20px;
  padding-right: 45px;
}

select.input-field option {
  background-color: #1d1d1d;
  color: #fff;
  padding: 12px;
  font-size: 1rem;
}

select.input-field:focus {
  outline: none;
  border-color: rgba(0, 255, 255, 0.4);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.05);
}

select.input-field:hover {
  border-color: rgba(0, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.05);
}

/* Style for disabled placeholder option */
select.input-field option[value=""] {
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  select.input-field {
    background-size: 16px;
    padding-right: 40px;
    font-size: 0.95rem;
  }
}

/* Add touch-friendly styles */
@media (hover: none) {
  .input-field:focus {
    font-size: 16px !important;
  }

  .submit-button {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}

.error-container {
  width: 100%;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease-in-out;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.2);
  color: #ff4444;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  text-align: left;
  animation: fadeInAndShake 0.5s ease-in-out;
  position: relative;
  overflow: hidden;
}

.error-message::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: rgba(255, 68, 68, 0.5);
  width: 100%;
  animation: countdown 10s linear forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
}

@keyframes countdown {
  from { width: 100%; }
  to { width: 0%; }
}

@keyframes fadeInAndShake {
  0% { 
    opacity: 0;
    transform: translateY(-10px);
  }
  50% { 
    opacity: 1;
    transform: translateY(0);
  }
  60% { transform: translateX(-5px); }
  70% { transform: translateX(5px); }
  80% { transform: translateX(-2px); }
  90% { transform: translateX(2px); }
  100% { transform: translateX(0); }
}

/* Disable submit button while submitting */
.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
