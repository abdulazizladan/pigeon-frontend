import { Component, inject, OnInit } from '@angular/core';
import { StationStore } from '../../store/station.store';

@Component({
  selector: 'app-station-details',
  standalone: false,
  templateUrl: './station-details.component.html',
  styleUrl: './station-details.component.scss'
})
export class StationDetailsComponent implements OnInit {

  public stationStore = inject(StationStore);

  ngOnInit(): void {
    this.stationStore.loadStation();
  }

}
