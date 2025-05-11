/**
 * @fileoverview The sign up email page component.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { sendCode } from "../services/authService";
import EmailForm from "../commons/EmailForm";
import AuthLayout from "../commons/AuthLayout";
import { useRegisterStore } from "../store/useRegisterStore";

const EmailSignup: React.FC = () => {
  const { email, setUserData } = useRegisterStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // set the email when the page is loaded
    if (email) {
      onValuesChange({}, { email });
    }
  }, []);

  const onValuesChange = (_: any, values: { email: string }) => {
    setIsEmailValid(
      !!values.email &&
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email) // check if the email is valid
    );
  };

  const handleSendCode = async (values: { email: string }) => {
    setLoading(true);
    try {
      setUserData("email", values.email);
      await sendCode(values.email);
      messageApi.success("Verification code sent to your email!");
      navigate("/signup/verify");
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        "Failed to send verification code!";
      messageApi.error(errorMessage);
    }
    setLoading(false);
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`; // redirect to the google sign up page
  };

  return (
    <AuthLayout>
      {contextHolder}
      <EmailForm
        handleSendCode={handleSendCode}
        initEmail={email}
        onValuesChange={onValuesChange}
        isEmailValid={isEmailValid}
        loading={loading}
        handleGoogleSignup={handleGoogleSignup}
      />
    </AuthLayout>
  );
};

export default EmailSignup;
