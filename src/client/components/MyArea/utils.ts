// biome-ignore lint/suspicious/noExplicitAny: Legacy React child inspection.
export function firstChildOfType(children: any, childType: any) {
  if (Array.isArray(children)) {
    return children.find((child) => child && child.type === childType);
  }
  if (children && children.type === childType) {
    return children;
  }
  return null;
}
