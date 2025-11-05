import React, { memo } from 'react';
import { Card, Statistic } from 'antd';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  precision?: number;
  valueStyle?: React.CSSProperties;
}

export const StatCard: React.FC<StatCardProps> = memo(({
  title,
  value,
  prefix,
  suffix,
  precision,
  valueStyle,
}) => {
  return (
    <Card bordered={false} className="stat-card">
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        precision={precision}
        valueStyle={valueStyle}
      />
    </Card>
  );
});

StatCard.displayName = 'StatCard';
