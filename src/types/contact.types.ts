// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────
export enum LinkPrecedence {
  PRIMARY   = "primary",
  SECONDARY = "secondary",
}

// ─────────────────────────────────────────────────────────────
// Database row shape (matches the contact table columns)
// ─────────────────────────────────────────────────────────────
export interface ContactRow {
  id:              number;
  phone_number:    string | null;
  email:           string | null;
  linked_id:       number | null;
  link_precedence: LinkPrecedence;
  created_at:      Date;
  updated_at:      Date;
  deleted_at:      Date | null;
}

// ─────────────────────────────────────────────────────────────
// Request / Response shapes
// ─────────────────────────────────────────────────────────────
export interface IdentifyRequestBody {
  email?:       string | null;
  phoneNumber?: string | null;
}

export interface ConsolidatedContact {
  primaryContatctId:    number;   // note: typo kept intentional (matches spec)
  emails:               string[];
  phoneNumbers:         string[];
  secondaryContactIds:  number[];
}

export interface IdentifyResponse {
  contact: ConsolidatedContact;
}