import MovingImageNavbar from "../MovingImageNavbar";

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
    <div className="flex-col items-center justify-center hidden w-full p-8 text-white rounded lg:flex lg:w-1/2 promo-gradient md:p-10 lg:p-12 xl:p-16">
      <div className="w-full max-w-2xl">
        <div className="mb-8 md:mb-12">
          <h2 className="mb-4 text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
            Transforming Higher Education in India
          </h2>
          
          <p className="text-sm text-indigo-200 sm:text-base md:text-lg lg:text-xl">
            Comprehensive platform for institutional performance monitoring and quality enhancement
          </p>
          <div className="pt-4">
            <MovingImageNavbar/>
          </div>
        </div>

        <div className="p-6 mb-10 border shadow-2xl bg-white/10 backdrop-blur-sm rounded-2xl md:p-8 md:mb-14 border-white/20">
          <div className="flex flex-col justify-between mb-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-lg font-bold text-white md:text-xl">
                National Education Performance Dashboard
              </h3>
              <p className="mt-1 text-sm text-indigo-200">
                Real-time insights across 500+ institutions
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 mt-2 text-xs font-medium text-green-300 rounded-full bg-green-500/20 md:mt-0">
              Live Monitoring
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
            {metrics.map((metric, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-xl">
                <p className="text-2xl font-bold text-white md:text-3xl">{metric.value}</p>
                <p className="mt-1 text-xs font-medium text-green-300">{metric.label}</p>
                <p className="mt-1 text-xs text-indigo-200">{metric.sublabel}</p>
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

        <div className="pt-6 mt-8 border-t md:mt-12 md:pt-8 border-white/20">
          <p className="mb-4 text-xs font-semibold tracking-wider text-indigo-200 uppercase md:text-sm md:mb-6">
            Trusted by Leading Institutions:
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs md:gap-4 md:text-sm">
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
