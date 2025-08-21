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
import AdminDashboard from "./pages/admin/AdminDashBoard";
import UserDepositsDashboard from "./pages/UserDepositsPage";
import Deposit from "./pages/Deposit";
import ContactPage from "./pages/ContactPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/deposit" element={<Deposit />} />
          {/* <Route path="/redeem" element={<UserDepositsDashboard />} /> */}
          <Route path="/user-deposits" element={<UserDepositsDashboard />} />
          {/* <Route path="/set-roi" element={<SetROIPage />} /> */}
          <Route path="/admin" element={<AdminDashboard />} />
          {/* <Route path="/depositPage" element={<Deposit />} /> */}
          <Route path="/*" element={<NotFoundPage />} />
          <Route path="/contact" element={<ContactPage />} />
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
