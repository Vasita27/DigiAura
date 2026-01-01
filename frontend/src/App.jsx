import { useState } from "react";
import Avatar from "./Avatar";
import TalkingFigure from "./TalkingFigure";
import { classifyText, generateText } from "./api";

export default function App() {
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [classificationResult, setClassificationResult] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [spokenText, setSpokenText] = useState("");
  const [isTalking, setIsTalking] = useState(false);
  const [activeTab, setActiveTab] = useState("main");
  const [journalText, setJournalText] = useState("");

  const triggerTalking = (text) => {
    setSpokenText(text);
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    utter.onstart = () => setIsTalking(true);
    utter.onend = () => setIsTalking(false);

    window.speechSynthesis.speak(utter);
  };

  const doClassify = async () => {
    const result = await classifyText(input1);
    setClassificationResult(result);
    triggerTalking(`${result}`);
  };

  const doGenerate = async () => {
    const result = await generateText(input2);
    setGeneratedOutput(result);
    triggerTalking(result);
  };

  const submitJournal = () => {
    triggerTalking(`You wrote: ${journalText}`);
    setJournalText("");
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
                {generatedOutput && (
                  <div style={{ padding: "12px", backgroundColor: "#E8E0F5", borderRadius: "8px", borderLeft: "4px solid #D4B5E8" }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6B4E71" }}>
                      {generatedOutput}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="journal-layout">
              <div className="journal-box">
                <h2 style={{ margin: "0 0 30px 0", fontSize: "28px", fontWeight: "600", color: "#B085B8" }}>Journal Entry</h2>
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Write your thoughts, feelings, and experiences..."
                  style={{
                    width: "100%", height: "300px", padding: "15px", border: "2px solid #E8C5D8",
                    borderRadius: "8px", fontSize: "14px", resize: "none", marginBottom: "20px",
                    color: "#6B4E71", fontFamily: "inherit"
                  }}
                />
                <button
                  onClick={submitJournal}
                  style={{
                    width: "100%", padding: "14px", background: "linear-gradient(135deg, #FFB3D9 0%, #D4B5E8 100%)",
                    color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "16px"
                  }}
                >
                  Submit Journal Entry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}