import * as React from "react";

const Select = ({ children, ...props }) => {
  return <select {...props} className="border px-3 py-2 rounded-md">{children}</select>;
};

const SelectTrigger = ({ children }) => <div>{children}</div>;
const SelectValue = () => null;
const SelectContent = ({ children }) => <div>{children}</div>;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
};
