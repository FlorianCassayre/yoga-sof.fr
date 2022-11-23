import React, { Fragment } from 'react';
import { BackofficeContent } from '../../components/layout/admin/BackofficeContent';
import { Email } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { EmailMessageGrid } from '../../components/grid/grids/EmailMessageGrid';

// TODO fix types and use this
const renderHtmlSafe = (html: string) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, 'text/html');
  const renderNodeSafe = (node: Document | ChildNode) => {
    if (node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.ELEMENT_NODE) {
      let Tag: React.FC<{ children: React.ReactNode }> = Fragment;
      const tagName = (node as any).tagName?.toLowerCase();
      if (tagName === 'br') {
        Tag = function Br() {
          return <br />;
        };
      } else if (tagName === 'a') {
        Tag = function A({ children }) {
          return <abbr title={(node as any).getAttributeNode('href')?.value}>{children}</abbr>;
        };
      } else if (tagName === 'strong') {
        Tag = function Strong({ children }) {
          return <strong>{children}</strong>;
        };
      } else if (tagName === 'em') {
        Tag = function Em({ children }) {
          return <em>{children}</em>;
        };
      } else if (tagName === 'ul') {
        Tag = function Ul({ children }) {
          return <ul>{children}</ul>;
        };
      } else if (tagName === 'li') {
        Tag = function Li({ children }) {
          return <li>{children}</li>;
        };
      }
      return (
        <Tag>
          {Array.from(node.childNodes).map((child, i) => (
            <Fragment key={i}>
              {renderNodeSafe(child)}
            </Fragment>
          ))}
        </Tag>
      );
    } else if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    } else {
      throw new Error();
    }
    // Else, ignore
  };
  return renderNodeSafe(dom);
};

export default function AdminEmails() {
  return (
    <BackofficeContent
      title="Emails"
      icon={<Email />}
    >
      <Typography paragraph>
        Liste des e-mails envoyés par le système. Ce module est en lecture seule.
      </Typography>
      <EmailMessageGrid />
    </BackofficeContent>
  );
}
