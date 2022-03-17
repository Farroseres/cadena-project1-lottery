import { Link } from 'react-router-dom';

export default () => {
  return (
    <header>
      <div className="logo">
        Cadena Projet 1 Lottery

        <nav>
          <Link to="/">Home</Link>
        </nav>
      </div>
    </header>
  )
}