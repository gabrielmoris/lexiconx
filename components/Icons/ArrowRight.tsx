type ArrowRightProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const ArrowRight: React.FC<ArrowRightProps> = ({ className, ...props }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default ArrowRight;
