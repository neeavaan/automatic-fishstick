import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CsvPreviewTable } from '../components/CsvPreviewTable.js';
import type { ParsedCsv } from '../types/csv.types.js';

const parsed: ParsedCsv = {
  headers: ['name', 'age'],
  rows: [
    { name: 'Alice', age: '30' },
    { name: 'Bob', age: '25' },
  ],
  rowCount: 2,
  columnCount: 2,
};

describe('CsvPreviewTable', () => {
  it('renders column headers', () => {
    render(<CsvPreviewTable parsed={parsed} />);
    expect(screen.getByText('name')).toBeTruthy();
    expect(screen.getByText('age')).toBeTruthy();
  });

  it('renders row data', () => {
    render(<CsvPreviewTable parsed={parsed} />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('shows row and column count', () => {
    render(<CsvPreviewTable parsed={parsed} />);
    // Row/column count is split across <span> elements; check the container paragraph text
    const summary = document.querySelector('p.text-sm');
    expect(summary?.textContent).toMatch(/2.*rows/i);
  });
});
