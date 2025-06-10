import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddSaleComponent } from '../add-sale/add-sale.component';

@Component({
  selector: 'app-sales-dashboard',
  standalone: false,
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.scss'
})
export class SalesDashboardComponent {

  private dialog = inject(MatDialog)

  openSalesDialog() {
    const diaologRef = this.dialog.open(AddSaleComponent)
  }

}
