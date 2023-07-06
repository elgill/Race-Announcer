import * as _ from "lodash";

export interface Runner {
  id: string;
  bib: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  town: string;
  state: string;
  customFields: { [key: string]: string };
}

export function areRunnersEquivalent(a: Runner, b: Runner): boolean {
  return a.bib === b.bib
    && a.firstName === b.firstName
    && a.lastName === b.lastName
    && a.age === b.age
    && a.gender === b.gender
    && a.town === b.town
    && a.state === b.state
    && _.isEqual(a.customFields, b.customFields);
}
