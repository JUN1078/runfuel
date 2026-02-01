import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/layout/AuthLayout';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';

import { OnboardingPage } from './features/onboarding/OnboardingPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PhotoCapturePage } from './features/food-log/PhotoCapturePage';
import { AIReviewPage } from './features/food-log/AIReviewPage';
import { ManualEntryPage } from './features/food-log/ManualEntryPage';
import { ProgressPage } from './features/progress/ProgressPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { AchievementsPage } from './features/achievements/AchievementsPage';
import { TrainingPage } from './features/training/TrainingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/log/photo" element={<PhotoCapturePage />} />
            <Route path="/log/photo/review" element={<AIReviewPage />} />
            <Route path="/log/manual" element={<ManualEntryPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
