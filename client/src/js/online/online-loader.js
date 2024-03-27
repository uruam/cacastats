import renderOnline from "./online-renderer.js";

const fetchOaquery = async () => {
  try {
    const response = await fetch(`/oaquery`);

    if (!response.ok) {
      throw new Error(`Failed to fetch oaquery. Status: ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching oaquery:", error);
    throw error;
  }
};

const loadOnline = () => {
  // const bgImage = document.getElementById('bgImage');
  // bgImage.src = backgroundImage;

  fetchOaquery()
    .then((data) => renderOnline(data))
    .catch((error) => console.error("Error fetching oaquery:", error));
};

export default loadOnline;
