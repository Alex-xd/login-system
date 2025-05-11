/**
 * @fileoverview The sign up user name form page component.
 */
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import styles from "./common.module.css";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../commons/AuthLayout";
import { useRegisterStore } from "../store/useRegisterStore";
import { register } from "../services/authService";

const { Title, Text } = Typography;

const UserNameForm: React.FC = () => {
  const { email, setUserData } = useRegisterStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // check if the input fields are valid
  const handleValuesChange = () => {
    // use setTimeout to avoid the validation error
    setTimeout(() => {
      form
        .validateFields()
        .then(() => {
          setIsButtonDisabled(false);
        })
        .catch(() => {
          setIsButtonDisabled(true);
        });
    }, 0);
  };

  // handle the submit logic
  const onFinish = async (values: { firstName: string; lastName: string }) => {
    setLoading(true);
    try {
      setUserData("firstName", values.firstName);
      setUserData("lastName", values.lastName);
      console.log("User Data:", values);
      const data = await register(email, values.firstName, values.lastName);
      localStorage.setItem("token", data.data.data);
      messageApi.success("Registration successful!");
      navigate("/home");
    } catch (error) {
      messageApi.error(error?.response?.data?.message || "Set failed!");
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      {contextHolder}
      <Title level={3}>What should we call you?</Title>
      <Text type="secondary">
        Enter your first and last name. You can make changes later on by
        verifying your account.
      </Text>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        onFinish={onFinish}
      >
        <Form.Item
          label="First name"
          name="firstName"
          rules={[
            { required: true, message: "First name is required" },
            { pattern: /^[A-Za-z]+$/, message: "Please enter a valid name" },
          ]}
        >
          <Input placeholder="Enter your first name" className={styles.input} />
        </Form.Item>

        <Form.Item
          label="Last name"
          name="lastName"
          rules={[
            { required: true, message: "Last name is required" },
            { pattern: /^[A-Za-z]+$/, message: "Please enter a valid name" },
          ]}
        >
          <Input placeholder="Enter your last name" className={styles.input} />
        </Form.Item>

        <Button
          type="primary"
          block
          loading={loading}
          disabled={isButtonDisabled}
          className={styles.continueBtn}
          htmlType="submit"
        >
          Continue
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default UserNameForm;
