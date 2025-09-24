// src/types/index.ts
// Barrel exports for all type definitions

// Export database types (real structure)
export * from './database'

// Export legal/compliance types
export * from './legal'

// Export Prisma types for backwards compatibility
export * from './prisma.d'

// Re-export common interfaces with aliases for easy migration
export type {
  Reservation,
  Customer,
  DatabaseTable as Table,
  DatabaseMenuItem as MenuItem,
  DatabaseUser as User,
  CalendarEvent,
  ReservationFormData,
  CustomerFormData,
  ApiResponse,
  PaginatedResponse,
  UseReservationsReturn,
  UseCustomersReturn,

  // Enums
  ReservationStatus,
  TableLocation,
  UserRole,
  CategoryType,
  OrderStatus,
  OrderItemStatus
} from './database'