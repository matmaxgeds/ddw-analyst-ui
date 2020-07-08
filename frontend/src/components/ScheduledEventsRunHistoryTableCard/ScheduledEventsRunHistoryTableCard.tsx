import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { Card, Dropdown, DropdownButton } from 'react-bootstrap';
import { Dimmer, Loader } from 'semantic-ui-react';
import { ScheduledEventRunHistory, ScheduledEvent } from '../../types/scheduledEvents';
import { PaginationRow } from '../PaginationRow';
import { ScheduledEventsRunHistoryTable } from '../ScheduledEventsRunHistoryTable';
import { fetchDataPerPage, LIMIT } from './utils';

interface ComponentProps {
  event?: ScheduledEvent;
}

export const ScheduledEventsRunHistoryTableCard: FunctionComponent<ComponentProps> = ({
  event,
}) => {
  const [historyData, setHistoryData] = useState<ScheduledEventRunHistory[]>([]);
  const [count, setCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [runInstanceStatus, setRunInstanceStatus] = useState('');

  useEffect(() => {
    if (event) {
      fetchDataPerPage(event.id, LIMIT, currentPage, runInstanceStatus).then((result) => {
        setHistoryData(result.data.results);
        setCount(result.data.count);
        setPageCount(Math.ceil(result.data.count / LIMIT));
        setLoading(false);
      });
    }
  }, [event, currentPage]);

  const handlePageChange = (page: { selected: number }): void => {
    setLoading(true);
    setSelectedPage(page.selected);
    if (page.selected === selectedPage + 1) {
      setCurrentPage((currentPage) => currentPage + 1);
    } else if (page.selected === selectedPage - 1) {
      setCurrentPage((currentPage) => currentPage - 1);
    } else {
      setCurrentPage(() => page.selected + 1);
    }
  };

  const renderPagination = (): ReactNode => {
    return count === 0 ? (
      'No Data'
    ) : (
      <PaginationRow
        limit={LIMIT}
        count={count}
        pageCount={pageCount}
        onPageChange={handlePageChange}
      />
    );
  };

  const filterHistoryData = (eventKey: string): void => {
    if (event) {
      setRunInstanceStatus(eventKey);
      fetchDataPerPage(event.id, LIMIT, 1, eventKey).then((result) => {
        setHistoryData(result.data.results);
        setCount(result.data.count);
        setPageCount(Math.ceil(result.data.count / LIMIT));
      });
    }
  };

  return event && historyData && historyData.length ? (
    <>
      <Dimmer active={loading} inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Card className="col-md-12">
        <Card.Header className="card-header-rose card-header-icon">
          <h4 className="card-title">{event.name} Run History</h4>
        </Card.Header>
        <Card.Body>
          <div className="float-right">
            <DropdownButton id="dropdown-basic-button" title="Filter" variant="danger">
              <Dropdown.Item onSelect={filterHistoryData} eventKey="">
                All
              </Dropdown.Item>
              <Dropdown.Item onSelect={filterHistoryData} eventKey="e">
                Errored
              </Dropdown.Item>
              <Dropdown.Item onSelect={filterHistoryData} eventKey="p">
                Pending
              </Dropdown.Item>
              <Dropdown.Item onSelect={filterHistoryData} eventKey="c">
                Complete
              </Dropdown.Item>
              <Dropdown.Item onSelect={filterHistoryData} eventKey="s">
                Skipped
              </Dropdown.Item>
            </DropdownButton>
          </div>
          <ScheduledEventsRunHistoryTable data={historyData} />
          {renderPagination()}
        </Card.Body>
      </Card>
    </>
  ) : null;
};
