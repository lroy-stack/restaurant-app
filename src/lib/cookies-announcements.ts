/**
 * ANNOUNCEMENT COOKIES UTILITIES
 * Manage dismissal cookies for announcements
 */

export function setCookie(name: string, value: string, days: number) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

export function getCookie(name: string): string | null {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export function deleteCookie(name: string) {
  document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/'
}

export function hasBeenDismissed(announcementId: string): boolean {
  return getCookie(`announcement_dismissed_${announcementId}`) !== null
}

export function markAsDismissed(
  announcementId: string,
  showOncePerDay: boolean,
  showOncePerSession: boolean
) {
  if (showOncePerSession) {
    // Session cookie (expires when browser closes)
    sessionStorage.setItem(`announcement_dismissed_${announcementId}`, 'true')
  } else if (showOncePerDay) {
    // 24-hour cookie
    setCookie(`announcement_dismissed_${announcementId}`, 'dismissed', 1)
  }
  // If both flags are false, don't save anything - announcement shows every visit
}

export function wasShownInSession(announcementId: string): boolean {
  return sessionStorage.getItem(`announcement_dismissed_${announcementId}`) === 'true'
}

export function clearAnnouncementCookies() {
  // Clear all announcement-related cookies
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const name = cookie.split('=')[0].trim()
    if (name.startsWith('announcement_dismissed_')) {
      deleteCookie(name)
    }
  }
  // Clear session storage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('announcement_dismissed_')) {
      sessionStorage.removeItem(key)
    }
  })
}
