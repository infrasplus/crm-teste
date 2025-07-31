// components/crm/icons/UserIcon.js
import React from 'react';

const UserIcon = ({ className, ...props }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 15a6 6 0 0112 0v2H6v-2z" fill="currentColor" />
  </svg>
);

export default UserIcon;