import { useState } from 'react';

import {
  ActionGroup,
  Alert,
  Button,
  Field,
  FieldSet,
  InvalidFormAlert,
  Label,
  Paragraph,
  Select,
  TextArea,
  TextInput,
} from '@amsterdam/design-system-react';

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
import { FieldError, getFieldProps } from './ServiceAlertFormFieldError.tsx';
import { ServiceAlertFormLinks } from './ServiceAlertFormLinks.tsx';
import { ServiceAlertFormPeriod } from './ServiceAlertFormPeriod.tsx';
import { ServiceAlertPreview } from './ServiceAlertPreview.tsx';

const FIELD_IDS = serviceAlertFormFieldIds;

function getInvalidFormErrors(errors: ServiceAlertFormErrors) {
  return Object.entries(errors).map(([field, label]) => ({
    id: `#${FIELD_IDS[field as ServiceAlertFormField]}`,
    label,
  }));
}

export function ServiceAlertForm({
  serviceAlert,
  readOnly = false,
}: ServiceAlertFormProps) {
  const {
    values,
    setValue,
    linkControls,
    handleDisplayLocationChange,
    handleSubmit,
    isLoading,
    isSuccess,
    errors,
    submitError,
  } = useServiceAlertForm(serviceAlert);
  const [isEditing, setIsEditing] = useState(!readOnly);

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
                {...getFieldProps(errors, 'title')}
                value={values.title}
                onChange={(event) =>
                  setValue('title', event.currentTarget.value)
                }
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
                {...getFieldProps(errors, 'body')}
                value={values.body}
                onChange={(event) =>
                  setValue('body', event.currentTarget.value)
                }
                aria-required="true"
              />
            </Field>
            <Field invalid={!!errors.displayLocation}>
              <Label htmlFor={FIELD_IDS.displayLocation} inFieldSet>
                Locatie
              </Label>
              <FieldError errors={errors} field="displayLocation" />
              <Select
                {...getFieldProps(errors, 'displayLocation')}
                value={values.displayLocation ?? ''}
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
            {values.displayLocation === 'theme' && (
              <Field invalid={!!errors.themaId}>
                <Label htmlFor={FIELD_IDS.themaId} inFieldSet>
                  Thema
                </Label>
                <FieldError errors={errors} field="themaId" />
                <Select
                  {...getFieldProps(errors, 'themaId')}
                  value={values.themaId}
                  onChange={(event) =>
                    setValue('themaId', event.currentTarget.value)
                  }
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
                {...getFieldProps(errors, 'type')}
                value={values.type ?? ''}
                onChange={(event) => {
                  setValue(
                    'type',
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
            <ServiceAlertFormLinks errors={errors} {...linkControls} />
            <ServiceAlertFormPeriod
              errors={errors}
              values={values}
              setValue={setValue}
            />
          </FieldSet>

          {submitError && (
            <Alert
              className="ams-mb-m"
              heading={
                serviceAlert ? 'Opslaan is mislukt' : 'Aanmaken is mislukt'
              }
              headingLevel={2}
              severity="error"
            >
              <Paragraph>{submitError}</Paragraph>
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
          title={values.title}
          body={values.body}
          type={values.type}
          displayLocation={values.displayLocation}
          links={linkControls.links}
        />
      </PageContentCell>
    </>
  );
}
