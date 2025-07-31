import * as React from "react";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return <textarea ref={ref} className={`border px-3 py-2 rounded-md ${className || ''}`} {...props} />;
});
Textarea.displayName = "Textarea";

export { Textarea };
