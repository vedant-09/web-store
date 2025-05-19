import React from 'react'
import { Link } from 'react-router-dom'

export default function AdminNavbar() {
  return (

            <nav className="navbar navbar-expand-lg bg-light  my-2 mx-2">
        <div className="container-fluid">
            <Link className="navbar-brand" to="/admin/dashboard/">Company.</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/admin/dashboard/">Home</Link>
                </li>
                <li className="nav-item">
                <Link className="nav-link" to="/admin/dashboard/">Link</Link>
                </li>
               
            </ul>
            <Link className='nav-link'to='/admin/dashboard/'>Admin</Link>
            </div>
        </div>
        </nav>
    
  )
}
