// Reset password page component

import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create New Password"
      description="Choose a strong password to secure your account"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};

export default ResetPasswordPage;