const ChartTypeSelector = ({ types, currentType, onChange }) => {
  return (
    <div className="flex gap-2">
      {types.map(type => (
        <button
          key={type.value}
          onClick={() => onChange(type.value)}
          className={`chart-type-btn ${currentType === type.value ? 'active' : ''}`}
        >
          {type.label}
        </button>
      ))}
    </div>
  );
};

export default ChartTypeSelector;