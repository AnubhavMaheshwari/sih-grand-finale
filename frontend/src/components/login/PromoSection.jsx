const PromoSection = () => {
  const metrics = [
    { value: '8.5', label: 'NAS Score', sublabel: 'National Average' },
    { value: '92%', label: 'Retention Rate', sublabel: 'Student Success' },
    { value: '85%', label: 'Research Index', sublabel: 'Academic Output' },
  ];

  const performanceItems = [
    { label: 'Faculty Development', value: '95%' },
    { label: 'Infrastructure Quality', value: '88%' },
    { label: 'Industry Collaboration', value: '82%' },
  ];

  const institutions = [
    'IITs & NITs',
    'Central Universities',
    'State Universities',
    'Private Institutions',
    'Research Institutes',
  ];

  return (
    <div className="hidden lg:flex w-full lg:w-1/2 promo-gradient text-white p-8 md:p-10 lg:p-12 xl:p-16 flex-col justify-center items-center">
      <div className="max-w-2xl w-full">
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Transforming Higher Education in India
          </h2>
          <p className="text-indigo-200 text-sm sm:text-base md:text-lg lg:text-xl">
            Comprehensive platform for institutional performance monitoring and quality enhancement
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl mb-10 md:mb-14 border border-white/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white">
                National Education Performance Dashboard
              </h3>
              <p className="text-indigo-200 text-sm mt-1">
                Real-time insights across 500+ institutions
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 mt-2 md:mt-0">
              Live Monitoring
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl md:text-3xl font-bold text-white">{metric.value}</p>
                <p className="text-xs text-green-300 font-medium mt-1">{metric.label}</p>
                <p className="text-xs text-indigo-200 mt-1">{metric.sublabel}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {performanceItems.map((item, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center ${
                  index < performanceItems.length - 1 ? 'pb-2 border-b border-white/10' : ''
                }`}
              >
                <span className="text-sm text-white/90">{item.label}</span>
                <span className="text-sm font-bold text-green-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/20">
          <p className="text-xs md:text-sm uppercase tracking-wider text-indigo-200 mb-4 md:mb-6 font-semibold">
            Trusted by Leading Institutions:
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs md:text-sm">
            {institutions.map((institution, index) => (
              <span 
                key={index}
                className="px-3 py-1.5 bg-white/5 rounded-lg text-white/90 hover:bg-white/10 transition cursor-default"
              >
                {institution}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoSection;
