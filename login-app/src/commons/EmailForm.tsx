/**
 * @fileoverview The email form component.
 */
import React from "react";
import { Form, Input, Button, Typography } from "antd";
import {
  MailOutlined,
  GoogleOutlined,
  KeyOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface EmailFormProps {
  handleSendCode: (values: any) => Promise<void>;
  initEmail?: string;
  isSignUP?: boolean;
  onValuesChange: (changedValues: any, allValues: any) => void;
  isEmailValid: boolean;
  loading: boolean;
  isPasskeyModalOpen?: boolean;
  closePasskeyModal?: () => void;
  handleGoogleSignup: () => void;
  handlePasskeySignin?: () => void;
}

const EmailForm: React.FC<EmailFormProps> = ({
  isSignUP = true,
  handleSendCode,
  initEmail,
  onValuesChange,
  isEmailValid,
  loading,
  handleGoogleSignup,
  handlePasskeySignin,
}) => {
  return (
    <>
      <Title style={{ textAlign: "left" }} level={3}>
        {`${isSignUP ? "Create" : "Sign in"} your account`}{" "}
      </Title>
      <Form
        onFinish={handleSendCode}
        initialValues={{ email: initEmail }}
        layout="vertical"
        onValuesChange={onValuesChange}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Use a valid email address",
            },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Enter your email" />
        </Form.Item>
        {!isSignUP && (
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              placeholder="Password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              className="password-input"
            />
          </Form.Item>
        )}

        <Button
          type="primary"
          htmlType="submit"
          disabled={!isEmailValid}
          loading={loading}
          block
        >
          Continue
        </Button>
      </Form>
      <div style={{ textAlign: "center", margin: "16px 0", color: "#888" }}>
        OR
      </div>
      {!isSignUP && (
        <Button
          icon={<KeyOutlined />}
          block
          style={{ marginBottom: 8 }}
          onClick={handlePasskeySignin}
        >
          Sign in with Passkey
        </Button>
      )}
      <Button
        icon={<GoogleOutlined />}
        block
        style={{ marginBottom: 8 }}
        onClick={handleGoogleSignup}
      >
        {`Sign ${isSignUP ? "up" : "in"} with Google`}
      </Button>
    </>
  );
};

export default EmailForm;
