import { useState, useEffect } from "react";
import mouthOpen from "./assets/mouth-open.png";
import mouthClosed from "./assets/mouth-closed.png";

export default function TalkingFigure({ isTalking }) {
  const [frame, setFrame] = useState(false);

  useEffect(() => {
    if (!isTalking) return;
    const interval = setInterval(() => setFrame((prev) => !prev), 180);
    return () => clearInterval(interval);
  }, [isTalking]);

  const style = {
    width: "300px",
    height: "300px",
    objectFit: "contain",       // prevents stretching
    transition: "none",         // prevents smooth shrinking animation
    imageRendering: "pixelated" // optional – keeps crisp shape
  };

  return (
    <img
      src={isTalking ? (frame ? mouthOpen : mouthClosed) : mouthClosed}
      style={style}
      draggable="false"
      alt="talking-mouth"
    />
  );
}
