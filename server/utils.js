import path from "path";
import url from "url";

// Workaround to get the current file directory in ES modules
const currDir = (fileUrl) => {
  const filename = url.fileURLToPath(fileUrl);

  return path.dirname(filename);
};

export default currDir;
