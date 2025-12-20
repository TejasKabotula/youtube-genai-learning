import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import NewAnalysis from './pages/NewAnalysis'
import MyVideos from './pages/MyVideos'
import VideoView from './pages/VideoView'
import EducatorDashboard from './pages/EducatorDashboard'
import EducatorReview from './pages/EducatorReview'

function App() {
    return (
        <div className="min-h-screen bg-white">
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/app" element={<DashboardLayout />}>
                        <Route index element={<Navigate to="/app/new" replace />} />
                        <Route path="new" element={<NewAnalysis />} />
                        <Route path="videos" element={<MyVideos />} />
                        <Route path="videos/:id/*" element={<VideoView />} />
                        <Route path="educator" element={<EducatorDashboard />} />
                        <Route path="educator/review/:videoId" element={<EducatorReview />} />
                    </Route>
                </Route>
            </Routes>
        </div>
    )
}

export default App
