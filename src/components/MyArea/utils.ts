export function firstChildOfType(children: any, childType: any) {
  return Array.isArray(children)
    ? children.find(child => child && child.type === childType)
    : children && children.type === childType
    ? children
    : null;
}
