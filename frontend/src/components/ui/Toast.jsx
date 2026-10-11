export function Toast({ message, onDismiss }) {
  if (!message) return null

  return <button onClick={onDismiss} className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#202d26] px-6 py-3 text-sm font-bold text-white shadow-xl">{message} <span className="ml-2 text-[#f9b49d]">×</span></button>
}
