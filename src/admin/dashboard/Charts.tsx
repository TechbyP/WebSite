import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DoughnutChartProps {
  data: Array<{ name: string; value: number }>;
  colors: string[];
  cutout?: string;
  title?: string;
}

export const DoughnutChart: React.FC<DoughnutChartProps> = ({
  data,
  colors,
  cutout = '70%',
  title
}) => {
  const theme = useTheme();

  const chartData: ChartData<'doughnut'> = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: colors,
        borderColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: theme.palette.text.primary,
          font: {
            family: theme.typography.fontFamily
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: context => {
            const label = context.label || '';
            const value = context.raw as number;
            return `${label}: ${value}`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: title ? 'calc(100% - 40px)' : '100%' }}>
        <Doughnut data={chartData} options={options} />
      </Box>
    </Box>
  );
};

interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  colors: string[];
  title?: string;
  horizontal?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  colors,
  title,
  horizontal = false
}) => {
  const theme = useTheme();

  const chartData: ChartData<'bar'> = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Value',
        data: data.map(item => item.value),
        backgroundColor: colors,
        borderColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: colors.map(color => `${color}CC`)
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      },
      y: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary
        },
        beginAtZero: true
      }
    },
    animation: {
      duration: 1000
    }
  };

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: title ? 'calc(100% - 40px)' : '100%' }}>
        <Bar data={chartData} options={options} />
      </Box>
    </Box>
  );
};

interface LineChartProps {
  data: Array<{ x: string | number; y: number }>;
  color: string;
  title?: string;
  fill?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  color,
  title,
  fill = false
}) => {
  const theme = useTheme();

  const chartData: ChartData<'line'> = {
    datasets: [
      {
        label: 'Value',
        data,
        borderColor: color,
        backgroundColor: fill ? `${color}40` : 'transparent',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: theme.palette.background.paper,
        pointBorderWidth: 2,
        fill,
        tension: 0.3
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      },
      y: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {title && (
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      <Box sx={{ height: title ? 'calc(100% - 40px)' : '100%' }}>
        <Line data={chartData} options={options} />
      </Box>
    </Box>
  );
};

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color,
  width = 120,
  height = 40
}) => {
  const chartData: ChartData<'line'> = {
    datasets: [
      {
        data,
        borderColor: color,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: false
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    },
    elements: {
      line: {
        capBezierPoints: true
      }
    }
  };

  return <Line width={width} height={height} data={chartData} options={options} />;
};

export const Charts = {
  Doughnut: DoughnutChart,
  Bar: BarChart,
  Line: LineChart,
  Sparkline: Sparkline
};