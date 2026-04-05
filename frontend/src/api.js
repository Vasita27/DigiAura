import axios from "axios";

const BASE = "http://127.0.0.1:5000";
const NGROK = "https://dichasial-nonextensive-ayaan.ngrok-free.dev"; //shud be actual trained model url

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token in localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Remove token from localStorage
const removeToken = () => localStorage.removeItem('token');

// ============ AUTHENTICATION API ============

export const registerUser = async (username, password) => {
  const res = await axios.post(`${BASE}/api/auth/register`, { 
    username, 
    password 
  });
  return res.data;
};

export const loginUser = async (username, password) => {
  const res = await axios.post(`${BASE}/api/auth/login`, { 
    username, 
    password 
  });
  if (res.data.access_token) {
    setToken(res.data.access_token);
  }
  return res.data;
};

export const verifyToken = async () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const res = await axios.get(`${BASE}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    removeToken();
    return null;
  }
};

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const res = await axios.get(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    removeToken();
    return null;
  }
};

export const logout = () => {
  removeToken();
};

// ============ EXISTING API ============

export const classifyText = async (text) => {
  const res = await axios.post(`${BASE}/classify`, { text });
  return res.data.label;
};

export const generateText = async (userid,text) => {
  const res = await axios.post(`${NGROK}/predictnlpfuncn`, { user_id: userid , text: text });
  console.log("Input to NLP:", res.data);
  console.log("Generateds text:", res.data.response);
  return res.data.response;
};

// export const generateText = async (text) => {
//   const res = await axios.post(`${NGROK}/generatenew`, { text });
//   console.log("Generateds text:", res.data.response);
//   return res.data.response;
// };



// import axios from "axios";
// const BASE = "http://127.0.0.1:5000";
// const NGROK = "https://38adc6a1488f.ngrok-free.app"

// export const classifyText = async (text) => {
//   const res = await axios.post(`${BASE}/classify`, { text });
//   return res.data.label;
// };

// export const generateText = async (text) => {
//   const res = await axios.post(`${NGROK}/generate`, { text });
//   console.log("Generated text:", res.data.response);
//   return res.data.response;
// };
// ============ TRANSLATION API ============

export const translateToEnglish = async (text) => {
  try {
    const res = await axios.post(`${BASE}/api/translate/to-english`, { text });
    return res.data;
  } catch (error) {
    console.error("Translation error:", error);
    return { translated: text, detected_language: 'en' };
  }
};

export const translateToTelugu = async (text) => {
  try {
    const res = await axios.post(`${BASE}/api/translate/to-telugu`, { text });
    return res.data;
  } catch (error) {
    console.error("Translation error:", error);
    return { translated: text };
  }
};
