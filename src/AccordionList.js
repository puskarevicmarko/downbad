import React, { useState } from 'react';

const AccordionList = ({ children }) => {
  const [accordionOpen, setAccordionOpen] = useState(false);

  const toggleAccordion = () => {
    setAccordionOpen(!accordionOpen);
  };

  return (
    <div className="flex items-center bg-gray-200 flex-col items-start px-6 py-5" id="accordionList">
      <div className="w-full flex justify-between items-center">
        <div className="flex-grow">
          {!accordionOpen ? (
            <button onClick={toggleAccordion} className="bg-blue-500 text-white px-4 py-2 rounded">
              Top 10 Most Heinous
            </button>
          ) : (
            <button onClick={toggleAccordion} className="bg-red-500 text-white px-4 py-2 mb-4 rounded">
              Hide Top 10 Most Heinous
            </button>
          )}
        </div>
        <div className="flex-shrink-0">{children}</div>
      </div>
      {accordionOpen && (
        <ul>
          {/* Replace the array with your actual list of top 10 restaurants */}
          {['Restaurant 1', 'Restaurant 2', 'Restaurant 3', 'Restaurant 4', 'Restaurant 5', 'Restaurant 6', 'Restaurant 7', 'Restaurant 8', 'Restaurant 9', 'Restaurant 10'].map((restaurant, index) => (
            <li key={index} className="mb-2">
              {restaurant}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AccordionList;
