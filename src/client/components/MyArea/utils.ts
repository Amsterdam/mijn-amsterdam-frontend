// biome-ignore lint/suspicious/noExplicitAny: Legacy React child inspection.
export function firstChildOfType(children: any, childType: any) {
  return Array.isArray(children)
    ? children.find((child) => child && child.type === childType)
    : children && children.type === childType
      ? children
      : null;
}
