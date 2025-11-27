/**
 * Discord Webhook Integration
 * Sends notifications for errors and updates
 */

const DISCORD_WEBHOOKS = {
  errors: 'https://discord.com/api/webhooks/1440378528528076893/ZsXqLu7ETxhvdU-zXpzJ5l2uD-HlblioeoXPd9Xaz7iUYQiiGvf01GJtsFKcYAq4Vuzh',
  updates: 'https://discord.com/api/webhooks/1440378531543519323/7_ppbcOZTJUnclN1UUwZR_qN2RBdYUT6b9rEjg_sfnWbrfdgjKTK2K2wszi6XH_dIehz'
}

interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: { name: string; value: string; inline?: boolean }[]
  footer?: { text: string }
  timestamp?: string
}

async function sendWebhook(webhookUrl: string, content: string, embeds?: DiscordEmbed[]) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        embeds,
        username: 'IGACMUN Certificate Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/6295/6295417.png'
      })
    })
    
    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text())
      return false
    }
    return true
  } catch (error) {
    console.error('Discord webhook error:', error)
    return false
  }
}

// Colors for embeds
const COLORS = {
  error: 0xFF4444,      // Red
  success: 0x44FF44,    // Green
  warning: 0xFFAA00,    // Orange
  info: 0x00AAFF,       // Blue
  sync: 0x9B59B6,       // Purple
  certificate: 0x2ECC71 // Emerald
}

/**
 * Send error notification
 */
export async function notifyError(title: string, error: string, details?: Record<string, string>) {
  const fields = details 
    ? Object.entries(details).map(([name, value]) => ({ name, value: String(value).slice(0, 1024), inline: true }))
    : []

  return sendWebhook(DISCORD_WEBHOOKS.errors, '', [{
    title: `❌ ${title}`,
    description: error.slice(0, 4000),
    color: COLORS.error,
    fields,
    footer: { text: 'IGACMUN Admin Portal' },
    timestamp: new Date().toISOString()
  }])
}

/**
 * Send sync update notification
 */
export async function notifySyncComplete(
  processed: number, 
  errors: number, 
  certificates: { participant_name: string; certificate_id: string }[]
) {
  const hasErrors = errors > 0
  const color = hasErrors ? COLORS.warning : COLORS.success
  const emoji = hasErrors ? '⚠️' : '✅'

  const certList = certificates.slice(0, 10).map(c => 
    `• **${c.participant_name}** → \`${c.certificate_id}\``
  ).join('\n')

  const fields = [
    { name: '📊 Processed', value: String(processed), inline: true },
    { name: '❌ Errors', value: String(errors), inline: true }
  ]

  if (certList) {
    fields.push({ name: '📜 Certificates Created', value: certList, inline: false })
  }

  if (certificates.length > 10) {
    fields.push({ name: '', value: `... and ${certificates.length - 10} more`, inline: false })
  }

  return sendWebhook(DISCORD_WEBHOOKS.updates, '', [{
    title: `${emoji} Sync from Google Sheets Complete`,
    description: `Processed **${processed}** certificates with **${errors}** errors`,
    color,
    fields,
    footer: { text: 'IGACMUN Admin Portal' },
    timestamp: new Date().toISOString()
  }])
}

/**
 * Send certificate created notification
 */
export async function notifyCertificateCreated(
  certificateId: string,
  participantName: string,
  certificateType: string,
  createdBy: string
) {
  return sendWebhook(DISCORD_WEBHOOKS.updates, '', [{
    title: '🎓 New Certificate Created',
    color: COLORS.certificate,
    fields: [
      { name: 'Certificate ID', value: `\`${certificateId}\``, inline: true },
      { name: 'Participant', value: participantName, inline: true },
      { name: 'Type', value: certificateType, inline: true },
      { name: 'Created By', value: createdBy, inline: true }
    ],
    footer: { text: 'IGACMUN Admin Portal' },
    timestamp: new Date().toISOString()
  }])
}

/**
 * Send certificate verification notification
 */
