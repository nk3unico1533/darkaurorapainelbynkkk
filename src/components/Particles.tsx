const Particles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-neon-purple/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
      {[...Array(10)].map((_, i) => (
        <div
          key={`glow-${i}`}
          className="absolute w-2 h-2 bg-neon-violet/20 rounded-full blur-sm animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 7}s`,
            animationDuration: `${20 + Math.random() * 15}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
