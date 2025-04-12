export interface INavigationItem {
  id: string;
  label: string;
  to: string;
  icon?: string;
  children?: INavigationItem[];
}
