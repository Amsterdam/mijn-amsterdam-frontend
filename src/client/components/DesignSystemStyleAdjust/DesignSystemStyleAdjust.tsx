export function DesignSystemStyleAdjust() {
  return (
    <style>
      {`
          :root {
            --mams-font-size-rem-adjust: initial;
            --mams-font-size-body: initial;
            --mams-line-height: initial;
          }
          body {
            font-family: var(--amsterdam-heading-font-family);
          }
          td,dd {
            font-size: var(--amsterdam-paragraph-compact-medium-font-size);
            line-height: var(--amsterdam-paragraph-compact-medium-line-height);
          }
          th,dt {
            font-size: var(--amsterdam-paragraph-compact-medium-font-size);
            line-height: var(--amsterdam-paragraph-compact-medium-line-height);
            font-weight: var(--amsterdam-heading-font-weight);
          }
          `}
    </style>
  );
}
