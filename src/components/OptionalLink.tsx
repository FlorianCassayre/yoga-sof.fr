import { LinkProps } from 'next/dist/client/link';
import * as React from 'react';
import Link from 'next/link';

export const OptionalLink = ({ href, ...props }: Omit<LinkProps, 'href'> & { href?: LinkProps['href'], children: React.ReactNode }): JSX.Element =>
  href ? <Link href={href} {...props}>{props.children}</Link> : <>{props.children}</>;
