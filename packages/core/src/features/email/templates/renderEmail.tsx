import type { ReactElement } from 'react';

import type { EmailType } from '../type/EmailType';
import type { EmailTemplate } from './EmailTemplate';
import type { EmailUser, UserContent } from './UserContent';

export interface RenderedEmail {
  type: EmailType;
  subject: string;
  html: string;
}

const displayName = ({ name }: EmailUser, casual?: boolean): string =>
  !name ? 'Bonjour' : casual ? (name.split(' ')[0] ?? name) : name;

// Next bans a static react-dom/server import from every module of the app
// graph (the templates travel through the server barrel); the renderer is
// therefore loaded at runtime — esbuild still bundles it for the cron worker.
const renderToHtml = async (element: ReactElement): Promise<string> => {
  const { renderToStaticMarkup } = await import(/* turbopackIgnore: true */ 'react-dom/server');

  return renderToStaticMarkup(element);
};

// Wraps the template body inside the shared envelope: greeting, signature and
// site footer. Attachments are handled separately (they are not part of the
// HTML).
export const renderEmail = async <Props extends object>(
  template: EmailTemplate<Props>,
  props: Props & UserContent,
): Promise<RenderedEmail> => ({
  type: template.type,
  subject: template.subject(props),
  html: await renderToHtml(
    <>
      <p>{displayName(props.user, props.casual)},</p>
      {template.body(props)}
      <p>
        Cordialement,
        <br />
        Sophie.
      </p>
      <p>
        --
        <br />
        <a href="https://yoga-sof.fr">yoga-sof.fr</a>
      </p>
    </>,
  ),
});
