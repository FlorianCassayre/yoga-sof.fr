import { describe, expect, it } from 'vitest';

import { COURSE_USER_REGISTRATION_CONFIRMATION_TEMPLATE } from '../../../features/courseUserRegistration/courseUserRegistrationConfirmationTemplate';
import { renderEmail } from '../../../features/email/templates/renderEmail';

const course = (startsAt: string, endsAt: string) => ({
  type: 'adulte' as const,
  startsAt: new Date(startsAt),
  endsAt: new Date(endsAt),
});

const user = { id: 'user-1', name: 'Isabelle Billiani' };

describe('COURSE_USER_REGISTRATION_CONFIRMATION_TEMPLATE', () => {
  it('renders the plural subject and body for several registrations', async () => {
    const email = await renderEmail(COURSE_USER_REGISTRATION_CONFIRMATION_TEMPLATE, {
      user,
      registrations: [
        { id: 2, course: course('2026-11-10T08:00:00.000Z', '2026-11-10T10:00:00.000Z') },
        { id: 1, course: course('2026-11-03T08:00:00.000Z', '2026-11-03T10:00:00.000Z') },
      ],
    });

    expect(email.type).toBe('sessionRegistration');
    expect(email.subject).toBe('Vos inscriptions à des séances de yoga');
    expect(email.html).toContain('<p>Isabelle Billiani,</p>');
    expect(email.html).toContain('vos inscriptions aux séances de yoga suivantes :');
    expect(email.html.indexOf('mardi 3 novembre 2026')).toBeLessThan(
      email.html.indexOf('mardi 10 novembre 2026'),
    );
    expect(email.html).toContain(
      'des informations pratiques vous seront communiquées la veille de votre séance.',
    );
    expect(email.html).toContain('Cordialement,');
    expect(email.html).toContain('<a href="https://yoga-sof.fr">yoga-sof.fr</a>');
  });

  it('renders the singular subject and body for one registration', async () => {
    const email = await renderEmail(COURSE_USER_REGISTRATION_CONFIRMATION_TEMPLATE, {
      user,
      registrations: [
        { id: 1, course: course('2026-11-03T08:00:00.000Z', '2026-11-03T10:00:00.000Z') },
      ],
    });

    expect(email.subject).toBe('Votre inscription à une séance de yoga');
    expect(email.html).toContain('votre inscription à la séance de yoga suivante :');
  });

  it('greets casually with the first name only', async () => {
    const email = await renderEmail(COURSE_USER_REGISTRATION_CONFIRMATION_TEMPLATE, {
      user,
      casual: true,
      registrations: [],
    });

    expect(email.html).toContain('<p>Isabelle,</p>');
  });

  it('falls back to Bonjour without a name', async () => {
    const email = await renderEmail(COURSE_USER_REGISTRATION_CONFIRMATION_TEMPLATE, {
      user: { id: 'user-1', name: null },
      registrations: [],
    });

    expect(email.html).toContain('<p>Bonjour,</p>');
  });
});
