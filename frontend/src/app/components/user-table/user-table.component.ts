import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Component({
  standalone: true,
  selector: 'app-user-table',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './user-table.component.html',

})
export class UserTableComponent {

}



