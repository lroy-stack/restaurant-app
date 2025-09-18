import { ElementType } from '@/app/(admin)/dashboard/mesas/components/floor-plan/utils/elementTypes'

export interface DatabaseFloorPlanElement {
  id: string
  restaurant_id: string
  element_type: ElementType
  position_x: number
  position_y: number
  width: number
  height: number
  rotation: number
  z_index: number
  style_data: any
  element_data: any
  created_at: string
  updated_at: string
}

export interface CreateFloorPlanElementRequest {
  element_type: ElementType
  position_x: number
  position_y: number
  width?: number
  height?: number
  rotation?: number
  z_index?: number
  style_data?: any
  element_data?: any
}

export interface UpdateFloorPlanElementRequest {
  id: string
  element_type?: ElementType
  position_x?: number
  position_y?: number
  width?: number
  height?: number
  rotation?: number
  z_index?: number
  style_data?: any
  element_data?: any
}

class FloorPlanElementsService {
  private baseUrl = '/api/admin/floor-plan-elements'

  async getElements(): Promise<DatabaseFloorPlanElement[]> {
    try {
      const response = await fetch(this.baseUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.elements || []
    } catch (error) {
      console.error('Error fetching floor plan elements:', error)
      throw error
    }
  }

  async createElement(element: CreateFloorPlanElementRequest): Promise<DatabaseFloorPlanElement> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(element),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.element
    } catch (error) {
      console.error('Error creating floor plan element:', error)
      throw error
    }
  }

  async updateElement(element: UpdateFloorPlanElementRequest): Promise<DatabaseFloorPlanElement> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(element),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.element
    } catch (error) {
      console.error('Error updating floor plan element:', error)
      throw error
    }
  }

  async deleteElement(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting floor plan element:', error)
      throw error
    }
  }

  async batchUpdateElements(elements: UpdateFloorPlanElementRequest[]): Promise<DatabaseFloorPlanElement[]> {
    try {
      const response = await fetch(`${this.baseUrl}/batch`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ elements }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.elements
    } catch (error) {
      console.error('Error batch updating floor plan elements:', error)
      throw error
    }
  }
}

export const floorPlanElementsService = new FloorPlanElementsService()