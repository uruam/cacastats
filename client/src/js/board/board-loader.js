// import backgroundImage from "../../assets/angelyss.svg";
import backgroundImage from "../../assets/smarine.svg";
import renderBoard from "./board-renderer.js";

const fetchBoardData = async () => {
  try {
    const response = await fetch("/board-data");

    if (!response.ok) {
      throw new Error(`Failed to fetch board data. Status: ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching board data:", error);
    throw error;
  }
};

const storeSortingState = (sortKey, sortOrder) => {
  localStorage.setItem("sortingState", JSON.stringify({ sortKey, sortOrder }));
};

const getSortingState = () => {
  const sortingState = localStorage.getItem("sortingState");
  return sortingState ? JSON.parse(sortingState) : null;
};

const loadBoard = () => {
  const bgImage = document.getElementById("bgImage");
  bgImage.src = backgroundImage;

  // Initial fetch withoout sorting
  const sortingState = getSortingState();

  if (sortingState) {
    const sortingStateSortKey = sortingState.sortKey;
    const sortingStateSortOrder = sortingState.sortOrder;

    fetchBoardData()
      .then((data) =>
        renderBoard(data, sortingStateSortKey, sortingStateSortOrder),
      )
      .catch((error) =>
        console.error("Error fetching data for sorted board:", error),
      );
  } else {
    fetchBoardData()
      .then((data) => renderBoard(data))
      .catch((error) =>
        console.error("Error fetching data for unsorted board:", error),
      );
  }

  document.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON" && event.target.id === "sortButton") {
      const sortButton = event.target;
      const { sortKey } = sortButton.dataset;
      let sortOrder = sortButton.className;
      sortOrder = sortOrder === "asc" ? "desc" : "asc";

      storeSortingState(sortKey, sortOrder);

      fetchBoardData()
        .then((data) => renderBoard(data, sortKey, sortOrder))
        .catch((error) => console.error("Error fetching board data:", error));
    }
  });
};

export default loadBoard;
