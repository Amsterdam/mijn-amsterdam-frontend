export function PreWrap({ children }: { children: React.ReactNode }) {
  return <span style={{ whiteSpace: 'pre-wrap' }}>{children}</span>;
}
