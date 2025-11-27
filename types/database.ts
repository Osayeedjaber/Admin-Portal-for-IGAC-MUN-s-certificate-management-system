export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'super_admin' | 'admin' | 'mod'
          account_status: 'pending_approval' | 'approved' | 'rejected'
          approved_by: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'super_admin' | 'admin' | 'mod'
          account_status?: 'pending_approval' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'super_admin' | 'admin' | 'mod'
          account_status?: 'pending_approval' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          event_code: string
          event_name: string
          year: number
          month: number
          session: number
          event_type: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          event_code: string
          event_name: string
          year: number
          month: number
          session: number
          event_type: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          event_code?: string
          event_name?: string
          year?: number
          month?: number
          session?: number
          event_type?: string
          created_at?: string
          created_by?: string | null
        }
      }
      certificates: {
        Row: {
          id: string
          certificate_id: string
          event_id: string
          certificate_type: string
          participant_name: string
          school: string
          date_issued: string
          status: 'active' | 'revoked'
          revoked_at: string | null
          revoked_by: string | null
          revoked_reason: string | null
          qr_code_data: string
          qr_code_image_path: string | null
          pdf_storage_path: string | null
          pdf_available: boolean
          created_at: string
          created_by: string | null
          verification_count: number
          last_verified_at: string | null
        }
        Insert: {
          id?: string
          certificate_id: string
          event_id: string
          certificate_type: string
          participant_name: string
          school: string
          date_issued: string
          status?: 'active' | 'revoked'
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          qr_code_data: string
          qr_code_image_path?: string | null
          pdf_storage_path?: string | null
          pdf_available?: boolean
          created_at?: string
          created_by?: string | null
          verification_count?: number
          last_verified_at?: string | null
        }
        Update: {
          id?: string
          certificate_id?: string
          event_id?: string
          certificate_type?: string
          participant_name?: string
          school?: string
          date_issued?: string
          status?: 'active' | 'revoked'
          revoked_at?: string | null
          revoked_by?: string | null
          revoked_reason?: string | null
          qr_code_data?: string
          qr_code_image_path?: string | null
          pdf_storage_path?: string | null
          pdf_available?: boolean
          created_at?: string
          created_by?: string | null
          verification_count?: number
          last_verified_at?: string | null
        }
      }
      certificate_metadata: {
        Row: {
          id: string
          certificate_id: string
          field_name: string
          field_value: string
          field_type: 'text' | 'array' | 'json'
        }
        Insert: {
          id?: string
          certificate_id: string
          field_name: string
          field_value: string
          field_type?: 'text' | 'array' | 'json'
        }
        Update: {
          id?: string
          certificate_id?: string
          field_name?: string
          field_value?: string
          field_type?: 'text' | 'array' | 'json'
        }
      }
      verification_logs: {
        Row: {
          id: string
          certificate_id: string
          verified_at: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          certificate_id: string
          verified_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          certificate_id?: string
          verified_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
      }
      analytics: {
        Row: {
          id: string
          event_id: string | null
          metric_type: string
          metric_value: Json
          calculated_at: string
        }
        Insert: {
          id?: string
          event_id?: string | null
          metric_type: string
          metric_value: Json
          calculated_at?: string
        }
        Update: {
          id?: string
          event_id?: string | null
          metric_type?: string
          metric_value?: Json
          calculated_at?: string
        }
      }
    }
  }
}

// SheetDB Row type (matches Google Sheet columns)
export interface SheetDBRow {
  Cert_Type: string
  Unique_ID: string
  Participant_Name: string
  Email: string
  institution: string  // lowercase in actual sheet
  Institution?: string // for backwards compatibility
  Verification_URL: string
  Award_Type: string
  Committee: string
  Country: string
  Date_Issued: string
  Verified_Status: string
  Event_Name: string
}

// Certificate types for MUN
export type CertificateType = 
  | 'delegate'
  | 'secretariat'
  | 'executive board'
  | 'campus ambassador'
  | 'volunteer'
  | 'organizer'
  | 'speaker'
  | 'trainer'
  | string // Allow custom types

// Award types for delegates
export type DelegateAwardType = 
  | 'Best Delegate'
  | 'Outstanding Delegate'
  | 'Honourable Mention'
  | 'Verbal Commendation'
  | 'Best Draft Resolution'
  | string // Allow custom award types

// Award types for other roles
export type GeneralAwardType =
  | 'Best Secretariat'
  | 'Best Executive Board'
  | 'Best Campus Ambassador'
  | 'Outstanding Contribution'
  | 'Certificate of Participation'
  | 'Certificate of Appreciation'
  | string // Allow custom award types
