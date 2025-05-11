/**
 * @fileoverview The initial page component.
 */
import React, { useState } from "react";
import { Layout, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { MailOutlined, SunOutlined } from "@ant-design/icons";
import { useRegisterStore } from "../store/useRegisterStore";

const { Header, Content } = Layout;

const InitPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUserData } = useRegisterStore();

  const handleSignInClick = () => {
    navigate("/signin");
  };

  const handleSignUpClick = () => {
    console.log("Sign up button clicked");
    navigate("/signup");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <div className="logo" style={{ color: "black", fontSize: "24px" }}>
          <SunOutlined />
        </div>
        <div>
          <Button
            color="default"
            shape="round"
            variant="filled"
            style={{ marginRight: "10px" }}
            onClick={handleSignInClick}
          >
            Sign in
          </Button>
          <Button
            color="primary"
            shape="round"
            variant="solid"
            onClick={handleSignUpClick}
          >
            Sign up
          </Button>
        </div>
      </Header>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ textAlign: "left" }}>Email address</p>
          <Input
            size="large"
            onChange={(e) => setUserData("email", e.target.value)}
            placeholder="Please enter your email"
            prefix={<MailOutlined />}
            style={{
              width: "300px",
              marginBottom: "20px",
              marginRight: "10px",
            }}
          />
          <Button
            type="primary"
            shape="round"
            size="large"
            onClick={handleSignUpClick}
          >
            Sign up
          </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default InitPage;
