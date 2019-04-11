import { OperationForm } from '../../components/OperationForm';
import axios, { AxiosResponse } from 'axios';
import { List } from 'immutable';
import * as React from 'react';
import { Card, Col, Row, Tab } from 'react-bootstrap';
import { MapDispatchToProps, connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import { deleteOperation, fetchOperation, setOperation } from '../../actions/operations';
import * as sourcesActions from '../../actions/sources';
import classNames from 'classnames';
import { OperationStepForm } from '../../components/OperationStepForm';
import OperationSteps from '../../components/OperationSteps';
import { SourcesState } from '../../reducers/sources';
import { TokenState } from '../../reducers/token';
import { ReduxStore } from '../../store';
import { Operation, OperationMap, OperationStepMap } from '../../types/operations';
import { SourceMap } from '../../types/sources';
import * as pageActions from './actions';
import './QueryBuilder.scss';
import { QueryBuilderState, queryBuilderReducerId } from './reducers';
import { api, getSourceIDFromOperation } from '../../utils';

interface ActionProps {
  actions: typeof sourcesActions & typeof pageActions & {
    fetchOperation: typeof fetchOperation;
    setActiveOperation: typeof setOperation;
    deleteOperation: typeof deleteOperation;
  };
}
interface ReduxState {
  sources: SourcesState;
  operations: List<OperationMap>;
  activeOperation?: OperationMap;
  activeSource?: SourceMap;
  token: TokenState;
  page: QueryBuilderState;
}
interface RouterParams {
  id?: string;
}
type QueryBuilderProps = ActionProps & ReduxState & RouteComponentProps<RouterParams>;

const StyledIcon = styled.i`cursor: pointer;`;
const StyledCardBody = styled(Card.Body)`
  &.card-body {
    padding-right: 15px;
    padding-left: 15px;
  }
`;

class QueryBuilder extends React.Component<QueryBuilderProps> {
  render() {
    const { activeSource } = this.props;
    const activeStep = this.props.page.get('activeStep') as OperationStepMap | undefined;

    return (
      <Row>
        <Col md={ 4 }>
          <Tab.Container defaultActiveKey="operation">
            <Card className="source-details">
              <Card.Header className="card-header-text card-header-danger">
                <Card.Text>Operation</Card.Text>
              </Card.Header>
              <StyledCardBody>

                { this.renderOperationForm() }

              </StyledCardBody>
            </Card>
          </Tab.Container>
        </Col>

        <Col md={ 8 }>
          <Card className={ classNames({ 'd-none': !activeStep }) }>
            <Card.Header>
              <Card.Title>
                Create Operation Step
                <StyledIcon className="material-icons float-right" onClick={ this.resetAction }>
                  close
                </StyledIcon>
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                {
                  this.renderOperationStepForm(activeSource, activeStep, this.props.page.get('editingStep') as boolean)
                }
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  componentDidMount() {
    const { activeOperation } = this.props;
    const { id } = this.props.match.params;
    if (id && !activeOperation) {
      this.setActiveOperationByID(id);
    }
    if (!id && activeOperation) {
      this.fetchActiveSourceByOperation(activeOperation);
    }
  }

  componentWillUnmount() {
    this.props.actions.setActiveOperation();
  }

  private renderOperationForm() {
    const { activeOperation: operation } = this.props;
    const { id } = this.props.match.params;

    if (id && !operation) {
      return 'Loading ...';
    }

    const steps = this.props.page.get('steps') as List<OperationStepMap>;
    const activeStep = this.props.page.get('activeStep') as OperationStepMap | undefined;

    return (
      <OperationForm
        operation={ operation }
        valid={ steps.count() > 0 }
        onUpdateOperation={ this.onUpdateOperation }
        onSuccess={ this.onSaveOperation }
        processing={ this.props.page.get('processing') as boolean }
        onDeleteOperation={ this.onDeleteOperation }
        onReset={ () => this.props.actions.setActiveOperation() }
      >
        <OperationSteps
          sources={ this.props.sources.get('sources') as List<SourceMap> }
          isFetchingSources={ this.props.sources.get('loading') as boolean }
          steps={ steps }
          fetchSources={ this.props.actions.fetchSources }
          onSelectSource={ this.props.actions.setActiveSource }
          onAddStep={ this.props.actions.updateActiveStep }
          activeSource={ this.props.activeSource }
          activeStep={ activeStep }
          onClickStep={ (step) => this.props.actions.updateActiveStep(step, true) }
        />
      </OperationForm>
    );
  }

  private renderOperationStepForm(source?: SourceMap, step?: OperationStepMap, editing = false) {
    if (step && source) {
      return (
        <OperationStepForm
          source={ source }
          step={ step }
          onUpdateStep={ this.props.actions.updateActiveStep }
          onSuccess={ this.onAddOperationStep }
          onDeleteStep={ this.onDeleteOperationStep }
          editing={ editing }
        />
      );
    }

    return null;
  }

  private setActiveOperationByID(id: string) {
    const operation = this.props.operations.find(ope => ope.get('id') === parseInt(id, 10));
    if (operation) {
      this.props.actions.setActiveOperation(operation);
      this.fetchActiveSourceByOperation(operation);
    } else {
      this.props.actions.fetchOperation(id);
    }
  }

  private fetchActiveSourceByOperation(operation: OperationMap) {
    const sourceID = getSourceIDFromOperation(operation);
    if (sourceID) {
      this.props.actions.fetchActiveSource(sourceID);
    }
  }

  private resetAction = () => {
    this.props.actions.updateActiveStep(undefined);
  }

  private onAddOperationStep = (step: OperationStepMap) => {
    if (this.props.page.get('editingStep')) {
      this.props.actions.editOperationStep(step);
    } else {
      this.props.actions.addOperationStep(step);
    }
    this.props.actions.updateActiveStep(undefined);
  }

  private onUpdateOperation = (operation: OperationMap) => {
    this.props.actions.setActiveOperation(operation, true);
  }

  private onDeleteOperation = (operation: OperationMap) => {
    const operationID = operation.get('id') as string | undefined;
    if (operationID) {
    this.props.actions.deleteOperation(operationID, this.props.history);
    }
  }

  private onSaveOperation = (preview = false) => {
    this.props.actions.savingOperation();
    const steps = this.props.page.get('steps') as List<OperationStepMap>;
    const { activeOperation: operation } = this.props;
    if (!operation) {
      return;
    }
    const id = operation.get('id');
    const url = id ? `${api.routes.OPERATIONS}${id}/` : api.routes.OPERATIONS;

    const data: Operation = { ...operation.toJS() as Operation, operation_steps: steps.toJS() };
    if (this.props.token) {
      axios.request({
        url,
        method: id ? 'put' : 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${this.props.token}`
        },
        data
      })
      .then((response: AxiosResponse<Operation>) => {
        if (response.status === 200 || response.status === 201) {
          this.props.actions.operationSaved(true);
          if (preview) {
            this.props.history.push(`/queries/data/${response.data.id}/`);
          } else {
            this.props.history.push('/');
          }
        }
      })
      .catch(() => {
        this.props.actions.operationSaved(false);
      });
    }
  }

  private onDeleteOperationStep = (step: OperationStepMap) => {
    this.props.actions.updateActiveStep(undefined);
    this.props.actions.deleteOperationStep(step);
  }
}

const mapDispatchToProps: MapDispatchToProps<ActionProps, {}> = (dispatch): ActionProps => ({
  actions: bindActionCreators({
    ...sourcesActions,
    ...pageActions,
    fetchOperation,
    setActiveOperation: setOperation,
    deleteOperation
  }, dispatch)
});
const mapStateToProps = (reduxStore: ReduxStore): ReduxState => {
  return {
    token: reduxStore.get('token') as TokenState,
    sources: reduxStore.get('sources') as SourcesState,
    operations: reduxStore.getIn([ 'operations', 'operations' ]),
    activeOperation: reduxStore.getIn([ 'operations', 'activeOperation' ]),
    activeSource: reduxStore.getIn([ 'sources', 'activeSource' ]),
    page: reduxStore.get(`${queryBuilderReducerId}`)
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps)(QueryBuilder);

export { connector as QueryBuilder };
