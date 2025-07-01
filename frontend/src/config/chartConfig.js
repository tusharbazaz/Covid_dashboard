import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Default chart options
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: 'Inter',
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
      titleFont: {
        family: 'Inter',
        size: 14,
        weight: '600'
      },
      bodyFont: {
        family: 'Inter',
        size: 13
      },
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          const value = context.parsed.y;
          label += new Intl.NumberFormat().format(value);
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(156, 163, 175, 0.1)'
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11
        }
      }
    }
  }
};

// Theme configurations
export const chartThemes = {
  light: {
    textColor: '#374151',
    gridColor: 'rgba(55, 65, 81, 0.1)',
    backgroundColor: '#ffffff'
  },
  dark: {
    textColor: '#9CA3AF',
    gridColor: 'rgba(156, 163, 175, 0.1)',
    backgroundColor: '#1F2937'
  }
};

// Update chart theme
export const updateChartTheme = (isDark) => {
  const theme = isDark ? chartThemes.dark : chartThemes.light;
  
  ChartJS.defaults.color = theme.textColor;
  ChartJS.defaults.borderColor = theme.gridColor;
  ChartJS.defaults.backgroundColor = theme.backgroundColor;
};

// Chart color schemes
export const chartColors = {
  primary: '#3B82F6',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  purple: '#8B5CF6',
  pink: '#EC4899',
  teal: '#14B8A6',
  indigo: '#6366F1'
};