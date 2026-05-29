type ArrowLeftProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const ArrowLeft: React.FC<ArrowLeftProps> = ({ className, ...props }) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export default ArrowLeft;
