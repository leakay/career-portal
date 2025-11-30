import React from 'react';
import { NavLink } from 'react-router-dom';
export default function Sidebar(){
  return (
    <aside className="sidebar">
      <h5>Menu</h5>
      <ul className="nav flex-column">
        <li className="nav-item"><NavLink to="/" className="nav-link">Home</NavLink></li>
        <li className="nav-item"><NavLink to="/reviews" className="nav-link">Reviews</NavLink></li>
      </ul>
    </aside>
  );
}