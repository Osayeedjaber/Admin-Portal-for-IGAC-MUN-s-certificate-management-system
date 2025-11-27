export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000b07] via-[#001c14] to-[#000b07]">
      <div className="text-center">
        {/* Animated gradient circle */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] animate-spin" style={{ animationDuration: '1.5s' }}>
            <div className="absolute inset-1 rounded-full bg-[#000b07]"></div>
          </div>
        </div>
        
        <p className="text-[#faf4ea]/60 text-sm">Loading...</p>
      </div>
    </div>
  );
}
