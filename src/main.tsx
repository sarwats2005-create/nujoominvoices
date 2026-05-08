import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadUnicodeFont } from "@/lib/pdfFont";

// Warm Arabic-capable font + install jsPDF shaping/BiDi patches early.
preloadUnicodeFont();

createRoot(document.getElementById("root")!).render(<App />);
