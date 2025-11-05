'use client'

import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/actions'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Transactions', href: '/transactions' },
    { name: 'Budgets', href: '/budgets' },
    { name: 'Accounts', href: '/accounts' },
    { name: 'Profile', href: '/profile' },
  ]

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold">
              PAM 🏃‍♀️💰
            </Link>
            <nav className="hidden md:flex space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <form action={signOut}>
            <Button variant="outline" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
