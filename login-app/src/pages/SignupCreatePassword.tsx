/**
 * @fileoverview The sign up create password page component.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
// import { register } from "../services/authService";
import AuthLayout from "../commons/AuthLayout";
import styles from "./common.module.css";
import { useRegisterStore } from "../store/useRegisterStore";
import { setPasswordApi } from "../services/authService";

const { Title, Text } = Typography;

// UI component for the password rules
const RuleCheck: React.FC<{ text: string; isValid: boolean }> = ({
  text,
  isValid,
}) => (
  <div className={styles.ruleCheck}>
    {isValid ? (
      <CheckCircleFilled style={{ color: "green" }} />
    ) : (
      <CloseCircleFilled style={{ color: "gray" }} />
    )}
    <Text className={`rule-text ${isValid ? "valid" : ""}`}>{text}</Text>
  </div>
);

// main component for the sign up create password page
const CreatePassword: React.FC = () => {
  const { email, setUserData } = useRegisterStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // redirect to the sign up page if the email is not set
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState({
    length: false,
    upperLower: false,
    number: false,
    symbol: false,
  });

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    // check if the password is valid
    setIsPasswordValid({
      length: value.length >= 8,
      upperLower: /[a-z]/.test(value) && /[A-Z]/.test(value),
      number: /\d/.test(value),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    });
  };

  // check if the password is valid
  const isFormValid = Object.values(isPasswordValid).every(Boolean);

  // handle the register process
  const handleRegister = async () => {
    setLoading(true);
    try {
      await setPasswordApi(email, password);
      // messageApi.success("Registration successful!");
      setUserData("password", password);
      navigate("/signup/usename");
    } catch (error) {
      messageApi.error(error?.response?.data?.message || "Set failed!");
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      {contextHolder}
      <Title className={styles.passwordTitle} level={3}>
        Create a password
      </Title>
      <Text className={styles.passwordSubTitle}>
        Protect your account by creating a strong password.
      </Text>
      <Form onFinish={handleRegister} layout="vertical">
        <Form.Item label="Password">
          <Input.Password
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Password"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            className="password-input"
          />
        </Form.Item>

        <div className={styles.passwordRules}>
          <RuleCheck
            text="A minimum of 8 characters"
            isValid={isPasswordValid.length}
          />
          <RuleCheck
            text="Lower and uppercase case letters"
            isValid={isPasswordValid.upperLower}
          />
          <RuleCheck
            text="At least 1 number"
            isValid={isPasswordValid.number}
          />
          <RuleCheck
            text="At least 1 symbol"
            isValid={isPasswordValid.symbol}
          />
        </div>

        <Button
          type="primary"
          block
          htmlType="submit"
          disabled={!isFormValid}
          loading={loading}
          className={styles.continueBtn}
        >
          Continue
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default CreatePassword;
