'use client'

import { Star, Award, Users } from "lucide-react"
import CountUp from "react-countup"

interface HeroTrustSignalsProps {
  googleRating: number
  awards: string
  monthlyCustomers: number
}

export function HeroTrustSignals({ googleRating, awards, monthlyCustomers }: HeroTrustSignalsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-6 text-sm">
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="enigma-brand-body font-semibold text-white">{googleRating}/5</span>
        <span className="text-white/80">Google</span>
      </div>
      <div className="flex items-center gap-1">
        <Award className="h-4 w-4 text-yellow-400" />
        <span className="enigma-brand-body text-white/90 font-medium">{awards}</span>
      </div>
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-white/90" />
        <span className="enigma-brand-body text-white/90 font-medium">
          <CountUp end={monthlyCustomers} duration={2.5} separator="," suffix="+" /> clientes satisfechos/mes
        </span>
      </div>
    </div>
  )
}
