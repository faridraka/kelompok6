import { Outlet } from "react-router"
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"

const App = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default App
