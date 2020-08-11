import { List } from 'immutable';
import React, { FunctionComponent, useState } from 'react';
import { Modal, Table, Alert } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { SourceMap } from '../../types/sources';
import { SourceDetailsTab } from '../SourceDetailsTab';
import { SourcesTableRow } from '../SourcesTableRow';

interface SourcesTableProps {
  sources: List<SourceMap>;
  activeSource?: SourceMap;
}
export const SourcesTable: FunctionComponent<SourcesTableProps> = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [activeSource, setActiveSource] = useState<SourceMap | undefined>();
  const history = useHistory();

  const onShowDatasets = (source: SourceMap) => {
    setActiveSource(source);
    history.push(`${source.get('id') as string}/datasets`);
  };
  const onShowMetadata = (source: SourceMap) => {
    setActiveSource(source);
    setShowModal(true);
  };
  const onHideModal = () => setShowModal(false);

  const renderRows = (sources: List<SourceMap>, activeSource?: SourceMap) => {
    if (sources && sources.size && activeSource) {
      return sources.map((source, index) => (
        <SourcesTableRow
          key={index}
          source={source}
          onShowDatasets={onShowDatasets}
          onShowMetadata={onShowMetadata}
        />
      ));
    }

    return null;
  };

  return (
    <>
      <Table responsive hover striped className="sources-table" size="sm">
        <thead>
          <tr>
            <th>Indicator</th>
            <th>Updated On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{renderRows(props.sources, props.activeSource)}</tbody>
      </Table>
      <Modal show={showModal} onHide={onHideModal}>
        {activeSource ? (
          <SourceDetailsTab source={activeSource} />
        ) : (
          <Alert variant="warning">No active source</Alert>
        )}
      </Modal>
    </>
  );
};
