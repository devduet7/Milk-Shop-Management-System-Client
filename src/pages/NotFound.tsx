// <== IMPORTS ==>
import { memo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

// <== NOT FOUND PAGE COMPONENT ==>
const NotFound = memo(() => {
  // GETTING CURRENT LOCATION
  const location = useLocation();
  // <== LOG 404 ERROR ON MOUNT ==>
  useEffect(() => {
    // LOGGING 404 ERROR WITH ATTEMPTED ROUTE
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);
  // RETURNING NOT FOUND PAGE COMPONENT
  return (
    // MAIN CONTAINER
    <div className="flex min-h-screen items-center justify-center bg-muted">
      {/* CONTENT */}
      <div className="text-center">
        {/* ERROR CODE */}
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        {/* ERROR MESSAGE */}
        <p className="mb-4 text-xl text-muted-foreground">
          Oops! Page not found
        </p>
        {/* HOME LINK */}
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>
    </div>
  );
});

// <== DISPLAY NAME FOR DEVTOOLS ==>
NotFound.displayName = "NotFound";

// <== MEMOIZED EXPORT TO PREVENT UNNECESSARY RE-RENDERS ==>
export default NotFound;
