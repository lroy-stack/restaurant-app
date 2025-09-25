'use client'

import { useState, useEffect } from 'react'

interface NewsletterSubscription {
  id: string
  email: string
  customer_id?: string
  subscription_source: string
  subscription_date: string
  unsubscribed_at?: string
}

interface NewsletterStatus {
  isSubscribed: boolean
  subscription: NewsletterSubscription | null
  loading: boolean
  error: string | null
}

export function useNewsletterStatus(email?: string): NewsletterStatus {
  const [status, setStatus] = useState<NewsletterStatus>({
    isSubscribed: false,
    subscription: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!email) {
      setStatus({
        isSubscribed: false,
        subscription: null,
        loading: false,
        error: null
      })
      return
    }

    const fetchNewsletterStatus = async () => {
      try {
        setStatus(prev => ({ ...prev, loading: true, error: null }))

        const response = await fetch(`/api/newsletter/subscribe?email=${encodeURIComponent(email)}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setStatus({
            isSubscribed: data.isSubscribed,
            subscription: data.subscription,
            loading: false,
            error: null
          })
        } else {
          setStatus({
            isSubscribed: false,
            subscription: null,
            loading: false,
            error: data.error || 'Failed to fetch newsletter status'
          })
        }
      } catch (error) {
        console.error('Newsletter status error:', error)
        setStatus({
          isSubscribed: false,
          subscription: null,
          loading: false,
          error: 'Network error'
        })
      }
    }

    fetchNewsletterStatus()
  }, [email])

  return status
}