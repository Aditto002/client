import { createBrowserRouter,RouterProvider,Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import CreditPage from '../pages/CreaditPage'
import DebitPage from '../pages/DebitPage'
import DuePage from '../pages/DuePage'
import DailyTransation from '../pages/DailyTransaction'
import Balance from '../pages/Balance'
import DailyLog from '../pages/DailyLog'
import Customer from '../pages/Customer'
import Account from '../pages/Account'
const router = createBrowserRouter([
  {
    path:'/',
    element:<HomePage></HomePage>,
  },
  {
  path:'/creditpage', 
  element:<CreditPage></CreditPage>
  },
  {
  path:'/debitpage',
  element:<DebitPage></DebitPage>
  },
  {
  path:'/duepage',
  element:<DuePage></DuePage>
  },
  {
    path: '/dailytransation',
    element :<DailyTransation></DailyTransation>
  },
  {
    path: '/balance',
    element :<Balance></Balance>
  },
  {
    path: '/dailylog',
    element :<DailyLog></DailyLog>
  },
  {
    path: '/customer',
    element :<Customer></Customer>
  },
  {
    path: '/account',
    element :<Account></Account>
  },

  
])
export default router