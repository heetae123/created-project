'use client';
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const AdminLogin = lazy(() => import('./components/Admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const AdminHero = lazy(() => import('./components/Admin/AdminHero'));
const AdminPortfolio = lazy(() => import('./components/Admin/AdminPortfolio'));
const AdminServiceImages = lazy(() => import('./components/Admin/AdminServiceImages'));
const AdminBoard = lazy(() => import('./components/Admin/AdminBoard'));
const AdminTeam = lazy(() => import('./components/Admin/AdminTeam'));
const AdminServiceTexts = lazy(() => import('./components/Admin/AdminServiceTexts'));
const AdminGreeting = lazy(() => import('./components/Admin/AdminGreeting'));
const AdminEmail = lazy(() => import('./components/Admin/AdminEmail'));
const AdminSeo = lazy(() => import('./components/Admin/AdminSeo'));
const AdminKakao = lazy(() => import('./components/Admin/AdminKakao'));
const AdminMap = lazy(() => import('./components/Admin/AdminMap'));
const AdminInquiries = lazy(() => import('./components/Admin/AdminInquiries'));
const AdminLandingTexts = lazy(() => import('./components/Admin/AdminLandingTexts'));
const AdminPassword = lazy(() => import('./components/Admin/AdminPassword'));

export default function AdminApp() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="fixed inset-0 bg-[#F9FAFB]" />}>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="dashboard" element={<Suspense fallback={null}><AdminDashboard /></Suspense>} />
            <Route path="hero" element={<Suspense fallback={null}><AdminHero /></Suspense>} />
            <Route path="portfolio" element={<Suspense fallback={null}><AdminPortfolio /></Suspense>} />
            <Route path="service-images" element={<Suspense fallback={null}><AdminServiceImages /></Suspense>} />
            <Route path="board" element={<Suspense fallback={null}><AdminBoard /></Suspense>} />
            <Route path="team" element={<Suspense fallback={null}><AdminTeam /></Suspense>} />
            <Route path="service-texts" element={<Suspense fallback={null}><AdminServiceTexts /></Suspense>} />
            <Route path="greeting" element={<Suspense fallback={null}><AdminGreeting /></Suspense>} />
            <Route path="email" element={<Suspense fallback={null}><AdminEmail /></Suspense>} />
            <Route path="seo" element={<Suspense fallback={null}><AdminSeo /></Suspense>} />
            <Route path="kakao" element={<Suspense fallback={null}><AdminKakao /></Suspense>} />
            <Route path="map" element={<Suspense fallback={null}><AdminMap /></Suspense>} />
            <Route path="inquiries" element={<Suspense fallback={null}><AdminInquiries /></Suspense>} />
            <Route path="landing-texts" element={<Suspense fallback={null}><AdminLandingTexts /></Suspense>} />
            <Route path="password" element={<Suspense fallback={null}><AdminPassword /></Suspense>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
