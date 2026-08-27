export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-bonkers-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-bonkers-gray-500">Loading...</p>
      </div>
    </div>
  )
}
