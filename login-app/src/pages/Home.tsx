/**
 * @fileoverview The home page component.
 */
import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Popconfirm,
  Typography,
  Form,
  Input,
  Button,
  Divider,
  Avatar,
  message,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  SunOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import styles from "./Home.module.css";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../services/userServices";
import { signOut } from "../services/authService";
import PasskeySettings from "../commons/passkey/PasskeySettings";
import { useRegisterStore } from "../store/useRegisterStore";
import { useNavigate } from "react-router-dom";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { setUserData, clearUserData } = useRegisterStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [user, setUser] = useState<UserProfileData>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [editingName, setEditingName] = useState(false);
  const [nameForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [currentMenu, setCurrentMenu] = useState("profile");

  useEffect(() => {
    // when the component is mounted, fetch the profile
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      let { data } = await getProfile();
      const useInfo = data.data;
      setUser({
        firstName: useInfo.firstName,
        lastName: useInfo.lastName,
        email: useInfo.email,
      });
    } catch (error) {
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch profile!"
      );
    }
  };

  const handleNameEdit = () => {
    setEditingName(true);
    nameForm.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
    });
  };

  const handleNameCancel = () => {
    setEditingName(false);
  };

  const handleNameSave = async (values: {
    firstName: string;
    lastName: string;
  }) => {
    try {
      await updateProfile({
        ...user,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      setUser({
        ...user,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      setUserData("firstName", values.firstName);
      setUserData("lastName", values.lastName);
      setEditingName(false);
      messageApi.success("Name updated successfully");
    } catch (error) {
      messageApi.error(error?.response?.data?.message || "Modify failed!");
    }
  };

  const handlePasswordChange = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    console.log("Password change:", values);
    try {
      await changePassword({
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      messageApi.success("Password changed successfully");
      passwordForm.resetFields();
    } catch (error) {
      messageApi.error(error?.response?.data?.message || "Modify failed!");
    }
  };

  const handleSignOutClick = async () => {
    try {
      await signOut();
      localStorage.removeItem("token");
      clearUserData();
      messageApi.success("Successfully signed out");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      messageApi.error("Failed to sign out. Please try again.");
      console.error("Sign out error:", error);
    }
  };

  return (
    <Layout className={styles.layout}>
      {contextHolder}
      <Header className={styles.header}>
        <div className={styles.logo}>
          <SunOutlined />
        </div>
        <div className={styles.signout}>
          <Popconfirm
            title="Are you sure you want to Sign out?"
            onConfirm={handleSignOutClick}
            okText="Yes"
            cancelText="No"
          >
            <Button color="primary" shape="round" variant="solid">
              Sign out
            </Button>
          </Popconfirm>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className={styles.sider}>
          <Menu
            mode="inline"
            className={styles.menu}
            selectedKeys={[currentMenu]}
            onSelect={({ key }) => setCurrentMenu(key)}
            items={[
              {
                key: "profile",
                icon: <UserOutlined />,
                label: "Profile",
              },
              {
                key: "security",
                icon: <LockOutlined />,
                label: "Security",
              },
            ]}
          />
        </Sider>
        <Content className={styles.content}>
          {currentMenu === "profile" && (
            <Card className={styles.card}>
              <div className={styles.profileHeader}>
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                  className={styles.avatar}
                />
                <div>
                  {!editingName ? (
                    <div className={styles.nameDisplay}>
                      <Title level={4}>
                        {user.firstName} {user.lastName}
                      </Title>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={handleNameEdit}
                        className={styles.editButton}
                      />
                    </div>
                  ) : (
                    <Form
                      form={nameForm}
                      layout="vertical"
                      onFinish={handleNameSave}
                      className={styles.nameForm}
                    >
                      <Form.Item
                        label="First name"
                        name="firstName"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your first name",
                          },
                        ]}
                      >
                        <Input placeholder="First name" />
                      </Form.Item>
                      <Form.Item
                        label="Last name"
                        name="lastName"
                        rules={[
                          {
                            required: true,
                            message: "Please enter your last name",
                          },
                        ]}
                      >
                        <Input placeholder="Last name" />
                      </Form.Item>
                      <div className={styles.formPlaceholder}></div>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<CheckOutlined />}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Button
                          onClick={handleNameCancel}
                          icon={<CloseOutlined />}
                        />
                      </Form.Item>
                    </Form>
                  )}
                  <div>Email</div>
                  <Text>{user.email}</Text>
                </div>
              </div>
            </Card>
          )}
          {currentMenu === "security" && (
            <>
              {" "}
              <Card title="Change Password" className={styles.card}>
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handlePasswordChange}
                >
                  <Form.Item
                    name="currentPassword"
                    label="Current Password"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your current password",
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your new password",
                      },
                      {
                        min: 8,
                        message: "Password must be at least 8 characters",
                      },
                      {
                        validator: (_, value) => {
                          if (
                            !value ||
                            (/[a-z]/.test(value) && /[A-Z]/.test(value))
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(
                              "Password must contain both lowercase and uppercase letters"
                            )
                          );
                        },
                      },
                      {
                        validator: (_, value) => {
                          if (!value || /\d/.test(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Password must contain at least 1 number")
                          );
                        },
                      },
                      {
                        validator: (_, value) => {
                          if (!value || /[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Password must contain at least 1 symbol")
                          );
                        },
                      },
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={["newPassword"]}
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your new password",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("The two passwords do not match")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Change Password
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
              <Divider />
              <Card className={styles.card}>
                <PasskeySettings />
              </Card>
            </>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserProfile;
