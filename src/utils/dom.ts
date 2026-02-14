export function getInput(id: string): HTMLInputElement | HTMLTextAreaElement {
  return document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
}

export function getElement(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
