import Link from 'next/link';
import { Badge, Breadcrumb, Spinner } from 'react-bootstrap';
import { ErrorMessage } from '../../ErrorMessage';

export function ContentLayout({ children, pathname, title, count, breadcrumb, isLoading, isError, error }) {
  return !isError ? (
    !isLoading ? (
      <>
        {breadcrumb && (
          <Breadcrumb>
            {breadcrumb.map(({ title, pathname: pathnameOther }, i) => pathnameOther && pathnameOther !== pathname ? (
              <Link key={i} href={pathnameOther} passHref>
                <Breadcrumb.Item>{title}</Breadcrumb.Item>
              </Link>
            ) : (
              <Breadcrumb.Item key={i} active>{title}</Breadcrumb.Item>
            ))}
          </Breadcrumb>
        )}

        {title && (
          <>
            <h1 className="h4">
              {title}
              {count != null && (
                <Badge pill bg="secondary" className="ms-2">{count}</Badge>
              )}
            </h1>
            <hr />
          </>
        )}

        {children}
      </>
    ) : (
      <div className="my-5 text-center">
        <Spinner animation="border" />
      </div>
    )
  ) : (
    <ErrorMessage error={error} />
  );
}
