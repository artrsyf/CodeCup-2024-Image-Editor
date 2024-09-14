import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage";
import Layout from "./pages/Layout/Layout"

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route index element={<MainPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
