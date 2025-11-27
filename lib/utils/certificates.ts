/**
 * Generate a simple 6-7 character certificate ID
 * Format: lowercase letters and numbers (easy to read and remember)
 */
export function generateCertificateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const length = Math.random() > 0.5 ? 7 : 6
  let code = ''
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}

/**
 * Generate verification URL for a certificate
 */
export function generateVerificationUrl(certificateId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_CERTIFICATE_PORTAL_URL || 'https://igacmun.vercel.app/certificate-portal'
  return `${baseUrl}/${certificateId}`
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

/**
 * Format date for display
 */
export function formatDateReadable(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

/**
 * Get default event name
 */
export function getDefaultEventName(): string {
  return process.env.DEFAULT_EVENT_NAME || 'igacmun-session-3-2025'
}

/**
 * All certificate types for MUN
 */
export const CERTIFICATE_TYPES = [
  'delegate',
  'secretariat', 
  'executive board',
  'campus ambassador',
  'volunteer',
  'organizer',
  'speaker',
  'trainer'
] as const

export type CertificateType = typeof CERTIFICATE_TYPES[number]

/**
 * Check if certificate type requires committee and country (for delegates)
 */
export function requiresCommitteeAndCountry(certType: string): boolean {
  const type = certType.toLowerCase().trim()
  return type === 'delegate' || type.includes('delegate')
}

/**
 * Check if certificate type requires department and designation (for secretariat)
 */
export function requiresDepartmentAndDesignation(certType: string): boolean {
  const type = certType.toLowerCase().trim()
  return type === 'secretariat' || type.includes('secretariat')
}

/**
 * Check if certificate type requires committee and position (for Executive Board)
 */
export function requiresCommitteeAndPosition(certType: string): boolean {
  const type = certType.toLowerCase().trim()
  return type === 'executive board' || type.includes('executive board') || type === 'eb'
}

/**
 * Check if certificate type is Campus Ambassador (no extra fields needed)
 */
export function isCampusAmbassador(certType: string): boolean {
  const type = certType.toLowerCase().trim()
  return type === 'campus ambassador' || type.includes('campus ambassador')
}

/**
 * Validate required fields based on certificate type
 */
export function validateCertificateFields(
  certType: string,
  data: {
    participant_name?: string
    email?: string
    institution?: string
    award_type?: string
    committee?: string
    country?: string
  }
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = []
  
  // Only participant name is truly required
  if (!data.participant_name?.trim()) missingFields.push('Participant Name')
  
  // Required for Delegate type
  if (requiresCommitteeAndCountry(certType)) {
    if (!data.committee?.trim()) missingFields.push('Committee')
    if (!data.country?.trim()) missingFields.push('Country')
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields
  }
}
