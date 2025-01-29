import { Grid, Heading, Paragraph } from '@amsterdam/design-system-react';
import { ReactNode } from 'react';
import { entries } from '../../../universal/helpers/utils';

export interface GridDetailsProps<T> {
  displayProps: (keyof T)[];
  items: T | undefined;
  caption?: string;
  subTitle?: ReactNode;
  textNoContent?: string;
}

export function GridDetails<T extends object>({
  caption,
  subTitle,
  items,
  displayProps,
  textNoContent,
}: GridDetailsProps<T>) {
  const textNoContentDefault = caption
    ? `U heeft (nog) geen ${caption.toLowerCase()}.`
    : `Er zijn geen gegevens gevonden.`;
  textNoContent = textNoContent ?? textNoContentDefault;
  const filteredEntries = entries(items ?? {}).filter(([key]) =>
    displayProps.includes(key)
  );
  return (
    <>
      <Grid.Cell span={10}>
        {!!caption && (
          <Heading level={3} size="level-2">
            {caption}
          </Heading>
        )}
        {subTitle}
        {!filteredEntries.length && <Paragraph>{textNoContent}</Paragraph>}
        <Grid>
          {filteredEntries.map(([key, value]) =>
            !value ? (
              <></>
            ) : (
              <Grid.Cell key={key} span={4}>
                <Heading level={3} size="level-5">
                  {key}
                </Heading>
                <div>{value as ReactNode}</div>
              </Grid.Cell>
            )
          )}
        </Grid>
      </Grid.Cell>
    </>
  );
}
