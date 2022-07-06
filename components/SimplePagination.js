import React, { useMemo } from 'react';
import { Pagination } from 'react-bootstrap';

export function SimplePagination({
  page,
  pageCount,
  onPageChange,
  radiusPage = 2,
  radiusExtremity = 1,
  isDisabled,
  isLoading,
  collapsePagination,
}) {
  const visiblePages = useMemo(() => {
    const pageSet = new Set();
    for (let i = page - radiusPage + 1; i <= page + radiusPage - 1; i++) {
      pageSet.add(i);
    }
    for (let i = 0; i < radiusExtremity; i++) {
      pageSet.add(1 + i);
      pageSet.add(pageCount - i);
    }

    const pagesArray = Array.from(pageSet)
      .filter(i => i >= 1 && i <= pageCount)
      .sort((a, b) => a - b);
    const finalPagesArray = [];
    for (let i = 0; i < pagesArray.length; i++) {
      const thisPage = pagesArray[i];
      finalPagesArray.push(thisPage);
      if (i < pagesArray.length - 1) {
        const nextPage = pagesArray[i + 1];
        if (thisPage + 2 === nextPage) { // Replace ellipsis by actual page
          finalPagesArray.push(thisPage + 1);
        }
      }
    }
    return finalPagesArray;
  }, [page, pageCount, radiusPage, radiusExtremity]);

  if (pageCount <= 1 && collapsePagination) {
    return null;
  }

  return (
    <Pagination className="justify-content-center">
      <Pagination.Prev disabled={page === 1 || isDisabled || isLoading} onClick={() => onPageChange(page - 1)} />

      {visiblePages.map((visiblePage, i) => (
        <React.Fragment key={visiblePage}>
          <Pagination.Item active={page === visiblePage} disabled={isDisabled || isLoading} onClick={() => visiblePage !== page && onPageChange(visiblePage)}>
            {visiblePage}
          </Pagination.Item>
          {i < visiblePages.length - 1 && visiblePage + 1 !== visiblePages[i + 1] && <Pagination.Ellipsis disabled />}
        </React.Fragment>
      ))}

      <Pagination.Next disabled={page === pageCount || isDisabled || isLoading} onClick={() => onPageChange(page + 1)} />
    </Pagination>
  );
}
