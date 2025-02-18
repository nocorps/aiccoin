<template>
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="register" class="register-form">
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
          <option value="Bahrain">Bahrain 🇧🇭</option>
          <option value="Bangladesh">Bangladesh 🇧🇩</option>
          <option value="Barbados">Barbados 🇧🇧</option>
          <option value="Belarus">Belarus 🇧🇾</option>
          <option value="Belgium">Belgium 🇧🇪</option>
          <option value="Belize">Belize 🇧🇿</option>
          <option value="Benin">Benin 🇧🇯</option>
          <option value="Bhutan">Bhutan 🇧🇹</option>
          <option value="Bolivia">Bolivia 🇧🇴</option>
          <option value="Bosnia and Herzegovina">Bosnia and Herzegovina 🇧🇦</option>
          <option value="Botswana">Botswana 🇧🇼</option>
          <option value="Brazil">Brazil 🇧🇷</option>
          <option value="Brunei">Brunei 🇧🇳</option>
          <option value="Bulgaria">Bulgaria 🇧🇬</option>
          <option value="Burkina Faso">Burkina Faso 🇧🇫</option>
          <option value="Burundi">Burundi 🇧🇮</option>
          <option value="Cabo Verde">Cabo Verde 🇨🇻</option>
          <option value="Cambodia">Cambodia 🇰🇭</option>
          <option value="Cameroon">Cameroon 🇨🇲</option>
          <option value="Canada">Canada 🇨🇦</option>
          <option value="Central African Republic">Central African Republic 🇨🇫</option>
          <option value="Chad">Chad 🇹🇩</option>
          <option value="Chile">Chile 🇨🇱</option>
          <option value="China">China 🇨🇳</option>
          <option value="Colombia">Colombia 🇨🇴</option>
          <option value="Comoros">Comoros 🇰🇲</option>
          <option value="Congo (Congo-Brazzaville)">Congo 🇨🇬</option>
          <option value="Congo (Democratic Republic)">Congo (Democratic Republic) 🇨🇩</option>
          <option value="Costa Rica">Costa Rica 🇨🇷</option>
          <option value="Croatia">Croatia 🇭🇷</option>
          <option value="Cuba">Cuba 🇨🇺</option>
          <option value="Cyprus">Cyprus 🇨🇾</option>
          <option value="Czech Republic (Czechia)">Czech Republic 🇨🇿</option>
          <option value="Denmark">Denmark 🇩🇰</option>
          <option value="Djibouti">Djibouti 🇩🇯</option>
          <option value="Dominica">Dominica 🇩🇲</option>
          <option value="Dominican Republic">Dominican Republic 🇩🇴</option>
          <option value="Ecuador">Ecuador 🇪🇨</option>
          <option value="Egypt">Egypt 🇪🇬</option>
          <option value="El Salvador">El Salvador 🇸🇻</option>
          <option value="Equatorial Guinea">Equatorial Guinea 🇬🇶</option>
          <option value="Eritrea">Eritrea 🇪🇷</option>
          <option value="Estonia">Estonia 🇪🇪</option>
          <option value="Eswatini">Eswatini 🇸🇿</option>
          <option value="Ethiopia">Ethiopia 🇪🇹</option>
          <option value="Fiji">Fiji 🇫🇯</option>
          <option value="Finland">Finland 🇫🇮</option>
          <option value="France">France 🇫🇷</option>
          <option value="Gabon">Gabon 🇬🇦</option>
          <option value="Gambia">Gambia 🇬🇲</option>
          <option value="Georgia">Georgia 🇬🇪</option>
          <option value="Germany">Germany 🇩🇪</option>
          <option value="Ghana">Ghana 🇬🇭</option>
          <option value="Greece">Greece 🇬🇷</option>
          <option value="Grenada">Grenada 🇬🇩</option>
          <option value="Guatemala">Guatemala 🇬🇹</option>
          <option value="Guinea">Guinea 🇬🇳</option>
          <option value="Guinea-Bissau">Guinea-Bissau 🇬🇼</option>
          <option value="Guyana">Guyana 🇬🇾</option>
          <option value="Haiti">Haiti 🇭🇹</option>
          <option value="Honduras">Honduras 🇭🇳</option>
          <option value="Hungary">Hungary 🇭🇺</option>
          <option value="Iceland">Iceland 🇮🇸</option>
          <option value="India">India 🇮🇳</option>
          <option value="Indonesia">Indonesia 🇮🇩</option>
          <option value="Iran">Iran 🇮🇷</option>
          <option value="Iraq">Iraq 🇮🇶</option>
          <option value="Ireland">Ireland 🇮🇪</option>
          <option value="Israel">Israel 🇮🇱</option>
          <option value="Italy">Italy 🇮🇹</option>
          <option value="Jamaica">Jamaica 🇯🇲</option>
          <option value="Japan">Japan 🇯🇵</option>
          <option value="Jordan">Jordan 🇯🇴</option>
          <option value="Kazakhstan">Kazakhstan 🇰🇿</option>
          <option value="Kenya">Kenya 🇰🇪</option>
          <option value="Kiribati">Kiribati 🇰🇮</option>
          <option value="Korea (North)">Korea (North) 🇰🇵</option>
          <option value="Korea (South)">Korea (South) 🇰🇷</option>
          <option value="Kuwait">Kuwait 🇰🇼</option>
          <option value="Kyrgyzstan">Kyrgyzstan 🇰🇬</option>
          <option value="Laos">Laos 🇱🇸</option>
          <option value="Latvia">Latvia 🇱🇻</option>
          <option value="Lebanon">Lebanon 🇱🇧</option>
          <option value="Lesotho">Lesotho 🇱🇸</option>
          <option value="Liberia">Liberia 🇱🇷</option>
          <option value="Libya">Libya 🇱🇾</option>
          <option value="Liechtenstein">Liechtenstein 🇱🇮</option>
          <option value="Lithuania">Lithuania 🇱🇹</option>
          <option value="Luxembourg">Luxembourg 🇱🇺</option>
          <option value="Madagascar">Madagascar 🇲🇬</option>
          <option value="Malawi">Malawi 🇲🇼</option>
          <option value="Malaysia">Malaysia 🇲🇾</option>
          <option value="Maldives">Maldives 🇲🇻</option>
          <option value="Mali">Mali 🇲🇱</option>
          <option value="Malta">Malta 🇲🇹</option>
          <option value="Marshall Islands">Marshall Islands 🇲🇭</option>
          <option value="Mauritania">Mauritania 🇲🇷</option>
          <option value="Mauritius">Mauritius 🇲🇺</option>
          <option value="Mexico">Mexico 🇲🇽</option>
          <option value="Micronesia">Micronesia 🇫🇲</option>
          <option value="Moldova">Moldova 🇲🇩</option>
          <option value="Monaco">Monaco 🇲🇨</option>
          <option value="Mongolia">Mongolia 🇲🇳</option>
          <option value="Montenegro">Montenegro 🇲🇪</option>
          <option value="Morocco">Morocco 🇲🇦</option>
          <option value="Mozambique">Mozambique 🇲🇿</option>
          <option value="Myanmar (Burma)">Myanmar (Burma) 🇲🇲</option>
          <option value="Namibia">Namibia 🇳🇦</option>
          <option value="Nauru">Nauru 🇳🇷</option>
          <option value="Nepal">Nepal 🇳🇵</option>
          <option value="Netherlands">Netherlands 🇳🇱</option>
          <option value="New Zealand">New Zealand 🇳🇿</option>
          <option value="Nicaragua">Nicaragua 🇳🇮</option>
          <option value="Niger">Niger 🇳🇪</option>
          <option value="Nigeria">Nigeria 🇳🇬</option>
          <option value="North Macedonia">North Macedonia 🇲🇰</option>
          <option value="Norway">Norway 🇳🇴</option>
          <option value="Oman">Oman 🇴🇲</option>
          <option value="Pakistan">Pakistan 🇵🇰</option>
          <option value="Palau">Palau 🇵🇼</option>
          <option value="Panama">Panama 🇵🇦</option>
          <option value="Papua New Guinea">Papua New Guinea 🇵🇬</option>
          <option value="Paraguay">Paraguay 🇵🇾</option>
          <option value="Peru">Peru 🇵🇪</option>
          <option value="Philippines">Philippines 🇵🇭</option>
          <option value="Poland">Poland 🇵🇱</option>
          <option value="Portugal">Portugal 🇵🇹</option>
          <option value="Qatar">Qatar 🇶🇦</option>
          <option value="Romania">Romania 🇷🇴</option>
          <option value="Russia">Russia 🇷🇺</option>
          <option value="Rwanda">Rwanda 🇷🇼</option>
          <option value="Saint Kitts and Nevis">Saint Kitts and Nevis 🇰🇳</option>
          <option value="Saint Lucia">Saint Lucia 🇱🇨</option>
          <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines 🇻🇨</option>
          <option value="Samoa">Samoa 🇼🇸</option>
          <option value="San Marino">San Marino 🇸🇲</option>
          <option value="Sao Tome and Principe">Sao Tome and Principe 🇸🇹</option>
          <option value="Saudi Arabia">Saudi Arabia 🇸🇦</option>
          <option value="Senegal">Senegal 🇸🇳</option>
          <option value="Serbia">Serbia 🇷🇸</option>
          <option value="Seychelles">Seychelles 🇸🇨</option>
          <option value="Sierra Leone">Sierra Leone 🇸🇱</option>
          <option value="Singapore">Singapore 🇸🇬</option>
          <option value="Slovakia">Slovakia 🇸🇰</option>
          <option value="Slovenia">Slovenia 🇸🇮</option>
          <option value="Solomon Islands">Solomon Islands 🇸🇧</option>
          <option value="Somalia">Somalia 🇸🇴</option>
          <option value="South Africa">South Africa 🇿🇦</option>
          <option value="South Sudan">South Sudan 🇸🇸</option>
          <option value="Spain">Spain 🇪🇸</option>
          <option value="Sri Lanka">Sri Lanka 🇱🇰</option>
          <option value="Sudan">Sudan 🇸🇩</option>
          <option value="Suriname">Suriname 🇸🇷</option>
          <option value="Sweden">Sweden 🇸🇪</option>
          <option value="Switzerland">Switzerland 🇨🇭</option>
          <option value="Syria">Syria 🇸🇾</option>
          <option value="Taiwan">Taiwan 🇹🇼</option>
          <option value="Tajikistan">Tajikistan 🇹🇯</option>
          <option value="Tanzania">Tanzania 🇹🇿</option>
          <option value="Thailand">Thailand 🇹🇭</option>
          <option value="Timor-Leste">Timor-Leste 🇹🇱</option>
          <option value="Togo">Togo 🇹🇬</option>
          <option value="Tonga">Tonga 🇹🇴</option>
          <option value="Trinidad and Tobago">Trinidad and Tobago 🇹🇹</option>
          <option value="Tunisia">Tunisia 🇹🇳</option>
          <option value="Turkey">Turkey 🇹🇷</option>
          <option value="Turkmenistan">Turkmenistan 🇹🇲</option>
          <option value="Tuvalu">Tuvalu 🇹🇻</option>
          <option value="Uganda">Uganda 🇺🇬</option>
          <option value="Ukraine">Ukraine 🇺🇦</option>
          <option value="United Arab Emirates">United Arab Emirates 🇦🇪</option>
          <option value="United Kingdom">United Kingdom 🇬🇧</option>
          <option value="United States of America">United States 🇺🇸</option>
          <option value="Uruguay">Uruguay 🇺🇾</option>
          <option value="Uzbekistan">Uzbekistan 🇺🇿</option>
          <option value="Vanuatu">Vanuatu 🇻🇺</option>
          <option value="Vatican City">Vatican City 🇻🇦</option>
          <option value="Venezuela">Venezuela 🇻🇪</option>
          <option value="Vietnam">Vietnam 🇻🇳</option>
          <option value="Yemen">Yemen 🇾🇪</option>
          <option value="Zambia">Zambia 🇿🇲</option>
          <option value="Zimbabwe">Zimbabwe 🇿🇼</option>

        </select>
      </div>

      <div class="input-group">
        <input v-model="referralCode" type="text" placeholder="Referral Code (Optional)" class="input-field" />
      </div>

      <div class="button-container">
        <button type="submit" class="submit-button">Register</button>
      </div>
    </form>
  </div>
