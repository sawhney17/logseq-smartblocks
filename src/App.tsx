import React, { useState } from 'react';
import { getDateForPage } from 'logseq-dateutils';
import { valueArray, valueZero, editValueArray} from './index';
import './app.css';
import { data, insertProperlyTemplatedBlock2, blockUuid2, sibling} from './insertTemplatedBlock';

var replacementArray = {};
function triggerParse(obj){
  const reg = /<%setInput:([^%].*?)%>/gi;
  const reg2 = /<%getInput:([^%].*?)%>/gi;
  if (obj.content) {
    var newRegexString = obj.content
    const regexMatched = obj.content.match(reg)
      for (const x in regexMatched){
          const toBeParsed = obj.content
          var currentMatch = regexMatched[x]
          const variableName = currentMatch.slice(2, -2).split(":")[1]
          newRegexString = toBeParsed.replace(currentMatch, replacementArray[variableName])
      }
      const regexMatched2 = obj.content.match(reg2)
for (const x in regexMatched2){
  const toBeParsed = newRegexString
  var currentMatch = regexMatched2[x]
  const variableName = currentMatch.slice(2, -2).split(":")[1]
  newRegexString = toBeParsed.replace(currentMatch, replacementArray[variableName])
}
    obj.content = newRegexString
     }
  obj.children.map(triggerParse)
}

const App = () => {
  const [value, setValue] = useState('');
    const [formValues, setFormValues] = useState([]);
    const [isOpened, setIsOpened] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // for (const x in variables){
    //   setFormValues([...formValues, { name: variables[x], value: "" }])
    // }

    let resetExit = (event) => {
      event.preventDefault();
      setIsSubmitted(false);
      setIsOpened(true);
      setFormValues([]);
      valueZero();
      logseq.hideMainUI()
    }
    let updateUI2 = () => {
      let newFormValues = [...formValues]
      for (const x in valueArray){
        newFormValues.push({name: valueArray[x].variable, value: "" })
      }
      setFormValues(newFormValues)
      setIsSubmitted(true)
      setIsOpened(wasOpened => !wasOpened);
    }
    let handleChange = (i, e) => {
        let newFormValues = [...formValues];
        newFormValues[i]["value"] = e.target.value;
        setFormValues(newFormValues);
      }

      // let handleChange = (i, e) => {
      //   let newFormValues = [...formValues];
      //   newFormValues[i][e.target.name] = e.target.value;
      //   setFormValues(newFormValues);
      // }
    
    
    let handleSubmit = (event) => {
        event.preventDefault();
        // alert(JSON.stringify(formValues));
        setIsSubmitted(false);
        setIsOpened(true);
        setFormValues([]);
        editValueArray(formValues);
        logseq.hideMainUI()
        for (const x in valueArray){
          const value = valueArray[x].value;
          const name = valueArray[x].name;
          replacementArray[name] = value;
        }
        triggerParse(data)
        valueZero();
        insertProperlyTemplatedBlock2(blockUuid2, sibling, data)

    }

    return (
      <div className="flex justify-center h-screen w-screen overlay" >
        <form  onSubmit={handleSubmit} className= "smartblock-popup centered-element">
          {formValues.map((element, index) => (
            <div className="form-inline" key={index}>
              <label className= 'text-white'>{valueArray[index].variable}</label> 
              <input type="text" name="name" value={formValues[index].value} onChange={e => handleChange(index, e)} />
                
            </div>
          ))}
          <div className="button-section">
          </div>

          <div className='grid-container'>
          
        {/* {isOpened && ( */}    
            <button type="button" className="button remove hidden grid-child" onClick={resetExit}>Go Back</button>
      {/* )} */}
        {isSubmitted && (
            <button className="button submit grid-child" type="submit">Submit</button>  
      )}
        {isOpened && (
            <button type="button" className="button submit hidden grid-child" onClick={updateUI2}>Continue</button>
      )}
      </div>
      </form>
     </div>

    )
}

export default App

