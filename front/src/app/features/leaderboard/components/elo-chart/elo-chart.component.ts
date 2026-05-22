import {
  Component, Input, OnChanges, ViewChild,
  ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EloPoint } from '../../../../core/models/player.model';
import { Chart, registerables, TooltipItem } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-elo-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './elo-chart.component.html',
})
export class EloChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() history: EloPoint[] = [];
  @Input() playerName = '';

  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.buildChart();
  }

  ngOnChanges(): void {
    if (this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private getLabels(): string[] {
    return this.history.map((p, i) =>
      new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    );
  }

  private getData(): number[] {
    return this.history.map(p => p.eloAfter);
  }

  private buildChart(): void {
    if (!this.canvasRef) return;
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(0, 245, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 245, 255, 0.00)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getLabels(),
        datasets: [{
          label: this.playerName,
          data: this.getData(),
          borderColor: '#00f5ff',
          borderWidth: 2,
          pointBackgroundColor: '#00f5ff',
          pointBorderColor: '#0a0a0f',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#00ff88',
          fill: true,
          backgroundColor: gradient,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#12121a',
            borderColor: '#00f5ff44',
            borderWidth: 1,
            titleColor: '#6b6b8a',
            bodyColor: '#00f5ff',
            bodyFont: { family: 'Orbitron', size: 14, weight: 'bold' },
            titleFont: { family: 'Inter', size: 11 },
            padding: 12,
            callbacks: {
              label: (ctx: TooltipItem<'line'>) => ` ${ctx.parsed.y} ELO`,
            }
          },
        },
        scales: {
          x: {
            grid: { color: '#1e1e2e' },
            ticks: {
              color: '#6b6b8a',
              font: { family: 'Inter', size: 11 },
            },
            border: { color: '#1e1e2e' },
          },
          y: {
            grid: { color: '#1e1e2e' },
            ticks: {
              color: '#6b6b8a',
              font: { family: 'Orbitron', size: 11 },
            },
            border: { color: '#1e1e2e' },
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      }
    });
  }

  private updateChart(): void {
    if (!this.chart) return;
    this.chart.data.labels         = this.getLabels();
    this.chart.data.datasets[0].data  = this.getData();
    this.chart.data.datasets[0].label = this.playerName;
    this.chart.update();
  }
}
