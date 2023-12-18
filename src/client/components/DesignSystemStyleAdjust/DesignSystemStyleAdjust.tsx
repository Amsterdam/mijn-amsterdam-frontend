export function DesignSystemStyleAdjust() {
  return (
    <style>
      {`
          :root {
            // --mams-font-size-rem-adjust: initial;
            // --mams-font-size-body: initial;
            // --mams-line-height: initial;
          }
          .amsterdam-grid .amsterdam-grid {
            --amsterdam-grid-padding-inline: 0
          }
          td,dd {
            font-size: var(--amsterdam-paragraph-spacious-medium-font-size);
            line-height: var(--amsterdam-paragraph-spacious-medium-line-height);
          }
          th,dt {
            font-size: var(--amsterdam-paragraph-spacious-medium-font-size);
            line-height: var(--amsterdam-paragraph-spacious-medium-line-height);
            font-weight: var(--amsterdam-heading-font-weight);
          }
          `}
    </style>
  );
}
