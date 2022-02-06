import React, { useState } from 'react';
import { getDateForPage } from 'logseq-dateutils';
import { valueArray, currentValueArray, currentValueCount, valueCount } from './index';

const name = "djkdh"
const variables = ["variable1", "variable2", "variable3"]
const App = () => {

    const [formValues, setFormValues] = useState([{ name: "", email : ""}, { name: "", email : ""}]);

      
    let handleChange = (i, e) => {
        let newFormValues = [...formValues];
        newFormValues[i][e.target.name] = e.target.value;
        setFormValues(newFormValues);
      }
    
    let handleSubmit = (event) => {
        event.preventDefault();
        alert(JSON.stringify(formValues));
    }

    return (
      <div className="flex justify-center h-screen w-screen overlay" >
        <form  onSubmit={handleSubmit} className= "smartblock-popup centered-element">
          {formValues.map((element, index) => (
            <div className="form-inline" key={index}>
              <label className= 'text-white'>{variables[index]}</label>
              <input type="text" name="name" value={element.name || ""} onChange={e => handleChange(index, e)} />
              <label className= 'text-white'>Value</label>
              <input type="text" name="email" value={element.email || ""} onChange={e => handleChange(index, e)} />
            </div>
          ))}
          <div className="button-section">
              <button className="button submit" type="submit">Submit</button>
          </div>
      </form>
     </div>

    )
}

export default App


// const App = () => {
//   const [taskVal, setTaskVal] = useState('');

//   const handleForm = (e: any) => {
//     setTaskVal(e.target.value);
//   };
//   const handleSubmit = async (e: any) => {
//     console.log("submit Clicked")
//     if (e.keyCode === 13) {
//       if (taskVal.length > 0) {
//         // const startingDate = getDateForPage(
//         //   new Date(),
//         //   logseq.settings.preferredDateFormat
//         // );
//         console.log("submit Clicked")
//         console.log(taskVal)

//         setTaskVal('');

//         logseq.hideMainUI({ restoreEditingCursor: true });

//         logseq.App.showMsg(`${taskVal} added to today's journal page!`);
//       } else {
//         logseq.App.showMsg(
//           'Please enter a task first or press Esc to close the popup.'
//         );
//       }
//     }
//   };

//   return (
//     <div
//       className="task-container flex justify-center border border-black"
//       tabIndex={-1}
//     >
//       <div className=" absolute top-10 bg-white rounded-lg p-3 w-1/3 border">
//         <input
//           className="task-field appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
//           type="text"
//           placeholder="Enter your task to add to today's journal page"
//           aria-label="quick todo"
//           name="taskVal"
//           onChange={handleForm}
//           value={taskVal}
//           onKeyDown={(e) => handleSubmit(e)}
//         />
//       </div>
//     </div>
//   );
// };

// export default App;
