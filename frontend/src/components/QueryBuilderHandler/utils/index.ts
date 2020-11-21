import Tokenizr from 'tokenizr';
import { Set } from 'immutable';

export const parseTextFilterString = (options: string, columns: Set<string>): any => {
  const advancedFilters: any = [];
  let filters: any = [];
  let expression: any = {};
  let operators: any = [];
  let andOR = '';
  let parenthesis = '';
  let bracketFilters: any = [];
  let parenthesisType = '';
  const columnValidation: any = {};

  const lexer = new Tokenizr();

  //Match table columns with 'col_' prefix
  lexer.rule(/\bcol_[a-zA-Z_][a-zA-Z0-9_]*/, (ctx) => {
    ctx.accept('table_column');
  });

  //Match sql comparison operators
  lexer.rule(/(=|>|<|>=|<|<=|<>)/, (ctx) => {
    ctx.accept('operato');
  });

  //Match column value in quotes
  lexer.rule(/(["'])(?:(?=(\\?))\2.)*?\1/, (ctx) => {
    ctx.accept('column_value');
  });

  //Match AND-OR statements
  lexer.rule(/AND|OR/, (ctx) => {
    ctx.accept('AND|OR');
  });

  //Ignore newlines
  lexer.rule(/\/\/[^\r\n]*\r?\n/, (ctx) => {
    ctx.ignore();
  });

  //Ignore tabs
  lexer.rule(/[ \t\r\n]+/, (ctx) => {
    ctx.ignore();
  });

  //Match brackets
  lexer.rule(/./, (ctx) => {
    ctx.accept('char');
  });

  lexer.input(options);

  //Create JSON fields from text filters query string
  lexer.tokens().forEach((token) => {
    // console.log(`token ${JSON.stringify(token)}`);
    if (token.type === 'AND|OR') {
      andOR = token.value;
    }

    if (token.type === 'char' && token.value === '(') {
      parenthesisType = andOR;
      andOR = '';
      parenthesis = token.value;
    } else if (token.type === 'char') {
      parenthesis = token.value;
      parenthesisType = parenthesisType.length === 0 ? andOR : parenthesisType;
    }

    if (token.type === 'table_column') {
      expression = {};
      const tableColumn = token.value.startsWith('col_') ? token.value.substr(4) : token.value;
      expression['field'] = tableColumn;

      if (validateTableColumn(tableColumn, columns) === undefined) {
        columnValidation[tableColumn] = tableColumn;
      }
    } else if (token.type === 'operato') {
      operators.push(token.value);
      expression['func'] = token.value;
    } else if (token.type === 'column_value') {
      expression['value'] = removeQuotes(token.value).toString();

      filters.push({ ...expression, func: mapComparisonOperators(operators) });

      operators = [];

      if (parenthesis === '(' && andOR === 'OR') {
        for (let index = 0; index < filters.length; index++) {
          bracketFilters.push(filters[index]);
        }
        filters = [];
      } else if (parenthesis === '(' && andOR === 'AND') {
        for (let index = 0; index < filters.length; index++) {
          bracketFilters.push([filters[index]]);
        }

        filters = [];
      } else if (andOR === 'AND') {
        for (let index = 0; index < filters.length; index++) {
          advancedFilters.push([filters[index]]);
        }
        filters = [];
      } else if (andOR === 'OR') {
        for (let index = 0; index < filters.length; index++) {
          advancedFilters.push(filters[index]);
        }
        filters = [];
      }
    }

    if (parenthesis === ')' && parenthesisType === 'AND') {
      if (bracketFilters.length > 0) {
        advancedFilters.push({
          and_brackets: bracketFilters,
        });
      }
      bracketFilters = [];
    } else if (parenthesis === ')' && parenthesisType === 'OR') {
      if (bracketFilters.length > 0) {
        advancedFilters.push({
          or_brackets: bracketFilters,
        });
      }

      bracketFilters = [];
    }
  });

  return {
    filterJSON: advancedFilters,
    validation: Object.keys(columnValidation).join(', '),
  };
};

const validateTableColumn = (columnName: string, columns: Set<string>) => {
  const col = columns.find((col) => col === columnName);

  return col;
};

const mapComparisonOperators = (operators: string[]) => {
  const operatorMap: any = {
    '>=': 'ge',
    '=>': 'ge',
    '<=': 'le',
    '=<': 'le',
    '<': 'lt',
    '>': 'gt',
    '=': 'eq',
    '!=': 'ne',
  };

  return operatorMap[operators.join('')];
};

const removeQuotes = (str: string) => {
  return str.replace(/['"]+/g, '');
};
