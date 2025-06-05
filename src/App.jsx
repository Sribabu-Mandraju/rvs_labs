import React from "react";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";

import Landing from "./pages/WelcomePage";
import DepositPage from "./pages/depositPage";
import RedeemPage from "./pages/RedeemPage";
import UserDeposits from "./pages/UserDeposits";
import SetROIPage from "./pages/SetROIPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/deposit" element={<DepositPage />} />
          <Route path="/redeem" element={<RedeemPage />} />
          <Route path="/user-deposits" element={<UserDeposits />} />
          <Route path="/set-roi" element={<SetROIPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </WalletProvider>
  );
};

export default App;
