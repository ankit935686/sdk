import { categories } from '../../data/homeData'

export function CategorySection() {
  return <section id="discover" className="mx-auto max-w-7xl px-6 pb-24 lg:px-10"><div className="flex items-end justify-between"><div><p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-[#ed6a45]">What are you craving?</p><h2 className="text-4xl font-black tracking-[-.05em]">Browse by mood</h2></div><a className="hidden text-sm font-bold text-[#ed6a45] sm:block" href="#discover">See all categories →</a></div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">{categories.map((category) => <a className={`${category.color} rounded-3xl p-5 transition hover:-translate-y-1`} href="#popular" key={category.name}><span className="text-4xl">{category.icon}</span><p className="mt-5 font-bold">{category.name}</p></a>)}</div></section>
}
