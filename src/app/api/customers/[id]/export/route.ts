import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

// GET export customer data (GDPR compliance)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServiceClient()

    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', (await params).id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get customer's reservations
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select(`
        id,
        customerName,
        customerEmail,
        customerPhone,
        partySize,
        date,
        time,
        status,
        specialRequests,
        hasPreOrder,
        occasion,
        dietaryNotes,
        consentDataProcessing,
        consentEmail,
        consentMarketing,
        consentDataProcessingTimestamp,
        consentEmailTimestamp,
        consentMarketingTimestamp,
        consentIpAddress,
        consentUserAgent,
        gdprPolicyVersion,
        consentMethod,
        preferredLanguage,
        createdAt,
        updatedAt
      `)
      .eq('customerEmail', customer.email)
      .order('createdAt', { ascending: false })

    // Compile all customer data for GDPR export
    const exportData = {
      exportMetadata: {
        exportDate: new Date().toISOString(),
        dataSubject: customer.email,
        exportReason: 'GDPR Article 20 - Right to data portability',
        dataController: 'Enigma - Cocina Con Alma',
        retentionPeriod: '7 years from last interaction',
        dataProcessingLegalBasis: 'Legitimate interest for customer service'
      },
      personalData: {
        id: customer.id,
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        email: customer.email,
        phone: customer.phone,
        role: customer.role,
        isVip: customer.isVip,
        accountCreated: customer.createdAt,
        lastUpdated: customer.updatedAt
      },
      reservationHistory: reservations || [],
      dataProcessingConsents: {
        // Extract consent data from most recent reservation
        currentConsents: reservations?.[0] ? {
          dataProcessing: reservations[0].consentDataProcessing,
          email: reservations[0].consentEmail,
          marketing: reservations[0].consentMarketing,
          consentTimestamps: {
            dataProcessing: reservations[0].consentDataProcessingTimestamp,
            email: reservations[0].consentEmailTimestamp,
            marketing: reservations[0].consentMarketingTimestamp
          },
          consentMethod: reservations[0].consentMethod,
          gdprPolicyVersion: reservations[0].gdprPolicyVersion,
          ipAddress: reservations[0].consentIpAddress,
          userAgent: reservations[0].consentUserAgent,
          preferredLanguage: reservations[0].preferredLanguage
        } : null,
        // History of all consent changes
        consentHistory: reservations?.map(r => ({
          reservationId: r.id,
          date: r.createdAt,
          dataProcessing: r.consentDataProcessing,
          email: r.consentEmail,
          marketing: r.consentMarketing,
          method: r.consentMethod,
          policyVersion: r.gdprPolicyVersion
        })) || []
      },
      statistics: {
        totalReservations: reservations?.length || 0,
        completedReservations: reservations?.filter(r => r.status === 'COMPLETED').length || 0,
        cancelledReservations: reservations?.filter(r => r.status === 'CANCELLED').length || 0,
        totalSpent: reservations?.reduce((sum, r) => {
          if (r.status === 'COMPLETED') {
            return sum + (r.partySize * 45) // Average €45 per person
          }
          return sum
        }, 0) || 0,
        averagePartySize: reservations?.length ? 
          reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length : 0,
        firstVisit: reservations?.length ? reservations[reservations.length - 1].createdAt : null,
        lastVisit: reservations?.length ? reservations[0].createdAt : null
      },
      gdprRights: {
        rightToAccess: 'Fulfilled through this export',
        rightToPortability: 'Fulfilled through this export',
        rightToRectification: 'Contact us to update your data',
        rightToErasure: 'Contact us to delete your data',
        rightToWithdrawConsent: 'Contact us to withdraw marketing consent',
        rightToObject: 'Contact us to object to data processing',
        supervisoryAuthority: 'Spanish Data Protection Authority (AEPD)',
        contactDetails: {
          email: 'privacy@enigmacocinalma.com',
          phone: '+34 XXX XXX XXX',
          address: 'Enigma - Cocina Con Alma, Calpe, Spain'
        }
      }
    }

    // Create JSON file
    const jsonContent = JSON.stringify(exportData, null, 2)
    
    // Set headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Content-Disposition', `attachment; filename="customer-data-${customer.id}-${new Date().toISOString().split('T')[0]}.json"`)
    headers.set('Content-Length', jsonContent.length.toString())

    // Log export for audit purposes
    console.log(`GDPR Data Export requested for customer: ${customer.email} at ${new Date().toISOString()}`)

    return new NextResponse(jsonContent, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Customer data export error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error during data export' },
      { status: 500 }
    )
  }
}