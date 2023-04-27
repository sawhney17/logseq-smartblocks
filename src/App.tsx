import React, { useState } from "react";
import { getDateForPage } from "logseq-dateutils";
import { valueArray, clearValueArray, editValueArray } from "./index";
import "./App.css";
import {
  data,
  insertProperlyTemplatedBlock2,
  blockUuid2,
  sibling,
} from "./insertTemplatedBlock";
import { Autocomplete } from "@mui/material";

var replacementArray = {};
function triggerParse(obj) {
  obj.properties = {};
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

export interface FormValues {
  name: string
  value: string
  options?: string[]
}
const App = () => {
  //Add type annotation to the state
  const [formValues, setFormValues] = useState<FormValues[]>([]);
  const [isOpened, setIsOpened] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [something, setSomething] = useState(false);

  //force remount the component upon formValues changing
  React.useEffect(() => {
    setFormValues(formValues);
    console.log(something)
  }
  , [formValues]);
  let resetExit = (event) => {
    event.preventDefault();
    setIsSubmitted(false);
    setIsOpened(true);
    setFormValues([]);
    clearValueArray();
    logseq.hideMainUI({ restoreEditingCursor: true });
  };
  let updateUI2 = () => {
    let newFormValues = [...formValues];
    for (const x in valueArray) {
      console.log(valueArray)
      newFormValues.push(valueArray[x]);
    }
    console.log(formValues)
    setFormValues(newFormValues);
    setIsSubmitted(true);
    setIsOpened((wasOpened) => !wasOpened);
  };
  let handleChange = (i, e) => {
    let newFormValues = [...formValues];
    newFormValues[i]["value"] = e.target.value;
    setFormValues(newFormValues);
  };
  let handleChange2 = (i, e) => {
    let newFormValues = [...formValues];
    newFormValues[i]["value"] = e.target.value;
    setFormValues(newFormValues);
  }

  let handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(false);
    setIsOpened(true);
    setFormValues([]);
    editValueArray(formValues);
    logseq.hideMainUI({ restoreEditingCursor: true });
    for (const x in valueArray) {
      //if value is empty and there exists options, use the first option instead
      if (valueArray[x].value === "" && valueArray[x].options) {
        valueArray[x].value = valueArray[x].options[0];
      }
      const value = valueArray[x].value;
      const name = valueArray[x].name;
      replacementArray[name] = value;
    }
    triggerParse(data);
    clearValueArray();
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
          {formValues.map((element, index) => {
            console.log(element)
            return (
              <div
                className="grid grid-cols-2 gap-4 place-items-auto py-2"
                key={index}
              >
                <label className="labelClass">{valueArray[index].name}</label>
                {element.options ? (
                  <select name="Options"
                  id = {`selectionNumber${index}`}
                    onChange={(event) => {
                      handleChange2(index, event);
                    }}
                    value={formValues[index].value}
                    >
                    {element.options.map((option) => {
                      return (
                        <option value={option}>{option}</option>
                      )
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="name"
                    value={formValues[index].value}
                    onChange={(e) => handleChange(index, e)}>
                  </input>
                )
                  // })
                  // }
                }
              </div>
            )
          })}
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
