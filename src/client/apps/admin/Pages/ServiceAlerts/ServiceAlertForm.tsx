import { Fragment, useState } from 'react';

import {
  ActionGroup,
  Alert,
  Button,
  DataList,
  DatePicker,
  ErrorMessage,
  Field,
  FieldSet,
  IconButton,
  InvalidFormAlert,
  Label,
  Link,
  Paragraph,
  Row,
  Select,
  TextArea,
  TextInput,
  TimeInput,
} from '@amsterdam/design-system-react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  PlusIcon,
} from '@amsterdam/design-system-react-icons';

import { PageContentCell } from '../../../../components/Page/Page.tsx';
import {
  serviceAlertDisplayLocations,
  serviceAlertFormFieldIds,
  serviceAlertThemas,
  serviceAlertTypes,
} from './ServiceAlertForm.constants.ts';
import { useServiceAlertForm } from './ServiceAlertForm.hooks.ts';
import type {
  ServiceAlertFormErrors,
  ServiceAlertFormField,
  ServiceAlertFormProps,
} from './ServiceAlertForm.types.ts';
import { ServiceAlertPreview } from './ServiceAlertPreview.tsx';

export function ServiceAlertForm({
  serviceAlert,
  readOnly = false,
}: ServiceAlertFormProps) {
  return (
    <ServiceAlertFormContent
      key={serviceAlert?.id ?? 'new'}
      serviceAlert={serviceAlert}
      readOnly={readOnly}
    />
  );
}

const FIELD_IDS = serviceAlertFormFieldIds;

const LINK_ERROR_ID = 'service-alert-link-error';

function getErrorId(field: ServiceAlertFormField) {
  return `${FIELD_IDS[field]}-error`;
}

function getInvalidFormErrors(errors: ServiceAlertFormErrors) {
  return Object.entries(errors).map(([field, label]) => ({
    id: `#${FIELD_IDS[field as ServiceAlertFormField]}`,
    label,
  }));
}

function FieldError({
  errors,
  field,
}: {
  errors: ServiceAlertFormErrors;
  field: ServiceAlertFormField;
}) {
  const message = errors[field];
  return message ? (
    <ErrorMessage id={getErrorId(field)}>{message}</ErrorMessage>
  ) : null;
}

