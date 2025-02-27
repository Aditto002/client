import { createBrowserRouter,RouterProvider,Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import CreditPage from '../pages/CreaditPage'
import DebitPage from '../pages/DebitPage'
import DuePage from '../pages/DuePage'
import DailyTransation from '../pages/DailyTransaction'
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
  }

  
])
export default router