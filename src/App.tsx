import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './page/Home/Home';
import './App.css'


function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
  ]);

  return (
      <RouterProvider router={router} />
  )
}

export default App
