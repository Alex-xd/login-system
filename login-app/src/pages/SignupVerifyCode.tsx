/**
 * @fileoverview The sign up verify code page component.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, message } from "antd";
import { sendCode, verifyCode } from "../services/authService";
import OTPInput from "../commons/OTPInput";
import AuthLayout from "../commons/AuthLayout";
import styles from "./common.module.css";
import { useRegisterStore } from "../store/useRegisterStore";

const { Title, Text } = Typography;

const VerifyCode: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const { email, setUserData } = useRegisterStore();

  // useEffect(() => {
  //   setTimeout(() => {
  //     if (!email) {
  //       navigate("/signup");
  //     }
  //   }, 50);
  // }, [email, navigate]);

  useEffect(() => {
    // countdown for the resend code
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // handle the verify code logic
  const handleVerifyCode = async (code: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await verifyCode(email, code);
      messageApi.success("Code verified successfully!");
      setUserData("otpVerified", true);
      navigate("/signup/password");
    } catch (error) {
      messageApi.error("Invalid code!");
      setIsOtpInvalid(true);
      setTimeout(() => {
        setIsOtpInvalid(false);
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCountdown(30);
    setCanResend(false);
    sendCode(email)
      .then(() => messageApi.success("Verification code sent to your email!"))
      .catch(() => {
        setCanResend(true);
        messageApi.error("Failed to send verification code!");
      });
  };

  return (
    <AuthLayout>
      {contextHolder}
      <Title level={3}>Enter the 6-digit code we emailed you</Title>
      <Text>
        Verify your email <b>{email}</b>. This helps us keep your account secure
        by verifying that it's really you.
      </Text>
      <div className={styles.inputSection}>
        <Text strong>Enter code</Text>
        <OTPInput
          length={6}
          onChange={() => {
            if (isOtpInvalid) setIsOtpInvalid(false);
          }}
          onComplete={handleVerifyCode}
          isInvalid={isOtpInvalid}
        />
      </div>
      <Button
        block
        disabled={!canResend}
        className={styles.resendBtn}
        onClick={handleResend}
      >
        {canResend ? "Resend code" : `Resend code in ${countdown}`}
      </Button>
      <a onClick={() => navigate("/signup")} className={styles.goBack}>
        Go back
      </a>
    </AuthLayout>
  );
};

export default VerifyCode;
