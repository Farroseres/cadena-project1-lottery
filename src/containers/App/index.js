import { Routes, Route } from 'react-router';

import Home from '../Home';
import Main from '../Layout/Main';

export default () => {
  return (
    <Routes>
      <Route path="/" element={<Main />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  )
}