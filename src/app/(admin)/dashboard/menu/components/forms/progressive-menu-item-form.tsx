'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import {
  createMenuItemSchema,
  type MenuItemFormData,
  defaultMenuItemValues
} from '../../schemas/menu-item.schema'
import { useAllergens } from '../../hooks/use-allergens'

interface ProgressiveMenuItemFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProgressiveMenuItemForm({ onSuccess, onCancel }: ProgressiveMenuItemFormProps) {
  // Test: Add allergens hook
  const { allergens, loading: allergensLoading, error: allergensError } = useAllergens()

  // Step 1: Try just the form setup
  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(createMenuItemSchema),
    defaultValues: defaultMenuItemValues
  })

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      console.log('Form data:', data)
      toast.success('Test form submitted!')
      onSuccess?.()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error submitting form')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold">Progressive Menu Item Form</h3>
        <p className="text-sm text-muted-foreground">
          Testing React Hook Form integration step by step.
        </p>
        <p className="text-xs text-blue-600">
          Allergens: {allergensLoading ? 'Loading...' : `${allergens.length} loaded`}
          {allergensError && <span className="text-red-600"> (Error: {allergensError})</span>}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Create Item
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}