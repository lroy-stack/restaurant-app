import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const to = searchParams.get('to') || new Date().toISOString()

    const supabase = await createServiceClient()

    // GDPR Compliance analytics query
    const complianceQuery = `
      WITH date_range AS (
        SELECT
          $1::timestamp as start_date,
          $2::timestamp as end_date
      ),
      cookie_consent_metrics AS (
        SELECT
          COUNT(*) as total_consents,
          COUNT(*) FILTER (WHERE analytics_consent = true) as analytics_consents,
          COUNT(*) FILTER (WHERE marketing_consent = true) as marketing_consents,
          COUNT(*) FILTER (WHERE functional_consent = true) as functional_consents,
          COUNT(*) FILTER (WHERE withdrawn_at IS NOT NULL) as withdrawals,
          ROUND(
            COUNT(*) FILTER (WHERE analytics_consent = true)::decimal /
            NULLIF(COUNT(*), 0) * 100, 2
          ) as analytics_opt_in_rate,
          ROUND(
            COUNT(*) FILTER (WHERE marketing_consent = true)::decimal /
            NULLIF(COUNT(*), 0) * 100, 2
          ) as marketing_opt_in_rate,
          ROUND(
            COUNT(*) FILTER (WHERE withdrawn_at IS NOT NULL)::decimal /
            NULLIF(COUNT(*), 0) * 100, 2
          ) as withdrawal_rate
        FROM public.cookie_consents cc
        CROSS JOIN date_range dr
        WHERE cc.created_at >= dr.start_date
          AND cc.created_at <= dr.end_date
      ),
      daily_consent_trends AS (
        SELECT
          DATE(cc.created_at) as consent_date,
          COUNT(*) as daily_consents,
          COUNT(*) FILTER (WHERE analytics_consent = true) as daily_analytics,
          COUNT(*) FILTER (WHERE marketing_consent = true) as daily_marketing,
          COUNT(*) FILTER (WHERE withdrawn_at IS NOT NULL) as daily_withdrawals
        FROM public.cookie_consents cc
        CROSS JOIN date_range dr
        WHERE cc.created_at >= dr.start_date
          AND cc.created_at <= dr.end_date
        GROUP BY DATE(cc.created_at)
        ORDER BY consent_date DESC
        LIMIT 30
      ),
      email_compliance AS (
        SELECT
          COUNT(*) as total_emails_sent,
          COUNT(*) FILTER (WHERE status = 'delivered') as delivered_emails,
          COUNT(*) FILTER (WHERE status = 'bounced') as bounced_emails,
          COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_emails,
          ROUND(
            COUNT(*) FILTER (WHERE status = 'delivered')::decimal /
            NULLIF(COUNT(*), 0) * 100, 2
          ) as delivery_rate,
          ROUND(
            COUNT(*) FILTER (WHERE status = 'bounced')::decimal /
            NULLIF(COUNT(*), 0) * 100, 2
          ) as bounce_rate
        FROM public.email_logs el
        CROSS JOIN date_range dr
        WHERE el.sent_at >= dr.start_date
          AND el.sent_at <= dr.end_date
      ),
      overall_compliance AS (
        SELECT
          ccm.total_consents,
          ccm.analytics_opt_in_rate,
          ccm.marketing_opt_in_rate,
          ccm.withdrawal_rate,
          ec.delivery_rate,
          ec.bounce_rate,
          CASE
            WHEN ccm.analytics_opt_in_rate >= 95 AND ccm.withdrawal_rate <= 5 AND ec.bounce_rate <= 2
            THEN 'compliant'
            WHEN ccm.analytics_opt_in_rate >= 80 AND ccm.withdrawal_rate <= 10 AND ec.bounce_rate <= 5
            THEN 'warning'
            ELSE 'non-compliant'
          END as compliance_status,
          ROUND(
            (ccm.analytics_opt_in_rate + ccm.marketing_opt_in_rate +
             (100 - ccm.withdrawal_rate) + ec.delivery_rate) / 4, 2
          ) as overall_compliance_score
        FROM cookie_consent_metrics ccm
        CROSS JOIN email_compliance ec
      )
      SELECT
        oc.analytics_opt_in_rate,
        oc.marketing_opt_in_rate,
        oc.withdrawal_rate,
        oc.delivery_rate,
        oc.bounce_rate,
        oc.compliance_status,
        oc.overall_compliance_score,
        oc.total_consents,
        json_agg(
          json_build_object(
            'date', dct.consent_date,
            'consents', dct.daily_consents,
            'analytics', dct.daily_analytics,
            'marketing', dct.daily_marketing,
            'withdrawals', dct.daily_withdrawals
          ) ORDER BY dct.consent_date DESC
        ) FILTER (WHERE dct.consent_date IS NOT NULL) as daily_trends
      FROM overall_compliance oc
      LEFT JOIN daily_consent_trends dct ON true
      GROUP BY
        oc.analytics_opt_in_rate, oc.marketing_opt_in_rate, oc.withdrawal_rate,
        oc.delivery_rate, oc.bounce_rate, oc.compliance_status,
        oc.overall_compliance_score, oc.total_consents
    `

    // Execute the compliance query using raw SQL
    const { data: complianceData, error } = await supabase.rpc('exec_sql', {
      sql: complianceQuery,
      params: [from, to]
    })

    // If RPC doesn't work, fall back to individual queries
    if (error) {
      console.log('RPC not available, using individual queries for compliance')

      const [
        { data: cookieConsents },
        { data: emailLogs },
        { count: totalConsents },
        { count: analyticsConsents },
        { count: marketingConsents },
        { count: withdrawals }
      ] = await Promise.all([
        // All cookie consents in period
        supabase
          .schema('public')
          .from('cookie_consents')
          .select('created_at, analytics_consent, marketing_consent, functional_consent, withdrawn_at')
          .gte('created_at', from)
          .lte('created_at', to),

        // Email logs in period
        supabase
          .schema('public')
          .from('email_logs')
          .select('sent_at, status, recipient_email')
          .gte('sent_at', from)
          .lte('sent_at', to),

        // Total consents
        supabase
          .schema('public')
          .from('cookie_consents')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', from)
          .lte('created_at', to),

        // Analytics consents
        supabase
          .schema('public')
          .from('cookie_consents')
          .select('*', { count: 'exact', head: true })
          .eq('analytics_consent', true)
          .gte('created_at', from)
          .lte('created_at', to),

        // Marketing consents
        supabase
          .schema('public')
          .from('cookie_consents')
          .select('*', { count: 'exact', head: true })
          .eq('marketing_consent', true)
          .gte('created_at', from)
          .lte('created_at', to),

        // Withdrawals
        supabase
          .schema('public')
          .from('cookie_consents')
          .select('*', { count: 'exact', head: true })
          .not('withdrawn_at', 'is', null)
          .gte('created_at', from)
          .lte('created_at', to)
      ])

      // Calculate metrics manually
      const analyticsOptInRate = totalConsents > 0 ? (analyticsConsents / totalConsents) * 100 : 0
      const marketingOptInRate = totalConsents > 0 ? (marketingConsents / totalConsents) * 100 : 0
      const withdrawalRate = totalConsents > 0 ? (withdrawals / totalConsents) * 100 : 0

      // Email metrics
      const totalEmailsSent = emailLogs?.length || 0
      const deliveredEmails = emailLogs?.filter(email => email.status === 'delivered').length || 0
      const bouncedEmails = emailLogs?.filter(email => email.status === 'bounced').length || 0
      const deliveryRate = totalEmailsSent > 0 ? (deliveredEmails / totalEmailsSent) * 100 : 0
      const bounceRate = totalEmailsSent > 0 ? (bouncedEmails / totalEmailsSent) * 100 : 0

      // Compliance status calculation
      let complianceStatus: 'compliant' | 'warning' | 'non-compliant' = 'non-compliant'
      if (analyticsOptInRate >= 95 && withdrawalRate <= 5 && bounceRate <= 2) {
        complianceStatus = 'compliant'
      } else if (analyticsOptInRate >= 80 && withdrawalRate <= 10 && bounceRate <= 5) {
        complianceStatus = 'warning'
      }

      // Build daily trends from cookie consents
      const dailyTrendsMap = new Map()
      cookieConsents?.forEach(consent => {
        const date = new Date(consent.created_at).toISOString().split('T')[0]
        const current = dailyTrendsMap.get(date) || {
          date,
          consents: 0,
          analytics: 0,
          marketing: 0,
          withdrawals: 0
        }
        current.consents++
        if (consent.analytics_consent) current.analytics++
        if (consent.marketing_consent) current.marketing++
        if (consent.withdrawn_at) current.withdrawals++
        dailyTrendsMap.set(date, current)
      })

      const dailyConsents = Array.from(dailyTrendsMap.values())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30)

      const analytics = {
        consentRate: analyticsOptInRate,
        analyticsOptIn: analyticsOptInRate,
        marketingOptIn: marketingOptInRate,
        withdrawalRate,
        deliveryRate,
        bounceRate,
        complianceStatus,
        overallComplianceScore: (analyticsOptInRate + marketingOptInRate + (100 - withdrawalRate) + deliveryRate) / 4,
        dailyConsents,
        metrics: {
          totalConsents: totalConsents || 0,
          totalEmailsSent,
          averageConsentRate: (analyticsOptInRate + marketingOptInRate) / 2,
          retentionRate: 100 - withdrawalRate
        }
      }

      return NextResponse.json({
        success: true,
        analytics,
        timestamp: new Date().toISOString(),
        dataSource: 'fallback_queries'
      })
    }

    // Process RPC results if available
    const result = complianceData?.[0]
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'No compliance data returned from query'
      }, { status: 500 })
    }

    const analytics = {
      consentRate: result.analytics_opt_in_rate || 0,
      analyticsOptIn: result.analytics_opt_in_rate || 0,
      marketingOptIn: result.marketing_opt_in_rate || 0,
      withdrawalRate: result.withdrawal_rate || 0,
      deliveryRate: result.delivery_rate || 0,
      bounceRate: result.bounce_rate || 0,
      complianceStatus: result.compliance_status || 'non-compliant',
      overallComplianceScore: result.overall_compliance_score || 0,
      dailyConsents: result.daily_trends || [],
      metrics: {
        totalConsents: result.total_consents || 0,
        averageConsentRate: ((result.analytics_opt_in_rate || 0) + (result.marketing_opt_in_rate || 0)) / 2,
        retentionRate: 100 - (result.withdrawal_rate || 0),
        gdprReadiness: result.compliance_status === 'compliant' ? 100 :
                      result.compliance_status === 'warning' ? 75 : 50
      }
    }

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString(),
      dataSource: 'sql_query'
    })

  } catch (error) {
    console.error('Compliance analytics API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}