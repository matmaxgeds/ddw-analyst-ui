import React, { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { OperationTabContainer } from '../../components/OperationTabContainer';
import { OperationMap } from '../../types/operations';
import { useOperation, useSources } from '../../utils/hooks';

type RouterParams = {
  id?: string;
};
type QueryBuilderProps = RouteComponentProps<RouterParams>;

const AdvancedQueryBuilder: FunctionComponent<QueryBuilderProps> = (props) => {
  const { id: operationID } = props.match.params;
  const { loading, operation } = useOperation<OperationMap>(
    operationID ? parseInt(operationID) : undefined,
  );
  const sources = useSources({ limit: 200, offset: 0 });

  return (
    <Row>
      <Col>
        <React.Fragment>
          <Dimmer active={loading || !sources.count()} inverted>
            <Loader content="Loading" />
          </Dimmer>
          {!loading && sources.count() ? <OperationTabContainer operation={operation} /> : null}
        </React.Fragment>
      </Col>
    </Row>
  );
};

export default AdvancedQueryBuilder;
