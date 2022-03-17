import { Outlet } from 'react-router';

export default () => {
  return (
    <div className="app">
      <div className="main">
        <Outlet/>
      </div>
    </div>
  )
}