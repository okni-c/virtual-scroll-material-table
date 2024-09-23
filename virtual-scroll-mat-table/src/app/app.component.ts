import { Component, OnInit, Inject } from '@angular/core';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouterModule } from '@angular/router';
import { AsyncPipe } from '@angular/common';

import { TableVirtualScrollStrategy } from './table-vs-strategy';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, MatTableModule, ScrollingModule, RouterModule, AsyncPipe],
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useClass: TableVirtualScrollStrategy,
    },
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  // Manually set the amount of buffer and the height of the table elements
  static BUFFER_SIZE = 3;
  rowHeight = 48;
  headerHeight = 56;

  rows: Observable<Array<any>> = of(
    new Array(1000).fill({
      position: 1,
      name: 'Hydrogen',
      weight: 1.0079,
      symbol: 'H',
    })
  );

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  range: any;

  dataSource: Observable<Array<any>> = combineLatest([
    this.rows,
    this.scrollStrategy.scrolledIndexChange,
  ]).pipe(
    map((value: any) => {
      // Determine the start and end rendered range
      const start = Math.max(0, value[1] - AppComponent.BUFFER_SIZE);
      const end = Math.min(value[0].length, value[1] + this.range);

      // Update the datasource for the rendered range of data
      return value[0].slice(start, end);
    })
  );;

  gridHeight = 400;

  constructor(
    @Inject(VIRTUAL_SCROLL_STRATEGY)
    private readonly scrollStrategy: TableVirtualScrollStrategy
  ) {}

  public ngOnInit() {
    this.range =
      Math.ceil(this.gridHeight / this.rowHeight) + AppComponent.BUFFER_SIZE;
    this.scrollStrategy.setScrollHeight(this.rowHeight, this.headerHeight);
  }
}
