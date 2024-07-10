import { Injectable } from '@angular/core';
import {TridentTagReadData} from "../interfaces/trident-tag-read-data";
import {ChipRead} from "../interfaces/chip-read";
import {RaceResultTagReadData} from "../interfaces/race-result-tag-read-data";

@Injectable({
  providedIn: 'root'
})
export class TagReadConversionService {

  constructor() { }

  static convertTridentToChipRead(data: TridentTagReadData): ChipRead {
    const { readerId, receiverId, tagId, date, time, hundredths } = data;

    const year = parseInt(date.slice(0, 2), 10) + 2000;
    const month = parseInt(date.slice(2, 4), 10) - 1; // Month is 0-indexed
    const day = parseInt(date.slice(4, 6), 10);
    const hours = parseInt(time.slice(0, 2), 10);
    const minutes = parseInt(time.slice(2, 4), 10);
    const seconds = parseInt(time.slice(4, 6), 10);
    const hundredthsSeconds = parseInt(hundredths, 16);

    const dateObj = new Date(year, month, day, hours, minutes, seconds, hundredthsSeconds * 10);

    return {
      readerId: readerId,
      antennaId: receiverId,
      chipCode: tagId,
      date: dateObj,
    };
  }

  static convertRaceResultToChipRead(data: RaceResultTagReadData): ChipRead {
    const { boxName, tagId, date, time , maxRssiAntenna} = data;

    const dateTime = new Date(`${date}T${time}`);

    return {
      readerId: boxName,
      antennaId: maxRssiAntenna,
      chipCode: tagId,
      date: dateTime,
    };
  }


}
