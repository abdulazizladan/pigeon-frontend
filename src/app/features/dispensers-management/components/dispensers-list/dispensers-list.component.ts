import { Component, inject, OnInit } from '@angular/core';
import { DispenserStore } from '../../store/dispensers.store';
import { MatDialog } from '@angular/material/dialog';
import { AddDispenserComponent } from '../add-dispenser/add-dispenser.component';

@Component({
  selector: 'app-dispensers-list',
  standalone: false,
  templateUrl: './dispensers-list.component.html',
  styleUrl: './dispensers-list.component.scss'
})
export class DispensersListComponent implements OnInit{

  private dialog = inject(MatDialog)
  public dispenserStore = inject(DispenserStore)
  displayedColumns: string[] = ['name', 'phone', 'status']

  ngOnInit() {
    this.dispenserStore.loadDispensers()
  }

  openNewDispenserDialog() {
    const dialogRef = this.dialog.open(AddDispenserComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.dispenserStore.addDispenser(data)
      }
    })
  }

}
