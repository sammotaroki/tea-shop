const Loading = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div role="status" className="flex flex-col items-center justify-center py-20">
      <div className={`${sizes[size]} border-4 border-cream-300 border-t-primary-500 rounded-full animate-spin`} aria-hidden="true" />
      <p className="mt-4 text-cream-500 text-sm animate-pulse-soft">{text || 'Loading...'}</p>
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  );
};

export default Loading;
