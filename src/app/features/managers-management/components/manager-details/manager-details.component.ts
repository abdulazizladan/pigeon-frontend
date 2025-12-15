import { Component, inject, OnInit } from '@angular/core';
import { ManagersStore } from '../../store/manager.store';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AssignStationDialogComponent } from '../assign-station-dialog/assign-station-dialog.component';
import { ManagersService } from '../../services/managers.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-manager-details',
  standalone: false,
  templateUrl: './manager-details.component.html',
  styleUrl: './manager-details.component.scss'
})
export class ManagerDetailsComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  public managersStore = inject(ManagersStore);
  private dialog = inject(MatDialog);
  private managersService = inject(ManagersService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      take(1)
    ).subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.managersStore.loadSelectedManager(idParam)
      }
    })
  }

  openAssignStationDialog(): void {
    const dialogRef = this.dialog.open(AssignStationDialogComponent, {
      width: '500px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(async (stationId: string | undefined) => {
      if (stationId) {
        await this.assignStation(stationId);
      }
    });
  }

  private async assignStation(stationId: string): Promise<void> {
    const managerId = this.managersStore.selectedManager()?.id;
    if (!managerId) {
      this.snackBar.open('Manager ID not found', 'Close', { duration: 3000 });
      return;
    }

    try {
      await this.managersService.assignStation(managerId, stationId);
      this.snackBar.open('Station assigned successfully', 'Close', { duration: 3000 });
      // Reload the manager details to show the updated station assignment
      this.managersStore.loadSelectedManager(managerId);
    } catch (error) {
      console.error('Error assigning station:', error);
      this.snackBar.open('Failed to assign station', 'Close', { duration: 3000 });
    }
  }

}
