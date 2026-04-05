import { useState,useEffect } from "react";
import Avatar from "./Avatar";
import TalkingFigure from "./TalkingFigure";
import { 
  classifyText, 
  generateText, 
  registerUser, 
  loginUser, 
  verifyToken, 
  logout,
  translateToEnglish,
  translateToTelugu
} from "./api";



export default function App() {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [classificationResult, setClassificationResult] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [spokenText, setSpokenText] = useState("");
  const [isTalking, setIsTalking] = useState(false);
  const [activeTab, setActiveTab] = useState("main");
  const [journalText, setJournalText] = useState("");
  const [situationText, setSituationText] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [trainStatus, setTrainStatus] = useState("");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // login or register
  const [authData, setAuthData] = useState({
    username: "",
    password: ""
  });
  const [outputLanguage, setOutputLanguage] = useState("english"); // "english" or "telugu"
const BASE_CLASSIFICATION = "https://CLASSIFICATION_NGROK";
const BASE_NLP = "https://dichasial-nonextensive-ayaan.ngrok-free.dev";

  // Verify token on app load
useEffect(() => {
  const checkAuth = async () => {
    const result = await verifyToken();
    if (result && result.valid) {
      setUser(result.user);
    }
  };
  checkAuth();
}, []);




  // const triggerTalking = (text) => {
  //   setSpokenText(text);
  //   const utter = new SpeechSynthesisUtterance(text);
  //   utter.rate = 1.0;
  //   utter.pitch = 1.0;
  //   utter.volume = 1.0;

  //   utter.onstart = () => setIsTalking(true);
  //   utter.onend = () => setIsTalking(false);

  //   window.speechSynthesis.speak(utter);
  // };

  const triggerTalking = async (text) => {
  let textToSpeak = text;

  if (outputLanguage === "telugu") {
    const translation = await translateToTelugu(text);
    textToSpeak = translation.translated;
  }

  setSpokenText(textToSpeak);

  const res = await fetch("http://localhost:5000/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: textToSpeak,
      lang: outputLanguage === "telugu" ? "te" : "en"
    })
  });

  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);

  const audio = new Audio(audioUrl);
  audio.playbackRate = 1.5;

  // 🔥 THIS IS THE FIX
  audio.onplay = () => setIsTalking(true);
  audio.onended = () => setIsTalking(false);

  audio.play();
};

  const doClassify = async () => {
    const result = await classifyText(input1);
    setClassificationResult(result);
    triggerTalking(`${result}`);
  };

  const doGenerate = async () => {
    // print("reached here")
    const result = await generateText(user.id,input2); 
    //const result = await generateText(input2);
    setGeneratedOutput(result);
    triggerTalking(result);
  };
