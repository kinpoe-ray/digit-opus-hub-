import React, { memo } from 'react';

interface PageHeaderProps {
  title: string;
  extra?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = memo(({ title, extra }) => {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      {extra && <div className="page-extra">{extra}</div>}
    </div>
  );
});

PageHeader.displayName = 'PageHeader';
