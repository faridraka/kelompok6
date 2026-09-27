import CoachTopNav from './CoachTopNav'

const CoachLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-navy-950">
      <CoachTopNav />

      <main className="mx-auto w-full max-w-[1650px] px-4 lg:px-8">
        {children}
      </main>
    </div>
  )
}

export default CoachLayout