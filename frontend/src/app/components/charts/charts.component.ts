import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  standalone: true,

  selector: 'app-charts',
  imports: [HttpClientModule],
  templateUrl: './charts.component.html',

})
export class ChartsComponent implements AfterViewInit, OnDestroy {
  chart: any;
  labels: string[] = [];
  datasets: any[] = [];
  dataSubscription: Subscription | null = null;

  // Color palette for professional look
  colorPalette = ['#4285F4', '#FA003F', '#FBBC05', '#EA4335', '#8AB4F8'];

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    if (typeof window === 'undefined') return;
    this.dataSubscription = interval(1000).pipe(
      switchMap(() => this.http.get<any>('assets/data.json'))
    ).subscribe(response => {
      console.log('Response from API:', response);

      let data: any[] = [];

      if (response && response.chart2 && Array.isArray(response.chart2.datasets)) {
        data = response.chart2;
      } else {
        console.error('Neplatná data pro chart2, očekáváno pole:', response);
        return;
      }

      console.log('Načtená data:', data);

      if (typeof window !== 'undefined') {
        if (!this.chart) {
          this.createChart(data);
        } else {
          this.updateChart(data);
        }
      }
    });
  }

  createChart(data: any) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    if (!data || !data.labels || !data.datasets) {
      console.error('Neplatná struktura dat:', data);
      return;
    }

    this.labels = data.labels;
    this.datasets = data.datasets.map((dataset: any, index: number) => {
      dataset.backgroundColor = this.colorPalette[index % this.colorPalette.length];
      dataset.borderRadius = 4;
      dataset.borderWidth = 0;
      dataset.maxBarThickness = 50;
      return dataset;
    });

    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element with id "myChart" not found');
      return;
    }

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: this.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#FFFFFF',
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                family: "'Arial', sans-serif"
              }
            }
          },
          tooltip: {
            backgroundColor: '#FFFFFF',
            titleFont: {
              size: 14,
              weight: 'bold',
              family: "'Arial', sans-serif"
            },
            bodyFont: {
              size: 13,
              family: "'Arial', sans-serif"
            },
            padding: 12,
            cornerRadius: 4,
            displayColors: true
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#FFFFFF',
              font: {
                family: "'Arial', sans-serif"
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(200, 200, 200, 0.2)',
              lineWidth: 1
            },
            ticks: {
              color: '#FFFFFF',
              font: {
                family: "'Arial', sans-serif"
              }
            }
          }
        },
       animation: false
      }
    });
  }

  updateChart(data: any) {
    if (!data || !data.labels || !data.datasets) {
      console.error('Neplatná struktura dat:', data);
      return;
    }
    this.labels = data.labels;
    this.datasets = data.datasets.map((dataset: any, index: number) => {
      dataset.backgroundColor = this.colorPalette[index % this.colorPalette.length];
      dataset.borderRadius = 4;
      dataset.maxBarThickness = 50;
      return dataset;
    });

    if (this.chart) {
      this.chart.data.labels = this.labels;
      this.chart.data.datasets = this.datasets;
      this.chart.update('none');
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}
