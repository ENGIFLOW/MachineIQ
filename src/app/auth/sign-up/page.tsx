import { AuthLayout } from '@/components/auth/AuthLayout'
import { SignUpForm } from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start mastering CNC programming with AI-powered coaching"
    >
      <SignUpForm />
    </AuthLayout>
  )
}

