import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TripVisualizerComponent } from "../component/trip-visualizer/trip-visualizer.component";

import LeaderLine from 'leader-line-new';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, TripVisualizerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'trip-visualizer';
  @ViewChild('el1', { static: false }) el1!: ElementRef;
  @ViewChild('el2', { static: false }) el2!: ElementRef;
  @ViewChild('el3') el3!: ElementRef;
  @ViewChild('el4') el4!: ElementRef;


  line1: any;
  line2: any;
  line3: any;

  ngAfterViewInit(): void {
    setTimeout(() => this.drawLines(), 0);
  }

  drawLines() {
    // el1 ➝ el2 (curved)
    this.line1 = new LeaderLine(
      this.el1.nativeElement,
      this.el2.nativeElement,
      {
        color: 'red',
        path: 'fluid',
        size: 6,
        endPlug: 'arrow3',
        endPlugSize: 2.5
      }
    );

    // el2 ➝ el3 (straight)
    this.line2 = new LeaderLine(
      this.el2.nativeElement,
      this.el3.nativeElement,
      {
        color: 'blue',
        path: 'straight',
        size: 4,
        endPlug: 'arrow3',
        endPlugSize: 2
      }
    );

    // el3 ➝ el4 (leftward horizontal straight line)
    this.line3 = new LeaderLine(
      this.el3.nativeElement,
      this.el4.nativeElement,
      {
        color: 'orange',
        path: 'fluid',               // creates the curved arc
        size: 4,
        endPlug: 'arrow3',
        endPlugSize: 2.5,
        gradient: true,
        dropShadow: true,
        startSocket: 'right',
        endSocket: 'left'      // gives it a lifted effect
      }
    );
  }

}



