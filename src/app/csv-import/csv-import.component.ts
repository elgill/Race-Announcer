import { Component } from '@angular/core';
import { CsvColumnMappingService } from '../services/csv-column-mapping.service';

@Component({
  selector: 'app-csv-import',
  templateUrl: './csv-import.component.html',
  styleUrls: ['./csv-import.component.css']
})
export class CsvImportComponent {

  file: File | null = null;
  headers: string[] = [];
  mappedColumns: { [key: string]: string } = {};
  possibleHeaders: { [key: string]: string[] } = {
    'bib': ['Bib', 'Bib Number', 'Bib#'],
    'firstName': ['First Name', 'FirstName', 'first_name'],
    'lastName': ['Last Name', 'LastName', 'last_name'],
    'age': ['Age', 'age', 'Age Group'],
    'gender': ['Gender', 'gender', 'Sex'],
    'town': ['Town', 'town', 'City'],
    'state': ['State', 'state', 'Province'],
    'customField1': ['Custom Field 1', 'custom_field_1', 'Custom1'],
    'customField2': ['Custom Field 2', 'custom_field_2', 'Custom2'],
  };

  constructor(private csvService: CsvColumnMappingService) { }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
    if (this.file !== null) {
      this.csvService.getHeaders(this.file)
        .then(headers => {
          // Initialize mappedColumns with all headers mapped to an empty string
          for (const header of headers) {
            this.mappedColumns[header] = '';
          }

          // Automatically map columns
          for (const runnerField of Object.keys(this.possibleHeaders)) {
            const matchingHeader = headers.find(header =>
              this.possibleHeaders[runnerField].includes(header)
            );
            if (matchingHeader !== undefined) {
              this.mappedColumns[matchingHeader] = runnerField;
            }
          }

          this.headers = headers;

        })
        .catch(error => {
          console.error('Error getting headers from CSV file:', error);
          // You could also show an error message to the user here
        });
    }
  }


  onColumnMapped(runnerField: string, event: any) {
    const csvColumn = (event.target as HTMLSelectElement).value;
    this.mappedColumns[csvColumn] = runnerField;
  }

  importCsv() {
    if (this.file !== null) {
      // Flip the mappings
      const columnMappings: { [key: string]: string } = {};
      for (const header of Object.keys(this.mappedColumns)) {
        const runnerField = this.mappedColumns[header];
        columnMappings[runnerField] = header;
      }

      this.csvService.importCsv(this.file, columnMappings);
    }
  }


}
