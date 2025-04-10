import { CommonModule, NgStyle } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import LeaderLine from 'leader-line-new';
export interface Trip {
  from: string;
  to: string;
}
@Component({
  selector: 'app-trip-visualizer',
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: './trip-visualizer.component.html',
  styleUrl: './trip-visualizer.component.scss'
})
export class TripVisualizerComponent {
  trips: Trip[] = [];
  from = '';
  to = '';
  lines: any[] = [];

  @ViewChildren('tripBlock', { read: ElementRef }) tripBlocks!: QueryList<ElementRef>;

  addTrip() {
    if (this.from && this.to) {
      this.trips.push({
        from: this.from.toUpperCase().slice(0, 3),
        to: this.to.toUpperCase().slice(0, 3),
      });
      this.from = '';
      this.to = '';

      // Delay rendering to wait for DOM update
      setTimeout(() => this.drawLines(), 0);
    }
  }

  ngAfterViewInit(): void {
    this.drawLines();
  }

  drawLines() {
    this.lines.forEach(line => line.remove());
    this.lines = [];
  
    const blocks = this.tripBlocks.toArray();
  
    for (let i = 1; i < blocks.length; i++) {
      const currTrip = this.trips[i];
      const currBlock = blocks[i].nativeElement;
  
      let sourceIndex = i - 1;
      while (sourceIndex >= 0) {
        if (this.isRepeated(this.trips[sourceIndex], currTrip)) {
          sourceIndex--;
          continue;
        }
        break;
      }
  
      if (sourceIndex < 0) continue;
  
      const prevTrip = this.trips[sourceIndex];
      const prevBlock = blocks[sourceIndex].nativeElement;
      const prevLevel = this.getTripLevel(sourceIndex);
  
      // If repeated (directly from last trip), draw straight stacked
      if (this.isRepeated(this.trips[i - 1], currTrip)) {
        this.lines.push(
          new LeaderLine(blocks[i - 1].nativeElement, currBlock, {
            path: 'straight',
            startSocket: 'right',
            endSocket: 'left',
            color: 'gray',
            size: 4,
            dash: true,
            endPlug: 'arrow3',
            dropShadow: true,
          })
        );
      }
      // Continued Trip
      else if (this.isContinued(prevTrip, currTrip)) {
        this.lines.push(
          new LeaderLine(prevBlock, currBlock, {
            path: 'straight',
            startSocket: 'right',
            endSocket: 'left',
            color: 'blue',
            size: 4,
            endPlug: 'behind',
            dropShadow: true,
          })
        );
      }
  
      else {
        this.lines.push(
          new LeaderLine(prevBlock, currBlock, {
            color: 'orange',
            path: 'fluid',
            size: 4,
            endPlug: 'arrow3',
            dropShadow: true,
            startSocket: 'right',
            endSocket: 'left'
          })
        );
      }
    }
  }

  isContinued(prev: Trip, curr: Trip): boolean {
    return prev.to === curr.from;
  }

  isRepeated(prev: Trip, curr: Trip): boolean {
    return prev.from === curr.from && prev.to === curr.to;
  }

  getBoxStyle(index: number): { [key: string]: string } {
    const level = this.getTripLevel(index);
    const allLevels = this.trips.map((_, i) => this.getTripLevel(i));
    const maxLevel = Math.max(...allLevels);
    const top = 100 + (maxLevel - level) * 100 + 'px';
    const left = 100 + index * 200 + 'px';
    return {
      position: 'absolute',
      top,
      left,
    };
  }  

  getChainIndex(index: number): number {
    if (index === 0) return 0;
  
    const curr = this.trips[index];
  
    for (let i = index - 1; i >= 0; i--) {
      if (this.isRepeated(this.trips[i], curr)) {
        return this.getChainIndex(i);
      }
    }
  
    for (let i = index - 1; i >= 0; i--) {
      if (this.isContinued(this.trips[i], curr)) {
        return this.getChainIndex(i);
      }
    }
  
    // Not continued or repeated → it's a new chain
    const existingChains = this.trips.slice(0, index).map((_, i) => this.getChainIndex(i));
    const maxChain = Math.max(...existingChains, 0);
    return maxChain + 1;
  }
  
  

  getTripLevel(index: number): number {
    if (index === 0) return 1;
  
    const curr = this.trips[index];
  
    // Check if trip is a repetition → inherit level
    for (let i = index - 1; i >= 0; i--) {
      const prev = this.trips[i];
      if (this.isRepeated(prev, curr)) {
        return this.getTripLevel(i);
      }
    }
  
    // Check if it's continued from any previous trip
    for (let i = index - 1; i >= 0; i--) {
      const prev = this.trips[i];
      if (this.isContinued(prev, curr)) {
        return this.getTripLevel(i);
      }
    }
  
    // Not connected to anything before → assign new level
    const usedLevels = this.trips.slice(0, index).map((_, i) => this.getTripLevel(i));
    const maxLevel = Math.max(...usedLevels, 0);
    return maxLevel + 1;
  }  
}
