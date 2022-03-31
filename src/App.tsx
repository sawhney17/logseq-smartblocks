import React, { useState } from "react";
import { getDateForPage } from "logseq-dateutils";
import { valueArray, valueZero, editValueArray } from "./index";
import "./App.css";
import {
  data,
  insertProperlyTemplatedBlock2,
  blockUuid2,
  sibling,
} from "./insertTemplatedBlock";

var replacementArray = {};
function triggerParse(obj) {
  const reg = /<%setInput:([^%].*?)%>/gi;
  const reg2 = /<%getInput:([^%].*?)%>/gi;
  if (obj.content) {
    var newRegexString = obj.content;
    const regexMatched = obj.content.match(reg);
    for (const x in regexMatched) {
      const toBeParsed = newRegexString;
      var currentMatch = regexMatched[x];
      const variableName = currentMatch.slice(2, -2).split(":")[1];
      newRegexString = toBeParsed.replace(
        currentMatch,
        replacementArray[variableName]
      );
    }
    const regexMatched2 = obj.content.match(reg2);
    for (const x in regexMatched2) {
      const toBeParsed = newRegexString;
      var currentMatch = regexMatched2[x];
      const variableName = currentMatch.slice(2, -2).split(":")[1];
      newRegexString = toBeParsed.replace(
        currentMatch,
        replacementArray[variableName]
      );
    }
    obj.content = newRegexString;
  }
  obj.children.map(triggerParse);
}

const App = () => {
  const [formValues, setFormValues] = useState([]);
  const [isOpened, setIsOpened] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  let resetExit = (event) => {
    event.preventDefault();
    setIsSubmitted(false);
    setIsOpened(true);
    setFormValues([]);
    valueZero();
    logseq.hideMainUI({ restoreEditingCursor: true });
  };
  let updateUI2 = () => {
    let newFormValues = [...formValues];
    for (const x in valueArray) {
      newFormValues.push({ name: valueArray[x].variable, value: "" });
    }
    setFormValues(newFormValues);
    setIsSubmitted(true);
    setIsOpened((wasOpened) => !wasOpened);
  };
  let handleChange = (i, e) => {
    let newFormValues = [...formValues];
    newFormValues[i]["value"] = e.target.value;
    setFormValues(newFormValues);
  };

  let handleSubmit = (event) => {
    event.preventDefault();
    // alert(JSON.stringify(formValues));
    setIsSubmitted(false);
    setIsOpened(true);
    setFormValues([]);
    editValueArray(formValues);
    logseq.hideMainUI({ restoreEditingCursor: true });
    for (const x in valueArray) {
      const value = valueArray[x].value;
      const name = valueArray[x].name;
      replacementArray[name] = value;
    }
    triggerParse(data);
    valueZero();
    insertProperlyTemplatedBlock2(blockUuid2, sibling, data);
  };

  document.addEventListener(
    "keydown",
    function (e) {
      if (e.keyCode === 27) {
        // logseq.hideMainUI({ restoreEditingCursor: true });
        resetExit(e);
      }
      e.stopPropagation();
    },
    false
  );
  return (
    <div>
      <div className="overlay" onClick={resetExit}></div>
      <div className="flex justify-center w-screen">
        <form onSubmit={handleSubmit} className="smartblock-inserter" id="form">
          {formValues.map((element, index) => (
            <div className="grid grid-cols-2 gap-4 place-items-auto py-2" key={index}>
              <label className="labelClass">{valueArray[index].variable}</label>
              <input
                type="text"
                name="name"
                value={formValues[index].value}
                onChange={(e) => handleChange(index, e)}
              />
            </div>
          ))}
          <div className="button-section"></div>
          {isOpened && <label>Would you like to insert with inputs?</label>}
          <div className="grid-container">
            {/* {isOpened && ( */}
            <button
              type="button"
              className="button remove grid-child"
              onClick={resetExit}
            >
              Go Back
            </button>
            {/* )} */}
            {isSubmitted && (
              <button className="button submit grid-child" type="submit">
                Submit
              </button>
            )}
            {isOpened && (
              <button
                type="button"
                className="button submit grid-child"
                onClick={updateUI2}
              >
                Continue
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
