import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Input } from '@angular/core';
import { HttpService } from '../http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit, OnDestroy {

  sub: Subscription;
  winnersArray;
  constructor(private http: HttpService) { }

  ngOnInit(): void {
    this.sub = this.http.finishGame.subscribe(() => {
      this.getWinners();
    });
  }

  getWinners(): void {
    this.http.getWinners().subscribe((data) => {
      this.winnersArray = data;
    });
  }

  trackByFn(index, item): void {
    return item.id;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
