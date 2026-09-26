import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, AdminRoute } from './components/PrivateRoute';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { ActivateAccount } from './pages/ActivateAccount';
import { Profile } from './pages/Profile';
import { EditProfile } from './pages/EditProfile';
import { UserList } from './pages/UserList';
import { UserDetail } from './pages/UserDetail';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/profile" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/activate/:token" element={<ActivateAccount />} />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/users/:id" element={<UserDetail />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/users" element={<UserList />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
