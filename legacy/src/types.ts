export interface Tool {
  id: string;
  name: string;
  render(): string;
  init(): void;
  destroy?(): void;
}
