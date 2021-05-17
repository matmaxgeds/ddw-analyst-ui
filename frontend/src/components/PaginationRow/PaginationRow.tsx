import classNames from 'classnames';
import React, { FunctionComponent, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Pagination, PaginationProps } from '../Pagination';

interface ComponentProps extends Partial<PaginationProps> {
  limit: number;
  count: number;
  className?: string;
  currentPage?: number;
}

const PaginationRow: FunctionComponent<ComponentProps> = ({ limit, count, ...props }) => {
  const [offset, setOffset] = useState(props.currentPage);
  const onPageSelected = (page: { selected: number }): void => {
    if (page.selected === 0) {
      setOffset(0);
    } else {
      setOffset(page.selected * limit);
    }
    if (props.onPageChange) {
      props.onPageChange(page);
    }
  };
  const max = offset ? offset : 0 + limit;

  return (
    <Row className={classNames(props.className)}>
      <Col
        lg={4}
        className="align-middle d-none d-sm-none d-md-block m-auto"
        style={{ top: '2px' }}
      >
        {count === 0
          ? 'No Data'
          : `Showing ${offset ? offset : 0 + 1} to ${max > count ? count : max} of ${count}`}
      </Col>
      <Col lg={8} className="align-middle">
        <Pagination
          className="pagination-danger float-right"
          {...props}
          onPageChange={onPageSelected}
          currentPage={props.currentPage}
        />
      </Col>
    </Row>
  );
};

export { PaginationRow };
