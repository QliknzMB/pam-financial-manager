'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

interface SubmitButtonProps {
  children: React.ReactNode
  pendingText?: string
}

export function SubmitButton({ children, pendingText = 'Submitting...' }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? pendingText : children}
    </Button>
  )
}
