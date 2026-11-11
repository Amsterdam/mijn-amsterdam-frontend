import { useState } from 'react';

import {
  ActionGroup,
  Button,
  DatePicker,
  ErrorMessage,
  Field,
  FieldSet,
  Label,
  Paragraph,
  Select,
  TextArea,
  TextInput,
  TimeInput,
} from '@amsterdam/design-system-react';

import { PageContentCell } from '../../../../components/Page/Page.tsx';
import { ServiceAlertPreview } from './ServiceAlertPreview.tsx';
import {
  serviceAlertDisplayLocations,
  serviceAlertEnvironments,
  serviceAlertThemas,
  serviceAlertTypes,
} from './ServiceAlertUpsertForm.constants.ts';
import { useServiceAlertUpsertForm } from './ServiceAlertUpsertForm.hooks.ts';
import type { ServiceAlertUpsertFormProps } from './ServiceAlertUpsertForm.types.ts';

export function ServiceAlertUpsertForm({
  serviceAlert,
  readOnly = false,
}: ServiceAlertUpsertFormProps) {
  return (
    <ServiceAlertUpsertFormContent
      key={serviceAlert?.id ?? 'new'}
      serviceAlert={serviceAlert}
      readOnly={readOnly}
    />
  );
}

function ServiceAlertUpsertFormContent({
  serviceAlert,
  readOnly = false,
}: ServiceAlertUpsertFormProps) {
  const {
    body,
    dateRange,
    displayLocation,
    handleDisplayLocationChange,
    handleSubmit,
    isError,
    isLoading,
    isSuccess,
    setBody,
    setDateRange,
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
    validationMessage,
    errorData,
  } = useServiceAlertUpsertForm(serviceAlert);
  const [isEditing, setIsEditing] = useState(!readOnly);

  return (
    <>
      <PageContentCell spanWide={7}>
        <form onSubmit={handleSubmit}>
          <FieldSet legend="Storingsmelding" disabled={!isEditing}>
            <Field className="ams-mb-m">
              <Label htmlFor="service-alert-title">Titel</Label>
              <TextInput
                id="service-alert-title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
                maxLength={200}
                required
              />
            </Field>
            <Field className="ams-mb-m">
              <Label htmlFor="service-alert-body">Bericht</Label>
              <TextArea
                id="service-alert-body"
                name="body"
                value={body}
                onChange={(event) => setBody(event.currentTarget.value)}
                required
              />
            </Field>
            <Field className="ams-mb-m">
              <Label htmlFor="service-alert-location">Locatie</Label>
              <Select
                id="service-alert-location"
                name="displayLocation"
                value={displayLocation}
                onChange={(event) =>
                  handleDisplayLocationChange(event.currentTarget.value)
                }
              >
                {serviceAlertDisplayLocations.map(({ value, label }) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Field>
            {displayLocation !== 'notification' && (
              <Field className="ams-mb-m">
                <Label htmlFor="service-alert-type">Type</Label>
                <Select
                  id="service-alert-type"
                  name="type"
                  value={type}
                  onChange={(event) => {
                    const selectedType = serviceAlertTypes.find(
                      ({ value }) => value === event.currentTarget.value
                    )?.value;
                    if (selectedType) {
                      setType(selectedType);
                    }
                  }}
                >
                  {serviceAlertTypes.map(({ value, label }) => (
                    <Select.Option key={value} value={value}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Field>
            )}
            {displayLocation === 'theme' && (
              <Field className="ams-mb-m">
                <Label htmlFor="service-alert-thema">Thema</Label>
                <Select
                  id="service-alert-thema"
                  name="themaId"
                  value={themaId}
                  onChange={(event) => setThemaId(event.currentTarget.value)}
                  required
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
            <Field className="ams-mb-m">
              <Label htmlFor="service-alert-environment">Omgeving</Label>
              <Select
                id="service-alert-environment"
                name="environment"
                defaultValue={serviceAlert?.environments[0] ?? ''}
                required
              >
                <Select.Option value="">Selecteer een omgeving</Select.Option>
                {serviceAlertEnvironments.map(({ value, label }) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Field>
            <Field className="ams-mb-m">
              <Label>Periode</Label>
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
                aria-label="Selecteer periode"
              />
            </Field>
            <Field className="ams-mb-m">
              <Label htmlFor="service-alert-time-start">Starttijd</Label>
              <TimeInput
                id="service-alert-time-start"
                name="timeStart"
                value={timeStart}
                onChange={(event) => setTimeStart(event.currentTarget.value)}
                required
              />
            </Field>
            <Field className="ams-mb-m">
              <Label htmlFor="service-alert-time-end">Eindtijd</Label>
              <TimeInput
                id="service-alert-time-end"
                name="timeEnd"
                value={timeEnd}
                onChange={(event) => setTimeEnd(event.currentTarget.value)}
                required
              />
            </Field>
          </FieldSet>

          {validationMessage && (
            <ErrorMessage>{validationMessage}</ErrorMessage>
          )}
          {isError && (
            <ErrorMessage>
              {isEditing ? 'Opslaan' : 'Aanmaken'} is mislukt: {errorData}
            </ErrorMessage>
          )}
          {isSuccess && (
            <Paragraph role="status" className="ams-mb-m">
              {isEditing
                ? 'De storingsmelding is bijgewerkt.'
                : 'De storingsmelding is aangemaakt.'}
            </Paragraph>
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
                  ? isEditing && serviceAlert
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
        />
      </PageContentCell>
    </>
  );
}
