function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Item Gallery
          </h1>
          <p className="text-white/80 mb-8">
            Modern glassmorphism design
          </p>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-xl">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">No Items Found</h3>
            <p className="text-white/70">
              Backend uses stub implementations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;