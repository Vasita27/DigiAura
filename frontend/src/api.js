import axios from "axios";
const BASE = "http://127.0.0.1:5000";
const NGROK = ""

export const classifyText = async (text) => {
  const res = await axios.post(`${BASE}/classify`, { text });
  return res.data.label;
};

export const generateText = async (text) => {
  const res = await axios.post(`${NGROK}/generate`, { text });
  console.log("Generated text:", res.data.response);
  return res.data.response;
};
