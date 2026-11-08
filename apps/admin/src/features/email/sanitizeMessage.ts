import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'br', 'a', 'p', 'ul', 'li'];
const ALLOWED_ATTR = ['href'];

let configured = false;

export const sanitizeMessage = (message: string): string => {
  // E-mails render exclusively on the client: fail closed on the server.
  if (typeof window === 'undefined') {
    return '';
  }
  if (!configured) {
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A') {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    });
    configured = true;
  }
  return DOMPurify.sanitize(message, { ALLOWED_TAGS, ALLOWED_ATTR });
};
