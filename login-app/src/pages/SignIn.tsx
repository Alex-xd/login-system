/**
 * @fileoverview The sign in page component.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { login } from "../services/authService";
import EmailForm from "../commons/EmailForm";
import AuthLayout from "../commons/AuthLayout";
import { useRegisterStore } from "../store/useRegisterStore";
import {
  prepareAuthenticationCredential,
  isWebAuthnSupported,
} from "../utils/webAuthnUtils";
import {
  getPasskeyAuthOptions,
  verifyPasskeyAuth,
} from "../services/passkeyServices";

const EmailSignup: React.FC = () => {
  const { setUserData } = useRegisterStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
  const navigate = useNavigate();

  const onValuesChange = (
    _: any,
    values: { email: string; password: string }
  ) => {
    // check if the email is valid
    setIsEmailValid(
      !!values.email &&
        !!values.password &&
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email)
    );
  };

  const handleSendCode = async (values: {
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      messageApi.success("Verification code sent to your email!");
      setUserData("email", values.email);
      navigate("/signin/verify");
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.data?.message ||
        "Failed to send verification code!";
      messageApi.error(errorMessage);
    }
    setLoading(false);
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handlePasskeySignin = async () => {
    // setIsPasskeyModalOpen(true);
    // check if the browser supports passkeys
    if (!isWebAuthnSupported()) {
      messageApi.error(
        "Your browser doesn't support passkeys. Please try a different browser or device."
      );
      return;
    }

    try {
      // get the authentication options - single device login does not require a sessionId
      const response = await getPasskeyAuthOptions();
      const { options, sessionId } = response.data.data;

      // prepare and execute the WebAuthn authentication
      const credential = await prepareAuthenticationCredential(
        options,
        sessionId
      );

      // verify the credential - need to send the sessionId and credential together
      const verifyResponse = await verifyPasskeyAuth({
        sessionId, // sessionId from the authentication options response
        credential: credential.credential,
      });

      // login successfully, save the token
      const { token, user } = verifyResponse.data.data;
      localStorage.setItem("token", token);

      message.success("Successfully authenticated!");

      // redirect to the home page after 2 seconds
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (err: any) {
      console.error("Authentication error:", err);
      messageApi.error(
        err.message || "Failed to authenticate. Please try again."
      );
    }
  };

  return (
    <AuthLayout>
      {contextHolder}
      <EmailForm
        handleSendCode={handleSendCode}
        onValuesChange={onValuesChange}
        isEmailValid={isEmailValid}
        loading={loading}
        isSignUP={false}
        isPasskeyModalOpen={isPasskeyModalOpen}
        closePasskeyModal={() => setIsPasskeyModalOpen(false)}
        handlePasskeySignin={handlePasskeySignin}
        handleGoogleSignup={handleGoogleSignup}
      />
    </AuthLayout>
  );
};

export default EmailSignup;
