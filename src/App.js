import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import { SocketProvider }  from "./context/SocketContext";
import { ThemeProvider }   from "./context/ThemeContext";
import ProtectedRoute      from "./components/layout/ProtectedRoute";
import LoginPage           from "./pages/LoginPage";
import SignupPage          from "./pages/SignupPage";
import InboxPage           from "./pages/InboxPage";
import ProfilePage         from "./pages/ProfilePage";
import AdminDashboard      from "./pages/AdminDashboard";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login"  element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected */}
              <Route path="/inbox" element={
                <ProtectedRoute><InboxPage /></ProtectedRoute>
              } />
              <Route path="/inbox/:id" element={
                <ProtectedRoute><InboxPage /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/inbox" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}