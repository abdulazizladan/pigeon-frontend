import { Component, inject, OnInit } from '@angular/core';
import { ManagersStore } from '../../store/manager.store';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-manager-details',
  standalone: false,
  templateUrl: './manager-details.component.html',
  styleUrl: './manager-details.component.scss'
})
export class ManagerDetailsComponent implements OnInit{
  
  constructor(private route: ActivatedRoute) {}

  public managersStore = inject(ManagersStore)

  ngOnInit(): void {
    this.route.paramMap.pipe(
      take(1)
    ).subscribe(params => {
      const idParam = params.get('id');
      if(idParam) {
        this.managersStore.loadSelectedManager(idParam)
      }
    })
  }

}
