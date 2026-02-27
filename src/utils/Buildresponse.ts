import { ContactRow, ConsolidatedContact } from "../types/contact.types";

// ─────────────────────────────────────────────────────────────
// Builds the final consolidated contact response.
// Primary contact's email/phone always appear FIRST in arrays.
// Duplicates are removed using Set.
// ─────────────────────────────────────────────────────────────
export const buildConsolidatedResponse = (
  primary: ContactRow,
  secondaries: ContactRow[]
): ConsolidatedContact => {
  const allContacts = [primary, ...secondaries];

  const emails = allContacts
    .map((c) => c.email)
    .filter((e): e is string => e !== null && e !== undefined);

  const phoneNumbers = allContacts
    .map((c) => c.phone_number)
    .filter((p): p is string => p !== null && p !== undefined);

  return {
    primaryContatctId:   primary.id,
    emails:              [...new Set(emails)],
    phoneNumbers:        [...new Set(phoneNumbers)],
    secondaryContactIds: secondaries.map((c) => c.id),
  };
};