import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./App.css";
import "@logseq/libs";
import "./tailwind.css";
import { insertProperlyTemplatedBlock } from "./insertTemplatedBlock";

let templates;

export function updateTemplates() {
  let query = `
  [:find (pull ?b [*])
             :where
             [?b :block/properties ?p]
             [(get ?p :template)]]
  `;
  logseq.DB.datascriptQuery(query).then((result) => {
    templates = result.map((item) => item[0].properties.template);
  });
}
const SearchBar: React.FC<{ blockID }> = ({ blockID }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [highlightedResult, setHighlightedResult] = React.useState(null);
  const firstUpdate = useRef(true);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };
  React.useEffect(() => {
    let results;
    updateTemplates();
    if (searchTerm != "") {
      results = templates.filter((template) =>
        template.toLowerCase().includes(searchTerm)
      );
    } else {
      results = templates;
    }
    setSearchResults(results);
  }, [searchTerm]);
  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    setHighlightedResult(0);
  }, [searchResults]);

  React.useEffect(() => {
    if (firstUpdate.current) {
      return;
    }
    document.addEventListener("keydown", keyControl);
    updateHighlight();
    return () => document.removeEventListener("keydown", keyControl);
  }, [highlightedResult]);
  function keyControl(e) {
    if (e.keyCode === 40) {
      //down arrow
      if (highlightedResult < searchResults.length - 1) {
        let hello = highlightedResult + 1;
        setHighlightedResult(hello);
      } else {
        setHighlightedResult(0);
      }
    }
    if (e.keyCode === 38) {
      //Up arrow
      if (highlightedResult > 0) {
        setHighlightedResult(highlightedResult - 1);
      } else {
        setHighlightedResult(searchResults.length - 1);
      }
    }
    if (e.keyCode === 13) {
      //Up arrow
      insertProperlyTemplatedBlock(
        blockID,
        searchResults[highlightedResult],
        "true"
      ).then(() => {
        logseq.hideMainUI({ restoreEditingCursor: true });
      });
    }
    e.handled = true;
  }
  const insertBlocks = (e) => {
    insertProperlyTemplatedBlock(
      blockID,
      e.target.id,
      "true"
    ).then(() => {
      logseq.hideMainUI({ restoreEditingCursor: true });
    });
  }
  const updateHighlight = () => {
    for (const x in searchResults) {
      if (x == highlightedResult) {
        document.getElementById(searchResults[x]).classList.add("bg-[#4c4c4c]");
      } else {
        document
          .getElementById(searchResults[x])
          .classList.remove("bg-[#4c4c4c]");
      }
    }
  };

  return (
    <div className="overlay">
      <div className="flex justify-center w-screen z-0">
        <div className="smartblock-inserter">
          <input
            type="text"
            className="cp__palette-input w-full"
            placeholder="Search for a Smartblock..."
            value={searchTerm}
            onChange={handleChange}
          />
          <ul className="w-full text-sm">
            {searchResults.map((item) => (
              <div id={item} onClick={insertBlocks}className="hover:bg-[#4c4c4c] p-2 rounded-lg">
                <div
                  title="template"
                  className="text-xs rounded border mr-2 px-1 inline-block"
                >
                  T
                </div>
                <li className="inline-block px-2 searchItem">{item}</li>
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
