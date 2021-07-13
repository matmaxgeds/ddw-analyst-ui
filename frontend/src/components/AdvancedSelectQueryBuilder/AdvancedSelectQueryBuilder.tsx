import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { AdvancedQueryColumn, AdvancedQueryOptions } from '../../types/operations';
import { ColumnList, SourceMap } from '../../types/sources';
import { ICheck, ICheckData } from '../ICheck';
import { AdvancedQueryContext } from '../QuerySentenceBuilder';
import { AdvancedQueryBuilderColumnOrder } from './AdvancedQueryBuilderColumnOrder/AdvancedQueryBuilderColumnOrder';
import { ColumnAggregate } from './ColumnAggregate';
import { ColumnSelector } from './ColumnSelector';

interface ComponentProps {
  source: SourceMap;
  usage?: AdvancedSelectUsage;
}
type AdvancedSelectUsage = 'select' | 'join';

const getDefaultSelectAll = (usage: AdvancedSelectUsage, selectAll?: boolean): boolean => {
  if (usage === 'join') {
    return false;
  }

  return typeof selectAll !== 'undefined' ? selectAll : true;
};

const hasNumericalColumn = (
  sourceColumns: ColumnList,
  activeColumns: AdvancedQueryColumn[],
): boolean =>
  !!activeColumns.find((_column) =>
    sourceColumns.find(
      (column) => column.get('data_type') === 'N' && column.get('name') === _column.name,
    ),
  );

const showAggregateButton = (
  sourceColumns: ColumnList,
  options: AdvancedQueryOptions,
  usage: AdvancedSelectUsage = 'select',
) => {
  if (usage === 'join' && options.join?.columns && options.join.columns.length) {
    return hasNumericalColumn(sourceColumns, options.join.columns);
  }

  if (usage === 'select' && options.columns && options.columns.length) {
    return hasNumericalColumn(sourceColumns, options.columns);
  }

  return false;
};

const AdvancedSelectQueryBuilder: FunctionComponent<ComponentProps> = ({ source, usage }) => {
  const { options, updateOptions } = useContext(AdvancedQueryContext);
  const [activeAction, setActiveAction] = useState<'select' | 'order' | 'aggregate'>();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [selectAll, setSelectAll] = useState(getDefaultSelectAll(usage!, options.selectall));
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line
    if (typeof options.selectall === 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      updateOptions!({ selectall: true });
    }
  }, []);
  const onToggleSelectAll = (data: ICheckData) => {
    setSelectAll(data.checked);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    updateOptions!({ selectall: data.checked });
  };
  const onReset = () => {
    setActiveAction(undefined);
    if (usage === 'select') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      updateOptions!({ selectall: true, columns: [] });
    } else if (options.join && options.join.columns) {
      delete options.join.columns;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      updateOptions!({ join: options.join });
    }
  };

  return (
    <div className="mb-3">
      {usage === 'select' ? (
        <ICheck
          id="selectAll"
          name="selectAll"
          label="Select All"
          onChange={onToggleSelectAll}
          variant="danger"
          checked={selectAll}
        />
      ) : null}
      <ButtonGroup className="mr-2">
        <Button
          variant="danger"
          size="sm"
          data-toggle="tooltip"
          data-placement="top"
          data-html="true"
          title={`<i>Replaces</i> <strong>ALL</strong> columns with those selected`}
          onClick={() => setActiveAction('select')}
        >
          {selectAll ? 'Select Columns for Ordering' : 'Select Column(s)'}
        </Button>
        <Button
          variant="danger"
          size="sm"
          disabled={
            usage === 'join' && options.join
              ? !options.join.columns || options.join.columns.length <= 1
              : !options.columns || options.columns.length <= 1
          }
          onClick={() => setActiveAction('order')}
        >
          Order Columns
        </Button>
        <Button
          variant="danger"
          size="sm"
          hidden={
            selectAll || !showAggregateButton(source.get('columns') as ColumnList, options, usage)
          }
          onClick={() => setActiveAction('aggregate')}
        >
          Aggregate
        </Button>
        <Button variant="danger" size="sm" onClick={onReset}>
          Clear/Reset
        </Button>
      </ButtonGroup>
      <ColumnSelector
        usage={usage}
        show={activeAction === 'select'}
        source={source}
        columns={(usage === 'join' && options.join ? options.join.columns : options.columns) || []}
      />
      <AdvancedQueryBuilderColumnOrder
        usage={usage}
        show={activeAction === 'order'}
        columns={(usage === 'join' && options.join ? options.join.columns : options.columns) || []}
        source={source}
      />
      <ColumnAggregate
        usage={usage}
        show={activeAction === 'aggregate'}
        source={source}
        columns={(usage === 'join' && options.join ? options.join.columns : options.columns) || []}
      />
    </div>
  );
};

AdvancedSelectQueryBuilder.defaultProps = { usage: 'select' };

export { AdvancedSelectQueryBuilder };
