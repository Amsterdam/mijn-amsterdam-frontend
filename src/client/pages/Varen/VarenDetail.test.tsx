import React from 'react';

import { render, screen } from '@testing-library/react';

import { useVarenDetailPage } from './useVarenDetailPage.hook';
import { VarenDetail } from './VarenDetail';

jest.mock('./useVarenDetailPage.hook');
jest.mock('./VarenDetailExploitatie', () => ({
  VarenDetailPageContentExploitatie: jest.fn(() => (
    <div>Exploitatie Content</div>
  )),
}));
jest.mock('./VarenDetailLigplaats', () => ({
  VarenDetailPageContentLigplaats: jest.fn(() => <div>Ligplaats Content</div>),
}));
jest.mock('./VarenDetailExploitatieHernoemen', () => ({
  VarenDetailPageContentExploitatieHernoemen: jest.fn(() => (
    <div>Hernoemen Content</div>
  )),
}));
jest.mock('./VarenDetailExploitatieVervangen', () => ({
  VarenDetailPageContentExploitatieVervangen: jest.fn(() => (
    <div>Vervangen Content</div>
  )),
}));
jest.mock('./VarenDetailExploitatieVerbouwen', () => ({
  VarenDetailPageContentExploitatieVerbouwen: jest.fn(() => (
    <div>Verbouwen Content</div>
  )),
}));
jest.mock('./VarenDetailExploitatieOverdragen', () => ({
  VarenDetailPageContentExploitatieOverdragen: jest.fn(() => (
    <div>Overdragen Content</div>
  )),
}));

describe('VarenDetail', () => {
  it('should display loading state', () => {
    (useVarenDetailPage as jest.Mock).mockReturnValue({
      isLoading: true,
      isError: false,
      vergunning: null,
      buttonItems: [],
    });

    render(<VarenDetail />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    (useVarenDetailPage as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: true,
      vergunning: null,
      buttonItems: [],
    });

    render(<VarenDetail />);
    expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument();
  });

  it('should display exploitatie content', () => {
    (useVarenDetailPage as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      vergunning: {
        caseType: 'Varen vergunning exploitatie',
        title: 'Exploitatie Vergunning',
      },
      buttonItems: [],
    });

    render(<VarenDetail />);
    expect(screen.getByText('Exploitatie Content')).toBeInTheDocument();
  });

  it('should display ligplaats content', () => {
    (useVarenDetailPage as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      vergunning: {
        caseType: 'Varen ligplaatsvergunning',
        title: 'Ligplaats Vergunning',
      },
      buttonItems: [],
    });

    render(<VarenDetail />);
    expect(screen.getByText('Ligplaats Content')).toBeInTheDocument();
  });

  it('should display hernoemen content', () => {
    (useVarenDetailPage as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      vergunning: {
        caseType: 'Varen vergunning exploitatie Wijziging vaartuignaam',
        title: 'Hernoemen Vergunning',
      },
      buttonItems: [],
    });

    render(<VarenDetail />);
    expect(screen.getByText('Hernoemen Content')).toBeInTheDocument();
  });

  it('should display vervangen content', () => {
    (useVarenDetailPage as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      vergunning: {
        caseType: 'Varen vergunning exploitatie Wijziging vervanging',
        title: 'Vervangen Vergunning',
      },
      buttonItems: [],
    });

    render(<VarenDetail />);
    expect(screen.getByText('Vervangen Content')).toBeInTheDocument();
  });

  it('should display verbouwen content', () => {
    (useVarenDetailPage as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      vergunning: {
        caseType: 'Varen vergunning exploitatie Wijziging verbouwing',
        title: 'Verbouwen Vergunning',
      },
      buttonItems: [],
    });

    render(<VarenDetail />);
    expect(screen.getByText('Verbouwen Content')).toBeInTheDocument();
  });

  it('should display overdragen content', () => {
    (useVarenDetailPage as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      vergunning: {
        caseType: 'Varen vergunning exploitatie Wijziging vergunninghouder',
        title: 'Overdragen Vergunning',
      },
      buttonItems: [],
    });

    render(<VarenDetail />);
    expect(screen.getByText('Overdragen Content')).toBeInTheDocument();
  });

  it('should display no content error for unknown case type', () => {
    (useVarenDetailPage as jest.Mock).mockReturnValue({
      isLoading: false,
      isError: false,
      vergunning: {
        caseType: 'Unknown case type',
        title: 'Unknown Vergunning',
      },
      buttonItems: [],
    });

    render(<VarenDetail />);
    expect(screen.getByText('Er is een fout opgetreden')).toBeInTheDocument();
  });
});
