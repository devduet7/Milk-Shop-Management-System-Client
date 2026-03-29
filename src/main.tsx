// <== IMPORTS ==>
import "./index.css";
import App from "./App.tsx";
import { createRoot } from "react-dom/client";

// <== RENDERING THE APP IN ROOT ELEMENT ==>
createRoot(document.getElementById("root")!).render(<App />);

// <== SPLASH SCREEN ANIMATION ==>
const splash = document.getElementById("splash-screen");
// <== IF SPLASH SCREEN EXISTS ==>
if (splash) {
  // HIDE SPLASH
  requestAnimationFrame(() => {
    // WAIT FOR BADGE ANIMATION
    setTimeout(() => {
      // ADD FADE OUT CLASS
      splash.classList.add("fade-out");
      // REMOVE SPLASH AFTER ANIMATION
      setTimeout(() => splash.remove(), 500);
    }, 300);
  });
}
