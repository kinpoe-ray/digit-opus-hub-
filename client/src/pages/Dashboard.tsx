import React, { useEffect, useState, useMemo, memo } from 'react';
import { Row, Col, Spin, message } from 'antd';
import {
  RobotOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { dashboardApi } from '../api/dashboard';
import { DashboardStats } from '../types';
import { PageHeader, StatCard } from '../components';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    activeAgents: 0,
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    successRate: 0,
    todayTasks: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        message.error('加载统计数据失败');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const successRateColor = useMemo(
    () => (stats.successRate >= 80 ? '#10b981' : '#ef4444'),
    [stats.successRate]
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="仪表盘" />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总数字员工"
            value={stats.totalAgents}
            prefix={<RobotOutlined />}
            valueStyle={{ color: '#10b981' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="活跃员工"
            value={stats.activeAgents}
            prefix={<SyncOutlined spin />}
            valueStyle={{ color: '#6366f1' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="已完成任务"
            value={stats.completedTasks}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#10b981' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="失败任务"
            value={stats.failedTasks}
            prefix={<CloseCircleOutlined />}
            valueStyle={{ color: '#ef4444' }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="总任务数" value={stats.totalTasks} suffix="个" />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="成功率"
            value={stats.successRate}
            precision={1}
            suffix="%"
            valueStyle={{ color: successRateColor }}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="今日任务" value={stats.todayTasks} suffix="个" />
        </Col>
      </Row>
    </>
  );
};

export default memo(Dashboard);
