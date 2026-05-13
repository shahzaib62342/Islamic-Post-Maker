import ReactGA from "react-ga4";

// Replace with your actual Measurement ID from Google Analytics (G-XXXXXXXXXX)
const MEASUREMENT_ID = "G-SSW7QK1TQW";

export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
};

export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

// Common Event Helper
export const trackAction = (actionName: string, details?: any) => {
  console.log(`[GA Event] ${actionName}`, details); // Useful for debugging in console
  ReactGA.event({
    category: "User Actions",
    action: actionName,
    ...details
  });
};
