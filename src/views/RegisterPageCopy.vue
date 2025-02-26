<template>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
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
            <option value="Bahrain">Bahrain 🇧ḧ</option>
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
            <option value="Djibouti">Djibouti 🇩ḯ</option>
            <option value="Dominica">Dominica 🇩ḿ</option>
            <option value="Dominican Republic">Dominican Republic 🇩ḯ</option>
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
            <option value="Gambia">Gambia 🇬ḿ</option>
            <option value="Georgia">Georgia 🇬ḛ</option>
            <option value="Germany">Germany 🇩ḛ</option>
            <option value="Ghana">Ghana 🇬ḧ</option>
            <option value="Greece">Greece 🇬🇷</option>
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
  
          // Generate a random initial coin balance (e.g., 80,000)
          const randomCoinBalance = Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;;
  
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
    padding: 25px;
    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
    border-radius: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    text-align: center;
    color: #fff;
  }
  
  h2 {
    font-size: 28px;
    margin-bottom: 30px;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .register-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .input-group {
    width: 100%;
    max-width: 400px;
  }
  
  .input-field {
    width: 100%;
    padding: 15px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-size: 16px;
    background-color: rgba(255, 255, 255, 0.05);
    color: #fff;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }
  
  .input-field::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  .input-field:focus {
    border-color: #0066ff;
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 15px rgba(0, 102, 255, 0.3);
    outline: none;
  }
  
  select.input-field {
    height: 52px;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 15px center;
    background-size: 20px;
    padding-right: 45px;
    color: white; /* Ensure text is white */
    font-size: 16px;
  }
  
  select.input-field option {
    background-color: #1a1a1a; /* Dark background for options */
    color: white; /* White text for options */
    padding: 12px;
    font-size: 16px;
  }
  
  /* Add hover effect for options */
  select.input-field option:hover,
  select.input-field option:focus {
    background-color: #2d2d2d;
  }
  
  /* Style for disabled placeholder option */
  select.input-field option[value=""][disabled] {
    color: rgba(255, 255, 255, 0.6);
  }
  
  /* Improve select dropdown on mobile */
  @media (max-width: 480px) {
    select.input-field {
      font-size: 14px;
    }
    
    select.input-field option {
      padding: 10px;
      font-size: 14px;
    }
  }
  
  .button-container {
    width: 100%;
    max-width: 400px;
    margin-top: 10px;
  }
  
  .submit-button {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #0066ff, #2e7bff);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .submit-button:hover {
    background: linear-gradient(135deg, #0052cc, #1a6cd1);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 102, 255, 0.4);
  }
  
  .submit-button:active {
    transform: translateY(0);
  }
  
  /* Responsive Design */
  @media (max-width: 480px) {
    .register-container {
      margin: 10px;
      padding: 20px;
    }
  
    h2 {
      font-size: 24px;
      margin-bottom: 20px;
    }
  
    .input-field {
      padding: 12px;
      font-size: 14px;
    }
  
    select.input-field {
      height: 46px;
    }
  
    .submit-button {
      padding: 14px;
      font-size: 16px;
    }
  }
  
  /* Dark mode optimization */
  @media (prefers-color-scheme: dark) {
    .register-container {
      background: linear-gradient(135deg, #121212, #1f1f1f);
    }
  
    .input-field {
      background-color: rgba(255, 255, 255, 0.03);
    }
  }
  </style>
  