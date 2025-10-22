import { cn } from '@/lib/utils'

interface EnigmaLogoProps {
  className?: string
  size?: number
  variant?: 'primary' | 'white'
}

export function EnigmaLogo({ className, size = 24, variant = 'primary' }: EnigmaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={cn(variant === 'white' ? 'text-white' : 'text-primary', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cabeza de león - Vista frontal */}

      {/* Melena exterior - capa 1 */}
      <path d="M100 30
        C85 30, 70 35, 58 45
        C50 52, 43 62, 40 75
        C38 82, 37 90, 37 98
        C37 110, 40 122, 45 132
        C40 138, 35 145, 32 153
        C30 158, 28 164, 28 170
        C28 178, 32 185, 38 188
        C42 145, 50 120, 65 105
        C55 115, 48 128, 45 145
        C60 140, 72 135, 82 128
        C75 135, 70 143, 68 152
        C80 148, 90 142, 100 135
        C110 142, 120 148, 132 152
        C130 143, 125 135, 118 128
        C128 135, 140 140, 155 145
        C152 128, 145 115, 135 105
        C150 120, 158 145, 162 188
        C168 185, 172 178, 172 170
        C172 164, 170 158, 168 153
        C165 145, 160 138, 155 132
        C160 122, 163 110, 163 98
        C163 90, 162 82, 160 75
        C157 62, 150 52, 142 45
        C130 35, 115 30, 100 30 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"/>

      {/* Melena interior - detalles */}
      <path d="M100 45 L95 60 M100 45 L105 60" strokeWidth="1.5"/>
      <path d="M75 52 L72 68 M125 52 L128 68" strokeWidth="1.5"/>
      <path d="M58 68 L55 85 M142 68 L145 85" strokeWidth="1.5"/>
      <path d="M48 95 L45 110 M152 95 L155 110" strokeWidth="1.5"/>
      <path d="M45 125 L42 140 M155 125 L158 140" strokeWidth="1.5"/>

      {/* Cara del león */}
      <ellipse cx="100" cy="105" rx="35" ry="42" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="2"/>

      {/* Orejas */}
      <path d="M75 75 Q70 70, 72 65 Q75 60, 78 63" strokeWidth="2"/>
      <path d="M125 75 Q130 70, 128 65 Q125 60, 122 63" strokeWidth="2"/>

      {/* Ojos */}
      <ellipse cx="88" cy="100" rx="4.5" ry="6" fill="currentColor"/>
      <ellipse cx="112" cy="100" rx="4.5" ry="6" fill="currentColor"/>
      <circle cx="89" cy="99" r="1.5" fill="white"/>
      <circle cx="113" cy="99" r="1.5" fill="white"/>

      {/* Cejas/arrugas expresivas */}
      <path d="M82 93 Q85 91, 88 92" strokeWidth="1.5"/>
      <path d="M112 92 Q115 91, 118 93" strokeWidth="1.5"/>

      {/* Nariz */}
      <path d="M100 108 L95 115 Q97.5 117, 100 116 Q102.5 117, 105 115 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>

      {/* Boca/hocico */}
      <path d="M100 116 L100 122" strokeWidth="2"/>
      <path d="M100 122 Q92 128, 85 126" strokeWidth="1.5"/>
      <path d="M100 122 Q108 128, 115 126" strokeWidth="1.5"/>

      {/* Bigotes */}
      <path d="M85 115 L65 112" strokeWidth="1.5" strokeOpacity="0.7"/>
      <path d="M85 118 L65 120" strokeWidth="1.5" strokeOpacity="0.7"/>
      <path d="M85 121 L68 128" strokeWidth="1.5" strokeOpacity="0.7"/>

      <path d="M115 115 L135 112" strokeWidth="1.5" strokeOpacity="0.7"/>
      <path d="M115 118 L135 120" strokeWidth="1.5" strokeOpacity="0.7"/>
      <path d="M115 121 L132 128" strokeWidth="1.5" strokeOpacity="0.7"/>

      {/* Detalles de melena en mejillas */}
      <path d="M72 130 Q70 135, 72 140" strokeWidth="1.5" strokeOpacity="0.6"/>
      <path d="M128 130 Q130 135, 128 140" strokeWidth="1.5" strokeOpacity="0.6"/>
    </svg>
  )
}