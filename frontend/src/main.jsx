import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./config/msalConfig";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// Initialize the msalInstance before rendering if required by msal-browser version
const initializeMsal = async () => {
  try {
    if (msalInstance.initialize) {
      await msalInstance.initialize();
    }
    // Handle the redirect promise BEFORE React Router can strip the url hash!
    await msalInstance.handleRedirectPromise();
  } catch (err) {
    console.error("MSAL Initialization failed", err);
  }
};

initializeMsal().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <MsalProvider instance={msalInstance}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MsalProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
});
