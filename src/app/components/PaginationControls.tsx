import { Button } from './Button';

export function getPagedItems<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(0, page);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(safePage, totalPages - 1);

  return {
    totalPages,
    currentPage,
    pageItems: items.slice(currentPage * pageSize, currentPage * pageSize + pageSize)
  };
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="pagination-row">
      <Button variant="ghost" disabled={page <= 0} onClick={() => onPageChange(Math.max(0, page - 1))}>
        Назад
      </Button>
      <strong className="page-indicator">
        {page + 1} / {totalPages}
      </strong>
      <Button variant="ghost" disabled={page >= totalPages - 1} onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}>
        Вперёд
      </Button>
    </div>
  );
}
