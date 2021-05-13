import { Set } from 'immutable';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Column, ColumnList, SourceMap } from '../../../types/sources';
import { sortObjectArrayByProperty } from '../../../utils';
import { CheckboxGroup, CheckboxGroupOption } from '../../CheckboxGroup';
import { QueryBuilderHandler } from '../../QueryBuilderHandler';

interface ColumnSelectorProps {
  show?: boolean;
  source: SourceMap;
  columns: Column[];
}
type CheckOption = CheckboxGroupOption;

const getColumnGroupOptionsFromSource = (source: SourceMap): CheckOption[] => {
  const columnsList = source.get('columns') as ColumnList;
  const columnSet = Set(columnsList.map((column) => column.get('name') as string));

  return QueryBuilderHandler.getSelectOptionsFromColumns(columnSet, columnsList) as CheckOption[];
};

const ColumnSelector: FunctionComponent<ColumnSelectorProps> = ({ source, show, ...props }) => {
  const [columns, setColumns] = useState<CheckOption[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    props.columns.map((column) => column.name as string),
  );
  useEffect(() => {
    (window as any).$('[data-toggle="tooltip"]').tooltip(); // eslint-disable-line

    setColumns(getColumnGroupOptionsFromSource(source));
  }, []);
  const onUpdateColumns = (selection: string[]) => {
    setSelectedColumns(selection);
  };

  if (show) {
    return (
      <CheckboxGroup
        options={columns.sort(sortObjectArrayByProperty('text').sort)}
        selectedOptions={selectedColumns}
        onUpdateOptions={onUpdateColumns}
      />
    );
  }

  return null;
};

ColumnSelector.defaultProps = { show: true };

export { ColumnSelector };
