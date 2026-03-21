import { useEffect } from "react";

function useBlinkingTitle() {
  useEffect(() => {
    const originalTitle = document.title;
    let interval;

    const messages = [
      "💎 Luxury Deals Inside!",
      "🛍️ Don't Miss Out!",
      "🔥 Come Back Now!"
    ];

    const handleVisibilityChange = () => {
      if (document.hidden) {
        let i = 0;
        interval = setInterval(() => {
          document.title = messages[i % messages.length];
          i++;
        }, 1000);
      } else {
        clearInterval(interval);
        document.title = originalTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}

export default useBlinkingTitle;