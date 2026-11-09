import { describe, expect, it } from 'vitest';

import { COURSE_WAITING_LIST_TEMPLATE } from '../../../features/courseUserWaitingList/courseUserWaitingListTemplate';
import { renderEmail } from '../../../features/email/templates/renderEmail';

const course = {
  type: 'adulte' as const,
  startsAt: new Date('2026-11-03T08:00:00.000Z'),
  endsAt: new Date('2026-11-03T10:00:00.000Z'),
};

const user = { id: 'user-1', name: 'Isabelle Billiani' };

describe('COURSE_WAITING_LIST_TEMPLATE', () => {
  it('renders the subject and body for a freed spot', async () => {
    const email = await renderEmail(COURSE_WAITING_LIST_TEMPLATE, { user, course });

    expect(email.type).toBe('courseWaitingList');
    expect(email.subject).toBe(
      'Place disponible pour la séance yoga adultes du mardi 3 novembre 2026 de 09h00 à 11h00',
    );
    expect(email.html).toContain('<p>Isabelle Billiani,</p>');
    expect(email.html).toContain(
      'Vous aviez demandé à être notifié(e) des disponibilités de la séance yoga adultes du mardi 3 novembre 2026 de 09h00 à 11h00.',
    );
    expect(email.html).toContain('une place vient de se libérer');
    expect(email.html).toContain('ce lien</a>');
    expect(email.html).toContain('Cordialement,');
  });
});
