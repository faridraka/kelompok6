// CoachLayout
// Wrapper layout untuk semua halaman Coach Perspective.
// Terdiri dari: CoachSidebar (kiri) + area konten utama (kanan).
// Semua halaman Coach cukup dibungkus dengan <CoachLayout>.

import CoachSidebar from './CoachSidebar'

const CoachLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-navy-950">
      <CoachSidebar />

      {/* Area konten utama */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Konten halaman */}
        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  )
}

export default CoachLayout
