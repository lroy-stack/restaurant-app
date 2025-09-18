import { Card, CardContent } from '@/components/ui/card'

export default function MenuLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-muted rounded animate-pulse w-48 mb-2" />
          <div className="h-4 bg-muted rounded animate-pulse w-64" />
        </div>
        <div className="flex gap-3">
          <div className="h-8 bg-muted rounded animate-pulse w-24" />
          <div className="h-8 bg-muted rounded animate-pulse w-32" />
          <div className="h-8 bg-muted rounded animate-pulse w-28" />
        </div>
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-muted rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded animate-pulse w-16 mb-1" />
                  <div className="h-6 bg-muted rounded animate-pulse w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions Bar Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 bg-muted rounded animate-pulse w-32" />
        <div className="flex gap-2">
          <div className="h-8 bg-muted rounded animate-pulse w-20" />
          <div className="h-8 bg-muted rounded animate-pulse w-24" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <Card>
        <CardContent className="p-6">
          {/* Table Header */}
          <div className="flex gap-4 mb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse flex-1" />
            ))}
          </div>

          {/* Table Rows */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-4 mb-3">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="h-10 bg-muted rounded animate-pulse flex-1" />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}