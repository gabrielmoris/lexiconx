type RemoveIconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const RemoveIcon: React.FC<RemoveIconProps> = ({ className, ...props }) => (
  <svg width="80" height="81" viewBox="0 0 80 81" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <g clipPath="url(#clip0_21_2)">
      <path
        d="M40 0.5C17.9086 0.5 0 18.4086 0 40.5C0 62.5914 17.9086 80.5 40 80.5C62.0914 80.5 80 62.5914 80 40.5C80 18.4086 62.0914 0.5 40 0.5ZM27.4317 18L40 30.5683L52.5683 18L62.5 27.9317L49.9317 40.5L62.5 53.0683L52.5683 63L40 50.4317L27.4317 63L17.5 53.0683L30.0683 40.5L17.5 27.9317L27.4317 18Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_21_2">
        <rect width="80" height="80" fill="currentColor" transform="translate(0 0.5)" />
      </clipPath>
    </defs>
  </svg>
);

export default RemoveIcon;