export async function notifyVerification(
  certificateId: string,
  participantName: string,
  verified: boolean
) {
  const color = verified ? COLORS.success : COLORS.error
  const emoji = verified ? '✅' : '❌'
  const status = verified ? 'Verified Successfully' : 'Verification Failed'

  return sendWebhook(DISCORD_WEBHOOKS.updates, '', [{
    title: `${emoji} Certificate ${status}`,
    color,
    fields: [
      { name: 'Certificate ID', value: `\`${certificateId}\``, inline: true },
      { name: 'Participant', value: participantName || 'Unknown', inline: true }
    ],
    footer: { text: 'IGACMUN Certificate Portal' },
    timestamp: new Date().toISOString()
  }])
}

/**
 * Send bulk operation notification
 */
export async function notifyBulkOperation(
  operation: 'import' | 'export' | 'delete',
  count: number,
  details?: string
) {
  const emojis = { import: '📥', export: '📤', delete: '🗑️' }
  const colors = { import: COLORS.info, export: COLORS.info, delete: COLORS.warning }

  return sendWebhook(DISCORD_WEBHOOKS.updates, '', [{
    title: `${emojis[operation]} Bulk ${operation.charAt(0).toUpperCase() + operation.slice(1)}`,
    description: details || `${count} certificates ${operation}ed`,
    color: colors[operation],
    fields: [
      { name: 'Count', value: String(count), inline: true }
    ],
    footer: { text: 'IGACMUN Admin Portal' },
    timestamp: new Date().toISOString()
  }])
}

/**
 * Send login notification
 */
export async function notifyLogin(email: string, success: boolean) {
  if (!success) {
    return sendWebhook(DISCORD_WEBHOOKS.errors, '', [{
      title: '🔐 Failed Login Attempt',
      description: `Someone tried to login with: **${email}**`,
      color: COLORS.error,
      footer: { text: 'IGACMUN Admin Portal' },
      timestamp: new Date().toISOString()
    }])
  }

  return sendWebhook(DISCORD_WEBHOOKS.updates, '', [{
    title: '🔓 Admin Login',
    description: `**${email}** logged into the admin portal`,
    color: COLORS.success,
    footer: { text: 'IGACMUN Admin Portal' },
    timestamp: new Date().toISOString()
  }])
}

/**
 * Send event created notification
 */
export async function notifyEventCreated(eventCode: string, eventName: string) {
  return sendWebhook(DISCORD_WEBHOOKS.updates, '', [{
    title: '📅 New Event Created',
    color: COLORS.info,
    fields: [
      { name: 'Event Code', value: `\`${eventCode}\``, inline: true },
      { name: 'Event Name', value: eventName, inline: true }
    ],
    footer: { text: 'IGACMUN Admin Portal' },
    timestamp: new Date().toISOString()
  }])
}

/**
 * Send sync error notification
 */
export async function notifySyncErrors(errors: { participant_name: string; error: string }[]) {
  if (errors.length === 0) return true

  const errorList = errors.slice(0, 10).map(e => 
    `• **${e.participant_name}**: ${e.error}`
  ).join('\n')

  return sendWebhook(DISCORD_WEBHOOKS.errors, '', [{
    title: `⚠️ Sync Errors (${errors.length})`,
    description: errorList,
    color: COLORS.error,
    footer: { text: errors.length > 10 ? `... and ${errors.length - 10} more errors` : 'IGACMUN Admin Portal' },
    timestamp: new Date().toISOString()
  }])
}

/**
 * Send new registration notification
 */
export async function notifyNewRegistration(email: string, name: string, role?: string) {
  const roleLabel = role === 'mod' ? '👀 Moderator (View Only)' : '🛡️ Admin (Full Access)'
  
  return sendWebhook(DISCORD_WEBHOOKS.updates, '', [{
    title: '👤 New Admin Registration',
    description: `A new account has been registered and is **pending approval**`,
    color: COLORS.warning,
    fields: [
      { name: 'Email', value: email, inline: true },
      { name: 'Name', value: name, inline: true },
      { name: 'Requested Role', value: roleLabel, inline: true },
      { name: 'Status', value: '⏳ Pending Approval', inline: false }
    ],
    footer: { text: 'IGACMUN Admin Portal - Super admin approval required' },
    timestamp: new Date().toISOString()
  }])
}
