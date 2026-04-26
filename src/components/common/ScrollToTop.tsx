// <== IMPORTS ==>
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// <== SCROLL TO TOP PROPS INTERFACE ==>
interface ScrollToTopProps {
  // <== CONTAINER REF TO SCROLL ==>
  containerRef: React.RefObject<HTMLElement>;
}

// <== SCROLL TO TOP COMPONENT ==>
export function ScrollToTop({ containerRef }: ScrollToTopProps): null {
  // GETTING CURRENT PATHNAME
  const { pathname } = useLocation();
  // TRACKING PREVIOUS PATHNAME TO DETECT ACTUAL NAVIGATION
  const prevPath = useRef<string>(pathname);
  // SCROLL TO TOP ON ROUTE CHANGE
  useEffect(() => {
    // ONLY SCROLL IF PATHNAME ACTUALLY CHANGED
    if (prevPath.current !== pathname) {
      // SCROLL CONTAINER TO TOP
      containerRef.current?.scrollTo(0, 0);
      // UPDATE PREVIOUS PATH
      prevPath.current = pathname;
    }
  }, [pathname, containerRef]);
  // RENDERS NOTHING
  return null;
}
