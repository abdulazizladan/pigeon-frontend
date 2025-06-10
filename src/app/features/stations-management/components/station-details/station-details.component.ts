import { Component, inject } from '@angular/core';
import { StationsStore } from '../../store/stations.store';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-station-details',
  standalone: false,
  templateUrl: './station-details.component.html',
  styleUrl: './station-details.component.scss'
})
export class StationDetailsComponent {

  constructor(private route: ActivatedRoute) {}

  public stationStore = inject(StationsStore);
  public id: number = 0;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam; // The '+' converts the string to a number
    } else {
      // Handle the case where ID is not provided
      console.error('No ID parameter provided in route');
      // You might want to redirect or show an error message here
    }
    this.stationStore.selectStation(this.id);
  }

}
