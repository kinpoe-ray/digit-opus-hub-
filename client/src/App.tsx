import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 布局
import MainLayout from './layouts/MainLayout';

// 页面
import Dashboard from './pages/Dashboard';
import AgentList from './pages/AgentList';
import AgentDetail from './pages/AgentDetail';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetail';
import WorkflowEditor from './pages/WorkflowEditor';
import Login from './pages/Login';

// 认证
import { useAuthStore } from './stores/authStore';

// React Query 配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 私有路由组件
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#2563eb',
          },
        }}
      >
        <BrowserRouter>
          <Routes>
            {/* 登录页 */}
            <Route path="/login" element={<Login />} />

            {/* 主应用 */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="agents" element={<AgentList />} />
              <Route path="agents/:id" element={<AgentDetail />} />
              <Route path="tasks" element={<TaskList />} />
              <Route path="tasks/:id" element={<TaskDetail />} />
              <Route path="workflows" element={<WorkflowEditor />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
