class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
  }

  mark(name) {
    if (performance.mark) {
      performance.mark(name);
      this.marks.set(name, performance.now());
    }
  }

  measure(name, startMark, endMark) {
    if (performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name);
        if (entries.length > 0) {
          const duration = entries[0].duration;
          this.measures.set(name, duration);
          console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
          return duration;
        }
      } catch (e) {
        console.warn('Performance measurement failed:', e);
      }
    }
    return null;
  }

  clearMarks() {
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    this.marks.clear();
  }

  clearMeasures() {
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
    this.measures.clear();
  }

  getReport() {
    const report = {
      marks: Object.fromEntries(this.marks),
      measures: Object.fromEntries(this.measures),
      timestamp: new Date().toISOString()
    };
    return report;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// HOC for monitoring component render time
export const withPerformanceMonitoring = (Component, componentName) => {
  return function MonitoredComponent(props) {
    useEffect(() => {
      performanceMonitor.mark(`${componentName}-mount-start`);
      
      return () => {
        performanceMonitor.mark(`${componentName}-mount-end`);
        performanceMonitor.measure(
          `${componentName}-mount-duration`,
          `${componentName}-mount-start`,
          `${componentName}-mount-end`
        );
      };
    }, []);
    
    return <Component {...props} />;
  };
};