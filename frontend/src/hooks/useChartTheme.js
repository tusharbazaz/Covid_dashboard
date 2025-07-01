import { useEffect } from 'react';
import { Chart } from 'chart.js';
import { chartThemes } from '../config/chartConfig';

export const useChartTheme = (darkMode) => {
  useEffect(() => {
    const theme = darkMode ? chartThemes.dark : chartThemes.light;
    
    // Update Chart.js defaults
    Chart.defaults.color = theme.textColor;
    Chart.defaults.borderColor = theme.gridColor;
    Chart.defaults.backgroundColor = theme.backgroundColor;
    
    // Update all existing chart instances
    Object.values(Chart.instances).forEach(chart => {
      if (chart && chart.options) {
        // Update text colors
        if (chart.options.plugins?.legend?.labels) {
          chart.options.plugins.legend.labels.color = theme.textColor;
        }
        
        // Update axis colors
        if (chart.options.scales) {
          Object.keys(chart.options.scales).forEach(scaleKey => {
            const scale = chart.options.scales[scaleKey];
            if (scale.ticks) scale.ticks.color = theme.textColor;
            if (scale.grid) scale.grid.color = theme.gridColor;
          });
        }
        
        chart.update('none');
      }
    });
  }, [darkMode]);
};