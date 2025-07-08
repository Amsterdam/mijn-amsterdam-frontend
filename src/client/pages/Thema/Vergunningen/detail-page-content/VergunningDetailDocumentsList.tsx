import { Paragraph } from '@amsterdam/design-system-react';

import { GenericDocument } from '../../../../../universal/types/App.types.ts';
import { Datalist } from '../../../../components/Datalist/Datalist.tsx';
import DocumentListV2 from '../../../../components/DocumentList/DocumentListV2.tsx';
import LoadingContent from '../../../../components/LoadingContent/LoadingContent.tsx';

type VergunningDetailDocumentsListProps = {
  documents: GenericDocument[];
  isLoading: boolean;
  isError: boolean;
  label?: string;
};

export function VergunningDetailDocumentsList({
  documents,
  label = 'Documenten',
  isLoading,
  isError,
}: VergunningDetailDocumentsListProps) {
  return (
    <Datalist
      rows={[
        {
          label,
          content: (
            <>
              {isLoading && (
                <LoadingContent barConfig={[['300px', '30px', '20px']]} />
              )}
              {!isLoading && !isError && !documents.length && (
                <Paragraph>Geen document beschikbaar.</Paragraph>
              )}
              {isError && !isLoading && (
                <Paragraph>Documenten ophalen is mislukt.</Paragraph>
              )}
              {!isLoading && !!documents.length && (
                <DocumentListV2 documents={documents} columns={['', '']} />
              )}
            </>
          ),
        },
      ]}
    />
  );
}
