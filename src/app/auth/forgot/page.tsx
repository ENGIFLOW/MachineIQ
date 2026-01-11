import { Suspense } from 'react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email to receive a password reset link"
    >
      <Suspense fallback={<div className="text-sm text-muted-ink">Loading...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}
