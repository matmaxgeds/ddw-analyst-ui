import { List } from 'immutable';
import queryString from 'query-string';
import React, {
  ChangeEvent,
  KeyboardEvent,
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { Card, FormControl } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { fetchSources } from '../../actions/sources';
import { LinksMap } from '../../types/api';
import { FormControlElement } from '../../types/bootstrap';
import { SourceMap } from '../../types/sources';
import { PaginationRow } from '../PaginationRow';
import { SourcesTable } from '../SourcesTable/SourcesTable';

interface ComponentProps {
  sources: List<SourceMap>;
  activeSource?: SourceMap;
  loading: boolean;
  limit: number;
  offset: number;
  links?: LinksMap;
  count: number;
}
type SourcesTableCardProps = ComponentProps;
type TableFilters = {
  search?: string;
  page?: number;
};

export const SourcesTableCard: FunctionComponent<SourcesTableCardProps> = (props) => {
  const { search, pathname } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  useEffect(() => {
    const queryParams = queryString.parse(search);
    setSearchQuery((queryParams.search as string) || '');
    setSearchInput((queryParams.search as string) || '');
    setPageNumber(Number(queryParams.page || 1));
  }, [search]);
  useEffect(() => {
    dispatch(
      fetchSources({
        limit: 10,
        offset: (pageNumber - 1) * props.limit,
        search: searchQuery,
      }),
    );
  }, [searchQuery, pageNumber]);

  const updateQueryParams = (filter: TableFilters): void => {
    const queryParameters = { ...queryString.parse(search), ...filter };
    const cleanParameters: Partial<TableFilters> = {};
    if (queryParameters.search) cleanParameters.search = queryParameters.search;
    if (queryParameters.page) cleanParameters.page = queryParameters.page;
    history.push(`${pathname}?${queryString.stringify(cleanParameters)}`);
  };

  const onSearchChange = (event: ChangeEvent<FormControlElement>) => {
    const { value = '' } = event.currentTarget as HTMLInputElement;
    if (!value) {
      updateQueryParams({ search: '' });
    } else {
      setSearchInput(value);
    }
  };

  const onSearch = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      updateQueryParams({ search: searchInput, page: 1 });
    }
  };

  const onPageChange = (page: { selected: number }): void => {
    dispatch(
      fetchSources({
        limit: props.limit,
        offset: page.selected * props.limit,
        search: searchQuery,
      }),
    );
    updateQueryParams({ page: page.selected + 1 });
  };

  const renderPagination = (): ReactNode => {
    return (
      <PaginationRow
        pageRangeDisplayed={2}
        limit={props.limit}
        count={props.count}
        pageCount={Math.ceil(props.count / props.limit)}
        onPageChange={onPageChange}
        currentPage={pageNumber === 1 ? 0 : pageNumber - 1}
        offset={(pageNumber - 1) * props.limit}
      />
    );
  };

  return (
    <React.Fragment>
      <Dimmer active={props.loading} inverted>
        <Loader content="Loading" />
      </Dimmer>
      <Card>
        <Card.Header className="card-header-text card-header-danger">
          <Card.Title>
            <FormControl
              placeholder="Search ..."
              className="w-50"
              value={searchInput}
              onChange={onSearchChange}
              onKeyDown={onSearch}
              data-testid="sources-table-search"
            />
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <SourcesTable sources={props.sources} activeSource={props.activeSource} />
          {renderPagination()}
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

SourcesTableCard.defaultProps = {
  limit: 10,
  offset: 0,
};
