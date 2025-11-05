import { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  algorithm: undefined, // We're using custom dark theme via CSS
  token: {
    colorPrimary: '#6366f1',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#8b5cf6',
    colorBgBase: '#0f0c29',
    colorTextBase: '#e5e7eb',
    borderRadius: 12,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeightStrong: 600,
    lineHeight: 1.6,
    controlHeight: 40,
    controlHeightLG: 48,
  },
  components: {
    Layout: {
      headerBg: 'rgba(17, 24, 39, 0.8)',
      bodyBg: 'transparent',
      siderBg: 'rgba(17, 24, 39, 0.8)',
      headerHeight: 64,
      headerPadding: '0 32px',
    },
    Card: {
      borderRadiusLG: 20,
      paddingLG: 24,
    },
    Button: {
      borderRadius: 12,
      controlHeight: 40,
      fontWeight: 600,
      primaryShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
    },
    Input: {
      borderRadius: 12,
      controlHeight: 40,
      paddingBlock: 10,
      paddingInline: 16,
    },
    Select: {
      borderRadius: 12,
      controlHeight: 40,
    },
    Table: {
      borderRadius: 16,
      headerBg: 'rgba(99, 102, 241, 0.1)',
      headerColor: '#e5e7eb',
      rowHoverBg: 'rgba(99, 102, 241, 0.1)',
    },
    Menu: {
      itemBorderRadius: 12,
      itemHeight: 48,
      itemMarginBlock: 4,
      itemMarginInline: 12,
    },
    Modal: {
      borderRadiusLG: 20,
      contentBg: 'rgba(17, 24, 39, 0.95)',
      headerBg: 'transparent',
    },
    Tag: {
      borderRadiusSM: 8,
      fontWeight: 600,
    },
  },
};
