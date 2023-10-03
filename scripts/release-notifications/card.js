function getReleaseCardJson(changes) {
  const now = new Date();

  const rows = changes.map((change) => ({
    type: 'TableRow',
    cells: [
      {
        type: 'TableCell',
        items: [
          {
            type: 'TextBlock',
            text: `[${change.ticket}](https://gemeente-amsterdam.atlassian.net/browse/${change.ticket})`,
            wrap: true,
          },
        ],
      },
      {
        type: 'TableCell',
        items: [
          {
            type: 'TextBlock',
            text: change.description,
            wrap: true,
          },
        ],
      },
      {
        type: 'TableCell',
        items: [
          {
            type: 'TextBlock',
            text: change.date,
            wrap: true,
          },
        ],
      },
    ],
  }));

  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body: [
      {
        type: 'TextBlock',
        text: `Release overzicht van ${now.getDate()}-${
          now.getMonth() + 1
        }-${now.getFullYear()}`,
        wrap: true,
        style: 'heading',
      },
      {
        type: 'Table',
        columns: [
          {
            width: 1,
          },
          {
            width: 2,
          },
          {
            width: 3,
          },
        ],
        rows: [
          {
            type: 'TableRow',
            cells: [
              {
                type: 'TableCell',
                items: [
                  {
                    type: 'TextBlock',
                    text: 'Ticket',
                    wrap: true,
                  },
                ],
                style: 'accent',
              },
              {
                type: 'TableCell',
                items: [
                  {
                    type: 'TextBlock',
                    text: 'Omschrijving',
                    wrap: true,
                  },
                ],
                style: 'accent',
              },
              {
                type: 'TableCell',
                items: [
                  {
                    type: 'TextBlock',
                    text: 'Dagen in main',
                    wrap: true,
                  },
                ],
                style: 'accent',
              },
            ],
          },
          ...rows,
        ],
        firstRowAsHeader: true,
      },
    ],
  };
}

module.exports = { getReleaseCardJson };
