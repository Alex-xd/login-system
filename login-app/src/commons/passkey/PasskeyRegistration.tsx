/**
 * @fileoverview The component for the passkey registration.
 */
import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Input,
  Button,
  Form,
  message,
  Alert,
  Spin,
} from "antd";
import { KeyOutlined, SafetyOutlined } from "@ant-design/icons";
import {
  getPasskeyRegistrationOptions,
  verifyPasskeyRegistration,
} from "../../services/passkeyServices";
import {
  prepareRegistrationCredential,
  isWebAuthnSupported,
} from "../../utils/webAuthnUtils";
import styles from "./PasskeyRegistration.module.css";

const { Title, Paragraph } = Typography;

interface PasskeyRegistrationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PasskeyRegistration: React.FC<PasskeyRegistrationProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleRegister = async (values: { deviceName: string }) => {
    // check if the browser supports WebAuthn/Passkeys
    if (!isWebAuthnSupported()) {
      setError("Your browser does not support WebAuthn/Passkeys.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // get the registration options
      const response = await getPasskeyRegistrationOptions();
      const { options, sessionId } = response.data.data;
      console.log("options:", options);
      // prepare and execute the WebAuthn registration
      const credential = await prepareRegistrationCredential(
        options,
        sessionId
      );
      console.log("credential:", credential);
      // verify the registration
      await verifyPasskeyRegistration({
        sessionId,
        credential: credential.credential,
        deviceName: values.deviceName,
      });
      console.log("done");
      message.success("Passkey registered successfully!");
      form.resetFields();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.name === "NotAllowedError") {
        setError("Operation was canceled by user or timeout occurred.");
      } else if (err.name === "SecurityError") {
        setError(
          "The origin is not secure or the RP ID is not a registrable domain suffix of the current origin."
        );
      } else {
        setError(
          err.message || "Failed to register passkey. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.registrationCard}>
      <div className={styles.headerIcon}>
        <SafetyOutlined />
      </div>

      {/* <Title level={4}>Register a New Passkey</Title> */}

      <Paragraph className={styles.description}>
        Add a passkey to your account for faster and more secure sign-in.
      </Paragraph>

      {error && (
        <Alert
          message="Registration Error"
          description={error}
          type="error"
          showIcon
          className={styles.errorAlert}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleRegister}
        className={styles.registrationForm}
      >
        <Form.Item
          name="deviceName"
          label="Device Name"
          rules={[
            { required: true, message: "Please name this device" },
            { max: 50, message: "Device name must be less than 50 characters" },
          ]}
        >
          <Input
            prefix={<KeyOutlined />}
            placeholder="e.g. My iPhone, Work Laptop"
          />
        </Form.Item>

        <Form.Item className={styles.actionButtons}>
          <Button
            type="default"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SafetyOutlined />}
          >
            Register Passkey
          </Button>
        </Form.Item>
      </Form>
      {loading && (
        <div className={styles.verificationOverlay}>
          <Spin tip="Waiting for verification on your device..." />
        </div>
      )}
    </Card>
  );
};

export default PasskeyRegistration;
