export type SmileFieldValue = {
  value: string | null;
};

export interface SmileSourceResponse<T> {
  rowcount: number;
  List: T[];
}
