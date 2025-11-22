import { SearchComponent } from './components/SearchComponent'
import { ProductGrid } from './components/ProductGrid'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="py-12 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Vitrina
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Turn any Instagram feed into a shoppable catalog instantly.
        </p>
      </header>

      <main className="container mx-auto pb-20">
        <section className="mb-12">
          <SearchComponent />
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold text-center mb-8">Recent Products</h2>
          <ProductGrid />
        </section>
      </main>

      <footer className="text-center py-8 text-sm text-gray-500 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800">
        <p>Built with Convex, Gemini 3 Pro, and Nano Banana.</p>
      </footer>
    </div>
  )
}

export default App
