import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Crown, Mail, Phone } from 'lucide-react'
import type { Customer } from '@/lib/validations/customer'

interface CustomerHeaderSimpleProps {
  customer: Customer
}

export function CustomerHeaderSimple({ customer }: CustomerHeaderSimpleProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-[hsl(var(--border))]">
            <AvatarFallback className="text-sm sm:text-lg font-semibold bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
              {`${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">
                {customer.firstName} {customer.lastName}
              </h1>
              {customer.isVip && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800">
                  <Crown className="h-3 w-3 mr-1" />VIP
                </Badge>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-[hsl(var(--muted-foreground))]">
              <div className="flex items-center gap-1 min-w-0">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-1 min-w-0">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{customer.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}