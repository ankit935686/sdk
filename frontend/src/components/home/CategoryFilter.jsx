import { foodCategories } from '../../data/foodData'

export function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#ed6a45]">
            Explore Menus
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            What's on your mind?
          </h2>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {foodCategories.map((cat) => {
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#202d26] text-white shadow-md shadow-gray-900/20 scale-105'
                  : 'bg-white text-gray-700 border border-gray-200/80 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
