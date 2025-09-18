'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { User, Crown, Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  isVip: boolean
  language: string
}

interface CustomerSearchInputProps {
  value: string
  matches: Customer[]
  onSelect: (customer: Customer) => void
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function CustomerSearchInput({
  value,
  matches,
  onSelect,
  onChange,
  className,
  placeholder = "Buscar cliente por nombre..."
}: CustomerSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Show dropdown when there are matches and input has focus
  const shouldShowDropdown = isOpen && matches.length > 0 && value.length > 0

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!shouldShowDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < matches.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && matches[selectedIndex]) {
          handleSelect(matches[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSelect = (customer: Customer) => {
    onChange(`${customer.firstName} ${customer.lastName}`)
    onSelect(customer)
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setIsOpen(newValue.length > 0)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    if (value.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* Input Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 h-9"
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {shouldShowDropdown && (
        <Card
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto shadow-lg border"
        >
          <CardContent className="p-2">
            {matches.map((customer, index) => (
              <div
                key={customer.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  selectedIndex === index && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleSelect(customer)}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <User className="w-4 h-4 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {customer.firstName} {customer.lastName}
                    </p>
                    {customer.isVip && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {customer.email}
                  </p>
                  {customer.phone && (
                    <p className="text-xs text-muted-foreground">
                      {customer.phone}
                    </p>
                  )}
                </div>

                {customer.isVip && (
                  <Badge variant="secondary" className="text-xs">
                    VIP
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}