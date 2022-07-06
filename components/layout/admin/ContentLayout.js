import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Badge, Breadcrumb, Spinner } from 'react-bootstrap';
import { ErrorMessage } from '../../ErrorMessage';

export function ContentLayout({ children, title, icon: Icon, headTitle, countRef, breadcrumb, isLoading, isError, error }) {
  const { pathname } = useRouter();
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (countRef != null) {
      // eslint-disable-next-line
      countRef.current = setCount;
    }
  }, [countRef, setCount]);

  const renderHeadTitle = titleValue => (
    <Head>
      <title>
        {titleValue}
        {' '}
        - Administration Yoga Sof
      </title>
    </Head>
  );

  return !isError ? (
    !isLoading ? (
      <>
        {headTitle ? renderHeadTitle(headTitle) : title && renderHeadTitle(title)}

        {breadcrumb && (
          <Breadcrumb>
            {breadcrumb.map(({ title: breadcrumbTitle, pathname: pathnameOther }, i) => (pathnameOther && pathnameOther !== pathname ? (
              <Link key={i} href={pathnameOther} passHref>
                <Breadcrumb.Item>{breadcrumbTitle}</Breadcrumb.Item>
              </Link>
            ) : (
              <Breadcrumb.Item key={i} active>{breadcrumbTitle}</Breadcrumb.Item>
            )))}
          </Breadcrumb>
        )}

        {title && (
          <>
            <h1 className="h4">
              {Icon && <Icon className="icon me-2" />}
              {title}
              {count != null && (
                <Badge pill bg="secondary" className="ms-2">
                  {count}
                </Badge>
              )}
            </h1>
            <hr />
          </>
        )}

        {children}
      </>
    ) : (
      <>
        {renderHeadTitle('Chargement...')}
        <div className="my-5 text-center">
          <Spinner animation="border" />
        </div>
      </>
    )
  ) : (
    <>
      {renderHeadTitle('Erreur')}
      <ErrorMessage error={error} />
    </>
  );
}
