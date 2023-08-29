export default function Loading({progress}) {
  return (
    <div className="bg-blue-100 w-96 mx-auto p-2 text-center relative">
      <span className="absolute top-0 left-0 h-full bg-green-500 z-10" style={{
        width: `${progress}%`
      }}></span>
      <h3 className="relative z-20">{progress}%</h3>
    </div>
  )
}