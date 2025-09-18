'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface EnigmaLogoProps {
  /** Size classes for the logo (w-8 h-8, w-6 h-6, etc.) */
  className?: string
  /** Background context to determine appropriate color */
  variant?: 'primary' | 'white' | 'auto'
  /** Custom color override */
  color?: string
}

/**
 * Enigma Restaurant Logo Component
 *
 * Automatically applies correct colors based on context:
 * - 'primary': Atlantic blue for white backgrounds
 * - 'white': White for colored backgrounds
 * - 'auto': Uses CSS currentColor (inherits text color)
 */
export function EnigmaLogo({
  className,
  variant = 'auto',
  color
}: EnigmaLogoProps) {

  // Determine fill color based on variant
  const getFillColor = () => {
    if (color) return color

    switch (variant) {
      case 'primary':
        return 'oklch(0.45 0.15 200)' // Atlantic blue from design system
      case 'white':
        return '#ffffff'
      case 'auto':
      default:
        return 'currentColor' // Inherits from text color
    }
  }

  const fillColor = getFillColor()

  return (
    <svg
      viewBox="0 0 2254 3406"
      className={cn('inline-block', className)}
      fill={fillColor}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Enigma Cocina Con Alma Logo"
    >
      <g transform="translate(0.000000,3406.000000) scale(0.100000,-0.100000)">
        <path d="M9977 34039 c-1839 -67 -3551 -529 -5097 -1375 -1604 -878 -2801
        -2021 -3627 -3464 -121 -210 -340 -653 -438 -885 -432 -1017 -678 -2085 -782
        -3395 -25 -322 -26 -1236 0 -1560 94 -1193 342 -2298 770 -3431 876 -2319
        2214 -4124 4022 -5426 1678 -1208 3551 -1663 5510 -1337 986 164 1984 571
        2910 1187 558 372 930 721 1273 1197 426 593 789 1541 952 2490 143 836 138
        1652 -16 2650 -206 1341 -700 2592 -1375 3480 -277 365 -633 721 -984 986
        -707 533 -1551 889 -2560 1078 -837 157 -1701 88 -2530 -204 -677 -238 -1101
        -493 -1525 -919 -596 -599 -957 -1350 -1076 -2236 -34 -255 -29 -724 12 -1000
        126 -859 476 -1607 1013 -2167 212 -223 570 -506 758 -601 58 -30 254 -109
        258 -105 1 2 12 23 25 47 l22 44 -49 49 c-26 28 -116 101 -198 162 -197 147
        -333 265 -482 418 -551 569 -910 1347 -1015 2203 -20 158 -16 632 6 790 105
        765 417 1406 936 1925 552 552 1280 888 2125 982 160 17 815 18 985 0 221 -23
        431 -52 590 -83 1615 -313 2931 -1370 3583 -2875 249 -576 468 -1454 552
        -2219 56 -513 60 -1121 9 -1615 -109 -1079 -445 -1942 -1040 -2674 -128 -156
        -418 -448 -559 -560 -439 -349 -1025 -642 -1784 -890 -454 -149 -903 -244
        -1381 -292 -209 -22 -752 -25 -955 -6 -742 69 -1439 272 -2145 623 -725 361
        -1294 779 -1900 1395 -527 536 -979 1129 -1437 1884 -1285 2123 -1804 4449
        -1532 6865 211 1882 1027 3472 2390 4656 1204 1047 2660 1725 4303 2004 878
        149 1884 192 2796 119 1801 -143 3454 -714 4955 -1709 531 -352 936 -679 1359
        -1095 563 -555 972 -1090 1346 -1760 518 -928 907 -1980 1124 -3038 109 -531
        175 -1030 218 -1652 17 -247 17 -1269 0 -1520 -70 -1021 -189 -1800 -412
        -2689 -326 -1302 -836 -2548 -1563 -3816 -899 -1570 -2000 -2887 -3257 -3896
        -698 -561 -1437 -1032 -2237 -1427 -892 -440 -1690 -717 -2573 -892 -1009
        -200 -2037 -240 -3141 -120 -575 62 -870 150 -1749 522 -749 317 -1726 677
        -2295 844 -263 78 -431 50 -496 -83 -19 -39 -24 -63 -23 -128 2 -101 25 -170
        114 -343 217 -418 483 -716 980 -1094 603 -458 1290 -829 2155 -1160 1843
        -708 3800 -804 5975 -293 1460 342 2851 966 4083 1832 1153 809 2225 1867
        3142 3098 1058 1420 1874 2988 2525 4851 538 1538 853 3009 964 4499 42 552
        54 1409 28 1870 -67 1157 -233 2155 -527 3150 -770 2612 -2228 4623 -4395
        6060 -1290 856 -2669 1438 -4195 1770 -1090 237 -2302 345 -3418 304z"/>
        <path d="M10215 2891 c-334 -39 -630 -180 -864 -411 -223 -220 -361 -483 -417
        -795 -23 -126 -23 -362 1 -485 91 -481 416 -883 873 -1080 177 -76 348 -110
        556 -110 234 0 415 40 612 134 421 202 708 572 801 1032 25 125 25 414 0 539
        -108 537 -474 953 -977 1113 -176 56 -418 82 -585 63z"/>
      </g>
    </svg>
  )
}

/**
 * Preset variants for common usage patterns
 */
export const EnigmaLogoVariants = {
  /** Logo for white/light backgrounds - uses Atlantic blue */
  primary: (props: Omit<EnigmaLogoProps, 'variant'>) => (
    <EnigmaLogo {...props} variant="primary" />
  ),

  /** Logo for colored/dark backgrounds - uses white */
  white: (props: Omit<EnigmaLogoProps, 'variant'>) => (
    <EnigmaLogo {...props} variant="white" />
  ),

  /** Logo that inherits color from parent - for consistent theming */
  auto: (props: Omit<EnigmaLogoProps, 'variant'>) => (
    <EnigmaLogo {...props} variant="auto" />
  )
}

export default EnigmaLogo