export interface Runner {
  id: string;
  bib: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  town: string;
  state: string;
  customFields: { [key: string]: string }; // converted from Map to object
}
