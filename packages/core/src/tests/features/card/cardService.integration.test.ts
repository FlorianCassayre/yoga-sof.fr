import { eq, inArray, like } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { db } from '../../../db/db';
import { withTransaction } from '../../../db/withTransaction';
import { usersTable } from '../../../features/auth/authTables';
import { cardService } from '../../../features/card/cardService';
import { cardsTable } from '../../../features/card/cardsTable';
import { cardValidUntil } from '../../../features/card/cardValidUntil';
import { cardSettingService } from '../../../features/card/settings/cardSettingService';
import { cardSettingsTable } from '../../../features/card/settings/cardSettingsTable';
import { cardTemplateService } from '../../../features/card/template/cardTemplateService';
import { cardTemplatesTable } from '../../../features/card/template/cardTemplatesTable';

const EMAIL_SUFFIX = 'card-service-test@example.com';

describe.skipIf(!process.env.DATABASE_INTEGRATION_TEST_URL)('cardService', () => {
  let userId = '';
  let otherUserId = '';
  let cancelerId = '';
  let templateId = 0;

  const clearUsers = () => db.delete(usersTable).where(like(usersTable.email, `%${EMAIL_SUFFIX}`));

  beforeAll(async () => {
    await clearUsers();
    await db.delete(cardSettingsTable);

    const [user, other, canceler] = await db
      .insert(usersTable)
      .values([
        { email: `holder-${EMAIL_SUFFIX}`, name: 'Titulaire Test' },
        { email: `other-${EMAIL_SUFFIX}`, name: 'Autre Test' },
        { email: `canceler-${EMAIL_SUFFIX}`, name: 'Annuleur Test' },
      ])
      .returning();
    if (!user || !other || !canceler) {
      throw new Error('expected users to be created');
    }
    userId = user.id;
    otherUserId = other.id;
    cancelerId = canceler.id;

    const template = await withTransaction((tx) =>
      cardTemplateService.create({ type: 'adulte', price: 20000, count: 10 }, tx),
    );
    if (!template) {
      throw new Error('expected template to be created');
    }
    templateId = template.id;

    await withTransaction((tx) => cardSettingService.update({ validityMonths: 12 }, tx));
  });

  afterAll(async () => {
    await clearUsers();
    await db.delete(cardSettingsTable);
    await db.delete(cardTemplatesTable).where(eq(cardTemplatesTable.id, templateId));
    await db.$client.end();
  });

  it('creates a card from a template with snapshots and computed validity', async () => {
    const card = await withTransaction((tx) => cardService.create({ userId, templateId }, tx));

    expect(card.type).toBe('adulte');
    expect(card.price).toBe(20000);
    expect(card.count).toBe(10);
    expect(card.remaining).toBe(10);
    expect(card.canceled).toBe(false);
    expect(card.validUntil).toBe(cardValidUntil({ purchasedAt: new Date(), months: 12 }));

    const fetched = await withTransaction((tx) => cardService.get({ id: card.id }, tx));
    expect(fetched.userName).toBe('Titulaire Test');
    expect(fetched.canceledByName).toBeNull();

    const listed = await withTransaction((tx) =>
      cardService.list(
        { page: 0, pageSize: 50, sort: [{ field: 'validUntil', sort: 'desc' }] },
        tx,
      ),
    );
    expect(listed.rows.some((row) => row.id === card.id && row.userName === 'Titulaire Test')).toBe(
      true,
    );
  });

  it('rejects an unknown template or holder', async () => {
    await expect(
      withTransaction((tx) => cardService.create({ userId, templateId: 999999 }, tx)),
    ).rejects.toThrow('Le modèle de carte est introuvable.');
    await expect(
      withTransaction((tx) => cardService.create({ userId: 'missing-user', templateId }, tx)),
    ).rejects.toThrow("L'utilisateur est introuvable.");
  });

  it('updates the validity date with optimistic locking', async () => {
    const [card] = await db
      .select({ id: cardsTable.id, version: cardsTable.version })
      .from(cardsTable)
      .where(eq(cardsTable.userId, userId));

    const updated = await withTransaction((tx) =>
      cardService.update({ id: card!.id, version: card!.version, validUntil: '2027-06-30' }, tx),
    );
    expect(updated.validUntil).toBe('2027-06-30');
    expect(updated.version).toBe(card!.version + 1);

    await expect(
      withTransaction((tx) =>
        cardService.update({ id: card!.id, version: card!.version, validUntil: '2027-01-01' }, tx),
      ),
    ).rejects.toThrow('La carte a été modifiée entre-temps, rechargez la page.');
  });

  it('cancels a card once, recording the canceler', async () => {
    const card = await withTransaction((tx) =>
      cardService.create({ userId: otherUserId, templateId }, tx),
    );

    const canceled = await withTransaction((tx) =>
      cardService.cancel({ id: card.id }, tx, cancelerId),
    );
    expect(canceled.canceled).toBe(true);
    expect(canceled.canceledAt).not.toBeNull();
    expect(canceled.canceledBy).toBe(cancelerId);

    const fetched = await withTransaction((tx) => cardService.get({ id: card.id }, tx));
    expect(fetched.canceledByName).toBe('Annuleur Test');

    await expect(
      withTransaction((tx) => cardService.cancel({ id: card.id }, tx, cancelerId)),
    ).rejects.toThrow('La carte est déjà annulée.');
  });

  it('deletes a template even when cards reference it', async () => {
    const deleted = await withTransaction((tx) =>
      cardTemplateService.delete({ id: templateId, version: 1 }, tx),
    );
    expect(deleted.id).toBe(templateId);
  });

  it('deletes cards when the holder is deleted', async () => {
    const [holder] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(inArray(usersTable.email, [`holder-${EMAIL_SUFFIX}`]));

    await db.delete(usersTable).where(eq(usersTable.id, holder!.id));

    const remaining = await db
      .select({ id: cardsTable.id })
      .from(cardsTable)
      .where(eq(cardsTable.userId, holder!.id));
    expect(remaining).toHaveLength(0);
  });
});