function ServiceAlertFormContent({
  serviceAlert,
  readOnly = false,
}: ServiceAlertFormProps) {
  const {
    body,
    dateRange,
    displayLocation,
    links,
    addLink,
    linkLabel,
    linkUrl,
    linkValidationMessage,
    handleDisplayLocationChange,
    handleSubmit,
    isError,
    isLoading,
    isSuccess,
    setBody,
    setDateRange,
    setLinkLabel,
    setLinkUrl,
    moveLink,
    removeLink,
    setThemaId,
    setTimeEnd,
    setTimeStart,
    setTitle,
    setType,
    title,
    themaId,
    timeEnd,
    timeStart,
    type,
    errors,
    errorData,
  } = useServiceAlertForm(serviceAlert);
  const [isEditing, setIsEditing] = useState(!readOnly);

  function getFieldProps(field: ServiceAlertFormField) {
    const isInvalid = !!errors[field];
    return {
      id: FIELD_IDS[field],
      invalid: isInvalid,
    };
  }

  return (
    <>
      <PageContentCell spanWide={7}>
        <InvalidFormAlert
          className="ams-mb-m"
          errors={getInvalidFormErrors(errors)}
          headingLevel={2}
        />
        <form onSubmit={handleSubmit} noValidate>
          <FieldSet
            legend="Storingsmelding"
            disabled={!isEditing}
            className="ams-mb-m"
          >
            <Field invalid={!!errors.title}>
              <Label htmlFor={FIELD_IDS.title} inFieldSet>
                Titel
              </Label>
              <FieldError errors={errors} field="title" />
              <TextInput
                {...getFieldProps('title')}
                name="title"
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
                maxLength={200}
                aria-required="true"
              />
            </Field>
            <Field invalid={!!errors.body}>
              <Label htmlFor={FIELD_IDS.body} inFieldSet>
                Bericht
              </Label>
              <FieldError errors={errors} field="body" />
              <TextArea
                {...getFieldProps('body')}
                name="body"
                value={body}
                onChange={(event) => setBody(event.currentTarget.value)}
                aria-required="true"
              />
            </Field>
            <Field invalid={!!errors.displayLocation}>
              <Label htmlFor={FIELD_IDS.displayLocation} inFieldSet>
                Locatie
              </Label>
              <FieldError errors={errors} field="displayLocation" />
              <Select
                {...getFieldProps('displayLocation')}
                name="displayLocation"
                value={displayLocation ?? ''}
                onChange={(event) =>
                  handleDisplayLocationChange(event.currentTarget.value)
                }
                aria-required="true"
              >
                <Select.Option value="">Selecteer een locatie</Select.Option>
                {serviceAlertDisplayLocations.map(({ value, label }) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Field>
            {displayLocation === 'theme' && (
              <Field invalid={!!errors.themaId}>
                <Label htmlFor={FIELD_IDS.themaId} inFieldSet>
                  Thema
                </Label>
                <FieldError errors={errors} field="themaId" />
                <Select
                  {...getFieldProps('themaId')}
                  name="themaId"
                  value={themaId}
                  onChange={(event) => setThemaId(event.currentTarget.value)}
                  aria-required="true"
                >
                  <Select.Option value="">Selecteer een thema</Select.Option>
                  {serviceAlertThemas.map(({ value, label }) => (
                    <Select.Option key={value} value={value}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Field>
            )}
            <Field invalid={!!errors.type}>
              <Label htmlFor={FIELD_IDS.type} inFieldSet>
                Type
              </Label>
              <FieldError errors={errors} field="type" />
              <Select
                {...getFieldProps('type')}
                name="type"
                value={type ?? ''}
                onChange={(event) => {
                  setType(
                    serviceAlertTypes.find(
                      ({ value }) => value === event.currentTarget.value
                    )?.value
                  );
                }}
                aria-required="true"
              >
                <Select.Option value="">Selecteer een type</Select.Option>
                {serviceAlertTypes.map(({ value, label }) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Field>
            <FieldSet
              id={FIELD_IDS.links}
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
                <ErrorMessage id={LINK_ERROR_ID}>
                  {linkValidationMessage}
                </ErrorMessage>
              )}
              <Field invalid={!!linkValidationMessage}>
                <Label htmlFor="service-alert-link-label" inFieldSet>
                  Linktekst
                </Label>
                <TextInput
                  id="service-alert-link-label"
                  value={linkLabel}
                  onChange={(event) => setLinkLabel(event.currentTarget.value)}
                  maxLength={200}
                  invalid={!!linkValidationMessage}
                  aria-describedby={
                    linkValidationMessage ? LINK_ERROR_ID : undefined
                  }
                />
              </Field>
              <Field invalid={!!linkValidationMessage}>
                <Label htmlFor="service-alert-link-url" inFieldSet>
                  URL
                </Label>
                <TextInput
                  id="service-alert-link-url"
                  type="url"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.currentTarget.value)}
                  maxLength={2048}
                  placeholder="https://"
                  invalid={!!linkValidationMessage}
                  aria-describedby={
                    linkValidationMessage ? LINK_ERROR_ID : undefined
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
            <FieldSet
              id={FIELD_IDS.period}
              legend="Periode"
              inFieldSet
              invalid={!!errors.period}
              aria-describedby={
                errors.period ? getErrorId('period') : undefined
              }
            >
              <FieldError errors={errors} field="period" />
              <DatePicker
                mode="range"
                value={dateRange}
                onChange={setDateRange}
                nextMonthButtonLabel="Volgende maand"
                nextYearButtonLabel="Volgend jaar"
                previousMonthButtonLabel="Vorige maand"
                previousYearButtonLabel="Vorig jaar"
                rangeStartAccessibleName="startdatum"
                rangeEndAccessibleName="einddatum"
              />
              <Row wrap>
                <Field invalid={!!errors.timeStart}>
                  <Label htmlFor={FIELD_IDS.timeStart} inFieldSet>
                    Starttijd
                  </Label>
                  <FieldError errors={errors} field="timeStart" />
                  <TimeInput
                    {...getFieldProps('timeStart')}
                    name="timeStart"
                    value={timeStart}
                    onChange={(event) =>
                      setTimeStart(event.currentTarget.value)
                    }
                    aria-required="true"
                  />
                </Field>
                <Field invalid={!!errors.timeEnd}>
                  <Label htmlFor={FIELD_IDS.timeEnd} inFieldSet>
                    Eindtijd
                  </Label>
                  <FieldError errors={errors} field="timeEnd" />
                  <TimeInput
                    {...getFieldProps('timeEnd')}
                    name="timeEnd"
                    value={timeEnd}
                    onChange={(event) => setTimeEnd(event.currentTarget.value)}
                    aria-required="true"
                  />
                </Field>
              </Row>
            </FieldSet>
          </FieldSet>

          {isError && (
            <Alert
              className="ams-mb-m"
              heading={
                serviceAlert ? 'Opslaan is mislukt' : 'Aanmaken is mislukt'
              }
              headingLevel={2}
              severity="error"
            >
              <Paragraph>
                {errorData || 'Er is iets misgegaan. Probeer het opnieuw.'}
              </Paragraph>
            </Alert>
          )}
          {isSuccess && (
            <Alert
              className="ams-mb-m"
              heading={
                serviceAlert
                  ? 'De storingsmelding is bijgewerkt'
                  : 'De storingsmelding is aangemaakt'
              }
              headingLevel={2}
              severity="success"
            >
              <Paragraph>De wijzigingen zijn opgeslagen.</Paragraph>
            </Alert>
          )}
          <ActionGroup>
            {readOnly && !isEditing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                Bewerken
              </Button>
            )}
            {isEditing && (
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading
                  ? serviceAlert
                    ? 'Bezig met opslaan...'
                    : 'Bezig met aanmaken...'
                  : serviceAlert
                    ? 'Wijzigingen opslaan'
                    : 'Storingsmelding aanmaken'}
              </Button>
            )}
          </ActionGroup>
        </form>
      </PageContentCell>
      <PageContentCell startWide={8} spanWide={5}>
        <ServiceAlertPreview
          title={title}
          body={body}
          type={type}
          displayLocation={displayLocation}
          links={links}
        />
      </PageContentCell>
    </>
  );
}