</template>

<script>
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserDocument, updateReferralSystem } from '../models/userModel';
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

    // Auto-fill referral code from URL
    onMounted(() => {
      const urlParams = new URLSearchParams(window.location.search);
      referralCode.value = urlParams.get('ref') || '';
    });

    const register = async () => {
      if (password.value !== confirmPassword.value) {
        alert('Passwords do not match!');
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
        const userId = userCredential.user.uid;
        const newReferralCode = generateReferralCode();

        console.log("User Registered:", userId, email.value);
        console.log("Referral Code Used:", referralCode.value);


        // Store user data in Firebase
        await createUserDocument(userId, {
          name: name.value,
          email: email.value,
          country: country.value,
          referralCode: newReferralCode,
          referralUsed: referralCode.value || '',
          referredUsers: [],
          coinBalance: 0
        });

        // Handle Referral System
        if (referralCode.value) {
          console.log("Updating Referral System for", referralCode.value);
          await updateReferralSystem(referralCode.value, userId, email.value);
        }

        // Redirect after successful registration
        router.push('/');
      } catch (error) {
        alert(error.message);
      }
    };

    return { name, email, password, confirmPassword, country, referralCode, register };
  }
};
</script>

<style scoped>
.register-container {
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  /* Add margin to top */
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  /* align-items: center; */
  /* align-content: center; */
  text-align: center;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.register-form {
  display: flex;
  flex-direction: column;
  align-content: center;
  /* align-items: center; */
}

.input-group {
  margin-bottom: 15px;
}

.input-field {
  /* align-content: center; */
  align-items: center;
  width: 80%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: #fff;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #007BFF;
  outline: none;
}

select.input-field {
  height: 40px;
}

.button-container {
  text-align: center;
}

.submit-button {
  width: 80%;
  padding: 12px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-button:hover {
  background-color: #0056b3;
}
</style>
