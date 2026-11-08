import { describe, expect, it } from 'vitest';

import { sanitizeMessage } from '../../../features/email/sanitizeMessage';

describe('sanitizeMessage', () => {
  it('keeps the allowed formatting tags', () => {
    expect(
      sanitizeMessage('<b>gras</b> <strong>fort</strong> <i>italique</i> <em>accent</em>'),
    ).toBe('<b>gras</b> <strong>fort</strong> <i>italique</i> <em>accent</em>');
  });

  it('keeps line breaks', () => {
    expect(sanitizeMessage('ligne<br>ligne')).toBe('ligne<br>ligne');
  });

  it('keeps paragraphs and lists', () => {
    expect(sanitizeMessage('<p>un</p><ul><li>deux</li></ul>')).toBe(
      '<p>un</p><ul><li>deux</li></ul>',
    );
  });

  it('keeps links with their href and forces a new tab', () => {
    const result = sanitizeMessage('<a href="https://example.com">lien</a>');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('drops scripts and their content', () => {
    expect(sanitizeMessage('avant<script>alert(1)</script>après')).toBe('avantaprès');
  });

  it('strips event handlers', () => {
    expect(sanitizeMessage('<b onclick="alert(1)">gras</b>')).toBe('<b>gras</b>');
  });

  it('neutralizes javascript links', () => {
    expect(sanitizeMessage('<a href="javascript:alert(1)">lien</a>')).not.toContain('javascript:');
  });

  it('strips images and unknown tags but keeps their text', () => {
    expect(sanitizeMessage('<img src="https://example.com/x.png" alt="x">texte')).toBe('texte');
    expect(sanitizeMessage('<section>texte</section>')).toBe('texte');
  });
});
