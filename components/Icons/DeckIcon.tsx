type DeckIconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const DeckIcon: React.FC<DeckIconProps> = ({ className, ...props }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect x="3" y="6" width="13" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M8 3.5C8 2.67 8.67 2 9.5 2H19a2 2 0 0 1 2 2v12.5c0 .83-.67 1.5-1.5 1.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default DeckIcon;
