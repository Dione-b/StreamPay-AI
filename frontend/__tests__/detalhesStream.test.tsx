import React from 'react';
import { render, screen } from '@testing-library/react';
import StreamDetalhePage from '../app/stream/[id]/page';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('StreamDetalhePage', () => {
  it('renderiza título e detalhes do stream', () => {
    (useRouter as jest.Mock).mockReturnValue({ query: { id: '1' } });
    render(<StreamDetalhePage />);
    expect(screen.getByText('Detalhes do Stream')).toBeInTheDocument();
    expect(screen.getByText(/Carregando detalhes|Stream não encontrado/)).toBeInTheDocument();
  });
});
