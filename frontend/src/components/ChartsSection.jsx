import { useMemo } from 'react';
import TrendsChart from './charts/TrendsChart';
import DeathChart from './charts/DeathChart';
import RecoveryChart from './charts/RecoveryChart';
import VaccineChart from './charts/VaccineChart';
import ContinentChart from './charts/ContinentChart';
import RankingChart from './charts/RankingChart';
import { processHistoricalData } from '../utils/chartHelpers';
import SkeletonLoader from './SkeletonLoader';

const ChartsSection = ({ data, country, countries }) => {
  const processedData = useMemo(() => {
    if (!data?.historical) return null;
    return processHistoricalData(data.historical, country);
  }, [data, country]);

  if (!data) {
    return (
      <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SkeletonLoader type="card" count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SkeletonLoader type="card" count={2} />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Trends */}
        {processedData && <TrendsChart data={processedData} />}
        
        {/* Death Analysis */}
        {processedData && <DeathChart data={processedData} />}
        
        {/* Recovery Trends */}
        {processedData && <RecoveryChart data={processedData} />}
        
        {/* Vaccine Progress */}
        <VaccineChart country={country} days={data.days || '90'} />
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Continental Distribution */}
        <ContinentChart />
        
        {/* Top Countries Ranking */}
        <RankingChart countries={countries} />
      </div>
    </>
  );
};

export default ChartsSection;