type MemoryHookIconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const MemoryHookIcon: React.FC<MemoryHookIconProps> = ({ className, ...props }) => (
  <svg
    width="80"
    height="81"
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M12 2.5C10.3431 2.5 9 3.84315 9 5.5V13.5C9 15.1569 10.3431 16.5 12 16.5C13.6569 16.5 15 15.1569 15 13.5V5.5C15 3.84315 13.6569 2.5 12 2.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 13.5C7 16.2614 9.23858 18.5 12 18.5C14.7614 18.5 17 16.2614 17 13.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 18.5V22.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 22.5H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default MemoryHookIcon;
