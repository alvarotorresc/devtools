/** Saves `data` as a file through a temporary link. Browser only: call it from event handlers. */
export function downloadBlob(
  data: Blob | string,
  filename: string,
  type = 'text/plain;charset=utf-8',
): void {
  const blob = typeof data === 'string' ? new Blob([data], { type }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