const handleAuth = async () => {
  if (!authData.username || !authData.password) {
    alert("Enter username and password");
    return;
  }

  try {
    if (authMode === "register") {
      const result = await registerUser(authData.username, authData.password);
      alert("Registered successfully! Please login.");
      setAuthMode("login");
      // setAuthData({ username: "", password: "" });
    } else {
      const result = await loginUser(authData.username, authData.password);
      setUser(result.user);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.error || "Authentication failed";
    alert(errorMsg);
  }
};

const handleLogout = () => {
  logout();
  setUser(null);
};

// const submitJournal = async () => {
//   if (!journalText.trim() || !situationText.trim()) {
//     alert("Please fill both situation and journal");
//     return;
//   }

//   try {
//     const response = await fetch(
//       "https://da4a2f17ca90.ngrok-free.app/submit",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           user_id: user.id, // later replace with real user id
//           journals: [
//             {
//               sentence: situationText,
//               journal: journalText,
//               label: "Neutral" // or auto-assign later
//             }
//           ]
//         })
//       }
//     );

//     const data = await response.json();
//     console.log(data);

//     alert("Journal stored successfully ✨");

//     // clear fields
//     setSituationText("");
//     setJournalText("");

//   } catch (err) {
//     console.error(err);
//     alert("Failed to submit journal");
//   }
// };

const submitJournal = async () => {
  if (!journalText.trim() || !situationText.trim()) {
    alert("Please fill both situation and journal");
    return;
  }

  try {
    // Translate Telugu to English if needed
    const situationTranslation = await translateToEnglish(situationText);
    const journalTranslation = await translateToEnglish(journalText);
    console.log("Translated Situation:", situationTranslation);
    console.log("Translated Journal:", journalTranslation);
    const response = await fetch(
      "https://1066-34-126-134-108.ngrok-free.app/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: user.id,
          journals: [
            {
              sentence: situationTranslation.translated,
              journal: journalTranslation.translated,
              label: "Neutral"
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log(data);

    alert("Journal stored successfully ✨");

    setSituationText("");
    setJournalText("");

  } catch (err) {
    console.error(err);
    alert("Failed to submit journal");
  }
};

const submitForNLP = async () => {
  if (!journalText.trim() || !situationText.trim()) {
    alert("Fill both fields");
    return;
  }

  try {
    const situationTranslation = await translateToEnglish(situationText);
    const journalTranslation = await translateToEnglish(journalText);

    const res = await fetch(`${BASE_NLP}/submitnlpnew`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id,
        journals: [
          {
            sentence: situationTranslation.translated,
            journal: journalTranslation.translated
          }
        ]
      })
    });

    await res.json();
    alert("✅ Saved for NLP Model");

  } catch (err) {
    console.error(err);
    alert("❌ Failed");
  }
};

const trainModel = async () => {
  setIsTraining(true);
  setTrainStatus("Training started… this may take a minute ⏳");

  try {
    const res = await fetch(
      "https://da4a2f17ca90.ngrok-free.app/train_model",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: user.id
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Training failed");
    }

    setTrainStatus("✅ Model trained successfully!");
  } catch (err) {
    console.error(err);
    setTrainStatus("❌ Training failed. Try again.");
  } finally {
    setIsTraining(false);
  }
};
const trainNLPModel = async () => {
  setIsTraining(true);
  setTrainStatus("Training NLP Model...");

  try {
    const res = await fetch(`${BASE_NLP}/train_model`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: user.id
      })
    });

    await res.json();
    setTrainStatus("✅ NLP Model Trained");

  } catch (err) {
    console.error(err);
    setTrainStatus("❌ Failed");
  } finally {
    setIsTraining(false);
  }
};

  return (
    <>
      <style>{`
        /* Global Reset & Base */
        * { box-sizing: border-box; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }

        .app-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 100vh;
          min-width: 100vw;
          background-color: #faf5f0;
        }

        /* Navbar */
        .navbar {
          background: linear-gradient(135deg, #FFB3D9 0%, #D4B5E8 100%);
          padding: 0 20px;
          height: 70px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 4px 15px rgba(220, 150, 200, 0.2);
          flex-shrink: 0;
        }

        .nav-title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #6B4E71;
        }

        .nav-buttons {
          display: flex;
          gap: 10px;
        }

        .nav-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        /* Main Content Layout */
        .content-wrapper {
          flex: 1;
          overflow-y: auto;
          width: 100%;
        }

        .chat-layout {
          display: flex;
          flex-direction: row;
          /* Align to left and prevent stretching too far on wide screens */
          justify-content: flex-start; 
          max-width: 1400px; 
          width: 100%;
          gap: 20px;
          padding: 20px;
          align-items: flex-start;
        }

        /* Sidebar Boxes (Classify & NLP) */
        .sidebar-box {
          flex: 0 0 260px;
          background-color: #FFF0F5;
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 8px 24px rgba(255, 179, 217, 0.15);
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .sidebar-box.blue {
          background-color: #F0F5FF;
          box-shadow: 0 8px 24px rgba(212, 181, 232, 0.15);
        }

        /* Avatar Section */
        .avatar-section {
          flex: 1; /* Takes remaining space */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          min-width: 300px;
          max-width: 600px; /* Don't get too wide */
        }

        .avatar-container {
          background-color: #FFF8FA;
          border-radius: 16px;
          padding: 15px;
          box-shadow: 0 8px 24px rgba(212, 181, 232, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 520px;
          width: 100%;
        }

        /* Journal Tab */
        .journal-layout {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100%;
          padding: 40px 20px;
        }

        .journal-box {
          background-color: #FFF8FA;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 8px 24px rgba(212, 181, 232, 0.15);
          max-width: 600px;
          width: 100%;
        }

        /* Inputs & Buttons Common */
        .input-field {
          width: 100%;
          padding: 11px;
          margin-bottom: 12px;
          border: 2px solid #E8C5D8;
          border-radius: 8px;
          font-size: 13px;
          background: #fff;
          color: #6B4E71;
        }
        .input-field:focus { outline: none; border-color: #FFB3D9; }

        .action-btn {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          color: #fff;
          transition: background 0.3s;
        }

        /* RESPONSIVE MEDIA QUERIES */
        @media (max-width: 900px) {
          .chat-layout {
            flex-direction: column;
            align-items: stretch;
            max-width: 100%;
          }

          .sidebar-box, .avatar-section {
            flex: none;
            width: 100%;
            max-width: 100%;
          }

          .avatar-container {
            height: 350px; /* Shorter avatar box on mobile */
          }

          .nav-title {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="app-container">

{!user ? (

<div style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"100vh"
}}>

<div style={{
background:"#9c7b84",
padding:"40px",
borderRadius:"12px",
width:"320px"
}}>

<h2>{authMode === "login" ? "Login" : "Register"}</h2>

<input
placeholder="Username"
className="input-field"
onChange={(e)=>
setAuthData({
...authData,
username:e.target.value
})
}
/>

<input
type="password"
placeholder="Password"
className="input-field"
onChange={(e)=>
setAuthData({
...authData,
password:e.target.value
})
}
/>

<button
className="action-btn"
style={{background:"#D4B5E8"}}
onClick={handleAuth}
>
{authMode === "login" ? "Login" : "Register"}
</button>

<p
style={{
marginTop:"10px",
cursor:"pointer",
color:"#1d022e"
}}
onClick={()=>
setAuthMode(
authMode==="login"
?"register"
:"login"
)
}
>

{authMode==="login"
?"Create account"
:"Already have account?"}

</p>

</div>

</div>

) :(
        
        <>
        {/* Navbar */}
        <nav className="navbar">
          <h1 className="nav-title">Avatar Studio</h1>
          <div className="nav-buttons">
            <button
              onClick={() => setActiveTab("main")}
              className="nav-btn"
              style={{
                backgroundColor: activeTab === "main" ? "#fff" : "rgba(255,255,255,0.3)",
                color: activeTab === "main" ? "#B085B8" : "#6B4E71",
              }}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("journal")}
              className="nav-btn"
              style={{
                backgroundColor: activeTab === "journal" ? "#fff" : "rgba(255,255,255,0.3)",
                color: activeTab === "journal" ? "#B085B8" : "#6B4E71",
              }}
            >
              Journal
            </button>
            <button
  onClick={() => setOutputLanguage(outputLanguage === "english" ? "telugu" : "english")}
  className="nav-btn"
  style={{
    backgroundColor: "#fff",
    color: "#B085B8",
    marginLeft: "auto"
  }}
>
  🌐 {outputLanguage === "english" ? "తెలుగు" : "English"}
</button>

          </div>
        </nav>

        {/* Main Content */}
        <div className="content-wrapper">
          {activeTab === "main" ? (
            <div className="chat-layout">
              {/* Classification Box - Left */}
              <div className="sidebar-box">
                <div>
                  <h3 style={{ margin: "0 0 18px 0", fontSize: "17px", fontWeight: "600", color: "#B085B8" }}>Classification</h3>
                  <input
                    className="input-field"
                    value={input1}
                    onChange={(e) => setInput1(e.target.value)}
                    placeholder="Enter situation..."
                  />
                  <button
                    className="action-btn"
                    onClick={doClassify}
                    style={{ backgroundColor: "#FFB3D9" }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#FF9BC4"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#FFB3D9"}
                  >
                    Classify
                  </button>
                </div>
                {classificationResult && (
                  <div style={{ padding: "12px", backgroundColor: "#FFE0ED", borderRadius: "8px", borderLeft: "4px solid #FFB3D9" }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6B4E71", fontWeight: "600" }}>
                      {classificationResult}
                    </p>
                  </div>
                  
                )}
                {/* <button
                    className="action-btn"
                    onClick={doGenerate}
                    style={{ backgroundColor: "#D4B5E8" }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#BFA0D9"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#D4B5E8"}
                  >
                    Click for Telugu
                  </button> */}
              </div>
              

              {/* Avatar Center (Now flexed with max width constraints) */}
              <div className="avatar-section">
                <div className="avatar-container">
                  <TalkingFigure isTalking={isTalking} />
                </div>
                {spokenText && (
                  <div style={{
                    backgroundColor: "#FFF8FA", borderRadius: "12px", padding: "11px 18px",
                    boxShadow: "0 4px 12px rgba(212, 181, 232, 0.12)", textAlign: "center", width: "100%"
                  }}>
                    <p style={{ margin: 0, fontSize: "12px", color: "#8B6B9F", fontStyle: "italic" }}>
                     <p style={{ margin: 0, fontSize: "12px", color: "#B085B8", fontWeight: "600" }}>
    Output Language: {outputLanguage === "english" ? "English 🇬🇧" : "తెలుగు 🇮🇳"}
  </p>
                      "{spokenText}"
                    </p>
                  </div>
                )}
              </div>
                
              {/* NLP Box - Right */}
              <div className="sidebar-box blue">
                <div>
                  <h3 style={{ margin: "0 0 18px 0", fontSize: "17px", fontWeight: "600", color: "#9BA3D9" }}>Natural Language</h3>
                  <input
                    className="input-field"
                    value={input2}
                    onChange={(e) => setInput2(e.target.value)}
                    placeholder="Describe situation..."
                    style={{ borderColor: "#D4C5E8" }}
                    onFocus={(e) => e.target.style.borderColor = "#D4B5E8"}
                    onBlur={(e) => e.target.style.borderColor = "#D4C5E8"}
                  />
                  <button
                    className="action-btn"
                    onClick={doGenerate}
                    style={{ backgroundColor: "#D4B5E8" }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#BFA0D9"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#D4B5E8"}
                  >
                    Generate
                  </button>
                  
                  
                </div>
                {/* <button
                    className="action-btn"
                    onClick={doGenerate}
                    style={{ backgroundColor: "#D4B5E8" }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#BFA0D9"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#D4B5E8"}
                  >
                    Click for Telugu
                  </button> */}
                {generatedOutput && (
                  <div style={{ padding: "12px", backgroundColor: "#E8E0F5", borderRadius: "8px", borderLeft: "4px solid #D4B5E8" }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6B4E71" }}>
                      {generatedOutput}
                    </p>
                  </div>
                )}
              </div>
              
            </div>
          ) :(
  <div className="journal-layout">
    <div className="journal-box">

      {/* Situation */}
      <h2
        style={{
          margin: "0 0 15px 0",
          fontSize: "22px",
          fontWeight: "600",
          color: "#9A6BA0"
        }}
      >
        Situation
      </h2>

      <textarea
        value={situationText}
        onChange={(e) => setSituationText(e.target.value)}
        placeholder="Briefly describe what happened..."
        style={{
          width: "100%",
          height: "120px",
          padding: "15px",
          border: "2px solid #E8C5D8",
          borderRadius: "8px",
          fontSize: "14px",
          resize: "none",
          marginBottom: "30px",
          color: "#6B4E71",
          fontFamily: "inherit",
          backgroundColor: "#FFF7FB"
        }}
      />

      {/* Journal */}
      <h2
        style={{
          margin: "0 0 30px 0",
          fontSize: "28px",
          fontWeight: "600",
          color: "#B085B8"
        }}
      >
        Journal Entry
      </h2>

      <textarea
        value={journalText}
        onChange={(e) => setJournalText(e.target.value)}
        placeholder="Write your thoughts, feelings, and experiences..."
        style={{
          width: "100%",
          height: "300px",
          padding: "15px",
          border: "2px solid #E8C5D8",
          borderRadius: "8px",
          fontSize: "14px",
          resize: "none",
          marginBottom: "20px",
          color: "#6B4E71",
          fontFamily: "inherit",
          backgroundColor: "#FFF7FB"
        }}
      />

      <button
        onClick={submitJournal}
        style={{
          width: "100%",
          padding: "14px",
          background: "linear-gradient(135deg, #FFB3D9 0%, #D4B5E8 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        Submit Journal Entry For Classification
      </button>
      {/* Train Model Button */}
<button
  onClick={trainModel}
  disabled={isTraining}
  style={{
    width: "100%",
    padding: "14px",
    marginTop: "15px",
    marginBottom: "10px",
    background: isTraining
      ? "#E0CFE8"
      : "linear-gradient(135deg, #B5A1E8 0%, #8B6FD8 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: isTraining ? "not-allowed" : "pointer",
    fontSize: "16px",
    opacity: isTraining ? 0.8 : 1
  }}
>
  {isTraining ? "Training Model…" : "Train Classification Model"}
</button>
<br></br>
<button onClick={submitForNLP} style={{
          width: "100%",
          padding: "14px",
          background: "linear-gradient(135deg, #FFB3D9 0%, #D4B5E8 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer",
          fontSize: "16px"
        }}>
  Submit input-output for NLP
</button>
<button onClick={trainNLPModel} disabled={isTraining} style={{
    width: "100%",
    padding: "14px",
    marginTop: "15px",
    background: isTraining
      ? "#E0CFE8"
      : "linear-gradient(135deg, #B5A1E8 0%, #8B6FD8 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: isTraining ? "not-allowed" : "pointer",
    fontSize: "16px",
    opacity: isTraining ? 0.8 : 1
  }}>
  Train NLP Model
</button>
{trainStatus && (
  <p
    style={{
      marginTop: "12px",
      fontSize: "14px",
      color: trainStatus.startsWith("✅")
        ? "#4CAF50"
        : trainStatus.startsWith("❌")
        ? "#E53935"
        : "#6B4E71",
      textAlign: "center"
    }}
  >
    {trainStatus}
  </p>
)}

    </div>
  </div>
)
}
        </div>
        <button
onClick={handleLogout}
style={{
position:"absolute",
top:"20px",
right:"20px"
}}
>
Logout
</button>

</>

)}
      </div>
    </>
  );
}