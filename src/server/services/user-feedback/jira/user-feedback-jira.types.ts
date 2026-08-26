export type JiraMyselfResponse = {
  accountId: string;
};

export type JiraIssueCreateResponse = {
  key: string;
};

export type JiraBoardsResponse = {
  values: {
    id: number;
  }[];
};

export type JiraSprintsResponse = {
  values: {
    id: number;
    state: string;
  }[];
};
