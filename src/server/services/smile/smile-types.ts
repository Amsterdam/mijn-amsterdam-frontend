export type SmileFieldValue<T = string> = {
  value: T | null;
};

export interface SmileSourceResponse<T> {
  rowcount: number;
  List: T[];
}
