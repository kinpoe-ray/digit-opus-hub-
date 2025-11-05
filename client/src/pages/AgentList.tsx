import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Popconfirm, Switch, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { agentsApi } from '../api/agents';
import { Agent, AgentType, AgentStatus } from '../types';
import { PageHeader } from '../components';

const { TextArea } = Input;

const AGENT_TYPE_MAP = {
  [AgentType.CUSTOMER_SERVICE]: { label: '客服', color: 'blue' },
  [AgentType.CONTENT_CREATOR]: { label: '内容创作', color: 'purple' },
  [AgentType.DATA_ANALYST]: { label: '数据分析', color: 'green' },
  [AgentType.CUSTOM]: { label: '自定义', color: 'default' },
};

const AgentList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const response = await agentsApi.getAgents();
      setAgents(response.data || []);
    } catch (error) {
      message.error('加载数字员工列表失败');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (agent?: Agent) => {
    setEditingAgent(agent || null);
    form.setFieldsValue(agent || {});
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingAgent) {
        await agentsApi.updateAgent(editingAgent.id, values);
        message.success('更新成功');
      } else {
        await agentsApi.createAgent(values);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      loadAgents();
    } catch (error: any) {
      if (!error.errorFields) {
        message.error('操作失败');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await agentsApi.deleteAgent(id);
      message.success('删除成功');
      loadAgents();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleToggle = async (agent: Agent) => {
    try {
      await agentsApi.toggleAgent(agent.id);
      message.success('状态已更新');
      loadAgents();
    } catch (error) {
      message.error('更新状态失败');
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: AgentType) => {
        const { label, color } = AGENT_TYPE_MAP[type];
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: AgentStatus, record: Agent) => (
        <Switch
          checked={status === AgentStatus.ACTIVE}
          onChange={() => handleToggle(record)}
          checkedChildren="运行中"
          unCheckedChildren="已停止"
        />
      ),
    },
    { title: '任务数', dataIndex: 'totalTasks', key: 'totalTasks' },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => `${rate.toFixed(1)}%`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Agent) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个数字员工吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="数字员工管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            创建员工
          </Button>
        }
      />

      <Card>
        <Table
          columns={columns}
          dataSource={agents}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>

      <Modal
        title={editingAgent ? '编辑数字员工' : '创建数字员工'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入员工名称' }]}
          >
            <Input placeholder="例如：客服小助手" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择员工类型' }]}
          >
            <Select placeholder="选择员工类型">
              <Select.Option value={AgentType.CUSTOMER_SERVICE}>客服</Select.Option>
              <Select.Option value={AgentType.CONTENT_CREATOR}>内容创作</Select.Option>
              <Select.Option value={AgentType.DATA_ANALYST}>数据分析</Select.Option>
              <Select.Option value={AgentType.CUSTOM}>自定义</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="描述这个数字员工的功能和用途" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue={AgentStatus.INACTIVE}
          >
            <Select>
              <Select.Option value={AgentStatus.ACTIVE}>运行中</Select.Option>
              <Select.Option value={AgentStatus.INACTIVE}>已停止</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AgentList;
