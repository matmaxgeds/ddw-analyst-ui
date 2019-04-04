import { OperationDataTable } from '../../components/OperationDataTable/OperationDataTable';
import { List } from 'immutable';
import { Card, Col, Row } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import * as React from 'react';
import { ReduxStore } from '../../store';
import { OperationDataMap, OperationMap } from '../../types/operations';
import { ColumnList } from '../../types/sources';
import * as pageActions from './actions';
import { QueryDataState, queryDataReducerId } from './reducers';

interface ActionProps {
  actions: typeof pageActions;
}
interface ReduxState {
  page: QueryDataState;
  operations: List<OperationMap>;
}
interface RouteParams {
  id?: string;
}
type QueryDataProps = ActionProps & ReduxState & RouteComponentProps<RouteParams>;

class QueryData extends React.Component<QueryDataProps> {
  render() {
    const data = this.props.page.getIn([ 'data', 'results' ]) as List<OperationDataMap>;
    const columns = this.props.page.getIn([ 'source', 'columns' ]) as ColumnList | undefined;

    return (
      <Row>
        <Col>
          <Card>
            <Card.Header className="card-header-text card-header-danger">
              <Card.Text>Query Data</Card.Text>
            </Card.Header>
            <Card.Body>
              <OperationDataTable data={ data } columns={ columns }/>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  componentDidMount() {
    const operation = this.props.page.get('operation') as OperationMap | undefined;
    const { id } = this.props.match.params;
    if (!operation) {
      this.setOperation(id);
    } else {
      this.props.actions.fetchOperationSource(operation);
    }
    if (id) {
      this.props.actions.fetchOperationData(id);
    }
  }

  private setOperation(id?: string) {
    if (id) {
      const operation = this.props.operations.find(ope => ope.get('id') === parseInt(id, 10));
      if (operation) {
        this.props.actions.setOperation(operation);
        this.props.actions.fetchOperationSource(operation);
      } else {
        this.props.actions.fetchOperation(id);
      }
    }
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators(pageActions, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => ({
  page: reduxStore.get(`${queryDataReducerId}`),
  operations: reduxStore.getIn([ 'operations', 'operations' ])
});

const connector = connect(mapStateToProps, mapDispatchToProps)(QueryData);

export { connector as QueryData, connector as default };
