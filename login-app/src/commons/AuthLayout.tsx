/**
 * @fileoverview The layout for the authentication pages.
 */
import React from "react";
import { Card, message, Layout, Button } from "antd";
import styles from "./AuthLayout.module.css";
import { SunOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Header, Content } = Layout;

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const location = useLocation();

  const handleSignInClick = () => {
    navigate("/signin");
  };

  const handleSignUpClick = () => {
    navigate("/signup");
  };

  return (
    <Layout className={styles.container}>
      {contextHolder}
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
          {location.pathname.includes("signup") && (
            <Button
              color="default"
              shape="round"
              variant="filled"
              onClick={handleSignInClick}
            >
              Sign in
            </Button>
          )}
          {location.pathname.includes("signin") && (
            <Button
              color="primary"
              shape="round"
              variant="solid"
              onClick={handleSignUpClick}
            >
              Sign up
            </Button>
          )}
        </div>
      </Header>
      <Content className={styles.bodyWrap}>
        <Card className={styles.publicCard}>{children}</Card>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
