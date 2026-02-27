import pool from "../db";
import { buildConsolidatedResponse } from "../utils/Buildresponse";
import {
  ContactRow,
  ConsolidatedContact,
  IdentifyRequestBody,
  LinkPrecedence,
} from "../types/contact.types";

// ─────────────────────────────────────────────────────────────
// Main service: identity reconciliation logic
// ─────────────────────────────────────────────────────────────
export const identifyContact = async (
  data: IdentifyRequestBody
): Promise<ConsolidatedContact> => {
  const { email, phoneNumber } = data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ── Step 1: Find all contacts matching email OR phoneNumber ──
    const { rows: matchingContacts } = await client.query<ContactRow>(
      `SELECT * FROM contact
       WHERE deleted_at IS NULL
         AND (
           ($1::TEXT IS NOT NULL AND email = $1)
           OR
           ($2::TEXT IS NOT NULL AND phone_number = $2)
         )`,
      [email ?? null, phoneNumber ?? null]
    );

    // ── Step 2: No match → create a brand new primary contact ──
    if (matchingContacts.length === 0) {
      const { rows } = await client.query<ContactRow>(
        `INSERT INTO contact (email, phone_number, link_precedence)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [email ?? null, phoneNumber ?? null, LinkPrecedence.PRIMARY]
      );

      await client.query("COMMIT");
      return buildConsolidatedResponse(rows[0], []);
    }

    // ── Step 3: Collect all primary IDs from matched contacts ──
    const primaryIds = new Set<number>();

    for (const contact of matchingContacts) {
      if (contact.link_precedence === LinkPrecedence.PRIMARY) {
        primaryIds.add(contact.id);
      } else if (contact.linked_id !== null) {
        primaryIds.add(contact.linked_id);
      }
    }

    // ── Step 4: Fetch all primary contacts, oldest first ──
    const { rows: primaryContacts } = await client.query<ContactRow>(
      `SELECT * FROM contact
       WHERE id = ANY($1::int[])
         AND deleted_at IS NULL
       ORDER BY created_at ASC`,
      [Array.from(primaryIds)]
    );

    // The oldest primary is the true primary
    const truePrimary = primaryContacts[0];

    // ── Step 5: Demote newer primaries to secondary if needed ──
    if (primaryContacts.length > 1) {
      const toDegrade = primaryContacts.slice(1);
      const toDegradeIds = toDegrade.map((c) => c.id);

      // Demote the newer primary contacts
      await client.query(
        `UPDATE contact
         SET link_precedence = $1,
             linked_id       = $2,
             updated_at      = NOW()
         WHERE id = ANY($3::int[])`,
        [LinkPrecedence.SECONDARY, truePrimary.id, toDegradeIds]
      );

      // Re-point any secondaries that linked to the demoted primaries
      await client.query(
        `UPDATE contact
         SET linked_id  = $1,
             updated_at = NOW()
         WHERE linked_id = ANY($2::int[])
           AND deleted_at IS NULL`,
        [truePrimary.id, toDegradeIds]
      );
    }

    // ── Step 6: Fetch all current secondaries under the true primary ──
    const { rows: allSecondaries } = await client.query<ContactRow>(
      `SELECT * FROM contact
       WHERE linked_id = $1
         AND deleted_at IS NULL`,
      [truePrimary.id]
    );

    // ── Step 7: Check if the request contains any NEW information ──
    const allContacts  = [truePrimary, ...allSecondaries];
    const knownEmails  = new Set(allContacts.map((c) => c.email).filter(Boolean));
    const knownPhones  = new Set(allContacts.map((c) => c.phone_number).filter(Boolean));

    const hasNewEmail  = Boolean(email       && !knownEmails.has(email));
    const hasNewPhone  = Boolean(phoneNumber && !knownPhones.has(phoneNumber));

    // ── Step 8: If new info exists, create a secondary contact ──
    if (hasNewEmail || hasNewPhone) {
      const { rows: newSecondaryRows } = await client.query<ContactRow>(
        `INSERT INTO contact (email, phone_number, linked_id, link_precedence)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [email ?? null, phoneNumber ?? null, truePrimary.id, LinkPrecedence.SECONDARY]
      );

      allSecondaries.push(newSecondaryRows[0]);
    }

    await client.query("COMMIT");

    return buildConsolidatedResponse(truePrimary, allSecondaries);

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};