'use client'

import * as React from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  value?: string
  onChange?: (value: string | undefined) => void
  defaultCountry?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
}

export const InternationalPhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, defaultCountry = 'ES', placeholder, className, disabled = false, error = false }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <PhoneInput
          international
          defaultCountry={defaultCountry as any}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "phone-input-wrapper",
            error && "phone-input-error"
          )}
          numberInputProps={{
            className: cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1",
              "text-base md:text-sm", // Fix auto-zoom iOS
              "ring-offset-background",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive"
            ),
            ref: ref as any,
          }}
        />
      </div>
    )
  }
)

InternationalPhoneInput.displayName = 'InternationalPhoneInput'
