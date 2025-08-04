import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import AnalysisPage from "./pages/AnalysisPage";
import HomePage from "./pages/HomePage";

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <div className="container mt-4">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/analysis/:id" element={<AnalysisPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;