import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Badge,
} from 'antd';
import { PlusOutlined, StopOutlined } from '@ant-design/icons';
import { tasksApi } from '../api/tasks';
import { agentsApi } from '../api/agents';
import { Task, TaskStatus, TaskPriority, Agent } from '../types';

const { TextArea } = Input;

const TaskList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTasks();
    loadAgents();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await tasksApi.getTasks();
      setTasks(response.data || []);
    } catch (error) {
      message.error('加载任务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await agentsApi.getAgents();
      setAgents(response.data || []);
    } catch (error) {
      console.error('加载员工列表失败');
    }
  };

  const showModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await tasksApi.createTask({
        ...values,
        input: { description: values.description },
      });
      message.success('任务创建成功');
      setIsModalVisible(false);
      loadTasks();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error('创建任务失败');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await tasksApi.cancelTask(id);
      message.success('任务已取消');
      loadTasks();
    } catch (error) {
      message.error('取消任务失败');
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    const statusMap = {
      [TaskStatus.PENDING]: { status: 'default' as const, text: '等待中' },
      [TaskStatus.RUNNING]: { status: 'processing' as const, text: '执行中' },
      [TaskStatus.COMPLETED]: { status: 'success' as const, text: '已完成' },
      [TaskStatus.FAILED]: { status: 'error' as const, text: '失败' },
      [TaskStatus.CANCELLED]: { status: 'warning' as const, text: '已取消' },
    };
    const { status: badgeStatus, text } = statusMap[status];
    return <Badge status={badgeStatus} text={text} />;
  };

  const getPriorityTag = (priority: TaskPriority) => {
    const priorityMap = {
      [TaskPriority.LOW]: { color: 'default', text: '低' },
      [TaskPriority.MEDIUM]: { color: 'blue', text: '中' },
      [TaskPriority.HIGH]: { color: 'orange', text: '高' },
      [TaskPriority.URGENT]: { color: 'red', text: '紧急' },
    };
    const { color, text } = priorityMap[priority];
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: '任务标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: TaskPriority) => getPriorityTag(priority),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => getStatusBadge(status),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Task) => (
        <Space>
          {(record.status === TaskStatus.PENDING ||
            record.status === TaskStatus.RUNNING) && (
            <Button
              type="link"
              danger
              icon={<StopOutlined />}
              onClick={() => handleCancel(record.id)}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>任务列表</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          创建任务
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '8px 0' }}>
              <p>
                <strong>描述：</strong>
                {record.description || '无'}
              </p>
              {record.error && (
                <p style={{ color: 'red' }}>
                  <strong>错误信息：</strong>
                  {record.error}
                </p>
              )}
            </div>
          ),
        }}
      />

      <Modal
        title="创建任务"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="例如：生成产品介绍文案" />
          </Form.Item>

          <Form.Item
            name="agentId"
            label="执行员工"
            rules={[{ required: true, message: '请选择执行员工' }]}
          >
            <Select placeholder="选择数字员工">
              {agents.map((agent) => (
                <Select.Option key={agent.id} value={agent.id}>
                  {agent.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="任务类型"
            rules={[{ required: true, message: '请输入任务类型' }]}
          >
            <Input placeholder="例如：content_generation" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            initialValue={TaskPriority.MEDIUM}
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select>
              <Select.Option value={TaskPriority.LOW}>低</Select.Option>
              <Select.Option value={TaskPriority.MEDIUM}>中</Select.Option>
              <Select.Option value={TaskPriority.HIGH}>高</Select.Option>
              <Select.Option value={TaskPriority.URGENT}>紧急</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="任务描述">
            <TextArea rows={4} placeholder="详细描述任务要求和期望结果" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskList;
