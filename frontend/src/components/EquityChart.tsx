'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EquityChartProps {
  equityCurve: Array<{
    date: string;
    equity: number;
    cash: number;
    position_value: number;
    close_price: number;
    sma?: number;
  }>;
  ticker: string;
}

const EquityChart: React.FC<EquityChartProps> = ({ equityCurve, ticker }) => {
  if (!equityCurve || equityCurve.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <p className="text-gray-500">No equity curve data available</p>
        </div>
      </div>
    );
  }

  const dates = equityCurve.map((point: any) => {
    const date = new Date(point.date);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  });

  const equityValues = equityCurve.map((point: any) => point.equity);
  const priceValues = equityCurve.map((point: any) => point.close_price);

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${ticker} Equity Curve`,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('Equity')) {
              return `${label}: $${value.toLocaleString()}`;
            }
            return `${label}: $${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          maxTicksLimit: 10,
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value ($)',
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Portfolio Equity',
        data: equityValues,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'Stock Price',
        data: priceValues,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      }
    ],
  };

  // Add SMA line if available
  const smaValues = equityCurve
    .map((point: any) => point.sma)
    .filter((sma: any) => sma !== null && sma !== undefined);

  if (smaValues.length > 0) {
    data.datasets.push({
      label: 'SMA',
      data: smaValues,
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: false,
      tension: 0.1,
      pointRadius: 0,
      pointHoverRadius: 6,
      yAxisID: 'y1',
    });
  }

  // Add secondary y-axis for price data
  if (data.datasets.length > 1) {
    options.scales.y1 = {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      title: {
        display: true,
        text: 'Price ($)',
      },
      ticks: {
        callback: function(value: any) {
          return '$' + value;
        }
      },
      grid: {
        drawOnChartArea: false,
      },
    };
  }

  return (
    <div className="card">
      <div className="h-96">
        <Line options={options} data={data} />
      </div>
      
      {/* Chart Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span>Portfolio Equity</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span>Stock Price</span>
        </div>
        {smaValues.length > 0 && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>SMA</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquityChart; 