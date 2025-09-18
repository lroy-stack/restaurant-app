'use client'

import { Button } from '@/components/ui/button'

interface SimpleMenuItemFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function SimpleMenuItemForm({ onSuccess, onCancel }: SimpleMenuItemFormProps) {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold">Simple Menu Item Form</h3>
        <p className="text-sm text-muted-foreground">
          This is a test form to verify modal functionality.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Item Name</label>
          <input
            type="text"
            className="w-full h-9 px-3 border border-input rounded-md bg-transparent"
            placeholder="Enter item name"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Price</label>
          <input
            type="number"
            className="w-full h-9 px-3 border border-input rounded-md bg-transparent"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            console.log('Form submitted!')
            onSuccess?.()
          }}
        >
          Create Item
        </Button>
      </div>
    </div>
  )
}