import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Firebase is initialized in firebase.ts

createRoot(document.getElementById("root")!).render(<App />);
