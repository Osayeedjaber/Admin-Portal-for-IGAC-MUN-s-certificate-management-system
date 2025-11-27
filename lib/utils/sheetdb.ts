/**
 * SheetDB API Utility with Rate Limiting Protection
 * 
 * SheetDB free tier has rate limits, so we implement:
 * 1. Request queuing
 * 2. Batch operations where possible
 * 3. Retry with exponential backoff
 */

import { SheetDBRow } from '@/types/database'

const SHEETDB_API_URL = process.env.SHEETDB_API_URL!
const RATE_LIMIT_DELAY = 1000 // 1 second between requests
const MAX_RETRIES = 3

// Simple queue to manage requests
let lastRequestTime = 0

async function waitForRateLimit(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest))
  }
  
  lastRequestTime = Date.now()
}

async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries = MAX_RETRIES
): Promise<Response> {
  await waitForRateLimit()
  
  try {
    const response = await fetch(url, options)
    
    if (response.status === 429) {
      // Rate limited - wait and retry
      if (retries > 0) {
        const delay = (MAX_RETRIES - retries + 1) * 2000 // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay))
        return fetchWithRetry(url, options, retries - 1)
      }
    }
    
    return response
  } catch (error) {
    if (retries > 0) {
      const delay = (MAX_RETRIES - retries + 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}

/**
 * Get all rows from the sheet
 */
export async function getAllRows(): Promise<SheetDBRow[]> {
  const response = await fetchWithRetry(SHEETDB_API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet data: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Get rows that need processing (have empty Unique_ID)
 */
export async function getUnprocessedRows(): Promise<SheetDBRow[]> {
  // SheetDB search endpoint
  const response = await fetchWithRetry(
    `${SHEETDB_API_URL}/search?Unique_ID=`, 
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  
  if (!response.ok) {
    // If search fails, get all and filter
    const allRows = await getAllRows()
    return allRows.filter(row => !row.Unique_ID || row.Unique_ID.trim() === '')
  }
  
  return response.json()
}

/**
 * Update a single row by matching criteria
 * Uses PATCH to update specific row
 */
export async function updateRow(
  searchColumn: string,
  searchValue: string,
  data: Partial<SheetDBRow>
): Promise<boolean> {
  const response = await fetchWithRetry(
    `${SHEETDB_API_URL}/${searchColumn}/${encodeURIComponent(searchValue)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    }
  )
  
  return response.ok
}

/**
 * Batch update multiple rows
 * More efficient than updating one by one
 */
export async function batchUpdateRows(
  updates: Array<{
    searchColumn: string
    searchValue: string
    data: Partial<SheetDBRow>
  }>
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0
  
  // Process in smaller batches to avoid rate limits
  const batchSize = 5
  
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    
    // Process batch sequentially with rate limiting
    for (const update of batch) {
      try {
        const result = await updateRow(
          update.searchColumn,
          update.searchValue,
          update.data
        )
        if (result) {
          success++
        } else {
          failed++
        }
      } catch {
        failed++
      }
    }
    
    // Extra delay between batches
    if (i + batchSize < updates.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  return { success, failed }
}

/**
 * Add a new row to the sheet
 */
export async function addRow(data: Partial<SheetDBRow>): Promise<boolean> {
  const response = await fetchWithRetry(SHEETDB_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })
  
  return response.ok
}

/**
 * Add multiple rows at once (more efficient)
 */
export async function addRows(rows: Partial<SheetDBRow>[]): Promise<boolean> {
  const response = await fetchWithRetry(SHEETDB_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: rows }),
  })
  
  return response.ok
}

/**
 * Delete a row by matching criteria
 */
export async function deleteRow(
  searchColumn: string,
  searchValue: string
): Promise<boolean> {
  const response = await fetchWithRetry(
    `${SHEETDB_API_URL}/${searchColumn}/${encodeURIComponent(searchValue)}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  
  return response.ok
}
