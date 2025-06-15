interface IntlOptions {
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  second?: "2-digit";
  hour12?: boolean;
}

function formatMongoDate(mongoDate: Date, options: IntlOptions = {}) {
  const date = new Date(mongoDate);

  const defaultOptions: IntlOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const formattingOptions = { ...defaultOptions, ...options };

  return new Intl.DateTimeFormat("en-GB", formattingOptions).format(date);
}

export default formatMongoDate;
