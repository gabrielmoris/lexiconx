import React from "react";
import LexiconxLogo from "../Icons/LexiconxLogo";

interface LoadingComponentProps {
 message?: string;
}

const LoadingComponent = ({ message }: LoadingComponentProps) => {
	return (
		<div className="flex flex-col items-center justify-center h-80">
			<LexiconxLogo className="w-15 h-15 animate-spin" />
			{message && (
				<p className="mt-4 text-sm text-muted-foreground">{message}</p>
			)}
		</div>
	);
};

export default LoadingComponent;
