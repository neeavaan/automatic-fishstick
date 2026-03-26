import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileDropZone } from '../components/FileDropZone.js';

describe('FileDropZone', () => {
  it('renders drag and drop prompt', () => {
    render(<FileDropZone onFile={() => undefined} />);
    expect(screen.getByText(/drag & drop a csv file/i)).toBeTruthy();
  });

  it('shows only .csv files accepted', () => {
    render(<FileDropZone onFile={() => undefined} />);
    expect(screen.getByText(/only .csv files are accepted/i)).toBeTruthy();
  });

  it('file input accepts only .csv', () => {
    render(<FileDropZone onFile={() => undefined} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe('.csv');
  });
});
