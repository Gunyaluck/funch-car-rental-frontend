import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminCarsPage } from '../pages/admin/AdminCarsPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminLoginPage } from '../pages/admin/AdminLoginPage'
import { AdminMembersPage } from '../pages/admin/AdminMembersPage'
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage'
import { AdminReportsPage } from '../pages/admin/AdminReportsPage'
import { CarDetailPage } from '../pages/CarDetailPage'
import { CarsPage } from '../pages/CarsPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { MyBookingsPage } from '../pages/MyBookingsPage'
import { RegisterPage } from '../pages/RegisterPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'cars', element: <CarsPage /> },
      { path: 'cars/:carId', element: <CarDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'my-bookings', element: <MyBookingsPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'bookings', element: <AdminBookingsPage /> },
      { path: 'cars', element: <AdminCarsPage /> },
      { path: 'members', element: <AdminMembersPage /> },
      { path: 'reports', element: <AdminReportsPage /> },
    ],
  },
])
