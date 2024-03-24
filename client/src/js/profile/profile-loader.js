// import backgroundImage from '../../assets/angelyss.svg';
import renderProfile from "./profile-renderer.js";

const fetchProfileData = async () => {
  const queryString = window.location.search;

  try {
    const response = await fetch(`/profile-data${queryString}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch profile data. Status: ${response.status}`,
      );
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
};

const loadProfile = () => {
  // const bgImage = document.getElementById('bgImage');
  // bgImage.src = backgroundImage;

  fetchProfileData()
    .then((data) => renderProfile(data))
    .catch((error) => console.error("Error fetching profile data:", error));
};

export default loadProfile;
