// Forgot password page component

import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your username to receive a password reset code"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;