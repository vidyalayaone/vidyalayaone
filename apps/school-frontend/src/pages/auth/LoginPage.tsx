// Login page component

import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your school portal account"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;