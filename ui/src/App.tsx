import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage/MainPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import Layout from "./pages/Layout/Layout"
import RegisterPage from "./pages/RegisterPage/RegisterPage";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<RegisterPage />} />
          <Route index element={<MainPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
