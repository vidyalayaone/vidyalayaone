// OTP verification page component

import React from 'react';
import AuthLayout from '@/components/layout/AuthLayout';
import VerifyOTPForm from '@/components/auth/VerifyOTPForm';

const VerifyOTPPage: React.FC = () => {
  return (
    <AuthLayout
      title="Verify Your Identity"
      description="Enter the verification code sent to your phone"
    >
      <VerifyOTPForm />
    </AuthLayout>
  );
};

export default VerifyOTPPage;