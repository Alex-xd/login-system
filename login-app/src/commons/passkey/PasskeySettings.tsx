/**
 * @fileoverview The component for the passkey settings.
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Modal,
  Button,
  List,
  Popconfirm,
  Empty,
  Spin,
  message,
} from "antd";
import {
  KeyOutlined,
  DeleteOutlined,
  PlusOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import {
  getUserPasskeys,
  deleteUserPasskey,
} from "../../services/passkeyServices";
import PasskeyRegistration from "./PasskeyRegistration";
import styles from "./PasskeySettings.module.css";

const { Title, Text } = Typography;

interface Passkey {
  _id: string;
  credentialID: string;
  deviceName: string;
  createdAt: string;
}

const PasskeySettings: React.FC = () => {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const fetchPasskeys = async () => {
    setLoading(true);
    try {
      const response = await getUserPasskeys();
      setPasskeys(response.data.data);
    } catch (error) {
      messageApi.error("Failed to load your passkeys");
      console.error("Error fetching passkeys:", error);
    } finally {
      setLoading(false);
    }
  };

  // fetch the passkeys when the component is mounted
  useEffect(() => {
    fetchPasskeys();
  }, []);

  const handleDelete = async (passkeyId: string) => {
    setDeleting((prev) => ({ ...prev, [passkeyId]: true }));
    try {
      await deleteUserPasskey(passkeyId);
      messageApi.success("Passkey deleted successfully");
      setPasskeys(passkeys.filter((pk) => pk._id !== passkeyId));
    } catch (error) {
      messageApi.error("Failed to delete passkey");
      console.error("Error deleting passkey:", error);
    } finally {
      setDeleting((prev) => ({ ...prev, [passkeyId]: false }));
    }
  };

  // const handleRegistrationSuccess = () => {
  //   setShowRegistration(false);
  //   fetchPasskeys();
  //   messageApi.success('New passkey added successfully');
  // };

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    // format the date to the format "MM/DD/YYYY"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const handleRegistrationSuccess = () => {
    setIsModalVisible(false);
    fetchPasskeys();
    messageApi.success("New passkey added successfully");
  };

  return (
    <div className={styles.passkeySettings}>
      {contextHolder}
      <div className={styles.header}>
        <div>
          <Title level={4} className={styles.title}>
            <SafetyOutlined className={styles.titleIcon} /> Passkeys
          </Title>
          <Text type="secondary">
            Manage passkeys for passwordless authentication across your devices
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add New Passkey
        </Button>
      </div>
      <Modal
        title="Register New Passkey"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        <PasskeyRegistration
          onSuccess={handleRegistrationSuccess}
          onCancel={() => setIsModalVisible(false)}
        />
      </Modal>
      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {passkeys.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="You don't have any passkeys yet"
              className={styles.empty}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Add Your First Passkey
              </Button>
            </Empty>
          ) : (
            <List
              className={styles.passkeyList}
              itemLayout="horizontal"
              dataSource={passkeys}
              renderItem={(item) => (
                <List.Item
                  key={item._id}
                  actions={[
                    <Popconfirm
                      title="Delete this passkey?"
                      description="This action cannot be undone"
                      onConfirm={() => handleDelete(item._id)}
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        loading={deleting[item._id]}
                      >
                        Remove
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<KeyOutlined className={styles.keyIcon} />}
                    title={item.deviceName}
                    description={`Added on ${formatDate(item.createdAt)}`}
                  />
                </List.Item>
              )}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PasskeySettings;
