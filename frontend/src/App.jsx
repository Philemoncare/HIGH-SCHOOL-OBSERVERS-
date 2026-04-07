import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { NavigationProvider } from './contexts/NavigationContext'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import About from './pages/About'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Shop from './pages/Shop'
import Magazine from './pages/Magazine'
import Payment from './pages/Payment'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminUsers from './pages/AdminUsers'
import AdminNews from './pages/AdminNews'
import AdminEvents from './pages/AdminEvents'
import AdminShop from './pages/AdminShop'
import AdminProfile from './pages/AdminProfile'
import Executives from './pages/Executives'
import PaymentVerification from './pages/PaymentVerification'
import ShopVerification from './pages/ShopVerification'
import AdminPayments from './pages/AdminPayments'
import AdminLeadership from './pages/AdminLeadership'
import AdminMagazines from './pages/AdminMagazines'
import Leadership from './pages/Leadership'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Contact from './pages/Contact'
import AdminLogin from './pages/AdminLogin'
import Privacy from './pages/Privacy'
import DataDeletion from './pages/DataDeletion'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NavigationProvider>
          <>
          <ScrollToTop />
          <Helmet>
            <title>High School Observer (HSO)</title>
            <meta name="description" content="Empowering school representatives and fostering educational excellence" />
          </Helmet>
          
          <Routes>
        <Route path="/donations/verify" element={<PaymentVerification />} />
        <Route path="/shop/verify" element={<ShopVerification />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="news" element={<News />} />
          <Route path="news/:slug" element={<NewsDetail />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="shop" element={<Shop />} />
          <Route path="donations" element={<Events />} />
          <Route path="magazine" element={<Magazine />} />
          <Route path="payment" element={<Payment />} />
          <Route path="executives" element={<Executives />} />
          <Route path="leadership" element={<Leadership />} />
          <Route path="login" element={<Login />} />
          <Route path="admin-login" element={<AdminLogin />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="data-deletion" element={<DataDeletion />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Admin />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="donations" element={<AdminEvents />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="shop" element={<AdminShop />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="leadership" element={<AdminLeadership />} />
          <Route path="magazines" element={<AdminMagazines />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
          </>
        </NavigationProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App 