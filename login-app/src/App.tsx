/**
 * @fileoverview The main component of the login application.
 */
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import InitPage from "./pages/InitPage";
import UserNameForm from "./pages/SignupUserNameForm";
import EmailSignup from "./pages/SignupEmail";
import VerifyCode from "./pages/SignupVerifyCode";
import CreatePassword from "./pages/SignupCreatePassword";
// import PhoneVerification from './pages/PhoneVerification'
import UserProfile from "./pages/Home";
import SignIn from "./pages/SignIn";
import Signinverify from "./pages/Signinverify";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InitPage />} />
        <Route path="/auth/callback" element={<GoogleAuthCallback />} />
        <Route path="/signup" element={<EmailSignup />} />
        <Route path="/signup/verify" element={<VerifyCode />} />
        <Route path="/signup/password" element={<CreatePassword />} />
        <Route path="/signup/usename" element={<UserNameForm />} />
        <Route path="/home" element={<UserProfile />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signin/verify" element={<Signinverify />} />

        {/* <Route path="/signup/phone" element={<PhoneVerification />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
