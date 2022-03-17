import { Outlet } from 'react-router';

import Header from './Header';

export default () => {
  return (
    <div className="app">
      <Header />
      
      <div className="main">
        <Outlet/>
      </div>
    </div>
  )
}