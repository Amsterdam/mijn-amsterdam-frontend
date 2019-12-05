// Taken from https://gist.github.com/gragland/929e42759c0051ff596bc961fb13cd93
import { useEffect, useState } from 'react';

const cachedScripts: string[] = [];

export default function useScript(
  src: string,
  defer: boolean = false,
  async: boolean = true,
  isDisabled: boolean = false
) {
  // Keeping track of script loaded and error state
  const [state, setState] = useState({
    loaded: false,
    error: false,
  });

  useEffect(() => {
    if (isDisabled) {
      return;
    }
    // If cachedScripts array already includes src that means another instance ...
    // ... of this hook already loaded this script, so no need to load again.
    if (cachedScripts.includes(src)) {
      setState({
        loaded: true,
        error: false,
      });
    } else {
      cachedScripts.push(src);

      // Create script
      let script = document.createElement('script');
      script.src = src;
      script.async = async;
      script.defer = defer;

      // Script event listener callbacks for load and error
      const onScriptLoad = () => {
        setState({
          loaded: true,
          error: false,
        });
      };

      const onScriptError = () => {
        // Remove from cachedScripts we can try loading again
        const index = cachedScripts.indexOf(src);
        if (index >= 0) cachedScripts.splice(index, 1);
        script.parentNode!.removeChild(script);

        setState({
          loaded: true,
          error: true,
        });
      };

      script.addEventListener('load', onScriptLoad);
      script.addEventListener('error', onScriptError);

      // Add script to document body
      document.body.appendChild(script);

      // Remove event listeners on cleanup
      return () => {
        script.removeEventListener('load', onScriptLoad);
        script.removeEventListener('error', onScriptError);
      };
    }
  }, [src, isDisabled, defer, async]); // Only re-run effect if script src changes

  return [state.loaded, state.error];
}
