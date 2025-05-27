import React from "react";

type LogoutIconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const LogoutIcon: React.FC<LogoutIconProps> = ({ className, ...props }) => (
  <svg width="24" height="24" viewBox="0 0 73 81" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path
      d="M40 80.1109C17.908 80.1109 0 62.2029 0 40.1109C0 18.0189 17.908 0.110897 40 0.110897C62.092 0.110897 80 18.0189 80 40.1109C80 62.2029 62.092 80.1109 40 80.1109ZM60 56.1109L80 40.1109L60 24.1109V36.1109H28V44.1109H60V56.1109Z"
      fill="currentColor"
    />
  </svg>
);

export default LogoutIcon;
