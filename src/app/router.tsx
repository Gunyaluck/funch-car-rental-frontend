import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { AdminCarsPage } from '../pages/admin/AdminCarsPage'
import { AdminCarDetailPage } from '../pages/admin/AdminCarDetailPage'
import { AdminCreateCarPage } from '../pages/admin/AdminCreateCarPage'
import { AdminBookingDetailPage } from '../pages/admin/AdminBookingDetailPage'
import { AdminEditCarPage } from '../pages/admin/AdminEditCarPage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminLoginPage } from '../pages/admin/AdminLoginPage'
import { AdminMemberDetailPage } from '../pages/admin/AdminMemberDetailPage'
import { AdminMembersPage } from '../pages/admin/AdminMembersPage'
import { AdminReportsPage } from '../pages/admin/AdminReportsPage'
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage'
import { CarDetailPage } from '../pages/CarDetailPage'
import { CarsPage } from '../pages/CarsPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { MyBookingsPage } from '../pages/MyBookingsPage'
import { ProfilePage } from '../pages/ProfilePage'
import { RegisterPage } from '../pages/RegisterPage'
import { RequireAuth } from '../routes/RequireAuth'

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
      {
        path: 'profile',
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'my-bookings',
        element: (
          <RequireAuth>
            <MyBookingsPage />
          </RequireAuth>
        ),
      },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: (
      <RequireAuth role="ADMIN">
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'bookings', element: <AdminBookingsPage /> },
      { path: 'bookings/:bookingId', element: <AdminBookingDetailPage /> },
      { path: 'cars', element: <AdminCarsPage /> },
      { path: 'cars/:carId', element: <AdminCarDetailPage /> },
      { path: 'cars/create', element: <AdminCreateCarPage /> },
      { path: 'cars/:carId/edit', element: <AdminEditCarPage /> },
      { path: 'members', element: <AdminMembersPage /> },
      { path: 'members/:memberId', element: <AdminMemberDetailPage /> },
      { path: 'reports', element: <AdminReportsPage /> },
    ],
  },
])
