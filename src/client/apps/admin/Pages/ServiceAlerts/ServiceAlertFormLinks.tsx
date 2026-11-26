import { Fragment } from 'react';

import {
  Button,
  DataList,
  ErrorMessage,
  Field,
  FieldSet,
  IconButton,
  Label,
  Link,
  TextInput,
} from '@amsterdam/design-system-react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  PlusIcon,
} from '@amsterdam/design-system-react-icons';

import {
  serviceAlertFormFieldIds,
  serviceAlertLinkFieldIds,
} from './ServiceAlertForm.constants.ts';
import type { ServiceAlertFormErrors } from './ServiceAlertForm.types.ts';
import { FieldError, getErrorId } from './ServiceAlertFormFieldError.tsx';
import type { ServiceAlertLinksControls } from './ServiceAlertFormLinks.hooks.ts';

type ServiceAlertFormLinksProps = ServiceAlertLinksControls & {
  errors: ServiceAlertFormErrors;
};

export function ServiceAlertFormLinks({
  errors,
  links,
  linkLabel,
  linkUrl,
  linkValidationMessage,
  setLinkLabel,
  setLinkUrl,
  addLink,
  moveLink,
  removeLink,
}: ServiceAlertFormLinksProps) {
  return (
    <FieldSet
      id={serviceAlertFormFieldIds.links}
      legend="Links"
      optional
      inFieldSet
      invalid={!!errors.links || !!linkValidationMessage}
      aria-describedby={errors.links ? getErrorId('links') : undefined}
    >
      <FieldError errors={errors} field="links" />
      <DataList>
        {links.map((link, index) => (
          <Fragment key={index}>
            <DataList.Item>
              <DataList.Key>Label</DataList.Key>
              <DataList.Value>{link.label}</DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Key>URL</DataList.Key>
              <DataList.Value>
                <Link href={link.url} target="_blank" rel="noreferrer">
                  {link.url}
                </Link>
              </DataList.Value>
              <DataList.Actions>
                <IconButton
                  label={`Verplaats link ${index + 1} omhoog`}
                  svg={ChevronUpIcon}
                  disabled={index === 0}
                  onClick={() => moveLink(index, 'up')}
                />
                <IconButton
                  label={`Verplaats link ${index + 1} omlaag`}
                  svg={ChevronDownIcon}
                  disabled={index === links.length - 1}
                  onClick={() => moveLink(index, 'down')}
                />
                <IconButton
                  label={`Verwijder link ${index + 1}`}
                  svg={CloseIcon}
                  onClick={() => removeLink(index)}
                />
              </DataList.Actions>
            </DataList.Item>
          </Fragment>
        ))}
      </DataList>
      {linkValidationMessage && (
        <ErrorMessage id={serviceAlertLinkFieldIds.error}>
          {linkValidationMessage}
        </ErrorMessage>
      )}
      <Field invalid={!!linkValidationMessage}>
        <Label htmlFor={serviceAlertLinkFieldIds.label} inFieldSet>
          Linktekst
        </Label>
        <TextInput
          id={serviceAlertLinkFieldIds.label}
          value={linkLabel}
          onChange={(event) => setLinkLabel(event.currentTarget.value)}
          maxLength={200}
          invalid={!!linkValidationMessage}
          aria-describedby={
            linkValidationMessage ? serviceAlertLinkFieldIds.error : undefined
          }
        />
      </Field>
      <Field invalid={!!linkValidationMessage}>
        <Label htmlFor={serviceAlertLinkFieldIds.url} inFieldSet>
          URL
        </Label>
        <TextInput
          id={serviceAlertLinkFieldIds.url}
          type="url"
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.currentTarget.value)}
          maxLength={2048}
          placeholder="https://"
          invalid={!!linkValidationMessage}
          aria-describedby={
            linkValidationMessage ? serviceAlertLinkFieldIds.error : undefined
          }
        />
      </Field>
      <Button
        type="button"
        icon={<PlusIcon />}
        variant="secondary"
        onClick={addLink}
      >
        Voeg nog een link toe
      </Button>
    </FieldSet>
  );
}
