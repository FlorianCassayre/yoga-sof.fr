import { describe, expect, it } from 'vitest';

import { COURSE_CANCELED_TEMPLATE } from '../../../features/course/courseCanceledTemplate';
import { renderEmail } from '../../../features/email/templates/renderEmail';

const course = {
  type: 'adulte' as const,
  startsAt: new Date('2026-11-17T08:00:00.000Z'),
  endsAt: new Date('2026-11-17T10:00:00.000Z'),
};

const user = { id: 'user-1', name: 'Isabelle Billiani' };

describe('COURSE_CANCELED_TEMPLATE', () => {
  it('renders the body with the reason', async () => {
    const email = await renderEmail(COURSE_CANCELED_TEMPLATE, {
      user,
      course,
      cancellationReason: 'La salle est indisponible.',
    });

    expect(email.type).toBe('sessionCanceled');
    expect(email.subject).toBe("Notification d'annulation de séance");
    expect(email.html).toContain('Isabelle Billiani,');
    expect(email.html).toContain(
      'La séance yoga adultes du mardi 17 novembre 2026 de 09h00 à 11h00 a malheureusement été annulée.',
    );
    expect(email.html).toContain('<p>La salle est indisponible.</p>');
    expect(email.html).toContain('Merci de votre compréhension.');
  });

  it('omits the reason paragraph without a reason', async () => {
    const email = await renderEmail(COURSE_CANCELED_TEMPLATE, {
      user,
      course,
      cancellationReason: null,
    });

    expect(email.html).toContain('a malheureusement été annulée.');
    expect(email.html).not.toContain('indisponible');
    expect(email.html).toContain('Merci de votre compréhension.');
  });
});
