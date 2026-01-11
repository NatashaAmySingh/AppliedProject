import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import RequestDetail from "./pages/RequestDetail";
import NewRequest from "./pages/NewRequest";
import Reports from "./pages/Reports";
import Administration from "./pages/Administration";
import Help from "./pages/Help";
import Profile from "./pages/Profile";
import UserSettings from "./pages/UserSettings";

import PrivateRoute from "./utils/PrivateRoute";

export default function App() {
  return (
    <Router>
      <Routes>  
        {/* auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* protected  routes */}
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/requests" element={<PrivateRoute element={<Requests />} />} />
        <Route path="/request-detail" element={<PrivateRoute element={<RequestDetail />} />} />
        <Route path="/new-request" element={<PrivateRoute element={<NewRequest />} />} />
        <Route path="/reports" element={<PrivateRoute element={<Reports />} />} />
        <Route path="/administration" element={<PrivateRoute element={<Administration />} />} />
        <Route path="/help" element={<PrivateRoute element={<Help />} />} />
        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
        <Route path="/settings" element={<PrivateRoute element={<UserSettings />} />} />
      </Routes>
    </Router>
  );
}