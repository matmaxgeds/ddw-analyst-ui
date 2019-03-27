import { MapDispatchToProps, connect } from 'react-redux';
import { List } from 'immutable';
import { Card, Col, FormControl, Pagination, Row } from 'react-bootstrap';
import { OperationMap } from '../../types/operations';
import { debounce } from 'lodash';
import { OperationsTable } from '../OperationsTable/OperationsTable';
import * as React from 'react';
import * as operationsActions from '../../actions/operations';
import { OperationsState } from '../../reducers/operations';
import { Dimmer, Loader } from 'semantic-ui-react';
import { bindActionCreators } from 'redux';
import { ReduxStore } from '../../store';
import { LinksMap } from '../../types/api';

interface ActionProps {
  actions: typeof operationsActions;
}
interface ReduxState {
  operations: OperationsState;
}
interface ComponentProps {
  limit: number;
  offset: number;
  links: LinksMap;
}
type OperationsTableCardProps = ComponentProps & ActionProps & ReduxState;

class OperationsTableCard extends React.Component<OperationsTableCardProps> {
  static defaultProps: Partial<OperationsTableCardProps> = {
    offset: 0
  };

  render() {
    const operations = this.props.operations.get('operations') as List<OperationMap>;
    const loading = this.props.operations.get('loading') as boolean;

    return (
      <React.Fragment>
        <Dimmer active={ loading } inverted>
          <Loader content="Loading" />
        </Dimmer>
        <Card>
          <Card.Header className="card-header-text card-header-danger">
            <Card.Text>Queries</Card.Text>
            <FormControl
              placeholder="Search ..."
              className="w-25"
              onChange={ debounce(this.onSearchChange, 1000, { leading: true }) }
              data-testid="sources-table-search"
            />
          </Card.Header>
          <Card.Body>
            <OperationsTable operations={ operations } onRowClick={ this.onRowClick }/>
            { this.renderPagination() }
          </Card.Body>
        </Card>
      </React.Fragment>
    );
  }

  componentDidMount() {
    const operations = this.props.operations.get('operations') as List<OperationMap>;
    const loading = this.props.operations.get('loading') as boolean;
    if (!operations.count() && !loading) {
      this.props.actions.fetchOperations({ limit: 10, offset: 0 });
    }
  }

  private renderPagination() {
    const count = this.props.operations.get('count') as number;
    const { offset, limit } = this.props;
    const max = offset + limit;

    return (
      <Row>
        <Col md={ 6 }>
          Showing { offset + 1 } to { max > count ? count : max } of { count }
        </Col>
        <Col md={ 6 }>
          <Pagination className="float-right">
            <Pagination.First onClick={ this.goToFirst } data-testid="info-pagination-first">
              <i className="material-icons">first_page</i>
            </Pagination.First>
            <Pagination.Prev onClick={ this.goToPrev } data-testid="info-pagination-prev">
              <i className="material-icons">chevron_left</i>
            </Pagination.Prev>
            <Pagination.Next onClick={ this.goToNext } data-testid="info-pagination-next">
              <i className="material-icons">chevron_right</i>
            </Pagination.Next>
            <Pagination.Last onClick={ this.goToLast } data-testid="info-pagination-last">
              <i className="material-icons">last_page</i>
            </Pagination.Last>
          </Pagination>
        </Col>
      </Row>
    );
  }

  private onSearchChange = (event: React.FormEvent<any>) => {
    const { value } = event.currentTarget as HTMLInputElement;
    this.setState({ searchQuery: value || '' });
  }

  private onRowClick = () => {
    //
  }

  private goToFirst = () => {
    this.props.actions.fetchOperations({ limit: this.props.limit, offset: 0 });
  }

  private goToLast = () => {
    const count = this.props.operations.get('count') as number;
    const pages = Math.ceil(count / this.props.limit);
    const offset = (pages - 1) * this.props.limit;
    this.props.actions.fetchOperations({ limit: this.props.limit, offset });
  }

  private goToNext = () => {
    const count = this.props.operations.get('count') as number;
    const offset = this.props.offset + this.props.limit;
    if (offset < count) {
      this.props.actions.fetchOperations({ limit: this.props.limit, offset });
    }
  }

  private goToPrev = () => {
    if (this.props.offset > 0) {
      const offset = this.props.offset - this.props.limit;
      this.props.actions.fetchOperations({ limit: this.props.limit, offset });
    }
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, ComponentProps> = (dispatch): ActionProps => ({
  actions: bindActionCreators(operationsActions, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    operations: reduxStore.get('operations') as OperationsState
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(OperationsTableCard);

export { connector as OperationsTableCard, connector as default };
