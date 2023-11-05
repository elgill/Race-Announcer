import {Component} from '@angular/core';
import {BibScrapeService} from "../services/bib-scrape.service";

@Component({
  selector: 'app-bib-scrape-util',
  templateUrl: './bib-scrape-util.component.html',
  styleUrls: ['./bib-scrape-util.component.css']
})
export class BibScrapeUtilComponent{
  url: string = '';
  message = '';
  messageType = '';

  constructor(
    private bibScrapeService: BibScrapeService,
  ) {}


  process() {
    this.message = '';
    this.messageType = '';

    this.bibScrapeService.process(this.url)
      .then(successMessage => {
        this.message = successMessage;
        this.messageType = 'success';
      })
      .catch(errorMessage => {
        this.message = errorMessage;
        this.messageType = 'error';
      });
  }
}

